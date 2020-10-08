import React, { Component } from 'react';
import LoadBoard from './LoadBoard';
import Panel from './Panel';
import { Subscribe } from 'unstated';
import GlobalStates from '../containers/GlobalStates';

class App extends Component {
  render() {
    return (
      <div>
        <LoadBoard />
        <Subscribe to={[GlobalStates]}>
          {globalStates =>
            <button onClick={() => globalStates.vis(1)}>
              Update Model
            </button>
          }
        </Subscribe>
        <Subscribe to={[GlobalStates]}>
          {globalStates =>
            <button onClick={() => globalStates.getBestMove()}>
              Get Best Move
            </button>
          }
        </Subscribe>
        <Subscribe to={[GlobalStates]}>
          {globalStates =>
            <button onClick={() => globalStates.getBestMove(0)}>
              AI play as Blue
            </button>
          }
        </Subscribe>
        <Subscribe to={[GlobalStates]}>
          {globalStates =>
            <button onClick={() => globalStates.getBestMove(1)}>
              AI play as Red
            </button>
          }
        </Subscribe>
        <Panel />
      </div>
    );
  }

}

export default App;
