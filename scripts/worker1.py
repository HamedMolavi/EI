#!/usr/bin/env python3
import sys
from PIL import Image, ImageFilter

def process_image(path):
    img = Image.open(path).convert("RGB")
    w, h = img.size
    img = img.resize((w * 3, h * 3), Image.BICUBIC)
    img = img.filter(ImageFilter.GaussianBlur(2))
    img = img.resize((w, h), Image.LANCZOS)
    img = img.filter(ImageFilter.UnsharpMask(1, 150, 3))
    return img

def main():
    path = sys.argv[1]
    process_image(path)

if __name__ == "__main__":
    main()
