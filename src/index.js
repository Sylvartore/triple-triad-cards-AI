import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'unstated';
import App from './ui/components/App';
import GlobalStates from './ui/containers/GlobalStates';
import './ui/css/style.css';

const GlobalStatesContainer = new GlobalStates();

ReactDOM.render(
  <Provider inject={[GlobalStatesContainer]}>
    <App />
  </Provider>,
  document.getElementById('root')
);
