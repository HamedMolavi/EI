# worker12.py
import sys
import torch
import torch.nn as nn
from PIL import Image
from torchvision import transforms

class UNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.enc = nn.Sequential(
            nn.Conv2d(3, 16, 3, padding=1),
            nn.ReLU(),
            nn.Conv2d(16, 16, 3, padding=1),
            nn.ReLU(),
        )
        self.dec = nn.Conv2d(16, 1, 1)

    def forward(self, x):
        return self.dec(self.enc(x))

model = UNet().eval()

transform = transforms.Compose([
    transforms.Resize((256,256)),
    transforms.ToTensor(),
])

img = Image.open(sys.argv[1]).convert("RGB")
x = transform(img).unsqueeze(0)

with torch.no_grad():
    model(x)
