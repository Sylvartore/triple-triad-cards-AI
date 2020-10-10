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
        webSocket.onopen = (e) => console.log("WebSocket connected");
        webSocket.onclose = (e) => console.log("WebSocket disconnected");
        webSocket.onerror = (e) => console.log(e);
        webSocket.onmessage = (event) => {
            let time = (Date.now() - this.startTime) / 1000
            // let data = unescape(event.data.replace(/\\u/g, '%u'))
            let json = event.data
            let msg = JSON.parse(json)
            switch (msg.action) {
                case "loadBoard":
                    this.loadBoard(msg.data, time)
                case "completed":
                    this.startTime = 0
                    console.log("update completed")
                    break;
                case "msg":
                    this.startTime = 0
                    console.log(msg.data)
                    break;
            }
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
            GameMechanics.stateTransition(response.data.cardIndex, response.data.tileIndex, packedState, this.cardAttributes)
            this.setState(this.unpackState(packedState))
        })
        this.socket = socket

        window.onbeforeunload = () => {
            console.log("unload")
            webSocket.send('disconnect')
            webSocket.close()
            socket.write('disconnect;\n')
            socket.destroy()
        }
        this.startTime = 0
    }

    loadBoard = (data, time) => {
        let players = JSON.parse(unescape(data.replace(/\\u/g, '%u')))
        if (!players || players.length === 0) {
            console.log("Recognition failed")
            return
        }
        console.log(`Board loaded in ${time}s`)
        console.log(players)
        let cards = []
        this.cardAttributes = []
        let index = 0
        for (let playerNo = 0; playerNo < 2; playerNo++) {
            for (let cardInfo of players[playerNo]) {
                this.cardAttributes[index] = [cardInfo[1], cardInfo[2], cardInfo[3], cardInfo[4]]
                cards.push(new Card(cardInfo[0], cardInfo[5], cardInfo[1], cardInfo[2],
                    cardInfo[3], cardInfo[4], false, playerNo, index++))
            }
        }
        this.setState({
            ...initial_state,
            cards: cards,
        })
        console.log(this.cardAttributes)
        console.log(cards)
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
        GameMechanics.stateTransition(cardIndex, tileIndex, packedState, this.cardAttributes)
        this.setState(this.unpackState(packedState))
    }

    vis = operation => {
        if (this.startTime !== 0) {
            alert("Still Processing...")
            return
        }
        if (!this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) {
            console.log("Disconnected to VIS")
        }
        this.startTime = Date.now()
        switch (operation) {
            case 0:
                console.log("Loading Board...")
                this.webSocket.send("loadBoard")
                break
            case 1:
                console.log("Updating Model...")
                this.webSocket.send("getCardInfo")
                break
        }
    }

    getBestMove = (playerNo = this.state.current) => {
        if (!this.state.cards || this.state.cards.length === 0 || !this.cardAttributes) {
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