# -*- coding: utf-8 -*-

import argparse
import glob
import numpy as np
from PIL import Image
from pprint import pprint
import random
import sys

from lib import *

# input
parser = argparse.ArgumentParser()
parser.add_argument('-in', dest="INPUT_FILE", default="output/photographic_grid.csv", help="Input csv file with grid assignments")
parser.add_argument('-im', dest="IMAGE_FILES", default="images/photographic_thumbnails/*.jpg", help="Input file pattern")
parser.add_argument('-tile', dest="TILE_SIZE", default="128x128", help="Tile size in pixels")
parser.add_argument('-grid', dest="GRID_SIZE", default="114x116", help="Grid size in cols x rows")
parser.add_argument('-out', dest="OUTPUT_FILE", default="output/photographic_matrix.jpg", help="File for output")
a = parser.parse_args()

grid = np.loadtxt(a.INPUT_FILE, delimiter=",")

tileW, tileH = tuple([int(t) for t in a.TILE_SIZE.split("x")])
gridW, gridH = tuple([int(t) for t in a.GRID_SIZE.split("x")])
imgW, imgH = (gridW * tileW, gridH * tileH)
tileCount = gridW * gridH
filenames = glob.glob(a.IMAGE_FILES)
filenames = sorted(filenames)
fileCount = len(filenames)

if fileCount != len(grid):
    print("File count (%s) != grid count (%s)" % (fileCount, len(grid)))
    sys.exit()

baseImage = Image.new('RGB', (imgW, imgH), (0,0,0))
i = 0
for xy, fn in zip(grid, filenames):
    col, row = tuple(xy)
    x = int(round((col-1) * tileW))
    y = int(round((row-1) * tileH))
    im = Image.open(fn)
    im = fillImage(im, tileW, tileH)
    baseImage.paste(im, (x, y))
    printProgress(i+1, fileCount)
    i += 1

print("Saving image...")
baseImage.save(a.OUTPUT_FILE)
print("Created %s" % a.OUTPUT_FILE)
