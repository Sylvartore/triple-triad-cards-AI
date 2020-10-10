import pandas as pd
import asyncio
import websockets
import json
from extract import extractCard
from identify import indentifyCard
from model.updater import getCardInfo
from model.updater import getCardImg
from model.trainer import train

columns = ["id", "left", "up", "right", "down", "name", "type", "rarity"]


async def run(websocket, path):
    msg = await websocket.recv()
    while(msg != "disconnect"):
        if(msg == "loadBoard"):
            data = loadBoard()
            response = {
                "action": "loadBoard",
                "data": data
            }
            await websocket.send(json.dumps(response, separators=(',', ':')))
        if(msg == "getCardInfo"):
            response = {"action": "msg"}
            cardInfo = getCardInfo()
            # response["data"] = cardInfo
            response["data"] = "Card Info downloaded, downloading card Imgs"
            await websocket.send(json.dumps(response, separators=(',', ':')))
            count = getCardImg(cardInfo)
            response["data"] = "Card Imgs downloaded, " + \
                str(count) + " images in total"
            await websocket.send(json.dumps(response, separators=(',', ':')))
            # train()
            # response = {"action": "completed"}
            # await websocket.send(json.dumps(response, separators=(',', ':')))
        msg = await websocket.recv()


def loadBoard():
    df = pd.read_csv("./public/cards/cardInfo.csv")
    cardsInfo = df.values
    cardImages = extractCard()
    if(cardImages == []):
        return []
    cards = indentifyCard(cardImages)
    player0 = cardsInfo[cards[0]]
    player1 = cardsInfo[cards[1]]
    return json.dumps([player0.tolist(), player1.tolist()])


if __name__ == "__main__":
    start_server = websockets.serve(run, "localhost", 8001)
    loop = asyncio.get_event_loop()
    loop.run_until_complete(start_server)
    loop.run_forever()
