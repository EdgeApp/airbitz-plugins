
(function() {
  'use strict';

  angular.module('app.clevercoin', ['clevercoin'])
    .factory('CcFactory', ['CleverCoinApi', cleverCoinFactory]);

  function cleverCoinFactory(CleverCoinApi) {
    var c = new CleverCoinApi({
      'apiKey': Airbitz.config.get('CLEVERCOIN_API_KEY'),
      'apiLabel': Airbitz.config.get('CLEVERCOIN_API_LABEL'),
      'apiSecret': Airbitz.config.get('CLEVERCOIN_API_SECRET')
    });
    var account = Airbitz.core.readData('account') || {};
    return c;
  }
})();
