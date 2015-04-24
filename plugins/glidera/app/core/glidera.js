
(function() {
  'use strict';

  angular.module('app.glidera', ['glidera'])
    .factory('glideraFactory', ['glideraApi', glideraCactory]);

  function glideraCactory(glideraApi) {
    var g = new Glidera({
      'sandbox': Airbitz.config.get('SANDBOX') === 'true' ? true : false,
      'partnerAccessKey': Airbitz.config.get('GLIDERA_PARTNER_TOKEN')
    });
    if (Airbitz.config.get('TESTNET_ADDRESS')) {
      g.sandboxAddress = Airbitz.config.get('TESTNET_ADDRESS')
    }
    var account = Airbitz.core.readData('account') || {};
    if (account) {
      g.key = account.key;
      g.secret = account.secret;
    }
    return g;
  }
})();
