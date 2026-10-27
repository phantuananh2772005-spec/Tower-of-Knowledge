"""
PET SPRITE STUDIO - Python Backend Processing Engine
Extracts, chroma-keys, despills, removes watermarks, aligns, and packages 
spritesheet strips and transparent animated GIFs from 3x2 grid Gemini video files.
"""

import os
import sys
import json
import argparse
import base64
import io
import cv2
import numpy as np
from PIL import Image

# Ensure UTF-8 output on Windows terminal
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

def find_grid_dividers(frame):
    """
    Dynamically finds the 2 vertical and 1 horizontal black divider lines in the 3x2 grid.
    Returns (col_ranges, row_ranges).
    """
    h, w, _ = frame.shape
    col_means = np.mean(frame, axis=(0, 2))
    v1_range = np.where((col_means < 45) & (np.arange(w) > int(w * 0.28)) & (np.arange(w) < int(w * 0.38)))[0]
    v2_range = np.where((col_means < 45) & (np.arange(w) > int(w * 0.61)) & (np.arange(w) < int(w * 0.72)))[0]
    v1 = int(np.median(v1_range)) if len(v1_range) > 0 else int(w * 0.333)
    v2 = int(np.median(v2_range)) if len(v2_range) > 0 else int(w * 0.667)

    row_means = np.mean(frame, axis=(1, 2))
    h_range = np.where((row_means < 45) & (np.arange(h) > int(h * 0.44)) & (np.arange(h) < int(h * 0.56)))[0]
    h1 = int(np.median(h_range)) if len(h_range) > 0 else int(h * 0.5)

    col_ranges = [(0, v1 - 3), (v1 + 4, v2 - 3), (v2 + 4, w - 1)]
    row_ranges = [(0, h1 - 3), (h1 + 4, h - 1)]
    return col_ranges, row_ranges

def get_grid_cell_rect(frame_w, frame_h, cell_idx, sample_frame=None, margin=4):
    """
    Returns (x1, y1, x2, y2) for a given 1-based cell index in a 3x2 grid.
    Cell 1: Top-Left       Cell 2: Top-Center     Cell 3: Top-Right
    Cell 4: Bottom-Left    Cell 5: Bottom-Center  Cell 6: Bottom-Right
    """
    if sample_frame is not None:
        col_ranges, row_ranges = find_grid_dividers(sample_frame)
    else:
        col_w = frame_w // 3
        row_h = frame_h // 2
        col_ranges = [(0, col_w - 3), (col_w + 3, col_w * 2 - 3), (col_w * 2 + 3, frame_w - 1)]
        row_ranges = [(0, row_h - 3), (row_h + 3, frame_h - 1)]

    idx0 = cell_idx - 1
    row = idx0 // 3
    col = idx0 % 3

    c_start, c_end = col_ranges[col]
    r_start, r_end = row_ranges[row]

    x1 = c_start + margin
    y1 = r_start + margin
    x2 = c_end - margin
    y2 = r_end - margin
    return x1, y1, x2, y2

def remove_gemini_watermark(bgr_cell, cell_idx, custom_box=None):
    """
    Removes Gemini 4-pointed sparkle watermark, especially in Cell 6 (bottom right).
    Replaces the sparkle pixels with clean background green.
    """
    h, w, _ = bgr_cell.shape
    out = bgr_cell.copy()
    
    # In Cell 6, Gemini watermark is consistently located on the right side
    if custom_box is not None:
        x1, y1, x2, y2 = custom_box
    elif cell_idx == 6:
        # Relative coordinates for Cell 6 watermark: right area
        x1 = int(w * 0.70)
        y1 = int(h * 0.45)
        x2 = int(w * 0.98)
        y2 = int(h * 0.85)
    else:
        return out
        
    x1 = max(0, min(w, x1))
    y1 = max(0, min(h, y1))
    x2 = max(0, min(w, x2))
    y2 = max(0, min(h, y2))
    
    if x2 <= x1 or y2 <= y1:
        return out
        
    patch = out[y1:y2, x1:x2]
    # Sparkle watermark has elevated green and mixed light red/blue
    # Background green in H264: G ~ 200, R ~ 50, B ~ 50
    # Sparkle watermark: G ~ 210, R ~ 100-160, B ~ 100-160 (whitish-green)
    is_sparkle = (patch[:, :, 1] > 140) & (patch[:, :, 1] > patch[:, :, 2] + 25)
    
    # Replace sparkle with standard chroma green (BGR: 54, 203, 46)
    patch[is_sparkle] = [54, 203, 46]
    out[y1:y2, x1:x2] = patch
    return out

