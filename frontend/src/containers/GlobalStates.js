import { Container } from 'unstated';
import GameMechanics from '../game/GameMechanics';
import Card from '../game/Card'
import Tile from '../game/Tile'
const electron = window.require('electron');
const net = electron.remote.require('net');



const initial_state = {
    cards: [],
    selected: -1,
    current: -1,
    tiles: [
        new Tile(0), new Tile(1), new Tile(2),
        new Tile(3), new Tile(4), new Tile(5),
        new Tile(6), new Tile(7), new Tile(8),
    ]
}

class GlobalStates extends Container {
    state = { ...initial_state };
    constructor() {
        super();
        this.init();
    }
    init = () => {
        const webSocket = new WebSocket("ws://localhost:8001/");
        webSocket.onopen = (e) => console.log("WebSocket Connected");
        webSocket.onclose = (e) => console.log("WebSocket Disconnected");
        webSocket.onmessage = (event) => {
            let loadTime = (Date.now() - this.startTime) / 1000
            this.startTime = 0
            let players = JSON.parse(unescape(event.data.replace(/\\u/g, '%u')))
            if (!players || players.length === 0) {
                console.log("Recognition failed")
            }
            console.log(`Board loaded in ${loadTime}s`)
            let cards = []
            this.cardId = []
            this.cardAttributes = []
            let index = 0
            for (let playerNo = 0; playerNo < 2; playerNo++) {
                for (let cardInfo of players[playerNo]) {
                    this.cardId[index] = cardInfo[4]
                    this.cardAttributes[cardInfo[4]] = [cardInfo[0], cardInfo[1], cardInfo[2], cardInfo[3]]
                    cards.push(new Card(cardInfo[4], cardInfo[5], cardInfo[0], cardInfo[1],
                        cardInfo[2], cardInfo[3], false, playerNo, index++))
                }
            }
            this.setState({
                ...initial_state,
                cards: cards,
            })
        };
        this.webSocket = webSocket

        const socket = new net.Socket();
        socket.connect(8002, 'localhost', () => console.log("Socket connected"));
        socket.on('close', () => console.log("Socket disconnected"));
        socket.on('data', (data) => {
            let calculateTime = (Date.now() - this.startTime) / 1000
            this.startTime = 0
            let response = JSON.parse(data.toString())
            if (response.action === "error") {
                console.log(response.data)
                return
            }
            console.log(`calculated in ${calculateTime}s, best score found ${response.data.score}`)
            let packedState = this.packState(this.state)
            GameMechanics.stateTransition(response.data.cardIndex, response.data.tileIndex, packedState, this.cardId, this.cardAttributes)
            this.setState(this.unpackState(packedState))
        })
        this.socket = socket

        window.onbeforeunload = () => {
            webSocket.send('disconnect')
            webSocket.close()
            socket.write('disconnect;\n')
            socket.distory()
        }
        this.startTime = 0
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
        GameMechanics.stateTransition(cardIndex, tileIndex, packedState, this.cardId, this.cardAttributes)
        this.setState(this.unpackState(packedState))
    }

    load = () => {
        if (this.startTime !== 0) {
            alert("Still Processing...")
            return
        }
        if (!this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) {
            console.log("Disconnected to VIS")
        }
        console.log("Loading Board...")
        this.startTime = Date.now()
        this.webSocket.send("getCard")
    }

    getBestMove = (playerNo = this.state.current) => {
        if (!this.state.cards || this.state.cards.length === 0 || !this.cardId || !this.cardAttributes) {
            console.log("load board first")
            return
        }
        if (playerNo !== -1) {
            this.state.current = playerNo
        } else {
            return
        }
        if (this.state.tiles.every(tile => tile.card !== null)) {
            console.log("Game Over")
            return
        }
        if (this.startTime !== 0) {
            alert("Still Processing...")
            return
        }
        if (!this.socket || this.socket.readyState !== "open") {
            console.log("Disconnected to AI")
            return
        }
        this.startTime = Date.now()
        console.log("Calculating...")
        let packedState = this.packState()
        this.socket.write(`getBestMove;` +
            `current=${this.state.current}&` +
            `cardsOwner=${JSON.stringify(packedState.cardsOwner).replace(/[[\]]/g, "")}&` +
            `cardsTile=${JSON.stringify(packedState.cardsTile).replace(/[[\]]/g, "")}&` +
            `tilesCard=${JSON.stringify(packedState.tilesCard).replace(/[[\]]/g, "")}&` +
            `cardId=${JSON.stringify(this.cardId).replace(/[[\]]/g, "")}&` +
            `cardAttributes=${JSON.stringify(this.cardAttributes).replace(/[[\]]/g, "")}\n`)
    }

    packState = () => {
        let tilesCard = this.state.tiles.map(tile => tile.card ? tile.card.index : -1)
        let cardsTile = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
        for (let i = 0; i < 9; i++) {
            if (tilesCard !== -1) cardsTile[tilesCard[i]] = i
        }
        return {
            current: this.state.current,
            cardsOwner: this.state.cards.map(card => card.owner),
            cardsTile: cardsTile,
            tilesCard: tilesCard
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