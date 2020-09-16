import cv2
from extract_cnn_vgg16_keras import VGGNet
import numpy as np
import h5py
from matplotlib import pyplot as plt
import matplotlib.image as mpimg
import argparse

ball_color = 'yellow'

color_dist = {'red': {'Lower': np.array([0, 60, 60]), 'Upper': np.array([6, 255, 255])},
              'blue': {'Lower': np.array([100, 80, 46]), 'Upper': np.array([124, 255, 255])},
              'yellow': {'Lower': np.array([15, 40, 46]), 'Upper': np.array([18, 160, 255])},
              }

# cv2.namedWindow('camera', cv2.WINDOW_AUTOSIZE)
frame = cv2.imread("a.png")

# 高斯模
gs_frame = cv2.GaussianBlur(frame, (5, 5), 0)
# 转化成HSV图像
hsv = cv2.cvtColor(gs_frame, cv2.COLOR_BGR2HSV)
# 腐蚀 粗的变细
# erode_hsv = cv2.erode(hsv, None, iterations=2)
y_hsv = cv2.inRange(
    hsv, color_dist[ball_color]['Lower'], color_dist[ball_color]['Upper'])

# b_hsv = cv2.inRange(
#     hsv, color_dist['blue']['Lower'], color_dist['blue']['Upper'])

# dst = cv2.addWeighted(y_hsv, 1, b_hsv, 1, 0)

cnts = cv2.findContours(
    y_hsv, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)[-2]

minArea = 40 * 40
maxArea = 110 * 110
for cnt in cnts:
    x, y, w, h = cv2.boundingRect(cnt)
    area = cv2.contourArea(cnt)
    if w/h > 0.75 and w/h < 0.85 and area > minArea and area < maxArea:
        frame = cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 0, 255), 3)


# cv2.imshow("image", dst)
cv2.imshow("image", frame)
cv2.waitKey(0)
cv2.destroyAllWindows()