def chroma_key_cell(bgr_img, green_thresh=40, despill=True, protect_mask=None):
    """
    Clean chroma-key using boundary flood-fill, color protection mask, and despill filter.
    Returns RGBA numpy array.
    """
    h, w, _ = bgr_img.shape
    b = bgr_img[:, :, 0].astype(np.float32)
    g = bgr_img[:, :, 1].astype(np.float32)
    r = bgr_img[:, :, 2].astype(np.float32)
    
    max_rb = np.maximum(r, b)
    green_diff = g - max_rb
    
    # Green background detection
    is_green = (green_diff > green_thresh) & (g > 105)
    
    # Exclude user protected pixels
    if protect_mask is not None:
        is_green[protect_mask > 0] = False
        
    # Outer flood fill from 4 borders to protect any internal green/cyan details
    flood_mask = np.zeros((h + 2, w + 2), dtype=np.uint8)
    flood_mask[1:h+1, 1:w+1] = (~is_green).astype(np.uint8)
    
    h_canvas = np.zeros((h, w), dtype=np.uint8)
    step = 4
    for x in range(0, w, step):
        if is_green[0, x] and flood_mask[1, x+1] == 0:
            cv2.floodFill(h_canvas, flood_mask, (x, 0), 255)
        if is_green[h-1, x] and flood_mask[h, x+1] == 0:
            cv2.floodFill(h_canvas, flood_mask, (x, h-1), 255)
    for y in range(0, h, step):
        if is_green[y, 0] and flood_mask[y+1, 1] == 0:
            cv2.floodFill(h_canvas, flood_mask, (0, y), 255)
        if is_green[y, w-1] and flood_mask[y+1, w] == 0:
            cv2.floodFill(h_canvas, flood_mask, (w-1, y), 255)
            
    # Alpha = 0 for outer background
    alpha = np.where(h_canvas == 255, 0, 255).astype(np.uint8)
    
    # Clean inner trapped green holes (e.g. between feet/tail) unless protected
    if protect_mask is None:
        alpha[is_green & (alpha > 0)] = 0
    else:
        alpha[is_green & (protect_mask == 0) & (alpha > 0)] = 0
        
    # Despill filter: Suppress green spill on edge pixels
    out_bgr = bgr_img.copy()
    if despill:
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        bg_dilated = cv2.dilate((alpha == 0).astype(np.uint8), kernel)
        edge_pixels = (bg_dilated > 0) & (alpha > 0)
        
        edge_g = out_bgr[:, :, 1].astype(np.float32)
        edge_max_rb = np.maximum(out_bgr[:, :, 0], out_bgr[:, :, 2]).astype(np.float32)
        spill = edge_pixels & (edge_g > edge_max_rb)
        out_bgr[spill, 1] = edge_max_rb[spill]
        
        # Clean up near-black outlines with green tint (snap to neutral dark)
        dark_edge = edge_pixels & (out_bgr[:, :, 0] < 70) & (out_bgr[:, :, 1] < 80) & (out_bgr[:, :, 2] < 70)
        out_bgr[dark_edge] = [18, 18, 18]
        
    rgba = cv2.cvtColor(out_bgr, cv2.COLOR_BGR2RGBA)
    rgba[:, :, 3] = alpha
    return rgba

