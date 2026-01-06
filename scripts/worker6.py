# worker6.py
import sys
import cv2

img = cv2.imread(sys.argv[1], cv2.IMREAD_GRAYSCALE)

sift = cv2.SIFT_create()
sift.detectAndCompute(img, None)

# SURF may not be available in all builds
if hasattr(cv2, "xfeatures2d"):
    try:
        surf = cv2.xfeatures2d.SURF_create()
        surf.detectAndCompute(img, None)
    except Exception:
        pass
