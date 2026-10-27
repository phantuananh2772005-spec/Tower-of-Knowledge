"""
PROCESS ALL 12 PETS BATCH ENGINE
Processes both Batch 1 (0-10s) and Batch 2 (10-20s) from Gemini video.
Extracts 16 frames Idle + 16 frames Attack for all 12 characters.
Applies:
- Dynamic grid slicing
- Cell 6 Gemini watermark removal
- Outer boundary flood-fill chroma keying
- Despill and anti-fringing
- Shared union bounding-box alignment & bottom feet anchoring
- Packaging into 01_raw_frames, 02_processed_frames, 03_spritesheet
"""

import os
import sys
import json
import cv2
import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

PET_DEFINITIONS = [
    # Batch 1 (0.0s - 10.0s)
    {
        "id": "pyra_phoenix",
        "name_vi": "Phượng Hoàng Lửa Pyra",
        "batch_video": r"C:\Users\phant\Downloads\ado\gemini_batch1_pets.mp4",
        "cell": 1,
        "idle_range": (0.8, 4.6),
        "atk_range": (5.0, 9.2),
        "target_size": (100, 100),
        "is_cell6": False,
        "icon": "🔥"
    },
    {
        "id": "kim_quy_turtle",
        "name_vi": "Rùa Thần Kim Quy",
        "batch_video": r"C:\Users\phant\Downloads\ado\gemini_batch1_pets.mp4",
        "cell": 2,
        "idle_range": (0.8, 4.6),
        "atk_range": (5.0, 9.2),
        "target_size": (100, 100),
        "is_cell6": False,
        "icon": "🐢"
    },
    {
        "id": "stone_golem",
        "name_vi": "Người Đá Golem Cổ Đại",
        "batch_video": r"C:\Users\phant\Downloads\ado\gemini_batch1_pets.mp4",
        "cell": 3,
        "idle_range": (0.8, 4.6),
        "atk_range": (5.0, 9.2),
        "target_size": (100, 100),
        "is_cell6": False,
        "icon": "🗿"
    },
    {
        "id": "maneki_neko",
        "name_vi": "Mèo Thần Tài Neko",
        "batch_video": r"C:\Users\phant\Downloads\ado\gemini_batch1_pets.mp4",
        "cell": 4,
        "idle_range": (0.8, 4.6),
        "atk_range": (5.0, 9.2),
        "target_size": (100, 100),
        "is_cell6": False,
        "icon": "🐱"
    },
    {
        "id": "bambo_panda",
        "name_vi": "Gấu Trúc Bambo",
        "batch_video": r"C:\Users\phant\Downloads\ado\gemini_batch1_pets.mp4",
        "cell": 5,
        "idle_range": (0.8, 4.6),
        "atk_range": (5.0, 9.2),
        "target_size": (100, 100),
        "is_cell6": False,
        "icon": "🐼"
    },
    {
        "id": "frostfang_wolf",
        "name_vi": "Sói Băng Frostfang",
        "batch_video": r"C:\Users\phant\Downloads\ado\gemini_batch1_pets.mp4",
        "cell": 6,
        "idle_range": (0.8, 4.6),
        "atk_range": (5.0, 9.2),
        "target_size": (100, 100),
        "is_cell6": True,
        "icon": "🐺"
    },

    # Batch 2 (10.0s - 20.0s)
    {
        "id": "byte_robot",
        "name_vi": "Robot Khối Lập Phương Byte",
        "batch_video": r"C:\Users\phant\Downloads\ado\gemini_batch2_pets.mp4",
        "cell": 1,
        "idle_range": (0.8, 4.6),
        "atk_range": (5.0, 9.2),
        "target_size": (100, 100),
        "is_cell6": False,
        "icon": "🤖"
    },
    {
        "id": "astra_stag",
        "name_vi": "Hươu Tinh Tú Astra",
        "batch_video": r"C:\Users\phant\Downloads\ado\gemini_batch2_pets.mp4",
        "cell": 2,
        "idle_range": (0.8, 4.6),
        "atk_range": (5.0, 9.2),
        "target_size": (100, 100),
        "is_cell6": False,
        "icon": "🦌"
    },
    {
        "id": "kylin_qilin",
        "name_vi": "Kỳ Lân Mây Kylin",
        "batch_video": r"C:\Users\phant\Downloads\ado\gemini_batch2_pets.mp4",
        "cell": 3,
        "idle_range": (0.8, 4.6),
        "atk_range": (5.0, 9.2),
        "target_size": (100, 100),
        "is_cell6": False,
        "icon": "🦄"
    },
    {
        "id": "inky_octopus",
        "name_vi": "Bạch Tuộc Học Giả Inky",
        "batch_video": r"C:\Users\phant\Downloads\ado\gemini_batch2_pets.mp4",
        "cell": 4,
        "idle_range": (0.8, 4.6),
        "atk_range": (5.0, 9.2),
        "target_size": (100, 100),
        "is_cell6": False,
        "icon": "🐙"
    },
    {
        "id": "spike_hedgehog",
        "name_vi": "Nhím Giấy Ghi Chú Spike",
        "batch_video": r"C:\Users\phant\Downloads\ado\gemini_batch2_pets.mp4",
        "cell": 5,
        "idle_range": (0.8, 4.6),
        "atk_range": (5.0, 9.2),
        "target_size": (100, 100),
        "is_cell6": False,
        "icon": "🦔"
    },
    {
        "id": "otto_otter",
        "name_vi": "Rái Cá Tri Thức Otto",
        "batch_video": r"C:\Users\phant\Downloads\ado\gemini_batch2_pets.mp4",
        "cell": 6,
        "idle_range": (0.8, 4.6),
        "atk_range": (5.0, 9.2),
        "target_size": (100, 100),
        "is_cell6": True,
        "icon": "🦦"
    },
]

