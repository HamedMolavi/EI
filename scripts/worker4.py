# worker4.py
import sys
import numpy as np
from PIL import Image
from scipy.fftpack import dct, idct

img = Image.open(sys.argv[1]).convert("L")
arr = np.asarray(img, dtype=np.float32)

coeff = dct(dct(arr.T, norm="ortho").T, norm="ortho")
idct(idct(coeff.T, norm="ortho").T, norm="ortho")
