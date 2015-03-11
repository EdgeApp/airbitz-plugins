
(function(root) {
  root.Airbitz = {};
  Airbitz = root.Airbitz;
  Airbitz.core = {};
  Airbitz.ui = {};
  Airbitz._callbacks = {};
  Airbitz._listeners = {};
  Airbitz._bridge = _bridge();

  Airbitz.core.wallets = function(options) {
    Airbitz._bridge.wallets(options);
  };

  Airbitz.core.createReceiveRequest = function(wallet, options) {
    Airbitz._bridge.createReceiveRequest(wallet, options);
  };

  Airbitz.core.finalizeRequest = function(wallet, requestId) {
    Airbitz._bridge.finalizeRequest(wallet, requestId);
  },

  Airbitz.core.requestSpend = function(wallet, toAddress, amountSatoshi, options) {
    Airbitz._bridge.requestSpend(wallet, toAddress, amountSatoshi, options);
  };

  Airbitz.core.writeData = function(key, data) {
    Airbitz._bridge.writeData(key, JSON.stringify(data));
  };

  Airbitz.core.readData = function(key) {
    var data = Airbitz._bridge.readData(key);
    return (data && data !== 'undefined') ? JSON.parse(data) : data;
  };

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

  Airbitz.core.exchangeRate = function(currencyNum) {
    return Airbitz._bridge.exchangeRate(currencyNum);
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

  Airbitz.ui.showAlert = function(title, message) {
    Airbitz._bridge.showAlert(title, message);
  };

  Airbitz.ui.title = function(s) {
    Airbitz._bridge.title(s);
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
})(this);