def find_dividers(frame):
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

def get_cell_coords(frame_w, frame_h, cell_idx, col_ranges, row_ranges, margin=4):
    idx0 = cell_idx - 1
    row = idx0 // 3
    col = idx0 % 3
    c_start, c_end = col_ranges[col]
    r_start, r_end = row_ranges[row]
    return c_start + margin, r_start + margin, c_end - margin, r_end - margin

def clean_watermark(bgr_cell, is_cell6=False):
    if not is_cell6:
        return bgr_cell
    h, w, _ = bgr_cell.shape
    out = bgr_cell.copy()
    # Sparkle in Cell 6 is consistently located at x: 0.65-0.98, y: 0.45-0.85
    x1, y1 = int(w * 0.65), int(h * 0.45)
    x2, y2 = int(w * 0.98), int(h * 0.85)
    patch = out[y1:y2, x1:x2]
    # Sparkle pixels are whitish-green: elevated G, elevated B & R (>95)
    is_sparkle = (patch[:, :, 1] > 160) & (patch[:, :, 0] > 95) & (patch[:, :, 2] > 95)
    patch[is_sparkle] = [46, 203, 54] # Chroma background green
    out[y1:y2, x1:x2] = patch
    return out

def chroma_key(bgr_img):
    h, w, _ = bgr_img.shape
    b = bgr_img[:, :, 0].astype(np.float32)
    g = bgr_img[:, :, 1].astype(np.float32)
    r = bgr_img[:, :, 2].astype(np.float32)
    diff = g - np.maximum(r, b)

    # Pure background green in the H264 video
    is_green = (diff > 65) & (g > 135) & (b < 95) & (r < 95)

    flood_mask = np.zeros((h + 2, w + 2), dtype=np.uint8)
    flood_mask[1:h+1, 1:w+1] = (~is_green).astype(np.uint8)

    h_canvas = np.zeros((h, w), dtype=np.uint8)
    for x in range(0, w, 4):
        if is_green[0, x] and flood_mask[1, x+1] == 0:
            cv2.floodFill(h_canvas, flood_mask, (x, 0), 255)
        if is_green[h-1, x] and flood_mask[h, x+1] == 0:
            cv2.floodFill(h_canvas, flood_mask, (x, h-1), 255)
    for y in range(0, h, 4):
        if is_green[y, 0] and flood_mask[y+1, 1] == 0:
            cv2.floodFill(h_canvas, flood_mask, (0, y), 255)
        if is_green[y, w-1] and flood_mask[y+1, w] == 0:
            cv2.floodFill(h_canvas, flood_mask, (w-1, y), 255)

    alpha = np.where(h_canvas == 255, 0, 255).astype(np.uint8)

    # Clean trapped outer green pockets near boundary
    alpha[is_green & (alpha > 0)] = 0

    # Despill filter
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    bg_dilated = cv2.dilate((alpha == 0).astype(np.uint8), kernel)
    edge_pixels = (bg_dilated > 0) & (alpha > 0)

    out_bgr = bgr_img.copy()
    edge_g = out_bgr[:, :, 1].astype(np.float32)
    edge_max_rb = np.maximum(out_bgr[:, :, 0], out_bgr[:, :, 2]).astype(np.float32)
    spill = edge_pixels & (edge_g > edge_max_rb)
    out_bgr[spill, 1] = edge_max_rb[spill]

    # Snap dark edge fringe to neutral #121212
    dark_edge = edge_pixels & (out_bgr[:, :, 0] < 70) & (out_bgr[:, :, 1] < 80) & (out_bgr[:, :, 2] < 70)
    out_bgr[dark_edge] = [18, 18, 18]

    rgba = cv2.cvtColor(out_bgr, cv2.COLOR_BGR2RGBA)
    rgba[:, :, 3] = alpha
    return rgba

