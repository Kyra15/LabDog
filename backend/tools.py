import cv2
import logging

MAX_SIDE = 1600
MAX_OUT = 2600

MIN_SIDE = 300
BLANK_STD = 8
DARK_MEAN = 40
BLUR_SHARP = 20

def post_process(img):
    # upscale images based on size so i dont explode memory
    longest = max(img.shape[:2])
    if longest > MAX_OUT:
        scale = MAX_OUT / longest
        return cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
    if longest >= MAX_SIDE:
        return img
    return cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)


def check_quality(img):
    # check the quality of the image before sending it over to model

    h, w = img.shape[:2]
    if min(h, w) < MIN_SIDE:
        return "small", "That photo is too small to read. Move closer so the page fills the frame."

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    longest = max(h, w)
    # make sure sizing stays consistent
    if longest > 800:
        s = 800 / longest
        gray = cv2.resize(gray, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)

    # grab characteristics to double check quality for 3 cases (blank, blurry, dark)
    std = float(gray.std())
    mean = float(gray.mean())
    sharp = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    logging.info("quality std=%.1f mean=%.1f sharp=%.1f", std, mean, sharp)

    if std < BLANK_STD:
        return "blank", "The photo seems blank. Make sure the page is in view and that the document is the right one."
    if mean < DARK_MEAN:
        return "dark", "The photo is too dark to read. Move somewhere brighter or turn on a light."
    if sharp < BLUR_SHARP:
        return "blurry", "The photo is too blurry to read. Hold the phone steady, let it focus, and try again."
    return None