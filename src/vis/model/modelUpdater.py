import asyncio
import aiohttp
import aiofiles
import os
import time
import re
import requests
from bs4 import BeautifulSoup
import pandas as pd

baseUrl = "https://arrtripletriad.com"
imgPath = "./public/cards/imgs/"
columns = ["id", "left", "up", "right", "down", "name", "type", "rarity"]
classToKey = {
    "cardTop": "up",
    "cardRight": "right",
    "cardBottom": "down",
    "cardLeft": "left",
    "cardRarity": "rarity",
    "cardType": "type"
}


def getCardInfo():
    url = baseUrl + "/en/cards"
    response = requests.get(url, timeout=7)

    dom = BeautifulSoup(response.text, 'html.parser')
    cards = dom.find(id="shortCardsListTable").tbody.find_all('tr')

    cardInfo = []
    id = 1
    for card in cards:
        data = {'id': id}
        a = card.a
        data["name"] = a.get_text()
        data["url"] = a["href"]
        cardInfo.append(data)
        id += 1

    loop = asyncio.get_event_loop()
    asyncJobs = [downloadCard(data) for data in cardInfo]
    results = loop.run_until_complete(asyncio.gather(*asyncJobs))
    print("writing csv")
    df = pd.DataFrame(results, columns=columns)
    df.to_csv("./public/cards/cardInfo.csv", index=False)
    print("writing completed")
    return cardInfo


async def downloadCard(data):
    try:
        async with aiohttp.ClientSession() as session:
            url = baseUrl + data["url"]
            async with session.get(url) as response:
                if response.status == 200:
                    doc = await response.text()
                    dom = BeautifulSoup(doc, 'html.parser')
                    cardData = dom.find(lambda tag:  tag.has_attr('class') and
                                        tag['class'][0] == "cardData").find_all("img")
                    data["type"] = 0
                    for img in cardData:
                        if(img.has_attr("class")):
                            src = img["src"]
                            value = re.findall("([0-9]*[0-9])b?\.png", src)[0]
                            key = classToKey[img['class'][0]]
                            data[key] = value
                        else:
                            data["url"] = img["src"]
                    print('[Completed] get Card No' +
                          str(data["id"]) + " info")
                    return data
                else:
                    print('[Failed to] get card No' +
                          str(data["id"]) + " info")
                    print('Not found')
    except Exception as e:
        print('[Failed to] get card No' + str(data["id"]) + " info")
        print(e)
        print("trying again")
        await downloadCard(data)


def getCardImg(data):
    loop = asyncio.get_event_loop()
    asyncJobs = [downloadImg(data) for data in cardInfo]
    loop.run_until_complete(asyncio.gather(*asyncJobs))
    return len(os.listdir(imgPath))


async def downloadImg(data):
    try:
        url = baseUrl + data["url"]
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status == 200:
                    f = await aiofiles.open(imgPath + str(data["id"]) + ".png", mode='wb')
                    await f.write(await response.read())
                    await f.close()
                    print('[Completed] download picture No' + str(data["id"]))
                else:
                    print('[Failed to] download picture No' + str(data["id"]))
                    print('Not found')
    except Exception as e:
        print('[Failed to] download picture No' + str(data["id"]))
        print(e)
        await downloadImg(data)


if __name__ == '__main__':
    start_time = time.time()
    cardInfo = getCardInfo()
    print("--- %s seconds ---" % (time.time() - start_time))
    count = getCardImg(cardInfo)
    print("Download completed, " + str(count) + " images in total")
    print("--- %s seconds ---" % (time.time() - start_time))
