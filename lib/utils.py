
import os
from PIL import Image
import re
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

def parseYears(strOrNumber):
    minYear = 1700
    maxYear = 2020

    # check for standard number between minYear and maxYear
    if isinstance(strOrNumber, int) and minYear <= strOrNumber <= maxYear:
        return [strOrNumber]

    # otherwise, convert everything to string
    s = str(strOrNumber)

    # remove stuff from the edges
    s = s.strip('[]approximately?, ')

    # remove spaces
    s = s.replace(" ","")

    # standard year, e.g. 1900
    if re.match(r'^[12][0-9]{3}$', s):
        return [int(s)]

    # year plus month (plus date), e.g. 1903-02 or 1903-03-12; just take the year
    if re.match(r'^[12][0-9]{3}\-[0-9]{2}(\-[0-9]{2})?$', s):
        return [int(s.split("-")[0])]

    # year range, e.g. 1900-1910
    if re.match(r'^[12][0-9]{3}\-[12][0-9]{3}$', s):
        yearFrom, yearTo = tuple([int(y) for y in s.split("-")])
        # add each year
        if yearTo > yearFrom:
            return list(range(yearFrom, yearTo+1)) # need to add one for last year to be inclusive
        # range going backwards, just take the first year
        else:
            return [yearFrom]

    # year in the beginning?
    if re.match(r'^[12][0-9]{3}', s):
        return [int(s[:4])]

    # year anywhere in the string?
    m = re.match(r'.*([12][0-9]{3}).*', s)
    if m:
        return [int(m.group(1))]

    # if len(s) > 0 and s != "Unknown":
    #     print(s)

    return []
