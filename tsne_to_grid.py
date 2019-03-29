# -*- coding: utf-8 -*-

import argparse
import math
import numpy as np
import os
from pprint import pprint
import rasterfairy
import sys

from lib.utils import *

# input
parser = argparse.ArgumentParser()
parser.add_argument('-in', dest="INPUT_FILE", default="output/photographic_tsne.csv", help="Input csv file")
parser.add_argument('-out', dest="OUTPUT_FILE", default="data/photographic_grid.csv", help="Output csv file")
a = parser.parse_args()

model = np.loadtxt(a.INPUT_FILE, delimiter=",")
count = len(model)

print("Determining grid assignment...")
gridAssignment = rasterfairy.transformPointCloud2D(model)
grid, gridShape = gridAssignment
print("Resulting shape:")
print(gridShape)

print("Saving grid assignment file %s..." % a.OUTPUT_FILE)
makeDir(a.OUTPUT_FILE)
np.savetxt(a.OUTPUT_FILE, grid, delimiter=",")
print("Done.")
