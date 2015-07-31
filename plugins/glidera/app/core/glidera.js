
(function() {
  'use strict';

  angular.module('app.glidera', ['glidera'])
    .factory('glideraFactory', ['glideraApi', glideraFactory]);

  function glideraFactory(glideraApi) {
    console.log('Sandbox: ' + Airbitz.config.get('SANDBOX'))
    var g = new Glidera({
      'sandbox': Airbitz.config.get('SANDBOX') == 'true' ? true : false,
      'clientId': Airbitz.config.get('GLIDERA_CLIENT_ID'),
      'clientSecret': Airbitz.config.get('GLIDERA_CLIENT_SECRET')
    });
    if (Airbitz.config.get('TESTNET_ADDRESS')) {
      g.sandboxAddress = Airbitz.config.get('TESTNET_ADDRESS')
    }
    var account = Airbitz.core.readData('account') || {};
    if (account) {
      g.accessToken = account.accessToken;
      g.accessTokenType = account.accessTokenType;
    }
    return g;
  }
})();
