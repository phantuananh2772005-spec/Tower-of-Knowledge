import cv2
import os
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

video_path = r"C:\Users\phant\Downloads\ado\gemini_generated_video_aa6bddb6.mp4"
tools_dir = r"C:\Users\phant\.gemini\antigravity\scratch\tower-of-knowledge\tools"

cap = cv2.VideoCapture(video_path)
fps = cap.get(cv2.CAP_PROP_FPS)

# Sample every 12 frames (every 0.5s)
for i in range(0, 240, 24):
    cap.set(cv2.CAP_PROP_POS_FRAMES, i)
    ret, frame = cap.read()
    if ret:
        cv2.imwrite(os.path.join(tools_dir, f"full_frame_{i:03d}.png"), frame)

cap.release()
print("Saved 10 full frames every second")
