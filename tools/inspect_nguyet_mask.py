import cv2
import numpy as np
import os
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

tools_dir = r"C:\Users\phant\.gemini\antigravity\scratch\tower-of-knowledge\tools"
brain_dir = r"C:\Users\phant\.gemini\antigravity\brain\1749ee9f-cdb1-4857-9457-40771305fd29"

# Load crop_nguyet.png
nguyet = cv2.imread(os.path.join(brain_dir, "crop_nguyet.png"))
h, w, _ = nguyet.shape
print(f"Nguyet size: {w}x{h}")

# Mask green background
hsv = cv2.cvtColor(nguyet, cv2.COLOR_BGR2HSV)
# Green background typically: H in [35, 85], S > 100, V > 50
lower_green = np.array([35, 100, 50])
upper_green = np.array([85, 255, 255])
is_green = cv2.inRange(hsv, lower_green, upper_green)

# Also mask the top text (y < 50) as green
is_green[:50, :] = 255

# Invert to get foreground mask
fg_mask = cv2.bitwise_not(is_green)

# Save raw fg mask
cv2.imwrite(os.path.join(brain_dir, "nguyet_raw_fg_mask.png"), fg_mask)

# Find connected components in fg_mask
num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(fg_mask)
print(f"Number of connected components: {num_labels}")

for i in range(1, num_labels):
    area = stats[i, cv2.CC_STAT_AREA]
    x = stats[i, cv2.CC_STAT_LEFT]
    y = stats[i, cv2.CC_STAT_TOP]
    cw = stats[i, cv2.CC_STAT_WIDTH]
    ch = stats[i, cv2.CC_STAT_HEIGHT]
    cx, cy = centroids[i]
    print(f"Component {i}: area={area}, bbox=({x}, {y}, {cw}, {ch}), center=({cx:.1f}, {cy:.1f})")

