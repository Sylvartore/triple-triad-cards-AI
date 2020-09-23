import { Container } from 'unstated';
import AI from './AI';
class Card {
    constructor(id, name, left, up, right, down, onBoard, owner, index) {
        this.name = name;
        this.onBoard = onBoard;
        this.owner = owner;
        this.index = index;
        this.id = id;
        this.attributes = [left, right, up, down]
    }
}

class Tile {
    constructor(id) {
        this.id = id
        this.card = null
    }
}


let packedState;

const initial_state = {
    cards: [
        new Card(0, "露琪亚", 8, 8, 2, 3, false, 0, 0),
        new Card(1, "伊塞勒", 1, 4, 8, 8, false, 0, 1),
        new Card(2, "铁面公卿", 1, 8, 8, 4, false, 0, 2),
        new Card(3, "希瓦", 8, 1, 8, 8, false, 0, 3),
        new Card(4, "希尔达", 8, 1, 4, 8, false, 0, 4),
        new Card(5, "缪塔米克斯", 6, 2, 6, 6, false, 1, 5),
        new Card(6, "蔓德拉", 3, 4, 2, 5, false, 1, 6),
        new Card(7, "长须豹", 5, 2, 5, 2, false, 1, 7),
        new Card(8, "矿爬虫", 4, 3, 3, 3, false, 1, 8),
        new Card(9, "梦魔", 6, 7, 3, 2, false, 1, 9)
    ],
    selected: -1,
    current: -1,
    tiles: [
        new Tile(0),
        new Tile(1),
        new Tile(2),
        new Tile(3),
        new Tile(4),
        new Tile(5),
        new Tile(6),
        new Tile(7),
        new Tile(8),
    ],
    cardAttributes:
        [[8, 8, 2, 3],
        [1, 4, 8, 8],
        [1, 8, 8, 4],
        [8, 1, 8, 8],
        [8, 1, 4, 8],
        [6, 2, 6, 6],
        [3, 4, 2, 5],
        [5, 2, 5, 2],
        [4, 3, 3, 3],
        [6, 7, 3, 2]],
    cardId: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

}

class GlobalStates extends Container {

    state = { ...initial_state };

    constructor() {
        super();
        this.init();
    }
    start;
    loading = false;
    init = () => {
        const ws = new WebSocket("ws://127.0.0.1:8765/");
        ws.onmessage = (event) => {
            console.log("Board loaded in ", (Date.now() - this.start) / 1000, "s")
            let str = unescape(event.data.replace(/\\u/g, '%u'))
            this.loading = false
            let players = JSON.parse(str)
            if (!players || players.length === 0) {
                console.log("Recognition failed ", (Date.now() - this.start) / 1000, "s")
            }
            let cards = []
            let cardId = []
            let cardAttributes = []
            let index = 0
            for (let playerNo = 0; playerNo < 2; playerNo++) {
                for (let cardInfo of players[playerNo]) {
                    cardId[index] = cardInfo[4]
                    cardAttributes[cardInfo[4]] = [cardInfo[0], cardInfo[1], cardInfo[2], cardInfo[3]]
                    cards.push(new Card(cardInfo[4], cardInfo[5], cardInfo[0], cardInfo[1],
                        cardInfo[2], cardInfo[3], false, playerNo, index++))
                }
            }
            this.setState({
                ...initial_state,
                cards: cards,
                cardId: cardId,
                cardAttributes: cardAttributes,
            })
            this.init()
        };
        this.state.ws = ws
    }

    load = () => {
        if (this.loading) {
            alert("still loading")
        } else {
            if (this.state.ws && this.state.ws.readyState === WebSocket.OPEN) {
                console.log("Loading Board...")
                this.start = Date.now()
                this.state.ws.send("getCard")
                this.loading = true
            } else {
                console.log("Connecting to vis...")
            }
        }
    }

    select = e => {
        let card_index = Number(e.target.id)
        if (this.state.selected !== card_index &&
            (this.state.current === -1 ||
                this.state.current === this.state.cards[card_index].owner)) {
            this.setState({ selected: card_index })
        } else {
            this.setState({ selected: -1 })
        }
    }

    place = e => {
        if (this.state.selected === -1) return
        let tileIndex = Number(e.target.id.replace('t', ''))
        let cardIndex = this.state.selected;
        if (this.state.current === -1) this.state.current = this.state.cards[cardIndex].owner
        let packedState = this.packState()
        AI.stateTransition(cardIndex, tileIndex, packedState, this.state.cardId, this.state.cardAttributes)
        this.setState(this.unpackState(packedState))
    }



    getBestMove = (playerNo = -1) => {
        if (playerNo !== -1) {
            this.state.current = playerNo
        } else {
            return
        }
        packedState = this.packState()
        let start = Date.now()
        // for (let i = 0; i < 10; i++)
        let best = AI.getBestMove(packedState, this.state.cardId, this.state.cardAttributes)
        let end = Date.now()
        console.log("Best Move calculated in ", (end - start) / 1000, "s")
        console.log("Best Move Score: ", best.score)
        AI.stateTransition(best.move[0], best.move[1], packedState, this.state.cardId, this.state.cardAttributes)
        this.setState(this.unpackState(packedState))
    }

    // b = () => {
    //     packedState = this.packState()
    //     console.log(`score for 0: ${AI.evaluateScore(packedState, 0)}`)
    //     console.log(`score for 1: ${AI.evaluateScore(packedState, 1)}`)
    // }

    packState = () => {
        return {
            current: this.state.current,
            // playerFields:
            //     [this.state.cards.filter(card =>
            //         card.owner === 0).map(card => card.id),
            //     this.state.cards.filter(card =>
            //         card.owner === 1).map(card => card.id)],
            tilesCard: this.state.tiles.map(tile => tile.card ? tile.card.index : -1),
            cardsOwner: this.state.cards.map(card => card.owner)
        }
    }

    unpackState = (packed) => {
        return {
            selected: -1,
            current: packed.current,
            cards: this.state.cards.map(card => {
                return {
                    ...card,
                    onBoard: !packed.tilesCard.every(cardIndex => cardIndex !== card.index),
                    owner: packed.cardsOwner[card.index]
                }
            }),
            tiles: this.state.tiles.map(tile => {
                return {
                    ...tile,
                    card: packed.tilesCard[tile.id] === -1 ? null :
                        {
                            ...this.state.cards[packed.tilesCard[tile.id]],
                            owner: packed.cardsOwner[packed.tilesCard[tile.id]]
                        }
                }
            })
        }
    }
}

export default GlobalStates;