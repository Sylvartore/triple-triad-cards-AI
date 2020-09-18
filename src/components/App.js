import React, { Component } from 'react';
import LoadBoard from './LoadBoard';
import Panel from './Panel';

class App extends Component {
  render() {
    return (
      <div>
        <LoadBoard />
        <Panel />
      </div>
    );
  }
}

export default App;
