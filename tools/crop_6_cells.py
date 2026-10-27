import cv2
import numpy as np
import os
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

tools_dir = r"C:\Users\phant\.gemini\antigravity\scratch\tower-of-knowledge\tools"
brain_dir = r"C:\Users\phant\.gemini\antigravity\brain\1749ee9f-cdb1-4857-9457-40771305fd29"

# Let's inspect grid boundaries on full_frame_024.png (1280x720)
f24 = cv2.imread(os.path.join(tools_dir, "full_frame_024.png"))
h, w, _ = f24.shape
print(f"Frame size: {w}x{h}")

# The 3x2 grid has 3 columns and 2 rows
# Column dividers: around x = 426, 853
# Row divider: around y = 360
col_ranges = [(0, 424), (428, 851), (855, 1279)]
row_ranges = [(0, 358), (362, 719)]

cells = [
    ("gloop", 0, 0),
    ("tickbot", 1, 0),
    ("glitchy", 2, 0),
    ("dracobot", 0, 1),
    ("aurum", 1, 1),
    ("nguyet", 2, 1),
]

for name, c, r in cells:
    x1, x2 = col_ranges[c]
    y1, y2 = row_ranges[r]
    cell_crop = f24[y1:y2, x1:x2]
    cv2.imwrite(os.path.join(brain_dir, f"crop_{name}.png"), cell_crop)
    print(f"Saved crop for {name} ({x2-x1}x{y2-y1})")
