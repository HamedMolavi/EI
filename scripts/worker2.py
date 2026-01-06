#!/usr/bin/env python3
import numpy as np
np.random.seed(42)
import sys
from PIL import Image

def process_image(path):
    img = Image.open(path).convert("RGB")
    gray = np.mean(img, axis=-1)
    return (gray > 127).astype(np.uint8) * 255

def main():
    path = sys.argv[1]
    process_image(path)

if __name__ == "__main__":
    main()