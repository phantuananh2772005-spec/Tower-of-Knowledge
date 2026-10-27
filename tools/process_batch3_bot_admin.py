"""
BATCH 3 PIPELINE - 4 BOT PETS + 2 ADMIN PETS
Video: gemini_generated_video_aa6bddb6.mp4 (1280x720, 24fps, 10s, 3x2 grid)

Steps per pet:
  1. Cell 6 only: remove the static semi-transparent Gemini watermark by inverse alpha
     blending (estimated from the median frame) - no cropping of the pet.
  2. Blank the text label at the top of every cell.
  3. Chroma key (bright green + dark green ground shadow), despill edges.
  4. Auto-detect the most seamless idle loop in the first half (no duplicated seam frame).
  5. Unified bbox -> 100x100 canvas, ground anchored, nearest-neighbour (crisp pixels).
  6. Optional horizontal flip baked into the source files.
  7. Export raw/processed frames, 2400x100 strips, still, GIFs (70 ms), metadata.
"""
import os, sys, json
import cv2
import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

VIDEO = r"C:\Users\phant\Downloads\ado\gemini_generated_video_aa6bddb6.mp4"
BASE_DIR = r"C:\Users\phant\.gemini\antigravity\scratch\tower-of-knowledge\public\assets\pets"
BRAIN_DIR = r"C:\Users\phant\.gemini\antigravity\brain\1749ee9f-cdb1-4857-9457-40771305fd29"

# Cell rectangles (x1, y1, x2, y2) inside the 1280x720 frame, black dividers excluded
COLS = [(0, 424), (428, 851), (855, 1279)]
ROWS = [(0, 358), (362, 719)]
LABEL_H = 36          # text label band at the top of each cell
MARGIN = 3

# Bots face LEFT (they always stand on the opponent side), admin pets face RIGHT
PETS = [
    {"id": "bot_gloop",    "name_vi": "Slime Tập Sự Gloop",     "icon": "💧", "role": "bot",   "tier": "🌱 Khởi nguyên", "cell": 1, "flip": False},
    {"id": "bot_tickbot",  "name_vi": "Cú Cót Tickbot",         "icon": "⚙️", "role": "bot",   "tier": "⚡ Tinh thông",  "cell": 2, "flip": False},
    {"id": "bot_glitchy",  "name_vi": "Bóng Ma Lỗi Glitchy",    "icon": "👾", "role": "bot",   "tier": "🌟 Xuất chúng",  "cell": 3, "flip": False},
    {"id": "bot_dracobot", "name_vi": "Long Giáp Dracobot",     "icon": "🐲", "role": "bot",   "tier": "👑 Trùm cuối",   "cell": 4, "flip": True},
    {"id": "admin_aurum",  "name_vi": "Kim Long Aurum",         "icon": "🐉", "role": "admin", "tier": "Quản trị viên", "cell": 5, "flip": True},
    {"id": "admin_nguyet", "name_vi": "Thỏ Nguyệt Thẩm Phán",   "icon": "🐰", "role": "admin", "tier": "Quản trị viên", "cell": 6, "flip": True},
]

# Gemini watermark search box inside cell 6 (cell-local coords), found by temporal analysis
LOGO_BOX = (270, 204, 340, 272)
LOGO_STAR_CENTER = (305, 237)   # cell-local centre of the 4-point star
LOGO_DEBUG = {}


def load_frames():
    cap = cv2.VideoCapture(VIDEO)
    frames = []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        frames.append(f)
    cap.release()
    return frames


