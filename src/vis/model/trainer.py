# -*- coding: utf-8 -*-
# Author: yongyuan.name
import os
import h5py
import numpy as np
from keras.preprocessing import image
from model import VGGNet
from PIL import Image, ImageDraw


def get_imlist(path, format):
    return [os.path.join(path, f) for f in os.listdir(path) if f.endswith(format)]


def train():
    db = './public/cards/trainImg'
    img_list = get_imlist(db, '.jpg')

    model = VGGNet()
    feats = []
    names = []
    for i, img_path in enumerate(img_list):
        norm_feat = model.extract_feat(img_path)
        img_name = os.path.split(img_path)[1]
        feats.append(norm_feat)
        names.append(img_name)
        print("extracting feature from image No. %d , %d images in total" %
              ((i+1), len(img_list)))

    feats = np.array(feats)
    output = './src/vis/model/model.h5'

    h5f = h5py.File(output, 'w')
    h5f.create_dataset('dataset_1', data=feats)
    h5f.create_dataset('dataset_2', data=np.string_(names))
    h5f.close()


color = {"b": "#476986",
         "r": "#864747"}


def preProcessImg():
    db = './public/cards/sourceImg'
    img_list = get_imlist(db, '.png')
    save = './public/cards/trainImg/'

    for i, img_path in enumerate(img_list):
        img_name = os.path.split(img_path)[1]
        image = Image.open(img_path).convert("RGBA")
        for key in color:
            new_image = Image.new("RGBA", image.size, color[key])
            new_image.paste(image, (0, 0), image)
            new_image = new_image.convert('RGB')
            ImageDraw.floodfill(new_image, (0, 0), (136, 97, 148), thresh=0)
            new_image.save(save + key + img_name[:-4] + ".jpg", "JPEG")


if __name__ == "__main__":
    preProcessImg()
    train()
    # db = './public/cards/imgs'
    # img_list = get_imlist(db)

    # print("--------------------------------------------------")
    # print("         feature extraction starts")
    # print("--------------------------------------------------")

    # feats = []
    # names = []

    # model = VGGNet()
    # for i, img_path in enumerate(img_list):
    #     img = image.load_img(img_path, target_size=(256, 256))

    #     im = img.convert('RGBA')

    #     data = np.array(im)   # "data" is a height x width x 4 numpy array
    #     red, green, blue, alpha = data.T  # Temporarily unpack the bands for readability

    #     white_areas = (red == 0) & (blue == 0) & (green == 0)
    #     data[..., :-1][white_areas.T] = (134, 69, 71)  # Transpose back needed

    #     im2 = Image.fromarray(data)
    #     im2.show()
    #     break
    #     norm_feat = model.extract_feat_2(img)
    #     img_name = os.path.split(img_path)[1]
    #     feats.append(norm_feat)
    #     names.append(img_name)
    #     print("extracting feature from image No. %d , %d images in total" %
    #           ((i+1), len(img_list)))

    # feats = np.array(feats)
    # # print(feats)
    # # directory for storing extracted features
    # output = './src/vis/model/model.h5'

    # print("--------------------------------------------------")
    # print("      writing feature extraction results ...")
    # print("--------------------------------------------------")

    # h5f = h5py.File(output, 'w')
    # h5f.create_dataset('dataset_1', data=feats)
    # #h5f.create_dataset('dataset_2', data = names)
    # h5f.create_dataset('dataset_2', data=np.string_(names))
    # h5f.close()
