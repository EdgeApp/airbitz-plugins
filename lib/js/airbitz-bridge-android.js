
_handleResponse = function(s, options) {
  console.log(s.substring(0, 200));
  var j = JSON.parse(s);
  options || (options = {});
  if (j.success) {
    if (!j.result) {
      options.success();
    } else {
      var v = '';
      if (j.result.value) {
        if (j.result.value == 'useBuffer') {
          v = Airbitz.buffer;
          Airbitz.bufferClear();
        } else {
          v = j.result.value;
        }
      } else {
        v = j.result
      }
      if (options.success) {
        options.success(v);
      } else {
        return v;
      }
    }
  } else {
    if (options.error) {
      options.error();
    } else {
      throw 'invalid data';
    }
  }
};

_bridge = function() {
  var id = 0;
  var newId = function() { return (id++).toString(); };
  return {
    inDevMod: function() {
      return false;
    },

    bitidAddress: function(uri, message) {
      return _native.bitidAddress(uri, message);
    },

    bitidSignature: function(uri, message) {
      return _native.bitidSignature(uri, message);
    },

    selectedWallet: function(options) {
      var cbid = newId(), opts = options;
      Airbitz._callbacks[cbid] = function(data) {
        _handleResponse(data, opts);
        delete Airbitz._callbacks[cbid];
      };
      _native.selectedWallet(cbid);
    },

    wallets: function(options) {
      var cbid = newId(), opts = options;
      Airbitz._callbacks[cbid] = function(data) {
        _handleResponse(data, opts);
        delete Airbitz._callbacks[cbid];
      };
      _native.wallets(cbid);
    },

    createReceiveRequest: function(wallet, options) {
      var cbid = newId(), opts = options;
      Airbitz._callbacks[cbid] = function(data) {
        _handleResponse(data, opts);
        delete Airbitz._callbacks[cbid];
      };
      _native.createReceiveRequest(cbid, wallet.id,
          options.label || '', options.category || '', options.notes || '',
          options.amountSatoshi || 0, options.amountFiat || 0.0, options.bizId);
    },

    finalizeRequest: function(wallet, requestId) {
      _native.finalizeRequest(wallet.id, requestId);
    },

    requestSpend: function(wallet, toAddress, amountSatoshi, amountFiat, options) {
      var cbid = newId(), opts = options;
      Airbitz._callbacks[cbid] = function(data) {
        _handleResponse(data, opts);
        delete Airbitz._callbacks[cbid];
      };
      _native.requestSpend(cbid, wallet.id, toAddress, amountSatoshi, amountFiat,
        options.label || '', options.category || '', options.notes || '', options.bizId);
    },

    requestSign: function(wallet, toAddress, amountSatoshi, amountFiat, options) {
      var cbid = newId(), opts = options;
      Airbitz._callbacks[cbid] = function(data) {
        _handleResponse(data, opts);
        delete Airbitz._callbacks[cbid];
      };
      _native.requestSign(cbid, wallet.id, toAddress, amountSatoshi, amountFiat,
        options.label || '', options.category || '', options.notes || '', options.bizId);
    },

    broadcastTx: function(wallet, rawTx) {
      var cbid = newId(), opts = options;
      Airbitz._callbacks[cbid] = function(data) {
        _handleResponse(data, opts);
        delete Airbitz._callbacks[cbid];
      };
      _native.broadcastTx(cbid, wallet.id, rawTx);
    },

    saveTx: function(wallet, rawTx) {
      return _native.saveTx(wallet.id, rawTx);
    },

    requestFile: function(options) {
      var cbid = newId(), opts = options;
      Airbitz._callbacks[cbid] = function(data) {
        _handleResponse(data, opts);
        delete Airbitz._callbacks[cbid];
      };
      _native.requestFile(cbid);
    },

    writeData: function(key, data) {
      _native.writeData(key, data);
    },

    clearData: function() {
      _native.clearData();
    },

    readData: function(key) {
      return _native.readData(key);
    },

    getBtcDenomination: function() {
      return _handleResponse(_native.getBtcDenomination());
    },

    satoshiToCurrency: function(satoshi, currencyNum) {
      return _handleResponse(_native.satoshiToCurrency(satoshi, currencyNum));
    },

    currencyToSatoshi: function(currency, currencyNum) {
      return _handleResponse(_native.currencyToSatoshi(currency, currencyNum));
    },

    formatSatoshi: function(satoshi, withSymbol) {
      return _handleResponse(_native.formatSatoshi(satoshi, withSymbol));
    },

    formatCurrency: function(currency, currencyNum, withSymbol) {
      return _handleResponse(_native.formatCurrency(currency, currencyNum, withSymbol));
    },

    exchangeRate: function(currencyNum) {
      return _handleResponse(_native.exchangeRate(currencyNum));
    },

    getConfig: function(key) {
      return _native.getConfig(key);
    },

    showAlert: function(title, message, options) {
      var showSpinner = options['showSpinner'] || false;
      _native.showAlert(title, message, showSpinner);
    },

    hideAlert: function(title, message, options) {
      _native.hideAlert();
    },

    title: function(s) {
      _native.title(s);
    },

    debugLevel: function(level, text) {
      _native.debugLevel(level, text);
    },

    showNavBar: function() {
      _native.showNavBar();
    },

    hideNavBar: function() {
      _native.hideNavBar();
    },

    back: function() {
      _native.back();
    },

    exit: function() {
      _native.exit();
    },

    navStackClear: function() {
      _native.navStackClear();
    },

    navStackPush: function(path) {
      _native.navStackPush(path);
    },

    navStackPop: function() {
      _native.navStackPop();
    },

    launchExternal: function(uri) {
      _native.launchExternal(uri);
    }
  }
};
