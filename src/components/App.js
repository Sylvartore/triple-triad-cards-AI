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
            <button onClick={() => globalStates.a()}>
              Debug a
            </button>
          }
        </Subscribe>
        <Subscribe to={[GlobalStates]}>
          {globalStates =>
            <button onClick={() => globalStates.b()}>
              Debug b
            </button>
          }
        </Subscribe>
        <Panel />
      </div>
    );
  }
}

export default App;
