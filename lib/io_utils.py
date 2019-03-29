import csv
import json
import os
import re
from urllib.parse import urlparse

import lib.math_utils as mu

def getBaseUrl(url):
    urlParts = url.split("/")
    baseUrl =  "/".join(urlParts[:-1]) + "/"
    return baseUrl

def getFileBasename(filename):
    basename = os.path.basename(filename)
    ext = getFileext(basename)
    return basename[:-len(ext)]

def getFileext(filename):
    return "." + filename.split(".")[-1]

def getFileextFromUrl(url):
    filename = getFilenameFromUrl(url)
    return getFileext(filename)

def getFilenameFromUrl(url):
    urlObj = urlparse(url)
    return os.path.basename(urlObj.path)

def makeDirectories(filenames):
    if not isinstance(filenames, list):
        filenames = [filenames]
    for filename in filenames:
        dirname = os.path.dirname(filename)
        if not os.path.exists(dirname):
            os.makedirs(dirname)

def readCsv(filename, headings=False, verbose=True):
    rows = []
    fieldnames = []
    if os.path.isfile(filename):
        with open(filename, 'r', encoding="utf8") as f:
            lines = list(f)
            reader = csv.DictReader(lines, skipinitialspace=True)
            if len(lines) > 0:
                fieldnames = list(reader.fieldnames)
            rows = list(reader)
            rows = mu.parseNumbers(rows)
            if verbose:
                print("Read %s rows from %s" % (len(rows), filename))
    return (fieldnames, rows)

def writeCsv(filename, arr, headings="auto", append=False, verbose=True):
    if headings == "auto":
        headings = arr[0].keys()
    mode = 'w' if not append else "a"

    with open(filename, mode, encoding="utf8") as f:

        writer = csv.writer(f)
        if not append:
            writer.writerow(headings)

        for i, d in enumerate(arr):
            row = []
            for h in headings:
                value = ""
                if h in d:
                    value = d[h]
                    if isinstance(value, str):
                        value = re.sub('\s+', ' ', value).strip() # clean whitespaces
                row.append(value)
            writer.writerow(row)

        if verbose:
            print("Wrote %s rows to %s" % (len(arr), filename))
