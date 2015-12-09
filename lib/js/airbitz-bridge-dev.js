
_bridge = function() {
  return {
    inDevMod: function() {
      return true;
    },
    bitidAddress: function(uri, message) {
      return prompt("Please enter bidid address", "");
    },
    bitidSignature: function(uri, message) {
      return prompt("Please enter bidid signature", "");
    },
    selectedWallet: function(options) {
      if (options.success) {
        options.success({"id": "111", "name": "My Wallet", "currencyNum": 840, "balance": 10000});
      }
    },
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

    finalizeRequest: function(wallet, requestId) {
    },

    requestSpend: function(wallet, toAddress, amountSatoshi, amountFiat, options) {
      if (options.success) {
        options.success();
      }
    },

    requestFile: function(options) {
      alert("If this were mobile, we'd load the camera/file manager");
      if (options.success) {
        options.success();
      }
    },

    writeData: function(key, data) {
      localStorage.setItem(key, data);
    },

    clearData: function() {
      localStorage.clear();
    },

    readData: function(key) {
      return localStorage.getItem(key);
    },

    getBtcDenomination: function() {
      return "BTC";
    },

    satoshiToCurrency: function(satoshi, currencyNum) {
      return (satoshi * (this.exchangeRate(currencyNum) / 100000000)).toFixed(2);
    },

    currencyToSatoshi: function(currency, currencyNum) {
      return (currency / this.exchangeRate(currencyNum) * 100000000);
    },

    formatSatoshi: function(satoshi, withSymbol) {
      var amount = parseFloat(satoshi) / 100000000;

      if(withSymbol) {
        return amount + ' BTC';
      } else {
        return amount;
      }

    },

    formatCurrency: function(currency, currencyNum, withSymbol) {
      var amount = (parseFloat(currency) | 0).toFixed(2);

      if(withSymbol) {
        return amount + ' USD';
      } else {
        return amount;
      }
    },

    exchangeRate: function(currencyNum) {
      return 250.0;
    },

    getConfig: function(key) {
      // This is dangerous but its only for debug bridge
      // This code will never go into production
      return eval(key);
    },

    showAlert: function(title, message, options) {
      alert(message);
    },

    hideAlert: function() {
    },

    title: function(s) {
      document.title = s;
    },

    debugLevel: function(level, text) {
      console.log(text);
    },

    showNavBar: function() {
      console.log('showing tabbar');
    },

    hideNavBar: function() {
      console.log('hide tabbar');
    },

    back: function() {
      console.log('Back Pressed');
    },

    exit: function() {
      console.log('Exit');
    },

    navStackClear: function() {
    },

    navStackPush: function(path) {
    },

    navStackPop: function() {
    },

    launchExternal: function(uri) {
      location.href = uri;
    }
  }
};
