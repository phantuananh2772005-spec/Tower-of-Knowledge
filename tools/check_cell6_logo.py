import cv2
import os
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

video_path = r"C:\Users\phant\Downloads\ado\gemini_generated_video_aa6bddb6.mp4"
brain_dir = r"C:\Users\phant\.gemini\antigravity\brain\1749ee9f-cdb1-4857-9457-40771305fd29"

cap = cv2.VideoCapture(video_path)
count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

# Check every 24 frames (every second)
for idx in [0, 48, 96, 144, 192, 239]:
    cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
    ret, frame = cap.read()
    if ret:
        # Crop cell 6 (bottom right: x from ~850 to 1280, y from 360 to 720)
        c6 = frame[360:720, 850:1280]
        cv2.imwrite(os.path.join(brain_dir, f"cell6_frame_{idx}.png"), c6)
        print(f"Saved cell6 at frame {idx}")

cap.release()
