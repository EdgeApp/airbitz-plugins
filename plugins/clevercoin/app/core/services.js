(function() {
  'use strict';

  angular
    .module('app.dataFactory', ['app.clevercoin', 'app.constants'])
    .factory('StatsFactory', [ '$http', 'ExchangeFactory', 'UserFactory', StatsFactory])
    .factory('UserFactory', [ '$q', '$filter', 'ExchangeFactory', 'CcFactory', UserFactory])
    .factory('DataFactory', [ '$q', '$filter', 'ExchangeFactory', 'CcFactory', 'Prices', 'StatsFactory', DataFactory]);

  angular
    .module('app.constants', [])
    .factory('ExchangeFactory', [ExchangeFactory]);

  function UserFactory($q, $filter, ExchangeFactory, CcFactory) {
    var factory = {};
    var account = Airbitz.core.readData('account') || {
      isSignedIn: false,
      isActivated: false
    };
    var bankList = Airbitz.core.readData('bankList') || [];
    var walletList = Airbitz.core.readData('walletList') || [];

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
      var mailTitle = 'Welcome to Airbitz on Clevercoin';
      var mailMessage = [ 'Dear %1$s,<br /><br />',
        'You have created an account at CleverCoin with this e-mail address (%2$s). Welcome!<br />',
        'Click the button below to activate your account.<br /><br />',
        'We have also summarized some facts and knowledge about bitcoin in this article.Do you have any questions? Let us know. We are happy to help you!<br /><br />',
        'Best regards,<br />',
        'Airbitz team'
      ].join('');
      CcFactory.register(name, email, password, redirectUri, mailTitle, mailMessage, function(_, c, b) {
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
    factory.requestLink = function(email) {
      var d = $q.defer();
      CcFactory.requestLink(email, redirectUri, function(_, c, b) {
        (c >= 200 && c <= 300) ? d.resolve(b) : d.reject(b);
      });
      return d.promise;
    };

    factory.activate = function(email, token) {
      var d = $q.defer();
      CcFactory.activate(account.email, token, function(_, c, b) {
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
        console.log(JSON.stringify(b));
        if (s == 200) {
          if (b.identity.passport) {
            userStatus.userIdentitySetup = b.identity.passport.progressState == 'Verified';
            userStatus.userIdentityState = b.identity.passport.progressState;
          }
          if (b.identity.identityFront && b.identity.identityBack) {
            userStatus.userIdentitySetup = b.identity.identityFront.progressState == 'Verified' &&
                                           b.identity.identityBack.progressState == 'Verified';
            userStatus.userIdentityState = b.identity.identityFront.progressState;
          }
          if (b.address.proof) {
            userStatus.userAddressSetup = b.address.proof.progressState == 'Verified';
            userStatus.userAddressState = b.address.proof.progressState;
          }
          userStatus.userCanTransact = userStatus.userIdentitySetup && userStatus.userAddressSetup;

          if (userStatus.userIdentityState == "Rejected") {
            userStatus.identityRejectedReason = b.identity.passport.rejectReason;
          } else {
            userStatus.identityRejectedReason = '';
          }
          if (userStatus.userAddressState == "Rejected") {
            userStatus.addressRejectedReason = b.address.proof.rejectReason;
          } else {
            userStatus.addressRejectedReason = '';
          }

          Airbitz.core.writeData('userStatus', userStatus);
          d.resolve(userStatus);
        } else {
          d.reject(b);
        }
      });
      return d.promise;
    };
    factory.getWallets = function() {
      return walletList;
    };
    factory.fetchWallets = function() {
      return $q(function(resolve, reject) {
        CcFactory.accountWallets(function(e, s, b) {
        if (s >= 200 && s <= 300) {
          walletList = b.filter(function(n) {
            return n.currency == 'EUR';
          });
          Airbitz.core.writeData('walletList', walletList); 
          resolve(walletList);
        } else {
          reject(b);
        }
        });
      });
    };
    factory.fetchAccount = function() {
      return $q(function(resolve, reject) {
        CcFactory.getAccount(function(e, s, b) {
          if (200 === s) {
            account.firstname = b.firstname || account.firstname;
            account.surname = b.surname || account.surname;
            account.email = b.email || account.email;
            account.verificationState = b.verificationState || account.verificationState;
            account.gender = b.gender || account.gender;
            if (b.birthday) {
              var arr = b.birthday.split("-");
              account.birthday = new Date(arr[0], arr[1] - 1, arr[2]);
            }
            account.birthcountry = b.birthcountry || account.birthcountry;
            account.birthcity = b.birthcity || account.birthcity;
            account.addresscountry = b.addresscountry || account.addresscountry;
            account.phonenumber = b.phonenumber || account.phonenumber;
            account.termsAgreedVersion = b.termsAgreedVersion || account.termsAgreedVersion;
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

    factory.getBanks = function() {
      return bankList;
    };
    factory.fetchBanks = function() {
      return $q(function(resolve, reject) {
        CcFactory.bankAccounts(function(e, s, b) {
          if (s === 200) {
            bankList = b;
            Airbitz.core.writeData('bankList', bankList);
            resolve(b)
          } else {
            reject(b);
          }
        });
      });
    };

    factory.addBank = function(accountholder, iban, bic, bankstatement, 
                               bankname, bankcountry, bankaddress) {
      return $q(function(resolve, reject) {
        CcFactory.addBank({
            'accountholder': accountholder,
            'IBAN': iban,
            'BIC': bic,
            'bankStatement': bankstatement,
            'bankname': bankname,
            'country': bankcountry,
            'address': bankaddress
          }, function(e, s, b) {
          s === 200 ?  resolve(b) : reject(b);
        });
      });
    };

    factory.depositSepa = function() {
      return $q(function(resolve, reject) {
        CcFactory.depositSepa(function(e, s, b) {
          s === 200 ? resolve(b) : reject(b);
        });
      });
    }

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
              countryList = b.filter(function(e) {
                return e.isResidenceAccepted;
              }).sort(function(a, b) {
                return a.name.localeCompare(b.name);
              });
              resolve(countryList);
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
    if (factory.isSignedIn()) {
      factory.fetchAccount();
    }
    return factory;
  }
  function DataFactory($q, $filter, ExchangeFactory, CcFactory, Prices, StatsFactory) {
    var factory = {};

    factory.getSelectedWallet = function() {
      return $q(function(resolve, reject) {
        Airbitz.core.selectedWallet({
          success: resolve,
          error: reject
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
          if (s >= 200 && s < 300) {
            var ls = [];
            for (var k in b.ledger) {
              var row = b.ledger[k];
              row.time = new Date(row.time * 1000);
              ls.push(row);
            }
            resolve(ls);
          } else {
            reject(b);
          }
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
    factory.getOrder = function(clear) {
      if(clear) {
        this.clearOrder();
      }
      return exchangeOrder;
    };

    factory.clearOrder = function() {
      exchangeOrder = {};
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
          resolve({'address': Airbitz.config.get('TESTNET_ADDRESS')});
        } else {
          Airbitz.core.createReceiveRequest(wallet, {
            label: label,
            category: category,
            notes: notes,
            amountSatoshi: amountSatoshi,
            amountFiat: amountFiat,
            bizId: ExchangeFactory.bizId,
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

    factory.requestBuy = function(btcQty, paymentMethod) {
      var d = $q.defer();
      var uri = Airbitz.config.get('REDIRECT_URI');
      var wallet = Airbitz.currentWallet;
      createAddress(wallet, 'CleverCoin', 0, 0, 'Exchange:CleverCoin', '', function(request) {
        var address = request['address'];
        CcFactory.quote('bid', btcQty, 'BTC', paymentMethod, uri, '', address, function(e, r, b) {
          if (r == 200) {
            if (true && !b.fees) {
              // TODO: once CC fixes fees, remove this
              var quoted = Prices.currentBuy.btcPrice;
              var diff = b.toPay - b.amount * quoted;
              b.fee = diff;
              b.btcPrice = quoted;
            }
            b.amount = Math.abs(b.amount);
            b.expires = new Date(b.expires * 1000);
            d.resolve(b);
          } else {
            d.reject(b);
          }
        });
      }, function() {
        Airbitz.ui.alert('Unable to create a receive address. Please try again later.');
      });
      return d.promise;
    }

    factory.confirmBuy = function(linkOrCode) {
      var d = $q.defer();
      CcFactory.quoteConfirm(linkOrCode, function(e, r, b) {
        if (r == 200) {
          var order = factory.getOrder(false);
          StatsFactory.recordEvent('buy', b, order.orderBtcInput);
          d.resolve(b);
        } else {
          d.reject(b);
        }
      });
      return d.promise;
    };

    factory.sell = function(qty, paymentMethod) {
      var wallet = Airbitz.currentWallet;
      var d = $q.defer();
      CcFactory.quote('ask', qty, 'BTC', paymentMethod, uri, '', null, function(e, r, b) {
        r == 200 ? d.resolve(b) : d.reject(b);
      });
      return d.promise;
    };
    return factory;
  }

  function StatsFactory($http, ExchangeFactory, UserFactory) {
    var factory = {};
    factory.recordEvent = function(eventType, eventDictionary, btcAmount) {
      var statsKey = Airbitz.config.get('AIRBITZ_STATS_KEY');
      var network = Airbitz.config.get('SANDBOX') == 'true' ? 'testnet' : 'mainnet';
      var acct = UserFactory.getUserAccount();
      var string_to_hash = acct.name + acct.email;
      var userhash = sha256(string_to_hash);
      var shortuserhash = userhash.substr(0,8)
      var s = angular.copy(eventDictionary);
      s['btc'] = btcAmount;
      s['partner'] = 'CleverCoin ' + ExchangeFactory.currency;
      s['country'] = ExchangeFactory.currency;
      s['user'] = shortuserhash;
      $http({
        method: 'POST',
        url: 'https://airbitz.co/api/v1/events',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + statsKey
        },
        data: {
          'event_type': eventType,
          'event_network': network,
          'event_text': JSON.stringify(s),
        }
      }).then(function successCallback(response) {
        console.log(response);
      }, function errorCallback(response) {
        console.log(response);
      });
    };
    return factory;
  }

  function ExchangeFactory() {
    var factory = {};
    factory.name = 'CleverCoin';
    factory.orderTimeout = '60';
    factory.depositTimeout = '3600';
    factory.currencySymbol = '€';
    factory.currencyNum = '978';
    factory.currency = 'EUR';
    factory.bizId = 10106;
    return factory;
  }
})();
