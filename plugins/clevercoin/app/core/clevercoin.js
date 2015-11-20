
(function() {
  'use strict';

  angular.module('app.clevercoin', ['clevercoin'])
    .factory('CcFactory', ['CleverCoinApi', cleverCoinFactory]);

  function cleverCoinFactory(CleverCoinApi) {
    var account = Airbitz.core.readData('account') || {isSignedIn: false};
    var params = {
      'sandbox': Airbitz.config.get('SANDBOX')
    };
    if (account.isSignedIn) {
      params['apiKey'] = account.key;
      params['apiLabel'] = account.label;
      params['apiSecret'] = account.secret;
    } else {
      params['apiKey'] = Airbitz.config.get('CLEVERCOIN_API_KEY');
      params['apiLabel'] = Airbitz.config.get('CLEVERCOIN_API_LABEL');
      params['apiSecret'] = Airbitz.config.get('CLEVERCOIN_API_SECRET');
    }
    return new CleverCoinApi(params);
  }
})();
