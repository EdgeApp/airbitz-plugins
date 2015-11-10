
function _handleBlocking(j) {
  console.log(j);
  if (j && j.success && j.result) {
    return j.result.value ? j.result.value : j.result;
  } else {
    return '';
  }
}

function _handleResponse(s, options) {
  var j = JSON.parse(s);
  console.log(j);
  options || (options = {});
  if (j && j.success) {
    if (!j.result) {
      options.success();
    } else {
      var v = (j.result.value) ? j.result.value : j.result;
      if (options.success) {
        options.success(v);
      }
    }
  } else {
    if (options.error) {
      options.error();
    } else {
      throw 'invalid data';
    }
  }
}

function _native(functionName, cbid, args, block) {
  var b = block || false;
  var data = {
    functionName: functionName,
    cbid: cbid
  };
  if (args) {
    data.args = args;
  }
  return openUrl(b, "bridge://" + JSON.stringify(data), cbid);
}

function openUrl(block, url, cbid) {
  var frame = document.createElement("IFRAME");
  frame.setAttribute("src", url);
  document.documentElement.appendChild(frame);
  frame.parentNode.removeChild(frame);
  if (block) {
    var ret = null;
    if (Airbitz._results[cbid]) {
      ret = Airbitz._results[cbid];
      delete Airbitz._results[cbid];
    }
    return ret;
  }
}

function _bridge() {
  var id = 0;
  var newId = function() { return (id++).toString(); };
  function createCallback(options) {
    var cbid = newId(), opts = options;
    Airbitz._callbacks[cbid] = function(data) {
      _handleResponse(data, opts);
      delete Airbitz._callbacks[cbid];
    };
    return cbid;
  }
  return {
    inDevMod: function() {
      return false;
    },

    bitidAddress: function(uri, message) {
      var options = {'uri': uri, 'message': message};
      return _handleBlocking(_native('bitidAddress', newId(), options, true));
    },

    bitidSignature: function(uri, message) {
      var options = {'uri': uri, 'message': message};
      return _handleBlocking(_native('bitidSignature', newId(), options, true));
    },

    selectedWallet: function(options) {
      var cbid = createCallback(options);
      _native('selectedWallet', cbid, options);
    },

    wallets: function(options) {
      var cbid = createCallback(options);
      _native('wallets', cbid, options);
    },

    createReceiveRequest: function(wallet, options) {
      var cbid = createCallback(options);
      options = options || {};
      options['id'] = wallet.id;
      _native('createReceiveRequest', cbid, options);
    },

    finalizeRequest: function(wallet, requestId) {
      var options = {'id': wallet.id, 'requestId': requestId};
      var cbid = createCallback(options);
      _native('finalizeRequest', cbid, options);
    },

    requestSpend: function(wallet, toAddress, amountSatoshi, amountFiat, options) {
      options = options || {};
      options['id'] = wallet.id;
      options['toAddress'] = toAddress;
      options['amountSatoshi'] = amountSatoshi;
      options['amountFiat'] = amountFiat;
      var cbid = createCallback(options);
      _native('requestSpend', cbid, options);
    },

    writeData: function(key, value) {
      _handleBlocking(_native('writeData', newId(), {'key': key, 'value': value}, true));
    },

    clearData: function() {
      _handleBlocking(_native('clearData', newId(), {}, true));
    },

    readData: function(key) {
      return _handleBlocking(_native('readData', newId(), {'key': key}, true));
    },

    getBtcDenomination: function() {
      return _handleBlocking(_native('getBtcDenomination', newId(), {}, true));
    },

    satoshiToCurrency: function(satoshi, currencyNum) {
      var options = {'satoshi': satoshi, 'currencyNum': currencyNum};
      return _handleBlocking(_native('satoshiToCurrency', newId(), options, true));
    },

    currencyToSatoshi: function(currency, currencyNum) {
      var options = {'currency': currency, 'currencyNum': currencyNum};
      return _handleBlocking(_native('currencyToSatoshi', newId(), options, true));
    },

    formatSatoshi: function(satoshi, withSymbol) {
      var options = {'satoshi': satoshi, 'currencyNum': currencyNum};
      return _handleBlocking(_native('formatSatoshi', newId(), options, true));
    },

    formatCurrency: function(currency, currencyNum, withSymbol) {
      var options = {'currency': currency, 'currencyNum': currencyNum, 'withSymbol': withSymbol};
      return _handleBlocking(_native('formatCurrency', newId(), options, true));
    },

    exchangeRate: function(currencyNum) {
      return _handleBlocking(_native('exchangeRate', newId(), {'currencyNum': currencyNum}));
    },

    getConfig: function(key) {
      return _handleBlocking(_native('getConfig', newId(), {'key': key}, true));
    },

    showAlert: function(title, message, options) {
      return _handleBlocking(_native('showAlert', newId(), {
        'title': title,
        'message': message,
        'showSpinner': options['showSpinner']
      }, true));
    },

    title: function(s) {
      return _handleBlocking(_native('title', newId(), {'title': s}, true));
    },

    showNavBar: function() {
      console.log('showNavBar');
      _handleBlocking(_native('showNavBar', newId(), {}, true));
    },

    hideNavBar: function() {
      console.log('hideNavBar');
      _handleBlocking(_native('hideNavBar', newId(), {}, true));
    },

    back: function() {
      console.log('Native Back Pressed');
      return _handleBlocking(_native('exit', newId(), {}, true));
    },

    exit: function() {
      return _handleBlocking(_native('exit', newId(), {}, true));
    },

    navStackClear: function() {
      return _handleBlocking(_native('navStackClear', newId(), {}, true));
    },

    navStackPush: function(path) {
      return _handleBlocking(_native('navStackPush', newId(), {'path': path}, true));
    },

    navStackPop: function() {
      return _handleBlocking(_native('navStackPop', newId(), {}, true));
    }
  }
};
