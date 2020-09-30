import React, { Component } from 'react';
import PlayerField from './PlayerField'
import Board from './Board'

class Panel extends Component {
    render() {
        return (
            <div>
                <PlayerField player={0} />
                <Board />
                <PlayerField player={1} />
            </div>
        );
    }
}

export default Panel;
