
import pandas as pd
from card import Card
from extract import extractCard
from identify import indentifyCard

cards = []
data = pd.read_csv("./test/cards.txt")

cardsInfo = data.values
cards = indentifyCard(extractCard())

print(cardsInfo[cards[0]])
print(cardsInfo[cards[1]])
