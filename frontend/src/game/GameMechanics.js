const Get =
    [[-1, 0, 1, -1, 3, 4, -1, 6, 7],
    [-1, -1, -1, 0, 1, 2, 3, 4, 5],
    [1, 2, -1, 4, 5, -1, 7, 8, -1],
    [3, 4, 5, 6, 7, 8, -1, -1, -1]]
const Counter = [2, 3, 0, 1]

class GameMechanics {

    stateTransition(cardIndex, tileIndex, state, cardId, cardAttributes) {
        if (state.tilesCard[tileIndex] !== -1) return state
        state.tilesCard[tileIndex] = cardIndex;
        state.cardsTile[cardIndex] = tileIndex;
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
        let map = new Map()
        for (let direction = 0; direction < 4; direction++) {
            let targetTileIndex = Get[direction][tileIndex]
            if (targetTileIndex === -1) continue
            let targetCardIndex = state.tilesCard[targetTileIndex]
            if (targetCardIndex === -1) continue
            let key = cardAttributes[cardId[cardIndex]][direction] +
                cardAttributes[cardId[targetCardIndex]][Counter[direction]]
            if (map.has(key)) {
                if (state.cardsOwner[targetCardIndex] !== state.current) {
                    state.cardsOwner[targetCardIndex] = state.current
                    this.combo(targetCardIndex, targetTileIndex, state, cardId, cardAttributes)
                }
                let stored = map.get(key)
                if (state.cardsOwner[stored[0]] !== state.current) {
                    state.cardsOwner[stored[0]] = state.current
                    this.combo(stored[0], stored[1], state, cardId, cardAttributes)
                }
            } else {
                map.set(key, [targetCardIndex, targetTileIndex])
            }
        }
    }

    combo = (cardIndex, tileIndex, state, cardId, cardAttributes) => {
        for (let direction = 0; direction < 4; direction++) {
            let targetTileIndex = Get[direction][tileIndex]
            if (targetTileIndex === -1) continue
            let targetCardIndex = state.tilesCard[targetTileIndex]
            if (targetCardIndex === -1 || state.cardsOwner[targetCardIndex] === state.current) continue
            if (cardAttributes[cardId[cardIndex]][direction] >
                cardAttributes[cardId[targetCardIndex]][Counter[direction]]) {
                state.cardsOwner[targetCardIndex] = state.current
                this.combo(targetCardIndex, targetTileIndex, state, cardId, cardAttributes)
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
        let res = []
        for (let i = 0; i < 10; i++) {
            if (state.cardsOwner[i] === state.current && state.cardsTile[i] === -1) {
                for (let j = 0; j < 9; j++) {
                    if (state.tilesCard[j] === -1)
                        res.push([i, j]);
                }
            }
        }
        return res;
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
            cardsOwner: [...state.cardsOwner],
            cardsTile: [...state.cardsTile],
            tilesCard: [...state.tilesCard]
        }
    }
}

const instance = new GameMechanics();
Object.freeze(instance);

export default instance;