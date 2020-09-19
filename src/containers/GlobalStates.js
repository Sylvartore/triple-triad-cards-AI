import { Container } from 'unstated';
import AI from './AI';

// import React from 'react';
let data;
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
class GlobalStates extends Container {
    state = {
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
        ]
    };

    init = () => {
        let cards = [
        ]
        this.setState({
            cards: cards
        })
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
        AI.stateTransition(cardIndex, tileIndex, packedState, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
        this.setState(this.unpackState(packedState))
    }



    a = () => {
        let start = Date.now()
        data = this.packState()
        console.log(AI.getBestMove(data, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]))
        console.log((Date.now() - start) / 1000)
    }
    b = () => {
        data = this.packState()
        console.log(`score for 0: ${AI.evaluateScore(data, 0)}`)
        console.log(`score for 1: ${AI.evaluateScore(data, 1)}`)
    }

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