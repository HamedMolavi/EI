# worker5.py
import sys
import pywt
import numpy as np
from PIL import Image

img = Image.open(sys.argv[1]).convert("L")
arr = np.asarray(img, dtype=np.float32)

pywt.dwt2(arr, "haar")
