const Get =
    [[-1, 0, 1, -1, 3, 4, -1, 6, 7],
    [-1, -1, -1, 0, 1, 2, 3, 4, 5],
    [1, 2, -1, 4, 5, -1, 7, 8, -1],
    [3, 4, 5, 6, 7, 8, -1, -1, -1]]
const Counter = [2, 3, 0, 1]

class AI {

    stateTransition(cardIndex, tileIndex, state, cardId, cardAttributes) {
        if (state.tilesCard[tileIndex] !== -1) return state
        state.tilesCard[tileIndex] = cardIndex
        this.takeoverSettlement(cardIndex, tileIndex, state, cardId, cardAttributes)
        state.current = state.current ? 0 : 1
    }

    takeoverSettlement = (cardIndex, tileIndex, state, cardId, cardAttributes) => {
        // this.ruleSame(cardIndex, tileIndex, state, cardId, cardAttributes)
        this.rulePlus(cardIndex, tileIndex, state, cardId, cardAttributes)
        this.ruleBasic(cardIndex, tileIndex, state, cardId, cardAttributes)
    }

    ruleSame = (cardIndex, tileIndex, state, cardId, cardAttributes) => {
        let res = []
        for (let direction = 0; direction < 4; direction++) {
            let targetTileIndex = Get[direction][tileIndex]
            if (targetTileIndex === -1) continue
            let targetCardIndex = state.tilesCard[targetTileIndex]
            if (targetCardIndex === -1) continue
            if (cardAttributes[cardId[cardIndex]][direction] ===
                cardAttributes[cardId[targetCardIndex]][Counter[direction]]) {
                res.push(targetCardIndex)
            }
        }
        if (res.length > 1) {
            for (const targetCardIndex of res) {
                state.cardsOwner[targetCardIndex] = state.current
            }
        }
    }

    rulePlus = (cardIndex, tileIndex, state, cardId, cardAttributes) => {
        let map = {}
        for (let direction = 0; direction < 4; direction++) {
            let targetTileIndex = Get[direction][tileIndex]
            if (targetTileIndex === -1) continue
            let targetCardIndex = state.tilesCard[targetTileIndex]
            if (targetCardIndex === -1) continue
            let key = cardAttributes[cardId[cardIndex]][direction] +
                cardAttributes[cardId[targetCardIndex]][Counter[direction]]
            if (map.hasOwnProperty(key)) {
                state.cardsOwner[targetCardIndex] = state.current
                state.cardsOwner[map[key]] = state.current
            } else {
                map[key] = targetCardIndex
            }

        }
    }

    ruleBasic = (cardIndex, tileIndex, state, cardId, cardAttributes) => {
        for (let direction = 0; direction < 4; direction++) {
            let targetTileIndex = Get[direction][tileIndex]
            if (targetTileIndex === -1) continue
            let targetCardIndex = state.tilesCard[targetTileIndex]
            if (targetCardIndex === -1 || state.cardsOwner[targetCardIndex] === state.current) continue
            if (cardAttributes[cardId[cardIndex]][direction] >
                cardAttributes[cardId[targetCardIndex]][Counter[direction]]) {
                state.cardsOwner[targetCardIndex] = state.current
            }
        }
    }

    getBestMove(state, cardId, cardAttributes) {
        let max = -5;
        let best = null;
        for (const move of this.getAllMoves(state)) {
            let copy = this.clone(state)
            this.stateTransition(move[0], move[1], copy, cardId, cardAttributes)
            let utility = this.min(copy, -5, 5, cardId, state.current, cardAttributes);
            if (max === -5 || utility > max) {
                max = utility;
                best = [move[0], move[1]];
            }
        }
        return { move: best, score: max };
    }

    min(state, alpha, beta, cardId, side, cardAttributes) {
        if (this.terminateTest(state)) return this.evaluateScore(state, side);
        let value = 5;
        for (const move of this.getAllMoves(state)) {
            let copy = this.clone(state)
            this.stateTransition(move[0], move[1], copy, cardId, cardAttributes)
            let utility = this.max(copy, alpha, beta, cardId, side, cardAttributes);
            if (utility < value) value = utility;
            if (utility <= alpha) return utility;
            if (utility < beta) beta = utility;
        }
        return value;
    }

    max(state, alpha, beta, cardId, side, cardAttributes) {
        if (this.terminateTest(state)) return this.evaluateScore(state, side);
        let value = -5;
        for (const move of this.getAllMoves(state)) {
            let copy = this.clone(state)
            this.stateTransition(move[0], move[1], copy, cardId, cardAttributes)
            let utility = this.min(copy, alpha, beta, cardId, side, cardAttributes);
            if (utility > value) value = utility;
            if (utility >= beta) return utility;
            if (utility > alpha) alpha = utility;
        }
        return value;
    }

    getAllMoves(state) {
        let empty = []
        let hasCard = []
        for (let i = 0; i < 9; i++) {
            if (state.tilesCard[i] === -1) empty.push(i)
            else hasCard.push(i)
        }
        let cards = []
        for (let i = 0; i < 10; i++) {
            if (state.cardsOwner[i] === state.current && hasCard.every(index => state.tilesCard[index] !== i))
                cards.push(i)
        }
        let res = []
        for (const card of cards) {
            for (const tile of empty) {
                res.push([card, tile])
            }
        }
        return res
    }

    terminateTest(state) {
        return state.tilesCard.every(cardIndex => cardIndex !== -1)
    }

    evaluateScore(state, side) {
        return state.cardsOwner.reduce((acc, cur) => acc + (cur === side ? 1 : 0), -5)
    }

    clone(state) {
        return {
            current: state.current,
            tilesCard: [...state.tilesCard],
            cardsOwner: [...state.cardsOwner]
        }
    }

    // getCardInfo = () => {
    //     return new Promise((success, nosuccess) => {
    //         const pyprog = spawn('node', ['./a.js']);
    //         pyprog.stdout.on('data', (data) => {
    //             success(data);
    //         });
    //         pyprog.stderr.on('data', (data) => {
    //             nosuccess(data);
    //         });
    //     });
    // }
}

const instance = new AI();
Object.freeze(instance);

export default instance;