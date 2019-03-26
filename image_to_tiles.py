# -*- coding: utf-8 -*-

import argparse
import os
from pprint import pprint
import sys

import lib.deepzoom as dz
from lib.utils import *

# input
parser = argparse.ArgumentParser()
parser.add_argument('-in', dest="INPUT_FILE", default="output/photographic_matrix.jpg", help="File for input")
parser.add_argument('-tsize', dest="TILE_SIZE", default=128, type=int, help="Tile size")
parser.add_argument('-out', dest="OUTPUT_FILE", default="img/photographic_matrix.dzi", help="File for output")
a = parser.parse_args()

makeDir(a.OUTPUT_FILE)
creator = dz.ImageCreator(tile_size=a.TILE_SIZE, tile_format="jpg")
creator.create(a.INPUT_FILE, a.OUTPUT_FILE)
print("Done.")
