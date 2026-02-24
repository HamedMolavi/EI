import os
import sys
from ultralytics import YOLO

model = YOLO("ultralytics/yolo11n.pt")

for line in sys.stdin:
  path = line.strip()
  if path == "__EXIT__":
    break
  if path.startswith("/tmp/"):
    try:
      os.remove(path)
    except:
      pass
  try:
    model(path, device="cuda", verbose=False)
  except Exception as e:
    print(f"Error processing {path}: {e}", file=sys.stderr)
  print("OK", flush=True)
