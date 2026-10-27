import os, sys, cv2, numpy as np
sys.path.insert(0, os.path.dirname(__file__))
import process_batch3_bot_admin as P
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

frames = P.load_frames()
rem = P.build_logo_remover(frames)
x1, y1, x2, y2 = P.cell_rect(6)
lx1, ly1, lx2, ly2 = P.LOGO_BOX
rows = []
for fi in [10, 100, 200]:
    cell = frames[fi][y1:y2, x1:x2].copy()
    fixed = rem(cell)
    a = cell[ly1 - 20:ly2 + 20, lx1 - 30:lx2 + 20]
    b = fixed[ly1 - 20:ly2 + 20, lx1 - 30:lx2 + 20]
    rows.append(np.hstack([a, np.full((a.shape[0], 4, 3), 255, np.uint8), b]))
out = cv2.resize(np.vstack(rows), None, fx=3, fy=3, interpolation=cv2.INTER_NEAREST)
cv2.imwrite(os.path.join(P.BRAIN_DIR, "logo_before_after.png"), out)
print("saved")
