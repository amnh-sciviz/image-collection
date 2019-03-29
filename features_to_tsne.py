# -*- coding: utf-8 -*-

# https://scikit-learn.org/stable/modules/generated/sklearn.manifold.TSNE.html

import argparse
import bz2
import os
import numpy as np
import pickle
from pprint import pprint
from MulticoreTSNE import MulticoreTSNE as TSNE
import sys

from lib.utils import *

# input
parser = argparse.ArgumentParser()
parser.add_argument('-in', dest="INPUT_FILE", default="output/photographic_features.p.bz2", help="Path to features file")
parser.add_argument('-components', dest="COMPONENTS", default=2, type=int, help="Number of components (1, 2, or 3)")
parser.add_argument('-rate', dest="LEARNING_RATE", default=150, type=int, help="Learning rate: increase if too dense, decrease if too uniform")
parser.add_argument('-angle', dest="ANGLE", default=0.1, type=float, help="Angle: increase to make faster, decrease to make more accurate")
parser.add_argument('-jobs', dest="JOBS", default=4, type=int, help="Concurrent jobs to run")
parser.add_argument('-out', dest="OUTPUT_FILE", default="data/photographic_tsne.csv", help="Output TSNE file")
a = parser.parse_args()

featureVectors = None
if os.path.isfile(a.INPUT_FILE):
    with bz2.open(a.INPUT_FILE, "rb") as f:
        featureVectors = pickle.load(f)

if featureVectors is None:
    print("Data could not be loaded from %s" % a.INPUT_FILE)
    sys.exit()

tsne = TSNE(n_components=a.COMPONENTS, learning_rate=a.LEARNING_RATE, verbose=2, angle=a.ANGLE, n_jobs=a.JOBS)
model = tsne.fit_transform(featureVectors)

print("Saving model file %s..." % a.OUTPUT_FILE)
makeDir(a.OUTPUT_FILE)
np.savetxt(a.OUTPUT_FILE, model, delimiter=",")
print("Done.")
