import pandas as pd
import asyncio
import websockets
import json
from extract import extractCard
from identify import indentifyCard
from model.modelUpdater import getCardInfo
from model.modelUpdater import getCardImg


async def run(websocket, path):
    msg = await websocket.recv()
    msg = msg.split(";")
    action = msg[0]
    while(action != "disconnect"):
        if(action == "loadBoard"):
            response = loadBoard()
            await websocket.send(action + ";" + response)
        if(action == "getCardInfo"):
            data = getCardInfo()
            response = {"action": action, "data": data}
            await websocket.send(json.dumps(response, separators=(',', ':')))
        msg = await websocket.recv()
        msg = msg.split(";")
        action = msg[0]


def loadBoard():
    data = pd.read_csv("./src/vis/test/cards.txt")
    cardsInfo = data.values
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
