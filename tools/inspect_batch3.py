import cv2
import os
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

video_path = r"C:\Users\phant\Downloads\ado\gemini_generated_video_aa6bddb6.mp4"
tools_dir = r"C:\Users\phant\.gemini\antigravity\scratch\tower-of-knowledge\tools"
brain_dir = r"C:\Users\phant\.gemini\antigravity\brain\1749ee9f-cdb1-4857-9457-40771305fd29"

if not os.path.exists(video_path):
    print("File not found:", video_path)
    sys.exit(1)

cap = cv2.VideoCapture(video_path)
fps = cap.get(cv2.CAP_PROP_FPS)
count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
duration = count / fps if fps > 0 else 0
print(f"Video info: {w}x{h}, {count} frames, {fps:.2f} fps, {duration:.2f}s")

# Extract frame at 1s, 3s, 5s
for sec in [1.0, 3.0, 5.0]:
    frame_idx = int(sec * fps)
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
    ret, frame = cap.read()
    if ret:
        cv2.imwrite(os.path.join(tools_dir, f"batch3_frame_{int(sec)}s.png"), frame)
        cv2.imwrite(os.path.join(brain_dir, f"batch3_frame_{int(sec)}s.png"), frame)
        print(f"Saved frame at {sec}s (frame {frame_idx})")

cap.release()
