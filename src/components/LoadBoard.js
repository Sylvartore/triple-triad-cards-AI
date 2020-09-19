import React from 'react';
import { Subscribe } from 'unstated';
import GlobalStates from '../containers/GlobalStates';

class LoadBoard extends React.Component {
    render() {
        return (
            <div>
                <Subscribe to={[GlobalStates]}>
                    {globalStates => (
                        <button onClick={() => globalStates.init()}>
                            Load Board
                        </button>
                    )}
                </Subscribe>
            </div>
        );
    }
}

export default LoadBoard;