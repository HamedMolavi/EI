# worker11.py
import sys
import torch
from torchvision import models, transforms
from PIL import Image

device = "cpu"

model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
model.eval()

transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
])

img = Image.open(sys.argv[1]).convert("RGB")
x = transform(img).unsqueeze(0)

with torch.no_grad():
    model(x)
