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

export default Card