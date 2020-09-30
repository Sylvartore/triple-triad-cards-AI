import React, { Component } from 'react';
import Tile from './Tile'

class Board extends Component {
    render() {
        return (
            <div id="board">
                <div >
                    {this.renderTile(0)}
                    {this.renderTile(3)}
                    {this.renderTile(6)}
                </div>
                <div  >
                    {this.renderTile(1)}
                    {this.renderTile(4)}
                    {this.renderTile(7)}
                </div>
                <div >
                    {this.renderTile(2)}
                    {this.renderTile(5)}
                    {this.renderTile(8)}
                </div>
            </div >
        );
    }

    renderTile(i) {
        return (
            <Tile id={i} />
        );
    }
}

export default Board;
