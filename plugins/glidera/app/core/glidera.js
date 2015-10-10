
(function() {
  'use strict';

  angular.module('app.glidera', ['glidera'])
    .factory('glideraFactory', ['glideraApi', glideraFactory]);

  function glideraFactory(glideraApi) {
    console.log('Sandbox: ' + Airbitz.config.get('SANDBOX'))
    var g = new Glidera({
      'sandbox': Airbitz.config.get('SANDBOX') == 'true' ? true : false,
      'clientId': Airbitz.config.get('GLIDERA_CLIENT_ID')
    });
    var account = Airbitz.core.readData('account') || {};
    if (false && account) {
      g.accessKey = account.accessKey;
      g.secret = account.secret;
    }
    return g;
  }
})();
