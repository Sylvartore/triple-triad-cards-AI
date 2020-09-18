
import pandas as pd
from card import Card

cards = []
data = pd.read_csv("../test/cards.txt")

for row in data.values:
    cards.append(Card(row[0], row[1], row[2], row[3], row[4], row[5], row[6]))

for card in cards:
    print(card)
