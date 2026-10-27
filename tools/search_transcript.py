import json
import re

log_path = r"C:\Users\phant\.gemini\antigravity\brain\1749ee9f-cdb1-4857-9457-40771305fd29\.system_generated\logs\transcript.jsonl"
out_path = r"C:\Users\phant\.gemini\antigravity\scratch\tower-of-knowledge\tools\search_results.txt"

matches = []
with open(log_path, "r", encoding="utf-8") as f:
    for line_idx, line in enumerate(f):
        try:
            data = json.loads(line)
        except Exception:
            continue
        
        # Check user inputs
        if data.get("type") == "USER_INPUT":
            content = data.get("content", "")
            lower_c = content.lower()
            if any(k in lower_c for k in ["chốt", "đặt tên", "tên đề tài", "tên là", "tên app", "tên web"]):
                matches.append((data.get("step_index"), "USER", content))
        elif data.get("type") == "PLANNER_RESPONSE":
            content = data.get("content", "")
            lower_c = content.lower()
            if any(k in lower_c for k in ["chốt tên", "tên đề tài là", "tên chính thức là", "tên dự án là"]):
                matches.append((data.get("step_index"), "ASSISTANT", content[:400]))

with open(out_path, "w", encoding="utf-8") as out:
    for idx, role, txt in matches:
        clean_txt = re.sub(r'\s+', ' ', txt)
        out.write(f"[{idx}] {role}: {clean_txt}\n\n")

print(f"Done. Found {len(matches)} matches.")
