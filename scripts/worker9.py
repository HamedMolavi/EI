# worker9.py
import sys
import cv2

img = cv2.imread(sys.argv[1], cv2.IMREAD_GRAYSCALE)

cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)
cascade.detectMultiScale(img, scaleFactor=1.1, minNeighbors=5)
