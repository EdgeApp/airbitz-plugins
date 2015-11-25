
(function(root) {
  root.Airbitz = {};
  Airbitz = root.Airbitz;
  Airbitz.config = {};
  Airbitz.core = {};
  Airbitz.ui = {};
  Airbitz._callbacks = {};
  Airbitz._results = {};
  Airbitz._listeners = {};
  Airbitz._walletListener = null;
  Airbitz._denomListener = null;
  Airbitz._bridge = _bridge();

  Airbitz.core.bitidAddress = function(uri, message) {
    return Airbitz._bridge.bitidAddress(uri, message);
  };

  Airbitz.core.bitidSignature = function(uri, message) {
    return Airbitz._bridge.bitidSignature(uri, message);
  };

  // Options has callback functions success and error.
  Airbitz.core.selectedWallet = function(options) {
    Airbitz._bridge.selectedWallet(options);
  };

  Airbitz.core.wallets = function(options) {
    Airbitz._bridge.wallets(options);
  };

  Airbitz.core.createReceiveRequest = function(wallet, options) {
    Airbitz._bridge.createReceiveRequest(wallet, options);
  };

  Airbitz.core.finalizeRequest = function(wallet, requestId) {
    Airbitz._bridge.finalizeRequest(wallet, requestId);
  },

  // Takes a spend request and sends user to send confirmation screen to spend.
  Airbitz.core.requestSpend = function(wallet, toAddress, amountSatoshi, amountFiat, options) {
    Airbitz._bridge.requestSpend(wallet, toAddress, amountSatoshi, amountFiat, options);
  };

  Airbitz.core.requestFile = function(options) {
    Airbitz._bridge.requestFile(options);
  };

  Airbitz.core.writeData = function(key, data) {
    Airbitz._bridge.writeData(key, JSON.stringify(data));
  };

  // Clears all data stored by the plugin.
  Airbitz.core.clearData = function() {
    Airbitz._bridge.clearData();
  };

  // Retrives data for a JSON key stored for the plugin.
  Airbitz.core.readData = function(key) {
    var data = Airbitz._bridge.readData(key);
    return (data && data !== 'undefined') ? JSON.parse(data) : null;
  };

  Airbitz.core.getBtcDenomination = function() {
    return Airbitz._bridge.getBtcDenomination();
  }

  Airbitz.core.satoshiToCurrency = function(satoshi, currencyNum) {
    return Airbitz._bridge.satoshiToCurrency(satoshi, currencyNum);
  }

  Airbitz.core.currencyToSatoshi = function(currency, currencyNum) {
    return Airbitz._bridge.currencyToSatoshi(currency, currencyNum);
  }

  Airbitz.core.formatSatoshi = function(satoshi, withSymbol) {
    return Airbitz._bridge.formatSatoshi(satoshi, withSymbol);
  }

  Airbitz.core.formatCurrency = function(currency, currencyNum, withSymbol) {
    return Airbitz._bridge.formatCurrency(currency, currencyNum, withSymbol);
  }

  Airbitz.config.get = function(key) {
    return Airbitz._bridge.getConfig(key);
  };

  /* Callback is called when wallet is changed AND every time plugin is created.
  ** Callback is provided wallet as parameter.
  */
  Airbitz.core.setWalletChangeListener = function(callback) {
    Airbitz._walletListener = callback;
  };

  //
  Airbitz._bridge.walletChanged = function(newWallet) {
    if (Airbitz._walletListener) {
      var j = JSON.parse(newWallet);
      if (j.success) {
        Airbitz._walletListener(j.result);
      }
    }
  };

  Airbitz.core.setDenominationChangeListener = function(callback) {
    Airbitz._denomListener = callback;
  };

  Airbitz._bridge.denominationUpdate = function(newDenom) {
    if (Airbitz._denomListener) {
      var j = JSON.parse(newDenom);
      if (j.success) {
        Airbitz._denomListener(j.result.value);
      }
    }
  };

  Airbitz.core.removeExchangeRateListener = function(currencyNum, callback) {
    var i = Airbitz._listeners[currencyNum].indexOf(callback);
    Airbitz._listeners[currencyNum].splice(i, 1);
  };

  Airbitz._bridge.exchangeRateUpdate = function() {
    for (var k in Airbitz._listeners) {
      for (var i = 0; i < Airbitz._listeners[k].length; ++i) {
        Airbitz._listeners[k][i]();
      }
    }
  };

  Airbitz.core.addExchangeRateListener = function(currencyNum, callback) {
    if (!Airbitz._listeners[currencyNum]) {
      Airbitz._listeners[currencyNum] = [];
    }
    Airbitz._listeners[currencyNum].push(callback);
  };

  Airbitz.core.removeExchangeRateListener = function(currencyNum, callback) {
    var i = Airbitz._listeners[currencyNum].indexOf(callback);
    Airbitz._listeners[currencyNum].splice(i, 1);
  };

  Airbitz.ui.showAlert = function(title, message, options) {
    Airbitz._bridge.showAlert(title, message, options || {});
  };

  Airbitz.ui.title = function(s) {
    Airbitz._bridge.title(s);
  };

  Airbitz.ui.debugLevel = function(level, text) {
    Airbitz._bridge.debugLevel(level, text);
  };

  Airbitz.ui.showNavBar = function() {
    Airbitz._bridge.showNavBar();
  };

  Airbitz.ui.hideNavBar = function() {
    Airbitz._bridge.hideNavBar();
  };

  Airbitz.ui.back = function() {
    Airbitz._bridge.back();
  };

  Airbitz.ui.exit = function() {
    Airbitz._bridge.exit();
  };

  Airbitz.ui.navStackClear = function() {
    Airbitz._bridge.navStackClear();
  };

  Airbitz.ui.navStackPush = function(path) {
    Airbitz._bridge.navStackPush(path);
  };

  Airbitz.ui.navStackPop = function() {
    Airbitz._bridge.navStackPop();
  };

})(this);
