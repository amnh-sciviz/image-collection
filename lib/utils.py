
import os
from PIL import Image
import sys

def fillImage(img, w, h):
    vw, vh = img.size
    if vw == w and vh == h:
        return img

    # first, resize video
    ratio = 1.0 * w / h
    vratio = 1.0 * vw / vh
    newW = w
    newH = h
    if vratio > ratio:
        newW = h * vratio
    else:
        newH = w / vratio
    # Lanczos = good for downsizing
    resized = img.resize((int(round(newW)), int(round(newH))), resample=Image.LANCZOS)

    # and then crop
    x = 0
    y = 0
    if vratio > ratio:
        x = int(round((newW - w) * 0.5))
    else:
        y = int(round((newH - h) * 0.5))
    x1 = x + w
    y1 = y + h
    cropped = resized.crop((x, y, x1, y1))

    return cropped

def makeDir(path):
    dirname = os.path.dirname(path)
    if not os.path.exists(dirname):
        os.makedirs(dirname)

def printProgress(step, total):
    sys.stdout.write('\r')
    sys.stdout.write("%s%%" % round(1.0*step/total*100,2))
    sys.stdout.flush()
