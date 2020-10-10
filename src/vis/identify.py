from model.model import VGGNet
import h5py
import cv2
from matplotlib import pyplot as plt
from PIL import Image
from PIL import ImageDraw
import numpy as np
from extract import extractCard


def indentifyCard(cardImages):
    h5f = h5py.File('./src/vis/model/model.h5', 'r')
    feats = h5f['dataset_1'][:]
    imgNames = h5f['dataset_2'][:]
    h5f.close()
    cards = [[], []]
    model = VGGNet()
    for image in cardImages:
        queryVec = model.extract_feat_2(image)
        scores = np.dot(queryVec, feats.T)
        scoreRank = np.argsort(scores)[::-1]
        first = str(imgNames[scoreRank[0]]).split('\'')[1]
        id = int(first[1:-4]) - 1
        playerNo = 0 if first[0:1] == "b" else 1
        cards[playerNo].append(id)

        if __name__ == "__main__":
            fig, ax = plt.subplots(2, 2)
            ax[0][0].imshow(image)
            ax[0][0].axis('off')
            ax[0][0].set_title('Origin')

            ax[0][1].imshow(Image.open("./public/cards/trainImg/" + first))
            ax[0][1].axis('off')
            ax[0][1].set_title(
                "score: " + str(scores[scoreRank[0]]))

            second = str(imgNames[scoreRank[1]]).split('\'')[1]
            third = str(imgNames[scoreRank[2]]).split('\'')[1]
            ax[1][0].imshow(Image.open(
                "./public/cards/trainImg/" + second))
            ax[1][0].axis('off')
            ax[1][0].set_title(
                "score: " + str(scores[scoreRank[1]]))

            ax[1][1].imshow(Image.open("./public/cards/trainImg/" + third))
            ax[1][1].axis('off')
            ax[1][1].set_title(
                "score: " + str(scores[scoreRank[2]]))
            plt.show()
    return cards


if __name__ == "__main__":
    indentifyCard(extractCard("./debug/failed_img_5.png"))
