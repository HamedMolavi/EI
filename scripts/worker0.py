import sys
from PIL import Image
import io

img = Image.open(sys.argv[1]).convert("RGB")
buf = io.BytesIO()
img.save(buf, format="JPEG", quality=90)
