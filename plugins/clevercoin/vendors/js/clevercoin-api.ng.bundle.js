
function _microtime(get_as_float) {
  var now = new Date().getTime() / 1000;
  var s = parseInt(now, 10);
  return (get_as_float) ? now : (Math.round((now - s) * 1000) / 1000) + ' ' + s;
}

function _pad(str, max) {
  str = str.toString();
  return str.length < max ? _pad("0" + str, max) : str;
}

function _http_build_query(formdata, numeric_prefix, arg_separator) {
  var value, key, tmp = [];
  var that = this;

  var _http_build_query_helper = function(key, val, arg_separator) {
    var k, tmp = [];
    if (val === true) {
      val = '1';
    } else if (val === false) {
      val = '0';
    }
    if (val != null) {
      if (typeof val === 'object') {
        for (k in val) {
          if (val[k] != null) {
            tmp.push(_http_build_query_helper(key + '[' + k + ']', val[k], arg_separator));
          }
        }
        return tmp.join(arg_separator);
      } else if (typeof val !== 'function') {
        return _urlencode(key) + '=' + _urlencode(val);
      } else {
        throw new Error('There was an error processing for http_build_query().');
      }
    } else {
      return '';
    }
  };

  if (!arg_separator) {
    arg_separator = '&';
  }
  for (key in formdata) {
    value = formdata[key];
    if (numeric_prefix && !isNaN(key)) {
      key = String(numeric_prefix) + key;
    }
    var query = _http_build_query_helper(key, value, arg_separator);
    if (query !== '') {
      tmp.push(query);
    }
  }

  return tmp.join(arg_separator);
}

function _urlencode(str) {
  str = (str + '').toString();
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/%20/g, '+');
}

