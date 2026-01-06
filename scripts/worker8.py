# worker8.py
import sys
import cv2

img = cv2.imread(sys.argv[1], cv2.IMREAD_GRAYSCALE)
_, mask = cv2.threshold(img, 128, 255, cv2.THRESH_BINARY)
