import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'unstated';
import App from './components/App';
import GlobalStates from './containers/GlobalStates';
import './css/style.css';

const GlobalStatesContainer = new GlobalStates();

ReactDOM.render(
  <Provider inject={[GlobalStatesContainer]}>
    <App />
  </Provider>,
  document.getElementById('root')
);
