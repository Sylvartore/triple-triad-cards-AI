import sys
import socketio
import pandas as pd
from extract import extractCard
from identify import indentifyCard


cards = []
data = pd.read_csv("../vis/test/cards.txt")
cardsInfo = data.values
cardImages = extractCard()
cards = indentifyCard(cardImages)

player0 = cardsInfo[cards[0]]
player1 = cardsInfo[cards[1]]

sio = socketio.Client()


@sio.event
def connect():
    print("I'm connected!")
    print("sending package")
    sio.emit('info', [player0.tolist(),
                      player1.tolist()])


@sio.event
def acknowledge(data):
    print("package delivered")
    sio.disconnect()
    print("discconnected after delivered")
    exit()


sio.connect('http://localhost:8080')
