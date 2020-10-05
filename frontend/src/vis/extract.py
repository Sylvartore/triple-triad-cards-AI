import cv2
import os
import numpy as np
from matplotlib import pyplot as plt
from PIL import Image
import matplotlib.patches as patches
from capture import windowCapture


def extractCard():
    ball_color = 'yellow'

    color_dist = {'red': {'Lower': np.array([0, 60, 60]), 'Upper': np.array([6, 255, 255])},
                  'blue': {'Lower': np.array([100, 80, 46]), 'Upper': np.array([124, 255, 255])},
                  'yellow': {'Lower': np.array([15, 40, 46]), 'Upper': np.array([18, 160, 255])}, }

    # pil_image = windowCapture()
    pil_image = Image.open("./src/vis/test/2.png")
    cv_image = pil_image.convert('RGB')
    frame = np.array(cv_image)[:, :, ::-1]

    # 高斯模
    gs_frame = cv2.GaussianBlur(frame, (5, 5), 0)
    # 转化成HSV图像
    hsv = cv2.cvtColor(gs_frame, cv2.COLOR_BGR2HSV)
    # 腐蚀 粗的变细
    # erode_hsv = cv2.erode(hsv, None, iterations=2)
    y_hsv = cv2.inRange(
        hsv, color_dist[ball_color]['Lower'], color_dist[ball_color]['Upper'])

    # cv2.imshow("image", y_hsv)
    # cv2.waitKey(0)
    cv2.destroyAllWindows()

    b_hsv = cv2.inRange(
        hsv, color_dist['blue']['Lower'], color_dist['blue']['Upper'])

    r_hsv = cv2.inRange(
        hsv, color_dist['red']['Lower'], color_dist['red']['Upper'])

    # dst = cv2.addWeighted(y_hsv, 1, b_hsv, 1, 0)
    # dst = cv2.addWeighted(y_hsv, 1, r_hsv, 1, 0)

    # cv2.imshow("image", dst)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()

    cnts = cv2.findContours(
        y_hsv, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)[-2]

    # todo: link to pc resolution
    minArea = 40 * 40
    maxArea = 110 * 110

    cardCoodinates = []
    for cnt in cnts:
        x, y, w, h = cv2.boundingRect(cnt)
        area = cv2.contourArea(cnt)
        # if w/h > 0.75 and w/h < 0.85 and area > 100:
        if w/h > 0.78 and w/h < 0.80 and area > minArea and area < maxArea:
            cardCoodinates.append([x, y, w, h])
            # print(w/h, " : ", area)

    rankCardsFromLeft = np.argsort([row[0] for row in cardCoodinates])
    player0 = [cardCoodinates[index] for index in rankCardsFromLeft[:5]]
    player1 = [cardCoodinates[index] for index in rankCardsFromLeft[5:]]

    cardImages = [[pil_image.crop((x, y, x+w, y+h)) for x, y, w, h in player0],
                  [pil_image.crop((x, y, x+w, y+h)) for x, y, w, h in player1]]

    if __name__ == "__main__" or len(cardCoodinates) != 10:
        fig, ax = plt.subplots(1)
        plt.imshow(pil_image)
        if len(cardCoodinates) != 10:
            plt.title("Card Extraction Failed!")
        for x, y, w, h in cardCoodinates:
            rect = patches.Rectangle(
                (x, y), w, h, linewidth=1, edgecolor='r', facecolor='none')
            ax.add_patch(rect)
        plt.show()
        if len(cardCoodinates) != 10:
            pil_image.save("../debug/failed_img_" +
                           str(len(os.listdir("../debug/"))) + ".png", "PNG")
            return []
    return cardImages


if __name__ == "__main__":
    extractCard()
