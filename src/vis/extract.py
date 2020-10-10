import cv2
import os
import numpy as np
from matplotlib import pyplot as plt
from PIL import Image
import matplotlib.patches as patches
from capture import windowCapture

# 'red': {'Lower': np.array([0, 60, 60]), 'Upper': np.array([6, 255, 255])},
# 'blue': {'Lower': np.array([100, 80, 46]), 'Upper': np.array([124, 255, 255])},

colorRange = {
    'normCard': {'Lower': np.array([15, 40, 46]), 'Upper': np.array([18, 160, 255])},
    'rareCard': {'Lower': np.array([10, 0, 0]), 'Upper': np.array([25, 100, 255])},
    'playerField': {'Lower': np.array([140, 0, 0]), 'Upper': np.array([160, 110, 255])},
    'tileField': {'Lower': np.array([18, 0, 0]), 'Upper': np.array([35, 50, 255])},
}

# todo: link to monitor resolution
ratioRange = {
    'normCard': (0.75, 0.81),
    'rareCard': (0.75, 0.81),
    'playerField':  (0.5, 2),
    'tileField':  (0.5, 2)
}

# todo: link to monitor resolution
areaRange = {
    'normCard':  (100 * 100, 120 * 120),
    'rareCard': (100 * 100, 120 * 120),
    'playerField':  (380*380, 1000 * 1000),
    'tileField':  (300*300, 1000 * 1000),
}


def findRect(hsv, target, results, baseX=0, baseY=0):
    targetHsv = cv2.inRange(
        hsv, colorRange[target]['Lower'], colorRange[target]['Upper'])
    cnts = cv2.findContours(
        targetHsv, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)[-2]
    for cnt in cnts:
        x, y, w, h = cv2.boundingRect(cnt)
        area = w*h
        if area > areaRange[target][0] and area < areaRange[target][1]:
            ratio = w/h
            if ratio > ratioRange[target][0] and ratio < ratioRange[target][1]:
                results.append([x + baseX, y + baseY, w, h])
                # print(w/h, " : ", w, " : ", h, " : ", w*h)


def findCard(frame, field, results):
    for x, y, w, h in field:
        crop_frame = frame[y:y+h, x:x+w]
        crop_gs = cv2.GaussianBlur(crop_frame, (5, 5), 0)
        crop_hsv = cv2.cvtColor(crop_gs, cv2.COLOR_BGR2HSV)
        findRect(crop_hsv, 'normCard',  results, x, y)
        findRect(crop_hsv, 'rareCard', results, x, y)


def extractCard(path=None):
    if path == None:
        pil_image = windowCapture()
    else:
        pil_image = Image.open(path)

    cv_image = pil_image.convert('RGB')

    frame = np.array(cv_image)[:, :, ::-1]
    gs_frame = cv2.GaussianBlur(frame, (5, 5), 0)
    hsv = cv2.cvtColor(gs_frame, cv2.COLOR_BGR2HSV)
    # erode_hsv = cv2.erode(hsv, None, iterations=2)

    playerFields = []
    tileFields = []
    findRect(hsv, 'playerField',  playerFields)
    findRect(hsv, 'tileField', tileFields)

    cards = []
    findCard(frame, playerFields, cards)
    findCard(frame, tileFields, cards)

    cardImgs = [pil_image.crop((x, y, x+w, y+h))
                for x, y, w, h in cards]

    if __name__ == "__main__" or len(cards) != 10:
        fig, ax = plt.subplots(1)
        plt.imshow(pil_image)
        show = cards
        if len(cards) != 10:
            plt.title("Card Extraction Failed!")
        for x, y, w, h in show:
            rect = patches.Rectangle(
                (x, y), w, h, linewidth=1, edgecolor='r', facecolor='none')
            ax.add_patch(rect)
        plt.show()
        if len(cards) != 10 and __name__ != "__main__":
            pil_image.save("./debug/failed_img_" +
                           str(len(os.listdir("./debug/"))) + ".png", "PNG")
        return []
    return cardImgs


def test():
    for i in range(len(os.listdir("./debug/"))):
        extractCard("./debug/failed_img_" + str(i) + ".png")


if __name__ == "__main__":
    test()
