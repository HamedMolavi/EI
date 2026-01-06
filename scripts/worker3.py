#!/usr/bin/env python3
import argparse
import sys
from ultralytics import YOLO
import cv2 as cv


def process_image(path):
  # parser = argparse.ArgumentParser()
  # parser.add_argument("input", help="Path to image or video file")
  # parser.add_argument("--cpu", action="store_true", help="Force CPU inference")
  # args = parser.parse_args()
  # device = "cpu" if args.cpu else "0"
  device = "cpu"

  # Load model ONCE per process
  model = YOLO("yolo11n.pt")

  # Decide image vs video by extension
  if path.lower().endswith((".mp4", ".avi", ".mov", ".mkv", ".webm")):
    cap = cv.VideoCapture(path)
    if not cap.isOpened():
      raise RuntimeError("Could not open video file")

    # Read ONE frame only (benchmark unit)
    ret, frame = cap.read()
    cap.release()
    if not ret:
      raise RuntimeError("Could not read frame from video")

    model(frame, device=device, verbose=False)

  else:
    # Image path
    model(path, device=device, verbose=False)


def main():
  path = sys.argv[1]
  process_image(path)


if __name__ == "__main__":
  main()
