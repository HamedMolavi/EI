#!/usr/bin/env python3
import os
import sys
from ultralytics import YOLO

model = YOLO("ultralytics/yolo11n.pt")

try:
  for line in sys.stdin:
    line = line.strip()

    if not line:
      continue

    if line == "__EXIT__":
      break

    paths = line.split()

    for path in paths:
      model(path, device="cpu", verbose=False)
      if path.startswith("/tmp/"):
        try:
          os.remove(path)
        except:
          pass

    print("OK", flush=True)
except KeyboardInterrupt:
  print("worker closed...")
