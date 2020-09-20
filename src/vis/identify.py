from model.model import VGGNet
import h5py
import cv2
from matplotlib import pyplot as plt
from PIL import Image
import numpy as np
from extract import extractCard


def indentifyCard(cardImages):
    h5f = h5py.File('./model/model.h5', 'r')
    feats = h5f['dataset_1'][:]
    imgNames = h5f['dataset_2'][:]
    h5f.close()

    cards = [[], []]
    model = VGGNet()
    for playerNo in range(len(cardImages)):
        for image in cardImages[playerNo]:
            queryVec = model.extract_feat_2(image)
            scores = np.dot(queryVec, feats.T)
            scoreRank = np.argsort(scores)[::-1]
            name = str(imgNames[scoreRank[0]]).split('\'')[1]
            id = int(name[:-4])
            cards[playerNo].append(id)

            if __name__ == "__main__":
                fig, (ax1, ax2) = plt.subplots(1, 2)
                ax1.imshow(image)
                ax1.axis('off')
                ax2.imshow(Image.open("../../public/cards/imgs/" + name))
                ax2.axis('off')
                plt.show()
    return cards


if __name__ == "__main__":
    indentifyCard(extractCard())
