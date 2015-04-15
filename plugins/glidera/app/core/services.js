(function() {
  'use strict';

  angular
    .module('app.dataFactory', ['app.glidera', 'app.2fa', 'app.constants', 'app.limits'])
    .factory('UserFactory', [ '$q', '$filter', 'States', 'Occupations', 'ExchangeFactory', 'glideraFactory', 'TwoFactor', UserFactory])
    .factory('DataFactory', [ '$q', '$filter', 'States', 'ExchangeFactory', 'glideraFactory', 'TwoFactor', 'Prices', DataFactory]);

  angular
    .module('app.constants', [])
    .factory('ExchangeFactory', [ExchangeFactory])
    .factory('States', [States])
    .factory('Occupations', [Occupations])

  function UserFactory($q, $filter, States, Occupations, ExchangeFactory, glideraFactory, TwoFactor) {
    var factory = {};
    var account = Airbitz.core.readData('account') || {};

    factory.isRegistered = function() {
      return glideraFactory.hasRegistered();
    };
    factory.getUserAccount = function() {
      return account;
    };
    factory.clearUser = function() {
      account = {};
      Airbitz.core.writeData('account', {});
    };
    factory.registrationMode = function() {
      var d = $q.defer();
      glideraFactory.registrationMode(function(success, isOpen) {
        if (success) {
          d.resolve(isOpen);
        } else {
          d.reject();
        }
      });
      return d.promise;
    };
    factory.registerUser = function(firstName, lastName, email, countryCode, registrationCode) {
      var d = $q.defer();
      glideraFactory.register(firstName, lastName, email, countryCode, registrationCode, function(success, b) {
        var account = factory.getUserAccount();
        account.firstName = firstName;
        account.lastName = lastName;
        account.email = email;
        account.countryCode = countryCode;
        account.key = b["key"];
        account.secret = b["secret"];
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
      'userCanTransact': false,
      'userEmailIsSetup': false,
      'userBankAccountIsSetup': false,
      'userBasicInfoIsSetup': false
    };
    factory.getUserAccountStatus = function() {
      return userStatus;
    };

    factory.fetchUserAccountStatus = function() {
      var d = $q.defer();
      glideraFactory.userStatus(function(e,s,b) {
        if (s == 200) {
          userStatus = b;
          Airbitz.core.writeData('userStatus', userStatus);
          d.resolve(userStatus);
        } else {
          d.reject(b);
        }
      });
      return d.promise;
    };
    factory.getFullUserAccount = function() {
      return $q(function(resolve, reject) {
        glideraFactory.getBasicInfo(function(e, s, b) {
          if (s === 200) {
            account.email = account.email || b.email;
            account.firstName = b.firstName;
            account.middleName = b.middleName;
            account.lastName = b.lastName;
            account.address1 = b.address1;
            account.address2 = b.address2;
            account.city = b.city;
            account.zipCode = b.zipCode;
            account.state = States.findState(b.state);
            account.country = b.countryCode;
            account.occupation = Occupations.find(b.occupation);
            account.status = b.status.status;

            // XXX: This is kind of hacky
            if (b.birthDate) {
              var birthDate = b.birthDate.replace(/T.*/, '');
              account.birthDate = new Date(birthDate);
            }
            account.registered = true;

            // persiste locally
            console.log(account);
            Airbitz.core.writeData('account', account);
            resolve(account);
          } else {
            reject(b);
          }
        });
      });
    }
    factory.updateUserAccount = function(account) {
      return $q(function(resolve, reject) {
        glideraFactory.updateBasicInfo({
          'firstName': account.firstName,
          'lastName': account.lastName,
          'birthDate': $filter('date')(account.birthDate, 'yyyy-MM-dd'),
          'address1': account.address1,
          'address2': account.address2,
          'city': account.city,
          'state': account.state.id,
          'occupation': account.occupation ? account.occupation.id : null,
          'zipCode': account.zipCode,
          'ip': '127.0.0.1'
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
    factory.getFullUserAccount();
    return factory;
  }
  function DataFactory($q, $filter, States, ExchangeFactory, glideraFactory, TwoFactor, Prices) {
    var factory = {};

    // transactions
    factory.getTransactions = function() {
      return $q(function(resolve, reject) {
        glideraFactory.transactions(function(e, s, b) {
          if (s >= 200 && s < 300) {
            resolve(b.transactions);
            console.log(b.transactions);

            // return dummyData
          } else {
            reject(b);
          }
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
      glideraFactory.addPhoneNumber(phoneNumber, function(e, r, b) {
        r >= 200 && r < 300 ? d.resolve(b) : d.reject(b);
      });
      return d.promise;
    };

    factory.confirmPhoneNumber = function(newCode, oldCode) {
      var d = $q.defer();
      glideraFactory.confirmPhoneNumber(newCode, oldCode, function(e, r, b) {
        r >= 200 && r < 300 ? d.resolve(b) : d.reject(b);
      });
      return d.promise;
    };

    factory.getPhoneNumber = function() {
      var d = $q.defer();
      glideraFactory.getPhoneNumber(function(e, r, b) {
        200 == r ? d.resolve(b) : d.reject(b);
      });
      return d.promise;
    };

    factory.checkPhoneNumber = function(account) {
      if (!account.phone) {
        factory.getPhoneNumber().then(function(data) {
          account.phone = data.phoneNumber;
          Airbitz.core.writeData('account', account);
        });
      }
    };

    var bankAccounts = Airbitz.core.readData('bankAccounts') || [];
    factory.getBankAccounts = function() {
      return bankAccounts;
    };
    factory.fetchBankAccounts = function() {
      return $q(function(resolve, reject) {
        glideraFactory.getBankAccounts(function(e, s, b) {
          if (s >= 200 && s < 300) {
            bankAccounts = b.bankAccounts; //cache bank accounts
            Airbitz.core.writeData('bankAccounts', bankAccounts);
            resolve(b.bankAccounts);
          } else {
            reject(b);
          }
        });
      });
    };
    factory.getBankAccount = function(uuid) {
      var l = bankAccounts.filter(function(b) {
        return b.bankAccountUuid == uuid;
      });
      return l.length > 0 ? l[0] : null;
    };
    factory.fetchBankAccount = function(uuid) {
      return $q(function(resolve, reject) {
        glideraFactory.getBankAccount(uuid, function(e, s, b) {
          if (s >= 200 && s < 300) {
            resolve(b);
          } else {
            reject(b);
          }
        });
      });
    };

    // MAPS TO: https://sandbox.glidera.com/documentation.xhtml#apiReference-createBankAccount
    factory.createBankAccount = function(bankAccount) {
      console.log(bankAccount);
      return $q(function(resolve, reject) {
        glideraFactory.createBankAccount(
          TwoFactor.getCode(),
          bankAccount.routingNumber,
          bankAccount.accountNumber,
          bankAccount.transit,
          bankAccount.institution,
          bankAccount.description,
          bankAccount.bankAccountType,
          function(e, s, b) {
            (s === 200) ? resolve(b.bankAccountUuid) : reject(b);
        });
      });
    };

    // MAPS TO: https://sandbox.glidera.com/documentation.xhtml#apiReference-verifyBankAccount
    factory.verifyBankAccount = function(uuid, amount1) {;
      return $q(function(resolve, reject) {
        glideraFactory.verifyBankAccount(uuid, amount1,
        function(e, s, b) {
          (s == 200) ?  resolve(b) : reject(b);
        });
      });
    };

    // MAPS TO: https://sandbox.glidera.com/documentation.xhtml#apiReference-updateBankAccount
    factory.updateBankAccount = function(bankAccount) {
      return $q(function(resolve, reject) {
        glideraFactory.updateBankAccount(
            bankAccount.bankAccountUuid, bankAccount.description,
            bankAccount.primary,
        function(e, s, b) {
          (s === 200) ? resolve(b) : reject(b);
        });
      });
    };

    // MAPS TO: https://sandbox.glidera.com/documentation.xhtml#apiReference-deleteBankAccount
    factory.deleteBankAccount = function(accountId) {
      return $q(function(resolve, reject) {
        glideraFactory.deleteBankAccount(TwoFactor.getCode(), accountId,
        function(e, s, b) {
          (s == 200) ? resolve(b) : reject(b);
        });
      });
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

    var executeBuy = function(wallet, qty, request) {
      var deferred = $q.defer(),
          requestId = request['requestId'],
          address = Airbitz._bridge.inDevMod()
                  ? glideraFactory.sandboxAddress : request['address'];
      if (address) {
        var opts = {'priceUuid': Prices.buyUuid()};
        glideraFactory.buy(TwoFactor.getCode(), address, qty, opts, function(e, r, b) {
          console.log(JSON.stringify(b));
          if (r == 200) {
            factory.getOrder(false).details = b;
            Airbitz.core.finalizeRequest(wallet, requestId);
            deferred.resolve(b);
          } else {
            deferred.reject(b);
          }
        });
      } else {
        deferred.reject('Unable to obtain a destination address. Please try again later.');
      }
      return deferred.promise;
    };

    var formatNotes = function(action, amountFiat) {
      return action + " on " + $filter('date')(new Date().getTime(), 'yyyy-MM-dd @ H:mm') + " for " + $filter('currency')(amountFiat);
    }

    var btcToSatoshi = function(btc) {
      return btc * 100000000;
    };

    factory.buy = function(wallet, qty, amountFiat) {
      var notes = formatNotes("Purchased", amountFiat);
      return $q(function (resolve, reject) {
        createAddress(wallet, 'Glidera', btcToSatoshi(qty), amountFiat, 'Exchange:Buy Bitcoin', notes, resolve, reject);
      }).then(function(request) {
        return executeBuy(wallet, qty, request);
      }, function(error) {
        return $q(function(resolve, reject) {
          reject(error);
        });
      });
    };

    factory.sell = function(wallet, qty, amountFiat) {
      var notes = formatNotes("Sold", amountFiat);
      return $q(function(resolve, reject) {
        glideraFactory.sellAddress(qty, function(e, r, b) {
          (r == 200) ? resolve(b) : reject(b);
        });
      }).then(function(data) {
        var sellAddress = data["sellAddress"];
        var d = $q.defer();
        createAddress(wallet, 'Glidera Refund', btcToSatoshi(qty), 
                      amountFiat, 'Exchange:Refund Bitcoin', notes, function(req) {
          d.resolve({'sellAddress': sellAddress, 'refundAddress': req['address']});
        }, d.reject);
        return d.promise;
      }).then(function(data) {
        var d = $q.defer();
        Airbitz.core.requestSpend(wallet, data.sellAddress, btcToSatoshi(qty), amountFiat, {
          label: 'Glidera',
          category: 'Exchange:Sell Bitcoin',
          notes: notes,
          success: function(res) {
            if (res && res.back) {
              d.reject({"code": "IgnoreAction"});
            } else {
              d.resolve({'sellAddress': data.sellAddress,
                        'refundAddress': data.refundAddress,
                        'signedTx': res});
            }
          },
          error: function() {
            d.reject();
          }
        });
        return d.promise;
      }).then(function(data) {
        var d = $q.defer();
        var opts = {'priceUuid': Prices.sellUuid()};
        glideraFactory.sell(TwoFactor.getCode(), data.refundAddress, data.signedTx, opts, function(e, r, b) {
          if (r == 200) {
            factory.getOrder(false).details = b;
            d.resolve(b);
          } else {
            d.reject(b);
          }
        });
        return d.promise;
      }).catch(function(data) {
        return $q(function(resolve, reject) {
          reject(data);
        });
      });
    };
    return factory;
  }

  function ExchangeFactory() {
    // default exchange data
    return {
      'name': 'Glidera',
      'emailVerificationAddress': 'admin@glidera.com',
      'depositId':  'Glidera Inc',
      'orderTimeout': '60',
      'depositTimeout': '3600',
      'countryCode': Airbitz.config.get("COUNTRY_CODE"),
      'currencyNum': Airbitz.config.get("CURRENCY_CODE"),
      'currency': Airbitz.config.get("CURRENCY_ABBREV")
    };
  }
  function States() {
    var usStates = [
      {"id": "AL", "name": "Alabama"},
      {"id": "AK", "name": "Alaska"},
      {"id": "AZ", "name": "Arizona"},
      {"id": "AR", "name": "Arkansas"},
      {"id": "CA", "name": "California"},
      {"id": "CO", "name": "Colorado"},
      {"id": "CT", "name": "Connecticut"},
      {"id": "DE", "name": "Delaware"},
      {"id": "DC", "name": "District"},
      {"id": "FL", "name": "Florida"},
      {"id": "GA", "name": "Georgia"},
      {"id": "HI", "name": "Hawaii"},
      {"id": "ID", "name": "Idaho"},
      {"id": "IL", "name": "Illinois"},
      {"id": "IN", "name": "Indiana"},
      {"id": "IA", "name": "Iowa"},
      {"id": "KS", "name": "Kansas"},
      {"id": "KY", "name": "Kentucky"},
      {"id": "LA", "name": "Louisiana"},
      {"id": "ME", "name": "Maine"},
      {"id": "MD", "name": "Maryland"},
      {"id": "MA", "name": "Massachusetts"},
      {"id": "MI", "name": "Michigan"},
      {"id": "MN", "name": "Minnesota"},
      {"id": "MS", "name": "Mississippi"},
      {"id": "MO", "name": "Missouri"},
      {"id": "MT", "name": "Montana"},
      {"id": "NE", "name": "Nebraska"},
      {"id": "NV", "name": "Nevada"},
      {"id": "NH", "name": "New"},
      {"id": "NJ", "name": "New"},
      {"id": "NM", "name": "New"},
      {"id": "NY", "name": "New"},
      {"id": "NC", "name": "North"},
      {"id": "ND", "name": "North"},
      {"id": "OH", "name": "Ohio"},
      {"id": "OK", "name": "Oklahoma"},
      {"id": "OR", "name": "Oregon"},
      {"id": "PA", "name": "Pennsylvania"},
      {"id": "RI", "name": "Rhode"},
      {"id": "SC", "name": "South"},
      {"id": "SD", "name": "South"},
      {"id": "TN", "name": "Tennessee"},
      {"id": "TX", "name": "Texas"},
      {"id": "UT", "name": "Utah"},
      {"id": "VT", "name": "Vermont"},
      {"id": "VA", "name": "Virginia"},
      {"id": "WA", "name": "Washington"},
      {"id": "WV", "name": "West"},
      {"id": "WI", "name": "Wisconsin"},
      {"id": "WY", "name": "Wyoming"}
    ];
    var caProvinces = [
      {"id": "ON", "name": "Ontario"},
      {"id": "QC", "name": "Quebec"},
      {"id": "NS", "name": "Nova Scotia"},
      {"id": "NB", "name": "New Brunswick"},
      {"id": "MB", "name": "Manitoba"},
      {"id": "BC", "name": "British Columbia"},
      {"id": "PE", "name": "Prince Edward Island"},
      {"id": "SK", "name": "Saskatchewan"},
      {"id": "AB", "name": "Alberta"},
      {"id": "NL", "name": "Newfoundland and Labrador"}
    ];
    var states = Airbitz.config.get("COUNTRY_CODE") === "US" ? usStates : caProvinces;
    return {
      getStates: function() {
        return states;
      },
      findState: function(code) {
        var l = states.filter(function(s) {
          return s.id === code;
        });
        return l.length >= 1 ? l[0] : null;
      }
    }
  }
  function Occupations() {
    var occupations = [
      {"id": "1", "name": "Accounting"},
      {"id": "2", "name": "Administration"},
      {"id": "3", "name": "Arts, Culture"},
      {"id": "4", "name": "Business"},
      {"id": "5", "name": "Communications"},
      {"id": "6", "name": "Customer Service"},
      {"id": "7", "name": "Education"},
      {"id": "8", "name": "Energy, Utilities"},
      {"id": "9", "name": "Engineering"},
      {"id": "10", "name": "Finance"},
      {"id": "11", "name": "Financial Services"},
      {"id": "12", "name": "Government"},
      {"id": "13", "name": "Health"},
      {"id": "14", "name": "Hospitality"},
      {"id": "15", "name": "Human Resources"},
      {"id": "16", "name": "Internet"},
      {"id": "17", "name": "Legal"},
      {"id": "18", "name": "Manufacturing"},
      {"id": "19", "name": "Marketing"},
      {"id": "20", "name": "Non profit"},
      {"id": "21", "name": "Recreation"},
      {"id": "22", "name": "Religion"},
      {"id": "23", "name": "Research"},
      {"id": "24", "name": "Sales"},
      {"id": "25", "name": "Sports, Fitness"},
      {"id": "26", "name": "Student"}
    ];
    return {
      getOccupations: function() {
        return occupations;
      },
      find: function(code) {
        var l = occupations.filter(function(s) {
          return s.id === code.toString();
        });
        return l.length >= 1 ? l[0] : null;
      }
    }
  }
})();
