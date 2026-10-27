import json

full_log = r"C:\Users\phant\.gemini\antigravity\brain\1749ee9f-cdb1-4857-9457-40771305fd29\.system_generated\logs\transcript_full.jsonl"
out_file = r"C:\Users\phant\.gemini\antigravity\scratch\tower-of-knowledge\tools\step_18047.txt"

target_steps = {18036, 18037, 18046, 18047}

with open(full_log, "r", encoding="utf-8") as f, open(out_file, "w", encoding="utf-8") as out:
    for line in f:
        try:
            data = json.loads(line)
        except Exception:
            continue
        step = data.get("step_index")
        if step in target_steps:
            out.write(f"=== STEP {step} ({data.get('type')}) ===\n")
            out.write(data.get("content", "") + "\n\n")

print("Extracted steps.")
