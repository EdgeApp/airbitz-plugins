(function() {
  'use strict';

  angular
    .module('app.dataFactory', ['app.clevercoin', 'app.constants'])
    .factory('UserFactory', [ '$q', '$filter', 'ExchangeFactory', 'CcFactory', UserFactory])
    .factory('DataFactory', [ '$q', '$filter', 'ExchangeFactory', 'CcFactory', 'Prices', DataFactory]);

  angular
    .module('app.constants', [])
    .factory('ExchangeFactory', [ExchangeFactory]);

  function UserFactory($q, $filter, ExchangeFactory, CcFactory) {
    var factory = {};
    var account = Airbitz.core.readData('account') || {};

    factory.isAuthorized = function() {
      return CcFactory.isAuthorized();
    };
    factory.getUserAccount = function() {
      return account;
    };
    factory.clearUser = function() {
      account = {};
      Airbitz.core.writeData('account', {});
    };
    factory.registerUser = function(name, email, password) {
      var d = $q.defer();
      CcFactory.register(name, email, password, 'http://localhost:8080/', function(success, b) {
        var account = factory.getUserAccount();
        account.name = name;
        account.email = email;
        if (success) {
          Airbitz.core.writeData('account', account);
          d.resolve(b);
        } else {
          d.reject(b);
        }
      });
      return d.promise;
    };
    var userStatus = Airbitz.core.readData('userStatus') || {
      'userIdentitySetup': false,
      'userAddressSetup': false,
    };
    factory.getUserAccountStatus = function() {
      return userStatus;
    };

    factory.fetchUserAccountStatus = function() {
      var d = $q.defer();
      CcFactory.verificationStatus(function(e,s,b) {
        if (s == 200) {
          // TODO: make this cleaner
          userStatus['userIdentitySetup'] = b['identity']['passport']['progressState'] == 'Verified';
          userStatus['userAddressSetup'] = b['address']['proof']['progressState'] == 'Verified';

          Airbitz.core.writeData('userStatus', userStatus);
          d.resolve(userStatus);
        } else {
          d.reject(b);
        }
      });
      return d.promise;
    };
    factory.fetchAccount = function() {
      return $q(function(resolve, reject) {
        CcFactory.getAccount(function(e, s, b) {
          if (200 === s) {
            Airbitz.core.writeData('account', b);
            resolve(b)
          } else {
            reject(b);
          }
        });
      });
    }
    factory.updateUserAccount = function(account) {
      return $q(function(resolve, reject) {
        CcFactory.updateBasicInfo({
          'name': account.firstName,
          'email': account.email,
        }, function(e, s, b) {
          if (s === 200) {
            Airbitz.core.writeData('account', account);
            resolve(b);
          } else {
            reject(b);
          }
        });
      });
    };

    // Fetch the user data if available
    factory.fetchAccount();
    return factory;
  }
  function DataFactory($q, $filter, ExchangeFactory, CcFactory, Prices) {
    var factory = {};

    factory.getTrades = function() {
      return $q(function(resolve, reject) {
        CcFactory.trades(function(e, s, b) {
          s >= 200 && s < 300 ? resolve(b) : reject(b);
        });
      });
    };

    factory.getFundsLedger = function() {
      return $q(function(resolve, reject) {
        CcFactory.fundsLedger(function(e, s, b) {
          s >= 200 && s < 300 ? resolve(b) : reject(b);
        });
      });
    };

    factory.getUserWallets = function() {
      return $q(function(resolve, reject) {
        Airbitz.core.wallets({
          success: resolve,
          error: reject
        });
      });
    };

    factory.getExchange = function() {
      return ExchangeFactory;
    }

    factory.addPhoneNumber = function(phoneNumber) {
      var d = $q.defer();
      CcFactory.addPhoneNumber(phoneNumber, function(e, r, b) {
        r >= 200 && r < 300 ? d.resolve(b) : d.reject(b);
      });
      return d.promise;
    };

    factory.confirmPhoneNumber = function(newCode, oldCode) {
      var d = $q.defer();
      CcFactory.confirmPhoneNumber(newCode, oldCode, function(e, r, b) {
        r >= 200 && r < 300 ? d.resolve(b) : d.reject(b);
      });
      return d.promise;
    };

    factory.getPhoneNumber = function() {
      var d = $q.defer();
      CcFactory.getPhoneNumber(function(e, r, b) {
        200 == r ? d.resolve(b) : d.reject(b);
      });
      return d.promise;
    };

    // initialize exchangeOrder
    var exchangeOrder = {};
    factory.createBuyOrder = function(order) {
      // exchangeOrder = angular.copy(order);
      exchangeOrder.destinationWallet = order.destinationWallet;
      exchangeOrder.qty = order.qty;
      exchangeOrder.useCurrentPrice = order.useCurrentPrice;
      exchangeOrder.orderAction = order.orderAction
    };

    factory.getOrder = function(clear) {
      if(clear) {
        this.clearOrder();
      }
      return exchangeOrder;
    };

    factory.clearOrder = function() {
      exchangeOrder = {};
    };

    var createAddress = function(wallet, label, amountSatoshi, amountFiat,
                                category, notes, resolve, reject) {
        Airbitz.core.createReceiveRequest(wallet, {
          label: label,
          category: category,
          notes: notes,
          amountSatoshi: amountSatoshi,
          amountFiat: amountFiat,
          success: resolve,
          error: reject
        })
    };

    var formatNotes = function(action, amountFiat) {
      return action + " on " + $filter('date')(new Date().getTime(), 'yyyy-MM-dd @ H:mm') + " for " + $filter('currency')(amountFiat);
    }

    var btcToSatoshi = function(btc) {
      return btc * 100000000;
    };

    factory.buy = function(qty) {
      var deferred = $q.defer();
      CcFactory.marketBuy(qty, function(e, r, b) {
        console.log(JSON.stringify(b));
        if (r == 200) {
          console.log(b);
          deferred.resolve(b);
        } else {
          deferred.reject(b);
        }
      });
      return deferred.promise;
    };

    factory.sell = function(qty) {
      var d = $q.defer();
      CcFactory.marketSell(qty, function(e, r, b) {
        if (r == 200) {
          d.resolve(b);
        } else {
          d.reject(b);
        }
      });
      return d.promise;
    };
    return factory;
  }

  function ExchangeFactory() {
    return { };
  }
})();
