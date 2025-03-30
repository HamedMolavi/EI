from os import walk
from os.path import join, dirname, abspath
from random import choice
from ultralytics import YOLO
from time import time, process_time_ns
import argparse
import datetime

parser = argparse.ArgumentParser()
parser.add_argument('--single-input', action='store_true',
                    help='Run in single input mode')
parser.add_argument('--cpu', action='store_true', help='Run on cpu')
args = parser.parse_args()

image_dir = '/ultralytics/val2017'
current_file_directory = dirname(abspath(__file__))
now = datetime.datetime.now()
time_str = now.strftime("%Y-%m-%d_%H-%M-%S")
device = "cpu" if args.cpu else "0"


# Load the YOLOv11 Nano model
model = YOLO('/ultralytics/yolo11n.pt')
images = next(walk(image_dir))[2]
l = len(images)
sample_image = choice(images)


def append_number_to_file(filename, number1, number2):
  with open(filename, 'a+') as file:
    file.write(str(number1) + "," + str(number2) + "\n")


if __name__ == '__main__':
  print("Running on ", "sample image" if args.single_input else "all images", "and", "cpu" if args.cpu else "gpu", )
  for i in range(l):
    image = join(image_dir, sample_image if args.single_input else images[i])
    # Perform detection on an image
    start = process_time_ns()
    results = model(image, verbose=True, device=device)
    end = process_time_ns()
    # Execution time for detection
    process_time = sum(results[0].speed.values())
    append_number_to_file(join(
      current_file_directory, time_str + device + '.txt'),
        (end - start) / 10e6, process_time)
