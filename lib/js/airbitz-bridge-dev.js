
_bridge = function() {
  return {
    wallets: function(options) {
      if (options.success) {
        options.success([
          {"id": "111", "name": "My Wallet", "currencyNum": 840, "balance": 10000}
        , {"id": "111", "name": "Salary", "currencyNum": 840, "balance": 200000000}
        ]);
      }
    },

    createReceiveRequest: function(wallet, options) {
      if (options.success) {
        options.success({
          "requestId": "123",
          "address": "15U2rkM3yhSpBR3Zef4LRe3mS9r3PWEU2z"
        });
      }
    },

    requestSpend: function(wallet, toAddress, amountSatoshi, options) {
      if (options.success) {
        options.success();
      }
    },

    satoshiToCurrency: function(satoshi, currencyNum) {
      return (satoshi * (Airbitz.core.exchangeRate(currencyNum) / 100000000)).toFixed(2);
    },

    currencyToSatoshi: function(currency, currencyNum) {
      return (satoshi / (Airbitz.core.exchangeRate(currencyNum) / 100000000));
    },

    formatSatoshi: function(satoshi, withSymbol) {
      return (satoshi * 100000000) + ' BTC';
    },

    formatCurrency: function(currency, currencyNum, withSymbol) {
      return (currency | 0).toFixed(2) + ' USD';
    },

    exchangeRate: function(currencyNum) {
      return 200.0;
    },

    title: function(s) {
      document.title = s;
    },

    back: function() {
      console.log('Back Pressed');
    },

    exit: function() {
      console.log('Exit');
    }
  }
};
