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
                                <img key={card.index} alt={card.name} id={card.index}
                                    src={`./cards/imgs/${card.id}.png`}
                                    className={globalStates.state.selected === card.index ?
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