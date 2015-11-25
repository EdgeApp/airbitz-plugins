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
    var account = Airbitz.core.readData('account') || {
      isSignedIn: false,
      isActivated: false
    };

    factory.isSignedIn = function() {
      return account.isSignedIn;
    };
    factory.isActivated = function() {
      return account.isActivated;
    };
    factory.getUserAccount = function() {
      return account;
    };
    factory.clearUser = function() {
      account = { isSignedIn: false };
      Airbitz.core.writeData('account', account);
    };
    var redirectUri = Airbitz.config.get('REDIRECT_URI');
    factory.registerUser = function(name, email, password) {
      var d = $q.defer();
      CcFactory.register(name, email, password, redirectUri, function(_, c, b) {
        console.log(JSON.stringify(b));
        if (c >= 200 && c <= 300) {
          var account = factory.getUserAccount();
          account.name = name;
          account.email = email;
          account.isSignedIn = true;
          account.key = b.key;
          account.secret = b.secret;
          CcFactory.clientKey = account.key;
          CcFactory.clientSecret = account.secret;
          Airbitz.core.writeData('account', account);
          d.resolve(b);
        } else {
          d.reject(b);
        }
      });
      return d.promise;
    };
    factory.requestLink = function() {
      var d = $q.defer();
      CcFactory.requestLink(account.email, redirectUri, function(_, c, b) {
        (c >= 200 && c <= 300) ? d.resolve(b) : d.reject(b);
      });
      return d.promise;
    };

    factory.activate = function(email, token) {
      var d = $q.defer();
      CcFactory.activate(email, token, function(_, c, b) {
        if (c >= 200 && c <= 300) {
          account.isActivated = true;
          Airbitz.core.writeData('account', account); 
          d.resolve(b);
        } else {
          d.reject(b);
        }
      });
      return d.promise;
    };
    var userStatus = Airbitz.core.readData('userStatus') || {
      userCanTransact: false,
      userIdentitySetup: false,
      userAddressSetup: false
    };
    factory.getUserAccountStatus = function() {
      return userStatus;
    };

    factory.fetchUserAccountStatus = function() {
      var d = $q.defer();
      CcFactory.verificationStatus(function(e,s,b) {
        if (s == 200 && b.identity && b.identity.passport && b.address && b.address.proof) {
          userStatus.userIdentitySetup = b.identity.passport.progressState == 'Verified';
          userStatus.userIdentityState = b.identity.passport.progressState;
          userStatus.userAddressSetup = b.address.proof.progressState == 'Verified';
          userStatus.userAddressState = b.address.proof.progressState;
          userStatus.userCanTransact = userStatus.userIdentitySetup && userStatus.userAddressSetup;

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
            account.firstname = b.firstname;
            account.surname = b.surname;
            account.email = b.email;
            account.verificationState = b.verificationState;
            account.gender = b.gender;
            if (b.birthday) {
              var arr = b.birthday.split("-");
              account.birthday = new Date(arr[0], arr[1] - 1, arr[2]);
            }
            account.birthcountry = b.birthcountry;
            account.birthcity = b.birthcity;
            account.addresscountry = b.addresscountry;
            account.phonenumber = b.phonenumber;
            account.termsAgreedVersion = b.termsAgreedVersion;
            Airbitz.core.writeData('account', account);
            resolve(b)
          } else {
            reject(b);
          }
        });
      });
    }
    factory.updateUserAccount = function(account) {
      return $q(function(resolve, reject) {

        CcFactory.updateAccount({
          'firstname': account.firstname,
          'surname': account.surname,
          'gender': account.gender,
          'birthday': account.birthday ? $filter('date')(account.birthday, 'yyyy-MM-dd') : null,
          'birthcountry': account.birthcountry,
          'birthcity': account.birthcity,
          'addresscountry': account.addresscountry,
          'phonenumber': account.phonenumber,
          'agreeOnTerms': account.termsAgreedVersion
        }, function(e, s, b) {
          if (s === 200) {
            // Airbitz.core.writeData('account', account);
            resolve(b);
          } else {
            reject(b);
          }
        });
      });
    };

    factory.verifyIdentity = function(type, country, primaryFile, secondaryFile) {
      return $q(function(resolve, reject) {
        CcFactory.verifyIdentity({
          'type': type,
          'nationality': country,
          'ipaddress': "24.152.187.171",
          'useragent': "Airbitz",
          'primaryFile': primaryFile,
          'secondaryFile': secondaryFile
        }, function(e, s, b) {
          (s === 200) ?  resolve(b) : reject(b);
        });
      });
    };

    factory.verifyAddress = function(type, address, city, zipcode, country, proofFile) {
      return $q(function(resolve, reject) {
        CcFactory.verifyAddress({
          'type': type,
          'zipcode': zipcode,
          'address': address,
          'city': city,
          'country': country,
          'proofFile': proofFile
        }, function(e, s, b) {
          (s === 200) ?  resolve(b) : reject(b);
        });
      });
    };

    var countryList = [];
    factory.getCountries = function() {
      return countryList;
    };
    factory.fetchCountries = function() {
      if (countryList.length > 0) {
        return $q(function(resolve, reject) {
          resolve(countryList);
        });
      } else {
        return $q(function(resolve, reject) {
          CcFactory.supportedCountries(function(e, s, b) {
            if (s === 200) {
              countryList = b;
              resolve(b)
            } else {
              reject(b);
            } 
          }); 
        });
      }
    };
    factory.findCountry = function(alpha3) {
      for (var i = 0; i < countryList.length; ++i) {
        if (countryList[i].codeAlpha3 == alpha3) {
          return countryList[i];
        }
      }
      return null;
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

    var createAddress = function(wallet, label, amountSatoshi, amountFiat,
                                 category, notes, resolve, reject) {
        if (Airbitz._bridge.inDevMod()) {
          resolve({'address': Airbitz.config.get('MAINNET_ADDRESS')});
        } else {
          Airbitz.core.createReceiveRequest(wallet, {
            label: label,
            category: category,
            notes: notes,
            amountSatoshi: amountSatoshi,
            amountFiat: amountFiat,
            success: resolve,
            error: reject
          });
        }
    };

    factory.paymentMethods = function() {
      var d = $q.defer();
      CcFactory.paymentMethods(function(e, r, b) {
        r === 200 ? d.resolve(b) : d.reject(b);
      });
      return d.promise;
    };

    factory.buy = function(wallet, qty, paymentMethod) {
      var d = $q.defer();
      var uri = Airbitz.config.get('REDIRECT_URI');
      createAddress(wallet, 'CleverCoin', qty, '', 'Exchange:CleverCoin', 'Here are some notes', function(request) {
        var address = request['address'];
        CcFactory.quote(qty, 'BTC', paymentMethod, uri, '', address, function(e, r, b) {
          r == 200 ? d.resolve(b) : d.reject(b);
        });
      }, function() {
        Airbitz.ui.alert('Unable to create a receive address. Please try again later.');
      });
      return d.promise;
    };

    factory.sell = function(wallet, qty, paymentMethod) {
      var d = $q.defer();
      CcFactory.quote(-1 * qty, 'BTC', paymentMethod, uri, '', null, function(e, r, b) {
        r == 200 ? d.resolve(b) : d.reject(b);
      });
      return d.promise;
    };

    return factory;
  }

  function ExchangeFactory() {
    return { };
  }
})();
