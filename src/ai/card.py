class Card:
    def __init__(self, id, left, up, right, down, coord, owner):
        self.id = id
        self.left = int(left)
        self.right = int(right)
        self.up = int(up)
        self.down = int(down)
        self.coord = int(coord)
        self.owner = int(owner)

    def __str__(self):
        return 'Id %s Left %d Up %d Right %d Down %d Coord %d Owner %d' \
            % (self.id, self.left, self.right, self.up, self.down, self.coord, self.owner)


def flip(self):
    self.owner = 1 if self.owner is 0 else 0
