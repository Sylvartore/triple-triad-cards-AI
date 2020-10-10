import React, { Component } from 'react';
import GlobalStates from '../containers/GlobalStates';
import { Subscribe } from 'unstated';

class Tile extends Component {
    render() {
        return (
            <Subscribe to={[GlobalStates]}>
                {globalStates =>
                    <div className={`tile ${globalStates.state.tiles[this.props.id].card ?
                        globalStates.state.tiles[this.props.id].card.owner ? "red" : "blue" : ""}`}
                        onClick={e => globalStates.place(e)} id={`t${this.props.id}`}>
                        {globalStates.state.tiles[this.props.id].card === null ? this.props.id :
                            <img src={`./cards/sourceImg/${globalStates.state.tiles[this.props.id].card.id}.png`}
                                alt={globalStates.state.tiles[this.props.id].card.name} />}
                    </div>
                }
            </Subscribe>
        );

    }
}

export default Tile;