def cell_rect(idx):
    i = idx - 1
    (cx1, cx2), (ry1, ry2) = COLS[i % 3], ROWS[i // 3]
    return cx1 + MARGIN, ry1 + MARGIN, cx2 - MARGIN, ry2 - MARGIN


def build_logo_remover(frames):
    """Estimate watermark alpha a(x,y): observed = a*255 + (1-a)*under. Return an inverse fn."""
    x1, y1, x2, y2 = cell_rect(6)
    lx1, ly1, lx2, ly2 = LOGO_BOX
    stack = np.stack([f[y1 + ly1:y1 + ly2, x1 + lx1:x1 + lx2].astype(np.float32) for f in frames])
    med = np.median(stack, axis=0)
    # background colour = median of the box border
    border = np.concatenate([med[0], med[-1], med[:, 0], med[:, -1]])
    bg = np.median(border, axis=0)
    # A pure white overlay lifts R, G and B by the SAME fraction a: (c - bg) / (255 - bg).
    # Pet pixels (yellow moon glow, white tail, navy cloak) do not satisfy that, so they are excluded.
    a_r = (med[..., 2] - bg[2]) / max(1.0, 255 - bg[2])
    a_g = (med[..., 1] - bg[1]) / max(1.0, 255 - bg[1])
    a_b = (med[..., 0] - bg[0]) / max(1.0, 255 - bg[0])
    consistent = (np.abs(a_r - a_b) < 0.12) & (np.abs(a_r - a_g) < 0.15) & (a_r > 0.03) & (a_r < 0.6)
    # keep only the connected blob that contains the star centre
    n, lab, _, _ = cv2.connectedComponentsWithStats(consistent.astype(np.uint8), connectivity=8)
    sx, sy = LOGO_STAR_CENTER[0] - lx1, LOGO_STAR_CENTER[1] - ly1
    star = (lab == lab[sy, sx]) if lab[sy, sx] > 0 else np.zeros_like(consistent)
    star = cv2.morphologyEx(star.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8)) > 0
    alpha = np.where(star, np.clip((a_r + a_g + a_b) / 3.0, 0, 0.6), 0).astype(np.float32)
    # 2-px ring around the star catches the soft anti-aliased rim of the watermark
    ring = (cv2.dilate(star.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0) & ~star
    print(f"   logo: bg={bg.round(0)}, star pixels={int(star.sum())}, max alpha={alpha.max():.2f}")
    LOGO_DEBUG["star"], LOGO_DEBUG["ring"] = star, ring

    def remove(cell_bgr):
        out = cell_bgr.astype(np.float32)
        region = out[ly1:ly2, lx1:lx2]
        a = alpha[..., None]
        restored = (region - a * 255.0) / (1.0 - a)
        region = np.where(a > 0, restored, region)
        # rim pixels: if they are still background-like green, snap them to the exact bg colour
        greenish = (region[..., 1] - np.maximum(region[..., 0], region[..., 2]) > 60)
        snap = (star | ring) & greenish
        region[snap] = bg
        out[ly1:ly2, lx1:lx2] = region
        return np.clip(out, 0, 255).astype(np.uint8)

    return remove


def chroma_key(bgr):
    h, w, _ = bgr.shape
    b, g, r = [bgr[..., i].astype(np.int32) for i in range(3)]
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    hue, sat, val = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    bright_green = (g - np.maximum(r, b) > 60) & (g > 120)
    dark_green = (hue >= 45) & (hue <= 80) & (sat > 110) & (val > 40) & (g > r + 25) & (g > b + 25)
    is_green = bright_green | dark_green

    alpha = np.where(is_green, 0, 255).astype(np.uint8)
    # drop isolated specks (compression noise) smaller than 6 px
    n, lab, st, _ = cv2.connectedComponentsWithStats((alpha > 0).astype(np.uint8), connectivity=8)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] < 6:
            alpha[lab == i] = 0

    out = bgr.copy()
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    edge = (cv2.dilate((alpha == 0).astype(np.uint8), kernel) > 0) & (alpha > 0)
    mx = np.maximum(out[..., 0], out[..., 2])
    spill = edge & (out[..., 1] > mx)
    out[..., 1][spill] = mx[spill]                     # despill green fringe
    rgba = cv2.cvtColor(out, cv2.COLOR_BGR2RGBA)
    rgba[..., 3] = alpha
    return rgba


