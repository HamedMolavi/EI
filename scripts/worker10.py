# worker10.py
import sys
import cv2

img = cv2.imread(sys.argv[1])
hog = cv2.HOGDescriptor()
hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
hog.detectMultiScale(img)