def process_single_pet(pet_info, base_out_dir):
    pet_id = pet_info["id"]
    video_path = pet_info["batch_video"]
    cell_idx = pet_info["cell"]
    is_cell6 = pet_info["is_cell6"]
    target_w, target_h = pet_info["target_size"]
    num_frames = 16

    print(f"\n[{pet_info['icon']}] Processing '{pet_info['name_vi']}' ({pet_id}) from Cell {cell_idx}...")

    cap = cv2.VideoCapture(video_path)
    total_f = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
    fw = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    fh = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    cap.set(cv2.CAP_PROP_POS_FRAMES, 20)
    _, sample_frame = cap.read()
    col_ranges, row_ranges = find_dividers(sample_frame)
    x1, y1, x2, y2 = get_cell_coords(fw, fh, cell_idx, col_ranges, row_ranges)

    def extract_state_frames(start_sec, end_sec):
        sf = max(0, min(total_f - 1, int(start_sec * fps)))
        ef = max(sf + 1, min(total_f - 1, int(end_sec * fps)))
        indices = [int(sf + i * (ef - sf) / (num_frames - 1)) for i in range(num_frames)]
        raws, cleans = [], []
        for fid in indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, fid)
            ret, frame = cap.read()
            if not ret: continue
            raw_cell = frame[y1:y2, x1:x2].copy()
            raws.append(raw_cell)
            clean_cell = clean_watermark(raw_cell, is_cell6)
            rgba = chroma_key(clean_cell)
            cleans.append(rgba)
        return raws, cleans

    raw_idle, clean_idle = extract_state_frames(*pet_info["idle_range"])
    raw_atk, clean_atk = extract_state_frames(*pet_info["atk_range"])
    cap.release()

    # Shared unified bounding box across ALL 32 frames (Idle + Attack)
    all_alphas = [f[:, :, 3] for f in clean_idle] + [f[:, :, 3] for f in clean_atk]
    union_alpha = np.maximum.reduce(all_alphas)
    coords = cv2.findNonZero((union_alpha > 0).astype(np.uint8))
    if coords is not None:
        bx, by, bw, bh = cv2.boundingRect(coords)
    else:
        bx, by, bw, bh = 0, 0, clean_idle[0].shape[1], clean_idle[0].shape[0]

    pad_x = max(2, int(bw * 0.05))
    pad_y = max(2, int(bh * 0.05))
    ch_h, ch_w, _ = clean_idle[0].shape
    crop_x1 = max(0, bx - pad_x)
    crop_y1 = max(0, by - pad_y)
    crop_x2 = min(ch_w, bx + bw + pad_x)
    crop_y2 = min(ch_h, by + bh + pad_y)
    c_w = crop_x2 - crop_x1
    c_h = crop_y2 - crop_y1

    # Fixed scale for both states
    scale = min((target_w - 6) / max(1, c_w), (target_h - 6) / max(1, c_h))
    new_w = max(1, int(c_w * scale))
    new_h = max(1, int(c_h * scale))

    def align_and_anchor(cleans):
        anchored = []
        for p in cleans:
            crop = p[crop_y1:crop_y2, crop_x1:crop_x2]
            resized = cv2.resize(crop, (new_w, new_h), interpolation=cv2.INTER_NEAREST)
            canvas = np.zeros((target_h, target_w, 4), dtype=np.uint8)
            ox = (target_w - new_w) // 2
            oy = target_h - new_h - 2 # Bottom feet ground anchored
            canvas[oy:oy+new_h, ox:ox+nw if 'nw' in locals() else ox+new_w] = resized
            anchored.append(canvas)
        return anchored

    anchored_idle = align_and_anchor(clean_idle)
    anchored_atk = align_and_anchor(clean_atk)

    # Output directory structure
    pet_dir = os.path.join(base_out_dir, pet_id)
    raw_idle_dir = os.path.join(pet_dir, "01_raw_frames", "idle")
    raw_atk_dir = os.path.join(pet_dir, "01_raw_frames", "attack")
    proc_idle_dir = os.path.join(pet_dir, "02_processed_frames", "idle")
    proc_atk_dir = os.path.join(pet_dir, "02_processed_frames", "attack")
    sheet_dir = os.path.join(pet_dir, "03_spritesheet")

    for d in [raw_idle_dir, raw_atk_dir, proc_idle_dir, proc_atk_dir, sheet_dir]:
        os.makedirs(d, exist_ok=True)

    # 1. Save Raw frames
    for i, rf in enumerate(raw_idle):
        cv2.imwrite(os.path.join(raw_idle_dir, f"frame_{i:03d}.png"), rf)
    for i, rf in enumerate(raw_atk):
        cv2.imwrite(os.path.join(raw_atk_dir, f"frame_{i:03d}.png"), rf)

    # 2. Save Processed frames
    for i, pf in enumerate(anchored_idle):
        cv2.imwrite(os.path.join(proc_idle_dir, f"clean_{i:03d}.png"), cv2.cvtColor(pf, cv2.COLOR_RGBA2BGRA))
    for i, pf in enumerate(anchored_atk):
        cv2.imwrite(os.path.join(proc_atk_dir, f"clean_{i:03d}.png"), cv2.cvtColor(pf, cv2.COLOR_RGBA2BGRA))

    # 3. Build Spritesheets & GIFs
    # Idle strip (1600 x 100)
    idle_strip = np.zeros((target_h, target_w * num_frames, 4), dtype=np.uint8)
    for i, f in enumerate(anchored_idle):
        idle_strip[:, i*target_w:(i+1)*target_w] = f
    idle_strip_path = os.path.join(sheet_dir, f"{pet_id}_idle_strip.png")
    cv2.imwrite(idle_strip_path, cv2.cvtColor(idle_strip, cv2.COLOR_RGBA2BGRA))

    # Attack strip (1600 x 100)
    atk_strip = np.zeros((target_h, target_w * num_frames, 4), dtype=np.uint8)
    for i, f in enumerate(anchored_atk):
        atk_strip[:, i*target_w:(i+1)*target_w] = f
    atk_strip_path = os.path.join(sheet_dir, f"{pet_id}_attack_strip.png")
    cv2.imwrite(atk_strip_path, cv2.cvtColor(atk_strip, cv2.COLOR_RGBA2BGRA))

    # Still frame (Frame 0 of idle)
    still_path = os.path.join(sheet_dir, f"{pet_id}_still.png")
    cv2.imwrite(still_path, cv2.cvtColor(anchored_idle[0], cv2.COLOR_RGBA2BGRA))

    # Backward compatibility copies
    cv2.imwrite(os.path.join(sheet_dir, f"{pet_id}_strip.png"), cv2.cvtColor(idle_strip, cv2.COLOR_RGBA2BGRA))

    # Animated GIFs (16 frames at 100ms per frame -> 10 fps)
    pil_idle = [Image.fromarray(f) for f in anchored_idle]
    idle_gif_path = os.path.join(sheet_dir, f"{pet_id}_idle.gif")
    pil_idle[0].save(idle_gif_path, save_all=True, append_images=pil_idle[1:], duration=100, loop=0, disposal=2)

    pil_atk = [Image.fromarray(f) for f in anchored_atk]
    atk_gif_path = os.path.join(sheet_dir, f"{pet_id}_attack.gif")
    pil_atk[0].save(atk_gif_path, save_all=True, append_images=pil_atk[1:], duration=100, loop=0, disposal=2)

    # Backward compatibility GIF
    pil_idle[0].save(os.path.join(sheet_dir, f"{pet_id}_anim.gif"), save_all=True, append_images=pil_idle[1:], duration=100, loop=0, disposal=2)

    # 4. Save metadata manifest
    meta = {
        "pet_id": pet_id,
        "name_vi": pet_info["name_vi"],
        "icon": pet_info["icon"],
        "cell_index": cell_idx,
        "batch_video": os.path.basename(video_path),
        "frame_size": [target_w, target_h],
        "states": {
            "idle": {
                "frame_count": num_frames,
                "fps": 10,
                "range_sec": pet_info["idle_range"],
                "strip": f"{pet_id}_idle_strip.png",
                "gif": f"{pet_id}_idle.gif"
            },
            "attack": {
                "frame_count": num_frames,
                "fps": 10,
                "range_sec": pet_info["atk_range"],
                "strip": f"{pet_id}_attack_strip.png",
                "gif": f"{pet_id}_attack.gif"
            }
        },
        "still": f"{pet_id}_still.png",
        "compat": {
            "strip": f"{pet_id}_strip.png",
            "gif": f"{pet_id}_anim.gif"
        }
    }
    with open(os.path.join(sheet_dir, "metadata.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)

    print(f"✓ Completed {pet_info['name_vi']}: 16f Idle + 16f Attack (100x100)")
    return meta

def main():
    base_out = r"C:\Users\phant\.gemini\antigravity\scratch\tower-of-knowledge\public\assets\pets"
    os.makedirs(base_out, exist_ok=True)
    
    print("=====================================================")
    print("  STARTING AUTOMATED PROCESSING OF ALL 12 PETS")
    print("  16-Frame Idle + 16-Frame Attack (32 Keyframes / Pet)")
    print("=====================================================")

    results = []
    for pet in PET_DEFINITIONS:
        try:
            res = process_single_pet(pet, base_out)
            results.append(res)
        except Exception as e:
            print(f"✗ ERROR processing {pet['id']}: {e}")

    summary_file = os.path.join(base_out, "all_pets_catalog.json")
    with open(summary_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print("\n=====================================================")
    print(f"✓ ALL 12 PETS SUCCESSFULLY PROCESSED AND PACKAGED!")
    print(f"Catalog saved to: {summary_file}")
    print("=====================================================")

if __name__ == "__main__":
    main()