def loop_score_frames(frames, rect):
    x1, y1, x2, y2 = rect
    return [cv2.resize(cv2.cvtColor(f[y1:y2, x1:x2], cv2.COLOR_BGR2GRAY), (96, 80)).astype(np.float32)
            for f in frames]


def best_loop(small, lo=4, hi=118, min_len=24, max_len=60):
    best = None
    for L in range(min_len, max_len + 1):
        for s in range(lo, hi - L):
            d = float(np.mean(np.abs(small[s] - small[s + L])))
            d += 0.02 * (60 - L)            # slight preference for longer, calmer cycles
            if best is None or d < best[0]:
                best = (d, s, L)
    return best


def process(cfg, frames, logo_remove):
    pid = cfg["id"]
    rect = cell_rect(cfg["cell"])
    x1, y1, x2, y2 = rect
    small = loop_score_frames(frames, rect)
    score, s, L = best_loop(small)
    idle_idx = [s + int(i * L / 24) for i in range(24)]              # exclusive end: seamless
    atk_s, atk_e = 124, min(len(frames) - 2, 232)
    atk_idx = [atk_s + int(i * (atk_e - atk_s) / 24) for i in range(24)]
    print(f"[{cfg['icon']}] {pid}: idle loop start={s} len={L} (score {score:.2f})")

    def extract(indices):
        raws, cleans = [], []
        for fi in indices:
            cell = frames[fi][y1:y2, x1:x2].copy()
            if cfg["cell"] == 6:
                cell = logo_remove(cell)
            cell[:LABEL_H] = (60, 180, 50)         # paint the text label band as background
            raws.append(cell)
            cleans.append(chroma_key(cell))
        return raws, cleans

    raw_idle, clean_idle = extract(idle_idx)
    raw_atk, clean_atk = extract(atk_idx)

    union = np.maximum.reduce([c[..., 3] for c in clean_idle + clean_atk])
    bx, by, bw, bh = cv2.boundingRect(cv2.findNonZero((union > 0).astype(np.uint8)))
    pad = 3
    ch, cw = union.shape
    cx1, cy1 = max(0, bx - pad), max(0, by - pad)
    cx2, cy2 = min(cw, bx + bw + pad), min(ch, by + bh + pad)
    scale = min(94 / (cx2 - cx1), 94 / (cy2 - cy1))
    nw, nh = max(1, int((cx2 - cx1) * scale)), max(1, int((cy2 - cy1) * scale))

    def anchor(cleans):
        out = []
        for c in cleans:
            res = cv2.resize(c[cy1:cy2, cx1:cx2], (nw, nh), interpolation=cv2.INTER_NEAREST)
            canvas = np.zeros((100, 100, 4), np.uint8)
            ox, oy = (100 - nw) // 2, 100 - nh - 2
            canvas[oy:oy + nh, ox:ox + nw] = res
            out.append(cv2.flip(canvas, 1) if cfg["flip"] else canvas)
        return out

    idle, atk = anchor(clean_idle), anchor(clean_atk)

    pdir = os.path.join(BASE_DIR, pid)
    dirs = {k: os.path.join(pdir, *k.split("/")) for k in
            ["01_raw_frames/idle", "01_raw_frames/attack", "02_processed_frames/idle",
             "02_processed_frames/attack", "03_spritesheet"]}
    for d in dirs.values():
        os.makedirs(d, exist_ok=True)
    for i, f in enumerate(raw_idle): cv2.imwrite(os.path.join(dirs["01_raw_frames/idle"], f"frame_{i:03d}.png"), f)
    for i, f in enumerate(raw_atk): cv2.imwrite(os.path.join(dirs["01_raw_frames/attack"], f"frame_{i:03d}.png"), f)
    for i, f in enumerate(idle): Image.fromarray(f).save(os.path.join(dirs["02_processed_frames/idle"], f"clean_{i:03d}.png"))
    for i, f in enumerate(atk): Image.fromarray(f).save(os.path.join(dirs["02_processed_frames/attack"], f"clean_{i:03d}.png"))

    sheet = dirs["03_spritesheet"]

    def strip(fr):
        st = np.zeros((100, 100 * len(fr), 4), np.uint8)
        for i, f in enumerate(fr):
            st[:, i * 100:(i + 1) * 100] = f
        return Image.fromarray(st)

    strip(idle).save(os.path.join(sheet, f"{pid}_idle_strip.png"))
    strip(idle).save(os.path.join(sheet, f"{pid}_strip.png"))
    strip(atk).save(os.path.join(sheet, f"{pid}_attack_strip.png"))
    Image.fromarray(idle[0]).save(os.path.join(sheet, f"{pid}_still.png"))
    Image.fromarray(idle[0]).save(os.path.join(BRAIN_DIR, f"{pid}_still.png"))

    def gif(fr, path):
        ims = [Image.fromarray(f) for f in fr]
        ims[0].save(path, save_all=True, append_images=ims[1:], duration=70, loop=0, disposal=2)

    gif(idle, os.path.join(sheet, f"{pid}_idle.gif"))
    gif(idle, os.path.join(sheet, f"{pid}_anim.gif"))
    gif(atk, os.path.join(sheet, f"{pid}_attack.gif"))
    gif(idle, os.path.join(BRAIN_DIR, f"{pid}_idle.gif"))

    meta = {
        "pet_id": pid, "name_vi": cfg["name_vi"], "icon": cfg["icon"], "role": cfg["role"],
        "tier": cfg["tier"], "cell_index": cfg["cell"], "facing": "left" if cfg["role"] == "bot" else "right",
        "frame_size": [100, 100], "frame_count": 24, "duration_ms": 70,
        "idle_loop": {"start_frame": s, "length": L},
        "states": {
            "idle": {"frame_count": 24, "strip": f"{pid}_idle_strip.png", "gif": f"{pid}_idle.gif"},
            "attack": {"frame_count": 24, "strip": f"{pid}_attack_strip.png", "gif": f"{pid}_attack.gif"},
        },
        "still": f"{pid}_still.png",
    }
    with open(os.path.join(sheet, "metadata.json"), "w", encoding="utf-8") as fh:
        json.dump(meta, fh, indent=2, ensure_ascii=False)
    return meta, idle


