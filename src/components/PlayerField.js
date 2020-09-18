import React, { Component } from 'react';
import GlobalStates from '../containers/GlobalStates';
import { Subscribe } from 'unstated';

class PlayerField extends Component {
    render() {
        return (
            <div className={`player-field ${this.props.player ? "red" : "blue"}`}>
                <Subscribe to={[GlobalStates]}>
                    {globalStates =>
                        globalStates.state.cards.filter(card =>
                            card.owner === this.props.player && !card.onBoard).map(card => (
                                <img key={card.uid} alt={card.name} id={card.uid}
                                    src={`./cards/imgs/${card.id}.png`}
                                    className={globalStates.state.selected === card.uid ?
                                        "selected" : "unselected"}
                                    onClick={e => globalStates.select(e)}
                                />
                            ))
                    }
                </Subscribe>
            </div >
        );
    }
}

export default PlayerField;