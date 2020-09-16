from PIL import Image
import os


def get_hash(img):
    image = img.resize((18, 13), Image.ANTIALIAS).convert("L")
    pixels = list(image.getdata())
    avg = sum(pixels)/len(pixels)
    return "".join(map(lambda p: "1" if p > avg else "0"), pixels)