def main():
    frames = load_frames()
    print(f"Loaded {len(frames)} frames")
    logo_remove = build_logo_remover(frames)
    metas, stills = [], []
    for cfg in PETS:
        m, idle = process(cfg, frames, logo_remove)
        metas.append(m)
        stills.append(idle)
    with open(os.path.join(BASE_DIR, "bot_admin_pets_catalog.json"), "w", encoding="utf-8") as fh:
        json.dump(metas, fh, indent=2, ensure_ascii=False)

    # QA montage: 6 pets x 4 frames (0, 6, 12, 18) on a checkerboard, 2x zoom
    cols, rows = 4, 6
    mont = Image.new("RGBA", (cols * 200, rows * 200))
    tile = Image.new("RGBA", (200, 200))
    for yy in range(0, 200, 20):
        for xx in range(0, 200, 20):
            c = (70, 70, 80, 255) if (xx // 20 + yy // 20) % 2 else (110, 110, 120, 255)
            tile.paste(c, (xx, yy, xx + 20, yy + 20))
    for r, idle in enumerate(stills):
        for c, fi in enumerate([0, 6, 12, 18]):
            mont.paste(tile, (c * 200, r * 200))
            im = Image.fromarray(idle[fi]).resize((200, 200), Image.NEAREST)
            mont.paste(im, (c * 200, r * 200), im)
    mont.save(os.path.join(BRAIN_DIR, "batch3_bot_admin_qa.png"))
    print("DONE - catalog + QA montage written")


if __name__ == "__main__":
    main()
