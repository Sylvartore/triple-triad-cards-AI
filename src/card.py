from PIL import Image
import os


class Card:
    def __init__(self, left, right, up, down, coord, owner):
        self.left = left
        self.right = right
        self.up = up
        self.down = down
        self.coord = coord
        self.owner = owner

    def flip(self):
        self.owner = 1 if self.owner is 0 else 0
