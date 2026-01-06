#!/usr/bin/env python3
import sys
from PIL import Image, ImageFilter


def process_image(path):
  img = Image.open(path).convert("RGB")
  w, h = img.size
  img = img.resize(
      (w * 3, h * 3), Image.BICUBIC
  ).filter(
      ImageFilter.GaussianBlur(2)
  ).resize(
      (w, h), Image.LANCZOS
  ).filter(ImageFilter
           .UnsharpMask(1, 150, 3)
           )
  return img


def main():
  path = sys.argv[1]
  process_image(path)


if __name__ == "__main__":
  main()