var CleverCoin = (function () {
  'use strict';

  function error(msg) {
    throw msg;
  };

  var CleverCoin = function(o) {
    o = o || {};
    if (!o.apiKey) {
      error('Missing apiKey');
    }
    if (!o.apiLabel) {
      error('Missing apiLabel');
    }
    if (!o.apiSecret) {
      error('Missing apiSecret');
    }
    this.apiKey = o.apiKey;
    this.apiLabel = o.apiLabel;
    this.apiSecret = o.apiSecret;
    this.CLEVERCOIN_URL = o.sandbox == true
        ? 'https://api.clevercoin.com'
        : 'https://api.clevercoin.com';
  }

  CleverCoin.prototype = {
    _sortObject: function(o) {
      var sorted = {},
      key, a = [],
      httpString = "";

      for (key in o) {
          if (o.hasOwnProperty(key)) {
              a.push(key);
          }
      }
      a.sort();

      for (key = 0; key < a.length; key++) {
          sorted[a[key]] = o[a[key]];
      }
      return sorted;
    },

    _request: function(authRequired, uri, opts) {
      opts = opts || {};
      var method = opts.method || 'GET';

      var path = '/v1' + uri;
      var url = this.CLEVERCOIN_URL + path;
      var headers = {},
          req = {
            method: method,
            url: url,
            headers: headers
          };

      if (authRequired) {
        var signatureParameters = {};
        var nonceArray = _microtime().split(' ');
        var nonce = nonceArray[1] + _pad(nonceArray[0].substring(2,6),6);
        
        headers['X-CleverAPI-Key'] = signatureParameters['X-CleverAPI-Key'] = this.apiKey;
        headers['X-CleverAPI-Nonce'] = signatureParameters['X-CleverAPI-Nonce'] = nonce;
        signatureParameters['X-CleverAPI-Request'] = method + ' ' + path;
        for (var p in opts.data) {
          signatureParameters[p] = opts.data[p];
        }
        signatureParameters = this._sortObject(signatureParameters);

        headers['X-CleverAPI-Signature'] =
          CleverCoin.hmacsha256(this.apiSecret, _http_build_query(signatureParameters));
      }
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      headers['Accept'] = 'application/json';

      CleverCoin.prepareData(req, opts, null);
      return CleverCoin.request(req, opts.callback);
    },

    register: function(firstName, email, password, activateLink, callback) {
      var data = {
        'apiLabel': this.apiLabel,
        'activationLink': activateLink,
        'name': firstName,
        'password': password,
        'email': email,
        'activationMailTitle': 'Hello',
        'activationMailMessage': 'Hello',
      };
      return this._request(true, '/account', {
        'method': 'POST',
        'data': data,
        'callback': callback
      });
    },

    isAuthorized: function() {
      return true;
    },

    getAccount: function(callback) {
      return this._request(true, '/account', {
        'callback': callback
      });
    },

    updateAccount: function(data, callback) {
      return this._request(true, '/account', {
        'method': 'PUT',
        'data': data,
        'callback': callback
      });
    },

    verificationStatus: function(callback) {
      return this._request(true, '/verification', {
        'callback': callback
      });
    },

    userLimits: function(callback) {
      return this._request(true, '/user/limits', {
        'callback': callback
      });
    },

    quotePrice: function(qty, currency, method, callback) {
      var data = {
        'amount': qty,
        'currencyShort': currency,
        'paymentMethod': method
      };
      return this._request(true, '/quote/price?' + _http_build_query(data), {
        'method': 'GET',
        'callback': callback
      });
    },

    buy: function(otpCode, destinationAddress, qty, opts, callback) {
      var data = {
        'destinationAddress': destinationAddress,
        'qty': qty
      };
      if (opts.priceUuid) {
        data.priceUuid = opts.priceUuid;
      } else {
        data.useCurrentPrice = true;
      }
      return this._request(true, '/buy', {
        'method': 'POST',
        'otpCode': otpCode,
        'data': data,
        'callback': callback
      });
    },

    sellAddress: function(qty, callback) {
      return this._request(true, '/user/create_sell_address', {
        'method': 'GET',
        'callback': callback
      });
    },

    sell: function(otpCode, refundAddress, signedTransaction, opts, callback) {
      var data = {
        'refundAddress': refundAddress,
        'signedTransaction': signedTransaction
      };
      if (opts.priceUuid) {
        data.priceUuid = opts.priceUuid;
      } else {
        data.useCurrentPrice = true;
      }
      return this._request(true, '/sell', {
        'method': 'POST',
        'otpCode': otpCode,
        'data': data,
        'callback': callback
      });
    },

    ticker: function(callback) {
      return this._request(false, '/ticker', {
        'callback': callback
      });
    },

    transactions: function(callback) {
      return this._request(false, '/transactions', {
        'callback': callback
      });
    },

    trades: function(callback) {
      return this._request(true, '/trades', {
        'callback': callback
      });
    },

    fundsLedger: function(callback) {
      return this._request(true, '/funds/ledger', {
        'callback': callback
      });
    },

    ordersLimited: function(type, amount, price, callback) {
      return this._request(true, '/orders/limited', {
        'method': 'POST',
        'data': {
          'type': type,
          'amount': amount,
          'price': price
        },
        'callback': callback
      });
    },

    marketBuy: function(amount, callback) {
      return this.ordersLimited('bid', amount, 100000, callback);
    },

    marketSell: function(amount, callback) {
      return this.ordersLimited('ask', amount, 0.01, callback);
    },

  };
  return CleverCoin;

  function request() {
    error('not implemented');
  };

  function prepareData(request, opts, json) {
    error('not implemented');
  };

  function jsonParse(j) {
    return JSON.parse(j);
  }

})();


(function() {
  angular.module('clevercoin', [])
    .factory('CleverCoinApi', ['$http', cleverCoinService]);

  function cleverCoinService($http) {
    CleverCoin.request = function(opts, callback) {
      return $http(opts).success(function(data, status, header, config) {
        callback(null, status, data);
      }).error(function(data, status, header, config) {
        callback(null, status, data);
      });
    };
    CleverCoin.jsonParse = JSON.parse;
    CleverCoin.prepareData = function(req, opts, json) {
      req.data = _http_build_query(opts.data);
    };

    CleverCoin.hmacsha256 = function(secret, message) {
      var shaObj = new jsSHA("SHA-256", "TEXT");
      shaObj.setHMACKey(secret, "TEXT");
      shaObj.update(message);
      return shaObj.getHMAC("HEX");
    };

    return CleverCoin;
  }
})();
