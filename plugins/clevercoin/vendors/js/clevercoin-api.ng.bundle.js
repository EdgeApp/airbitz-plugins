
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
        return '';
      } else if (typeof val !== 'function') {
        return _urlencode(key) + '=' + _urlencode(val);
      } else {
        return '';
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
    if (!o.apiSecret) {
      error('Missing apiSecret');
    }
    this.apiKey = o.apiKey;
    this.apiLabel = o.apiLabel;
    this.apiSecret = o.apiSecret;
    this.clientKey = o.clientKey;
    this.clientSecret = o.clientSecret;
    this.CLEVERCOIN_URL = o.sandbox == true
        ? 'https://sandboxapi.cleverco.in'
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
        var key = this.clientKey;
        var secret = this.clientSecret;
        if (opts['auth_as_provider'] || !key || !secret) {
          key = this.apiKey;
          secret = this.apiSecret;
        }
        var signatureParameters = {};
        var nonceArray = _microtime().split(' ');
        var nonce = nonceArray[1] + _pad(nonceArray[0].substring(2,6),6);
        
        headers['X-CleverAPI-Key'] = signatureParameters['X-CleverAPI-Key'] = key;
        headers['X-CleverAPI-Nonce'] = signatureParameters['X-CleverAPI-Nonce'] = nonce;
        signatureParameters['X-CleverAPI-Request'] = method + ' ' + path;
        for (var p in opts.data) {
          signatureParameters[p] = opts.data[p];
        }
        signatureParameters = this._sortObject(signatureParameters);

        headers['X-CleverAPI-Signature'] =
          CleverCoin.hmacsha256(secret, _http_build_query(signatureParameters));
      }
      headers['Content-Type'] = opts['content-type'] || 'application/x-www-form-urlencoded';
      if (opts['content-transfer-encoding']) {
        headers['Content-Transfer-Encoding'] = opts['content-transfer-encoding'];
      }
      headers['Accept'] = 'application/json';

      CleverCoin.prepareData(req, opts, null);
      if (headers['Content-Type'] == 'multipart/form-data') {
        var data = new FormData();
        for (var k in opts.data) {
          data.append(k, opts.data[k]);
        }
        req.fb = data;
      }
      return CleverCoin.request(req, opts.callback);
    },

    register: function(firstName, email, password, activateLink, mailTitle, mailMessage, callback) {
      var data = {
        'apiLabel': this.apiLabel,
        'activationLink': activateLink,
        'name': firstName,
        'password': password,
        'email': email,
        'activationMailTitle': mailTitle,
        'activationMailMessage': mailMessage,
      };
      return this._request(true, '/account', {
        'method': 'POST',
        'data': data,
        'callback': callback,
        'auth_as_provider': true
      });
    },

    requestLink: function(email, activateLink, callback) {
      var data = {
        'email': email,
        'redirect': activateLink,
      };
      return this._request(true, '/account/link', {
        'method': 'POST',
        'data': data,
        'callback': callback,
        'auth_as_provider': true
      });
    },

    activate: function(email, token, callback) {
      var data = {
        'email': email,
        'token': token,
      };
      return this._request(true, '/account/activate', {
        'method': 'POST',
        'data': data,
        'callback': callback,
        'auth_as_provider': true
      });
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

    verifyIdentity: function(data, callback) {
      return this._request(true, '/verification/identity', {
        'method': 'POST',
        'data': data,
        'callback': callback,
        // 'content-transfer-encoding': 'base64',
        'content-type': 'multipart/form-data'
      });
    },

    verifyAddress: function(data, callback) {
      return this._request(true, '/verification/address', {
        'method': 'POST',
        'data': data,
        'callback': callback,
        // 'content-transfer-encoding': 'base64',
        'content-type': 'multipart/form-data'
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

    paymentMethods: function(callback) {
      return this._request(true, '/quote/paymentmethods', {
        'method': 'GET',
        'callback': callback
      });
    },

    quote: function(type, amount, currencyShort, paymentMethod, callBackLink, paymentParameter, address, callback) {
      var data = {
        'type': type,
        'amount': amount,
        'currencyShort': currencyShort,
        'paymentMethod': paymentMethod,
        'callBackLink': callBackLink,
        'paymentParameter': paymentParameter,
        'directWithdrawAddress': address,
        'profitPercentage': 1,
      };
      return this._request(true, '/quote', {
        'method': 'POST',
        'data': data,
        'callback': callback
      });
    },

    quoteConfirm: function(linkOrCode, callback) {
      var data = {
        'code': linkOrCode,
      };
      return this._request(true, '/quote/confirm', {
        'method': 'POST',
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

    supportedCountries: function(callback) {
      return this._request(true, '/utility/countries', {
        'callback': callback
      });
    },

    bankAccounts: function(callback) {
      return this._request(true, '/account/bankAccounts', {
        'callback': callback
      });
    },

    addBank: function(data, callback) {
      return this._request(true, '/verification/bank', {
        'method': 'POST',
        'data': data,
        'callback': callback,
        // 'content-transfer-encoding': 'base64',
        'content-type': 'multipart/form-data'
      });
    },

    depositIdealBanks: function(callback) {
      return this._request(true, '/euro/deposit/ideal/banks', {
        'callback': callback
      });
    },

    depositSepa: function(callback) {
      return this._request(true, '/euro/deposit/sepa', {
        'callback': callback
      });
    },

    depositAddress: function(newAddress, callback) {
      return this._request(true, '/bitcoin/depositAddress', {
        'data': {
          'new': newAddress
        },
        'callback': callback
      });
    },

    accountWallets: function(callback) {
      return this._request(true, '/account/wallets', {
        'callback': callback
      });
    }
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
      if (opts.headers['Content-Type'] == 'multipart/form-data') {
        opts.headers['Content-Type'] = undefined;
        opts.transformRequest = angular.identity;
        opts.data = opts.fb;
      }
      opts.fb = null;
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
