"""
REPROCESS 10 PETS WITH 24-FRAME HIGH-SMOOTHNESS LOOPS
Removes Wolf and Otter.
Processes 10 clean pets:
- 24 frames Idle (natural looping cycle, 70ms/frame)
- 24 frames Attack (smooth skill execution & return)
- Unified bounding box across all 48 frames
- Preserves green/cyan details (Panda bamboo, Turtle skin, Neko bell, Byte screen, etc.)
"""

import os
import sys
import json
import cv2
import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

PET_CONFIGS = [
    # Batch 1 (video 1)
    {
        "id": "pyra_phoenix",
        "name_vi": "Phượng Hoàng Lửa Pyra",
        "icon": "🔥",
        "video": r"C:\Users\phant\Downloads\ado\gemini_batch1_pets.mp4",
        "cell": 1,
        "idle_frames": (14, 38),   # 1 full continuous wing flap cycle
        "atk_frames": (120, 220),  # Full attack and recovery
    },
    {
        "id": "kim_quy_turtle",
        "name_vi": "Rùa Thần Kim Quy",
        "icon": "🐢",
        "video": r"C:\Users\phant\Downloads\ado\gemini_batch1_pets.mp4",
        "cell": 2,
        "idle_frames": (12, 50),
        "atk_frames": (120, 220),
    },
    {
        "id": "stone_golem",
        "name_vi": "Người Đá Golem Cổ Đại",
        "icon": "🗿",
        "video": r"C:\Users\phant\Downloads\ado\gemini_batch1_pets.mp4",
        "cell": 3,
        "idle_frames": (12, 44),
        "atk_frames": (120, 220),
        "flip_horizontal": True,
    },
    {
        "id": "maneki_neko",
        "name_vi": "Mèo Thần Tài Neko",
        "icon": "🐱",
        "video": r"C:\Users\phant\Downloads\ado\gemini_batch1_pets.mp4",
        "cell": 4,
        "idle_frames": (12, 46),
        "atk_frames": (120, 220),
    },
    {
        "id": "bambo_panda",
        "name_vi": "Gấu Trúc Bambo",
        "icon": "🐼",
        "video": r"C:\Users\phant\Downloads\ado\gemini_batch1_pets.mp4",
        "cell": 5,
        "idle_frames": (12, 46),
        "atk_frames": (120, 220),
    },

    # Batch 2 (video 2)
    {
        "id": "byte_robot",
        "name_vi": "Robot Khối Byte",
        "icon": "🤖",
        "video": r"C:\Users\phant\Downloads\ado\gemini_batch2_pets.mp4",
        "cell": 1,
        "idle_frames": (12, 48),
        "atk_frames": (120, 220),
    },
    {
        "id": "astra_stag",
        "name_vi": "Hươu Tinh Tú Astra",
        "icon": "🦌",
        "video": r"C:\Users\phant\Downloads\ado\gemini_batch2_pets.mp4",
        "cell": 2,
        "idle_frames": (12, 50),
        "atk_frames": (120, 220),
    },
    {
        "id": "kylin_qilin",
        "name_vi": "Kỳ Lân Mây Kylin",
        "icon": "🦄",
        "video": r"C:\Users\phant\Downloads\ado\gemini_batch2_pets.mp4",
        "cell": 3,
        "idle_frames": (12, 48),
        "atk_frames": (120, 220),
        "flip_horizontal": True,
    },
    {
        "id": "inky_octopus",
        "name_vi": "Bạch Tuộc Học Giả Inky",
        "icon": "🐙",
        "video": r"C:\Users\phant\Downloads\ado\gemini_batch2_pets.mp4",
        "cell": 4,
        "idle_frames": (12, 54),
        "atk_frames": (120, 220),
    },
    {
        "id": "spike_hedgehog",
        "name_vi": "Nhím Giấy Ghi Chú Spike",
        "icon": "🦔",
        "video": r"C:\Users\phant\Downloads\ado\gemini_batch2_pets.mp4",
        "cell": 5,
        "idle_frames": (12, 50),
        "atk_frames": (120, 220),
        "flip_horizontal": True,
    }
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

def chroma_key(bgr_img):
    h, w, _ = bgr_img.shape
    b = bgr_img[:, :, 0].astype(np.float32)
    g = bgr_img[:, :, 1].astype(np.float32)
    r = bgr_img[:, :, 2].astype(np.float32)
    diff = g - np.maximum(r, b)

    is_green = (diff > 65) & (g > 135) & (b < 95) & (r < 95)

    flood_mask = np.zeros((h + 2, w + 2), dtype=np.uint8)
    flood_mask[1:h+1, 1:w+1] = (~is_green).astype(np.uint8)

    h_canvas = np.zeros((h, w), dtype=np.uint8)
    for x in range(0, w, 4):
        if is_green[0, x] and flood_mask[1, x+1] == 0: cv2.floodFill(h_canvas, flood_mask, (x, 0), 255)
        if is_green[h-1, x] and flood_mask[h, x+1] == 0: cv2.floodFill(h_canvas, flood_mask, (x, h-1), 255)
    for y in range(0, h, 4):
        if is_green[y, 0] and flood_mask[y+1, 1] == 0: cv2.floodFill(h_canvas, flood_mask, (0, y), 255)
        if is_green[y, w-1] and flood_mask[y+1, w] == 0: cv2.floodFill(h_canvas, flood_mask, (w-1, y), 255)

    alpha = np.where(h_canvas == 255, 0, 255).astype(np.uint8)
    alpha[is_green & (alpha > 0)] = 0

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    bg_dilated = cv2.dilate((alpha == 0).astype(np.uint8), kernel)
    edge_pixels = (bg_dilated > 0) & (alpha > 0)

    out_bgr = bgr_img.copy()
    edge_g = out_bgr[:, :, 1].astype(np.float32)
    edge_max_rb = np.maximum(out_bgr[:, :, 0], out_bgr[:, :, 2]).astype(np.float32)
    spill = edge_pixels & (edge_g > edge_max_rb)
    out_bgr[spill, 1] = edge_max_rb[spill]

    dark_edge = edge_pixels & (out_bgr[:, :, 0] < 70) & (out_bgr[:, :, 1] < 80) & (out_bgr[:, :, 2] < 70)
    out_bgr[dark_edge] = [18, 18, 18]

    rgba = cv2.cvtColor(out_bgr, cv2.COLOR_BGR2RGBA)
    rgba[:, :, 3] = alpha
    return rgba

def process_smooth_pet(cfg, base_dir, brain_dir):
    pet_id = cfg["id"]
    print(f"\n[{cfg['icon']}] Processing '{cfg['name_vi']}' ({pet_id}) with 24 frames...")
    
    cap = cv2.VideoCapture(cfg["video"])
    fw = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    fh = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    cap.set(cv2.CAP_PROP_POS_FRAMES, 20)
    _, sample = cap.read()
    col_ranges, row_ranges = find_dividers(sample)
    x1, y1, x2, y2 = get_cell_coords(fw, fh, cfg["cell"], col_ranges, row_ranges)

    def extract_sequence(start_f, end_f, num_f=24):
        indices = [int(start_f + i * (end_f - start_f) / (num_f - 1)) for i in range(num_f)]
        raws, cleans = [], []
        for fid in indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, fid)
            ret, frame = cap.read()
            if not ret: continue
            raw_cell = frame[y1:y2, x1:x2].copy()
            raws.append(raw_cell)
            clean_cell = chroma_key(raw_cell)
            cleans.append(clean_cell)
        return raws, cleans

    raw_idle, clean_idle = extract_sequence(*cfg["idle_frames"], num_f=24)
    raw_atk, clean_atk = extract_sequence(*cfg["atk_frames"], num_f=24)
    cap.release()

    # Shared bounding box across all 48 frames (24 idle + 24 attack)
    all_alphas = [f[:, :, 3] for f in clean_idle] + [f[:, :, 3] for f in clean_atk]
    union_alpha = np.maximum.reduce(all_alphas)
    coords = cv2.findNonZero((union_alpha > 0).astype(np.uint8))
    bx, by, bw, bh = cv2.boundingRect(coords)

    pad_x, pad_y = max(2, int(bw * 0.05)), max(2, int(bh * 0.05))
    ch_h, ch_w = clean_idle[0].shape[:2]
    crop_x1 = max(0, bx - pad_x)
    crop_y1 = max(0, by - pad_y)
    crop_x2 = min(ch_w, bx + bw + pad_x)
    crop_y2 = min(ch_h, by + bh + pad_y)
    c_w = crop_x2 - crop_x1
    c_h = crop_y2 - crop_y1

    target_size = (100, 100)
    scale = min(94 / max(1, c_w), 94 / max(1, c_h))
    new_w = max(1, int(c_w * scale))
    new_h = max(1, int(c_h * scale))

    def anchor(cleans):
        anchored = []
        for p in cleans:
            crop = p[crop_y1:crop_y2, crop_x1:crop_x2]
            res = cv2.resize(crop, (new_w, new_h), interpolation=cv2.INTER_NEAREST)
            canvas = np.zeros((100, 100, 4), dtype=np.uint8)
            ox = (100 - new_w) // 2
            oy = 100 - new_h - 2 # Ground planted
            canvas[oy:oy+new_h, ox:ox+new_w] = res
            anchored.append(canvas)
        return anchored

    anchored_idle = anchor(clean_idle)
    anchored_atk = anchor(clean_atk)
    if cfg.get("flip_horizontal"):
        anchored_idle = [cv2.flip(f, 1) for f in anchored_idle]
        anchored_atk = [cv2.flip(f, 1) for f in anchored_atk]

    # Directories
    pet_dir = os.path.join(base_dir, pet_id)
    raw_idle_dir = os.path.join(pet_dir, "01_raw_frames", "idle")
    raw_atk_dir = os.path.join(pet_dir, "01_raw_frames", "attack")
    proc_idle_dir = os.path.join(pet_dir, "02_processed_frames", "idle")
    proc_atk_dir = os.path.join(pet_dir, "02_processed_frames", "attack")
    sheet_dir = os.path.join(pet_dir, "03_spritesheet")

    for d in [raw_idle_dir, raw_atk_dir, proc_idle_dir, proc_atk_dir, sheet_dir]:
        os.makedirs(d, exist_ok=True)

    # Save raw & processed frames
    for i, rf in enumerate(raw_idle): cv2.imwrite(os.path.join(raw_idle_dir, f"frame_{i:03d}.png"), rf)
    for i, rf in enumerate(raw_atk): cv2.imwrite(os.path.join(raw_atk_dir, f"frame_{i:03d}.png"), rf)
    for i, pf in enumerate(anchored_idle): cv2.imwrite(os.path.join(proc_idle_dir, f"clean_{i:03d}.png"), cv2.cvtColor(pf, cv2.COLOR_RGBA2BGRA))
    for i, pf in enumerate(anchored_atk): cv2.imwrite(os.path.join(proc_atk_dir, f"clean_{i:03d}.png"), cv2.cvtColor(pf, cv2.COLOR_RGBA2BGRA))

    # Build 24-frame horizontal strips (2400 x 100)
    idle_strip = np.zeros((100, 2400, 4), dtype=np.uint8)
    for i, f in enumerate(anchored_idle): idle_strip[:, i*100:(i+1)*100] = f
    cv2.imwrite(os.path.join(sheet_dir, f"{pet_id}_idle_strip.png"), cv2.cvtColor(idle_strip, cv2.COLOR_RGBA2BGRA))
    cv2.imwrite(os.path.join(sheet_dir, f"{pet_id}_strip.png"), cv2.cvtColor(idle_strip, cv2.COLOR_RGBA2BGRA))

    atk_strip = np.zeros((100, 2400, 4), dtype=np.uint8)
    for i, f in enumerate(anchored_atk): atk_strip[:, i*100:(i+1)*100] = f
    cv2.imwrite(os.path.join(sheet_dir, f"{pet_id}_attack_strip.png"), cv2.cvtColor(atk_strip, cv2.COLOR_RGBA2BGRA))

    # Still frame
    cv2.imwrite(os.path.join(sheet_dir, f"{pet_id}_still.png"), cv2.cvtColor(anchored_idle[0], cv2.COLOR_RGBA2BGRA))

    # GIFs (24 frames, duration 70ms = ~14.3 fps, smooth and natural)
    pil_idle = [Image.fromarray(f) for f in anchored_idle]
    idle_gif_path = os.path.join(sheet_dir, f"{pet_id}_idle.gif")
    pil_idle[0].save(idle_gif_path, save_all=True, append_images=pil_idle[1:], duration=70, loop=0, disposal=2)
    pil_idle[0].save(os.path.join(sheet_dir, f"{pet_id}_anim.gif"), save_all=True, append_images=pil_idle[1:], duration=70, loop=0, disposal=2)

    pil_atk = [Image.fromarray(f) for f in anchored_atk]
    atk_gif_path = os.path.join(sheet_dir, f"{pet_id}_attack.gif")
    pil_atk[0].save(atk_gif_path, save_all=True, append_images=pil_atk[1:], duration=70, loop=0, disposal=2)

    # Copy to brain dir for direct preview
    pil_idle[0].save(os.path.join(brain_dir, f"{pet_id}_idle.gif"), save_all=True, append_images=pil_idle[1:], duration=70, loop=0, disposal=2)
    pil_atk[0].save(os.path.join(brain_dir, f"{pet_id}_attack.gif"), save_all=True, append_images=pil_atk[1:], duration=70, loop=0, disposal=2)
    cv2.imwrite(os.path.join(brain_dir, f"{pet_id}_still.png"), cv2.cvtColor(anchored_idle[0], cv2.COLOR_RGBA2BGRA))

    meta = {
        "pet_id": pet_id,
        "name_vi": cfg["name_vi"],
        "icon": cfg["icon"],
        "cell_index": cfg["cell"],
        "frame_size": [100, 100],
        "frame_count": 24,
        "fps": 14.3,
        "duration_ms": 70,
        "states": {
            "idle": { "frame_count": 24, "strip": f"{pet_id}_idle_strip.png", "gif": f"{pet_id}_idle.gif" },
            "attack": { "frame_count": 24, "strip": f"{pet_id}_attack_strip.png", "gif": f"{pet_id}_attack.gif" }
        },
        "still": f"{pet_id}_still.png"
    }
    with open(os.path.join(sheet_dir, "metadata.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)

    print(f"✓ Completed {cfg['name_vi']} (24f Idle + 24f Attack)")
    return meta

def main():
    base_dir = r"C:\Users\phant\.gemini\antigravity\scratch\tower-of-knowledge\public\assets\pets"
    brain_dir = r"C:\Users\phant\.gemini\antigravity\brain\1749ee9f-cdb1-4857-9457-40771305fd29"
    
    print("=====================================================")
    print("  REPROCESSING 10 PETS WITH 24-FRAME SILKY LOOPS")
    print("  (Wolf and Otter excluded)")
    print("=====================================================")

    results = []
    for cfg in PET_CONFIGS:
        try:
            res = process_smooth_pet(cfg, base_dir, brain_dir)
            results.append(res)
        except Exception as e:
            print(f"✗ ERROR on {cfg['id']}: {e}")

    summary_file = os.path.join(base_dir, "all_pets_catalog.json")
    with open(summary_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print("\n✓ ALL 10 PETS FINISHED AT 24-FRAME HIGH-SMOOTHNESS!")

if __name__ == "__main__":
    main()
