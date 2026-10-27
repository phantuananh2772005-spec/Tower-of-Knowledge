"""Locate the static Gemini watermark in cell 6 by temporal analysis.
Watermark = pixels that are NOT background green, but are constant over all frames,
and are brighter/whiter than the green background (semi-transparent white overlay)."""
import cv2, os, sys
import numpy as np
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

VIDEO = r"C:\Users\phant\Downloads\ado\gemini_generated_video_aa6bddb6.mp4"
BRAIN = r"C:\Users\phant\.gemini\antigravity\brain\1749ee9f-cdb1-4857-9457-40771305fd29"

cap = cv2.VideoCapture(VIDEO)
frames = []
while True:
    ok, f = cap.read()
    if not ok: break
    frames.append(f[362:719, 855:1279].astype(np.float32))   # cell 6
cap.release()
stack = np.stack(frames)                       # T,H,W,3
std = stack.std(axis=0).mean(axis=2)           # temporal variation
med = np.median(stack, axis=0)
b, g, r = med[..., 0], med[..., 1], med[..., 2]
# background green approx
bg = np.array([47, 178, 60], np.float32)
whiteness = np.minimum(r, b) - bg[[0, 2]].mean()  # lifted R & B => white overlay on green
cand = (std < 6) & (whiteness > 25) & (g > 150)
cand[:60, :] = False                            # ignore the text label
n, lab, st, cen = cv2.connectedComponentsWithStats(cand.astype(np.uint8))
for i in range(1, n):
    if st[i, 4] > 30:
        print(f"static whitish blob {i}: bbox x={st[i,0]} y={st[i,1]} w={st[i,2]} h={st[i,3]} area={st[i,4]}")
vis = cv2.cvtColor((np.clip(std * 8, 0, 255)).astype(np.uint8), cv2.COLOR_GRAY2BGR)
vis[cand] = (0, 0, 255)
cv2.imwrite(os.path.join(BRAIN, "cell6_static_logo_map.png"), vis)
x, y = 270, 190
cv2.imwrite(os.path.join(BRAIN, "cell6_logo_zoom.png"),
            cv2.resize(med[y:y+90, x:x+90].astype(np.uint8), None, fx=4, fy=4, interpolation=cv2.INTER_NEAREST))
print("frames:", len(frames))
