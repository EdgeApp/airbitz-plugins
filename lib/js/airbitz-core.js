
(function(root) {
  root.Airbitz = {};
  Airbitz = root.Airbitz;
  Airbitz.core = {};
  Airbitz.ui = {};
  Airbitz._callbacks = {};
  Airbitz._bridge = _bridge();

  Airbitz.core.wallets = function(options) {
    Airbitz._bridge.wallets(options);
  };

  Airbitz.core.createReceiveRequest = function(wallet, options) {
    Airbitz._bridge.createReceiveRequest(wallet, options);
  };

  Airbitz.core.requestSpend = function(wallet, toAddress, amountSatoshi, options) {
    Airbitz._bridge.requestSpend(wallet, toAddress, amountSatoshi, options);
  };

  Airbitz.core.writeData = function(appId, data, options) {
    _bridge.writeData(appId, data, options);
  };

  Airbitz.core.readData = function(appId, data, options) {
    _bridge.readData(appId, data, options);
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

  Airbitz.ui.title = function(s) {
    Airbitz._bridge.title(s);
  };

  Airbitz.ui.back = function() {
    Airbitz._bridge.back();
  };

  Airbitz.ui.exit = function() {
    Airbitz._bridge.exit();
  };
})(this);
