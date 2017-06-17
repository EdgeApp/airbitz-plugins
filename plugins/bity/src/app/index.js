import React, { PropTypes } from 'react';
import Router from 'react-router/lib/Router';
import hashHistory from 'react-router/lib/hashHistory';
import { Provider } from 'react-redux';

import '../3rd-party/modernizr-custom';

import routes from './routes';
import { AppPreloader } from './app-preloader';

const propTypes = {
  store: PropTypes.object.isRequired
};

export default function App({ store }) {
  return (
    <Provider store={store}>
      <AppPreloader>
        <Router key={Math.random()} history={hashHistory} routes={routes} />
      </AppPreloader>
    </Provider>
  );
}

App.propTypes = propTypes;
