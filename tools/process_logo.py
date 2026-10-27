import os
import shutil
from PIL import Image, ImageFilter
import numpy as np

src_path = r"C:\Users\phant\.gemini\antigravity\brain\1749ee9f-cdb1-4857-9457-40771305fd29\.user_uploaded\media_1793104130150_ce689ffe.jpg"
assets_dir = r"C:\Users\phant\.gemini\antigravity\scratch\tower-of-knowledge\public\assets"
public_dir = r"C:\Users\phant\.gemini\antigravity\scratch\tower-of-knowledge\public"

os.makedirs(assets_dir, exist_ok=True)

# 1. Save original high-res logo
dest_original = os.path.join(assets_dir, "logo_original.jpg")
shutil.copy2(src_path, dest_original)

img = Image.open(src_path).convert("RGBA")
print(f"Original Logo Size: {img.size}, Mode: {img.mode}")

# Save full quality PNG
img.save(os.path.join(assets_dir, "logo.png"), "PNG")

# 2. Transparent background version:
# Background is pure or near pure white (corners: ~255, 255, 255)
# Check corner pixel colors
arr = np.array(img, dtype=np.float32)
corner_colors = [arr[0, 0], arr[0, -1], arr[-1, 0], arr[-1, -1]]
print("Corner colors:", corner_colors)

# The dragon itself has white parts (its white fur/face/scales), so we must flood-fill / mask
# ONLY the outer background connected to the borders, NOT the white inside the dragon!
# Let's use floodfill on a mask.
from scipy.ndimage import binary_fill_holes
from collections import deque

rgb = arr[:, :, :3]
# Distance from white
dist_from_white = np.sqrt(np.sum((255.0 - rgb) ** 2, axis=2))
is_bg_candidate = dist_from_white < 28.0 # Very close to white

h, w = is_bg_candidate.shape
bg_visited = np.zeros((h, w), dtype=bool)

# BFS floodfill from edges
q = deque()
for x in range(w):
    if is_bg_candidate[0, x]:
        q.append((0, x))
        bg_visited[0, x] = True
    if is_bg_candidate[h-1, x]:
        q.append((h-1, x))
        bg_visited[h-1, x] = True

for y in range(h):
    if is_bg_candidate[y, 0] and not bg_visited[y, 0]:
        q.append((y, 0))
        bg_visited[y, 0] = True
    if is_bg_candidate[y, w-1] and not bg_visited[y, w-1]:
        q.append((y, w-1))
        bg_visited[y, w-1] = True

while q:
    cy, cx = q.popleft()
    for ny, nx in ((cy-1, cx), (cy+1, cx), (cy, cx-1), (cy, cx+1)):
        if 0 <= ny < h and 0 <= nx < w:
            if not bg_visited[ny, nx] and is_bg_candidate[ny, nx]:
                bg_visited[ny, nx] = True
                q.append((ny, nx))

# Smooth alpha at outer border
alpha = np.ones((h, w), dtype=np.uint8) * 255
alpha[bg_visited] = 0

# Soften outer edge slightly with feathering
alpha_img = Image.fromarray(alpha, mode='L')
# Blur slightly on mask to anti-alias edges
alpha_blurred = alpha_img.filter(ImageFilter.GaussianBlur(radius=0.75))

# Ensure background visited stays fully transparent
alpha_final = np.array(alpha_blurred)
alpha_final[bg_visited & (dist_from_white < 15.0)] = 0

trans_img = Image.fromarray(np.dstack([arr[:, :, :3].astype(np.uint8), alpha_final]), mode='RGBA')
trans_path = os.path.join(assets_dir, "logo_transparent.png")
trans_img.save(trans_path, "PNG")
print(f"Saved transparent logo to {trans_path}")

# 3. Create favicon & icons
fav_16 = trans_img.resize((16, 16), Image.Resampling.LANCZOS)
fav_32 = trans_img.resize((32, 32), Image.Resampling.LANCZOS)
fav_48 = trans_img.resize((48, 48), Image.Resampling.LANCZOS)
fav_64 = trans_img.resize((64, 64), Image.Resampling.LANCZOS)
fav_128 = trans_img.resize((128, 128), Image.Resampling.LANCZOS)
fav_192 = trans_img.resize((192, 192), Image.Resampling.LANCZOS)
fav_512 = trans_img.resize((512, 512), Image.Resampling.LANCZOS)

fav_32.save(os.path.join(assets_dir, "favicon-32x32.png"), "PNG")
fav_192.save(os.path.join(assets_dir, "icon-192.png"), "PNG")
fav_512.save(os.path.join(assets_dir, "icon-512.png"), "PNG")

# Save .ico with multi-size
ico_path = os.path.join(public_dir, "favicon.ico")
trans_img.save(ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
print(f"Saved favicon.ico to {ico_path}")

# Also copy transparent logo to brain artifact folder for visual inspection
brain_dest = r"C:\Users\phant\.gemini\antigravity\brain\1749ee9f-cdb1-4857-9457-40771305fd29\app_logo.png"
trans_img.save(brain_dest, "PNG")
print("Saved preview to brain/app_logo.png")
