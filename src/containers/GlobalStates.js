import { Container } from 'unstated';
// import React from 'react';

class Card {
    constructor(id, name, left, up, right, down, onBoard, owner, uid) {
        this.name = name;
        this.onBoard = onBoard;
        this.owner = owner;
        this.uid = uid;
        this.id = id;
        this.left = left;
        this.right = right;
        this.up = up;
        this.down = down;
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
            new Card("082189", "露琪亚", 8, 8, 2, 3, false, 0, 0),
            new Card("082190", "伊塞勒", 1, 4, 8, 8, false, 0, 1),
            new Card("082277", "铁面公卿", 1, 8, 8, 4, false, 0, 2),
            new Card("082155", "希瓦", 8, 1, 8, 8, false, 0, 3),
            new Card("082191", "希尔达", 8, 1, 4, 8, false, 0, 4),
            new Card("082136", "缪塔米克斯", 6, 2, 6, 6, false, 1, 5),
            new Card("082107", "蔓德拉", 3, 4, 2, 5, false, 1, 6),
            new Card("082110", "长须豹", 5, 2, 5, 2, false, 1, 7),
            new Card("082108", "矿爬虫", 4, 3, 3, 3, false, 1, 8),
            new Card("082124", "梦魔", 6, 7, 3, 2, false, 1, 9)
        ],
        selected: -1,

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
            new Card("082189", "露琪亚", 8, 8, 2, 3, false, 0, 0),
            new Card("082190", "伊塞勒", 1, 4, 8, 8, false, 0, 1),
            new Card("082277", "铁面公卿", 1, 8, 8, 4, false, 0, 2),
            new Card("082155", "希瓦", 8, 1, 8, 8, false, 0, 3),
            new Card("082191", "希尔达", 8, 1, 4, 8, false, 0, 4),
            new Card("082136", "缪塔米克斯", 6, 2, 6, 6, false, 1, 5),
            new Card("082107", "蔓德拉", 3, 4, 2, 5, false, 1, 6),
            new Card("082110", "长须豹", 5, 2, 5, 2, false, 1, 7),
            new Card("082108", "矿爬虫", 4, 3, 3, 3, false, 1, 8),
            new Card("082124", "梦魔", 6, 7, 3, 2, false, 1, 9)
        ]
        this.setState({
            cards: cards
        })
    }

    select = e => {
        let id = Number(e.target.id)
        if (this.state.selected !== id) {
            this.setState({ selected: id })
        } else {
            this.setState({ selected: -1 })
        }
    }

    place = e => {
        if (this.state.selected === -1) return
        if (e.target.hasChildNodes()) {
            let id = Number(e.target.id.replace('t', ''))
            this.state.cards[this.state.selected].onBoard = true
            this.state.tiles[id].card = this.state.cards[this.state.selected]
        }
        this.setState({ selected: -1 })
    }
}

export default GlobalStates;