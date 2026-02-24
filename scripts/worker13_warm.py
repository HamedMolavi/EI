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
  model(path, device="cpu", verbose=False)
  print("OK", flush=True)