def extract_and_process_pet(
    video_path,
    cell_idx=1,
    start_sec=0.0,
    end_sec=4.0,
    num_frames=8,
    target_size=(84, 84),
    pet_name="pet_character",
    output_dir="./exports/pets",
    green_thresh=40,
    despill=True,
    protect_mask_path=None,
    custom_watermark_box=None
):
    """
    Extracts keyframes from video cell, applies chroma-key, despill, watermark removal,
    aligns collective bounding box, and exports the 3-folder structure + spritesheet + GIF.
    """
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video file not found: {video_path}")
        
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
    frame_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    start_frame = max(0, min(total_frames - 1, int(start_sec * fps)))
    end_frame = max(start_frame + 1, min(total_frames - 1, int(end_sec * fps)))
    
    if num_frames <= 1:
        frame_indices = [start_frame]
    else:
        frame_indices = [
            int(start_frame + i * (end_frame - start_frame) / (num_frames - 1))
            for i in range(num_frames)
        ]
        
    ret_first, sample_frame = cap.read()
    x1, y1, x2, y2 = get_grid_cell_rect(frame_w, frame_h, cell_idx, sample_frame if ret_first else None)
    
    # Load protect mask if given
    protect_mask = None
    if protect_mask_path and os.path.exists(protect_mask_path):
        pm_img = cv2.imread(protect_mask_path, cv2.IMREAD_GRAYSCALE)
        cell_w, cell_h = x2 - x1, y2 - y1
        protect_mask = cv2.resize(pm_img, (cell_w, cell_h), interpolation=cv2.INTER_NEAREST)
        
    raw_cells = []
    processed_cells = []
    
    for fid in frame_indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, fid)
        ret, frame = cap.read()
        if not ret:
            continue
        cell_raw = frame[y1:y2, x1:x2].copy()
        raw_cells.append(cell_raw)
        
        # 1. Clean watermark
        cell_nowm = remove_gemini_watermark(cell_raw, cell_idx, custom_watermark_box)
        # 2. Key & Despill
        rgba = chroma_key_cell(cell_nowm, green_thresh, despill, protect_mask)
        processed_cells.append(rgba)
        
    cap.release()
    
    if not processed_cells:
        raise RuntimeError("No frames could be extracted from the specified range.")
        
    # --- Collective Bounding Box for Stable Centering ---
    all_alphas = [p[:, :, 3] for p in processed_cells]
    union_alpha = np.maximum.reduce(all_alphas)
    coords = cv2.findNonZero((union_alpha > 0).astype(np.uint8))
    
    if coords is not None:
        bx, by, bw, bh = cv2.boundingRect(coords)
    else:
        bx, by, bw, bh = 0, 0, processed_cells[0].shape[1], processed_cells[0].shape[0]
        
    # Add a 6% margin around bounding box
    pad_x = max(2, int(bw * 0.06))
    pad_y = max(2, int(bh * 0.06))
    ch_h, ch_w, _ = processed_cells[0].shape
    crop_x1 = max(0, bx - pad_x)
    crop_y1 = max(0, by - pad_y)
    crop_x2 = min(ch_w, bx + bw + pad_x)
    crop_y2 = min(ch_h, by + bh + pad_y)
    
    target_w, target_h = target_size
    final_frames = []
    
    for p in processed_cells:
        cropped = p[crop_y1:crop_y2, crop_x1:crop_x2]
        c_h, c_w, _ = cropped.shape
        
        # Scale while preserving aspect ratio
        scale = min((target_w - 4) / max(1, c_w), (target_h - 4) / max(1, c_h))
        new_w = max(1, int(c_w * scale))
        new_h = max(1, int(c_h * scale))
        
        # Pixel-perfect resize
        resized = cv2.resize(cropped, (new_w, new_h), interpolation=cv2.INTER_NEAREST)
        
        # Place centered and planted (bottom-aligned with 2px bottom padding)
        canvas = np.zeros((target_h, target_w, 4), dtype=np.uint8)
        off_x = (target_w - new_w) // 2
        off_y = target_h - new_h - 2 # Anchor feet near bottom
        canvas[off_y:off_y+new_h, off_x:off_x+new_w] = resized
        final_frames.append(canvas)
        
    # --- Prepare Folder Structure ---
    pet_dir = os.path.join(output_dir, pet_name)
    raw_dir = os.path.join(pet_dir, "01_raw_frames")
    proc_dir = os.path.join(pet_dir, "02_processed_frames")
    sheet_dir = os.path.join(pet_dir, "03_spritesheet")
    
    os.makedirs(raw_dir, exist_ok=True)
    os.makedirs(proc_dir, exist_ok=True)
    os.makedirs(sheet_dir, exist_ok=True)
    
    # 1. Save Raw Frames
    for idx, rf in enumerate(raw_cells):
        cv2.imwrite(os.path.join(raw_dir, f"frame_{idx:03d}.png"), rf)
        
    # 2. Save Processed Frames
    for idx, pf in enumerate(final_frames):
        bgra = cv2.cvtColor(pf, cv2.COLOR_RGBA2BGRA)
        cv2.imwrite(os.path.join(proc_dir, f"clean_{idx:03d}.png"), bgra)
        
    # 3. Stitch Spritesheet Strip
    num_f = len(final_frames)
    strip_w = target_w * num_f
    strip_img = np.zeros((target_h, strip_w, 4), dtype=np.uint8)
    for idx, pf in enumerate(final_frames):
        strip_img[:, idx*target_w:(idx+1)*target_w] = pf
        
    strip_path = os.path.join(sheet_dir, f"{pet_name}_strip.png")
    cv2.imwrite(strip_path, cv2.cvtColor(strip_img, cv2.COLOR_RGBA2BGRA))
    
    # 4. Save Representative Still Frame
    still_idx = min(len(final_frames) // 2, len(final_frames) - 1)
    still_path = os.path.join(sheet_dir, f"{pet_name}_still.png")
    cv2.imwrite(still_path, cv2.cvtColor(final_frames[still_idx], cv2.COLOR_RGBA2BGRA))
    
    # 5. Generate Transparent Looping Animated GIF
    pil_frames = [Image.fromarray(f) for f in final_frames]
    gif_path = os.path.join(sheet_dir, f"{pet_name}_anim.gif")
    # Duration per frame in ms: e.g. 120ms (~8.3 fps)
    frame_dur = max(60, int(1000 / 8))
    pil_frames[0].save(
        gif_path,
        save_all=True,
        append_images=pil_frames[1:],
        duration=frame_dur,
        loop=0,
        disposal=2
    )
    
    # 6. Save Metadata Manifest
    meta = {
        "pet_name": pet_name,
        "cell_index": cell_idx,
        "video_source": os.path.basename(video_path),
        "start_sec": start_sec,
        "end_sec": end_sec,
        "frame_count": num_f,
        "frame_size": [target_w, target_h],
        "strip_size": [strip_w, target_h],
        "fps_playback": 8,
        "files": {
            "spritesheet_strip": f"{pet_name}_strip.png",
            "still_frame": f"{pet_name}_still.png",
            "animated_gif": f"{pet_name}_anim.gif",
            "raw_dir": "01_raw_frames",
            "processed_dir": "02_processed_frames"
        }
    }
    with open(os.path.join(sheet_dir, "metadata.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)
        
    print(f"✓ Successfully exported pet pack for '{pet_name}' to: {pet_dir}")
    return meta

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract and process sprite sheets from 3x2 video")
    parser.add_argument("--video", required=True, help="Path to mp4 video")
    parser.add_argument("--cell", type=int, default=1, help="Grid cell index (1 to 6)")
    parser.add_argument("--name", default="pet_character", help="Pet folder and file name")
    parser.add_argument("--start", type=float, default=0.0, help="Start time in seconds")
    parser.add_argument("--end", type=float, default=4.0, help="End time in seconds")
    parser.add_argument("--frames", type=int, default=8, help="Number of keyframes to extract")
    parser.add_argument("--size", type=int, default=84, help="Target square size (e.g. 84 for Sparky, 100 for Kitsune)")
    parser.add_argument("--out", default="./exports/pets", help="Output directory")
    parser.add_argument("--mask", default=None, help="Optional path to protection mask image")
    
    args = parser.parse_args()
    res = extract_and_process_pet(
        video_path=args.video,
        cell_idx=args.cell,
        start_sec=args.start,
        end_sec=args.end,
        num_frames=args.frames,
        target_size=(args.size, args.size),
        pet_name=args.name,
        output_dir=args.out,
        protect_mask_path=args.mask
    )
    print(json.dumps(res, indent=2, ensure_ascii=False))
