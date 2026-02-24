# worker7.py
import sys
import cv2
import numpy as np

img = cv2.imread(sys.argv[1])
if img is None:
	raise ValueError(f"Failed to load image: {sys.argv[1]}")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

_, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
kernel = np.ones((3,3), np.uint8)
opening = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=2)

dist = cv2.distanceTransform(opening, cv2.DIST_L2, 5)
_, sure_fg = cv2.threshold(dist, 0.7 * dist.max(), 255, 0)
sure_fg = sure_fg.astype(np.uint8)

markers = cv2.connectedComponents(sure_fg)[1]
cv2.watershed(img, markers)
