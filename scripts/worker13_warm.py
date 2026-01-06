# worker_warm.py
import sys
from ultralytics import YOLO

model = YOLO("ultralytics/yolo11n.pt")  # LOAD ONCE

for line in sys.stdin:
    path = line.strip()
    if path == "__EXIT__":
        break
    model(path, device="cpu", verbose=False)
    print("OK", flush=True)
