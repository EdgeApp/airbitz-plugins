
function errorMap(res) {
  if (!res.code) {
    return "An unknown error occurred.";
  }
  switch(res.code) {
    case "MissingRequiredParameter":
      return "This request is missing required data."
    case "UnauthorizedException":
      return res.message;
    default:
      return "An unknown error occurred."
  }
}

angular.module('app.dataFactory', ['app.glidera', 'app.2fa', 'app.constants']).
factory('UserFactory', [
  '$q', '$filter', 'States', 'ExchangeFactory', 'glideraFactory', 'TwoFactor',
  function($q, $filter, States, ExchangeFactory, glideraFactory, TwoFactor) {
    var factory = {};
    var account = Airbitz.core.readData('account') || {};

    factory.getRegistrationStatus = function() {
      return this.registered;
    };
    factory.setRegistrationStatus = function(status) {
      this.registered = status;
    };
    factory.getUserAccount = function() {
      return account;
    };
    factory.getFullUserAccount = function() {
      return $q(function(resolve, reject) {
        glideraFactory.getBasicInfo(function(e, s, b) {
          if (s === 200) {
            account.firstName = b.firstName;
            account.middleName = b.middleName;
            account.lastName = b.lastName;
            account.address1 = b.address1;
            account.address2 = b.address2;
            account.city = b.city;
            account.zipCode = b.zipCode;
            account.state = States.findState(b.state);
            account.status = b.status.status;

            // XXX: This is kind of hacky
            if (b.birthDate) {
              var birthDate = b.birthDate.replace(/T.*/, '');
              account.birthDate = $filter('date')(birthDate, 'MM/dd/yyyy');
            }

            account.email = 'someone@yourdomain.co';
            account.registered = true;

            // persiste locally
            console.log(account);
            Airbitz.core.writeData('account', account);
            resolve(account);
          } else {
            reject();
          }
        });
      });
    }
    factory.updateUserAccount = function(account) {
      return $q(function(resolve, reject) {
        glideraFactory.updateBasicInfo({
          'firstName': account.firstName,
          'lastName': account.lastName,
          'birthDate': account.birthDate,
          'address1': account.address1,
          'address2': account.address2,
          'city': account.city,
          'state': account.state.id,
          'zipCode': account.zipCode
        }, function(e, s, b) {
          if (s === 200) {
            Airbitz.core.writeData('account', account);
            resolve();
          } else {
            reject();
          }
        });
      });
    };


    // Fetch the user data if available
    factory.getFullUserAccount();
    return factory;

  }]).
factory('DataFactory', [
  '$q', '$filter', 'States', 'ExchangeFactory', 'glideraFactory', 'TwoFactor', 'Prices',
  function($q, $filter, States, ExchangeFactory, glideraFactory, TwoFactor, Prices) {
  var factory = {};

  // transactions
  factory.getTransactions = function() {
    return $q(function(resolve, reject) {
      glideraFactory.transactions(function(e, s, b) {
        if (e === null) {
          resolve(b.transactions);
          console.log(b.transactions);

          // return dummyData
        } else {
          reject();
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

  var bankAccounts = Airbitz.core.readData('bankAccounts') || [];
  factory.getBankAccounts = function() {
    return bankAccounts;
  };
  factory.fetchBankAccounts = function() {
    return $q(function(resolve, reject) {
      glideraFactory.getBankAccounts(function(e, s, b) {
        if (e === null) {
          bankAccounts = b.bankAccounts; //cache bank accounts
          Airbitz.core.writeData('bankAccounts', bankAccounts);
          resolve(b.bankAccounts);
        } else {
          reject();
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
        if (e === null) {
          resolve(b);
        } else {
          reject();
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
        bankAccount.description,
        bankAccount.bankAccountType, function(e, s, b) {
        if (s === 200) {
          resolve(b.bankAccountUuid);
        } else {
          reject();
        }
      });
    });
  };

  // MAPS TO: https://sandbox.glidera.com/documentation.xhtml#apiReference-verifyBankAccount
  factory.verifyBankAccount = function(uuid, amount1, amount2, description) {
    console.log(uuid + ' ' + amount1 + ' ' + amount2 + ' ' + description);
    return $q(function(resolve, reject) {
      glideraFactory.verifyBankAccount(uuid, amount1, amount2, description, function(e, s, b) {
        s == 200 ?  resolve() : reject();
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
          e === null ? resolve(b) : reject();
      });
    });
  };

  // MAPS TO: https://sandbox.glidera.com/documentation.xhtml#apiReference-deleteBankAccount
  factory.deleteBankAccount = function(accountId) {
    return $q(function(resolve, reject) {
      glideraFactory.deleteBankAccount(TwoFactor.getCode(), accountId, function(e, s, b) {
        e === null && s == 200 ? resolve() : reject();
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

  var createAddress = function(wallet, name, notes, resolve, reject) {
      Airbitz.core.createReceiveRequest(wallet, {
        name: name,
        notes: notes,
        success: resolve,
        error: reject
      })
  };

  factory.buy = function(wallet, qty) {
    return $q(function (resolve, reject) {
      createAddress(wallet, 'Glidera', '', resolve, reject);
    }).then(function(data) {
      var address = Airbitz._bridge.inDevMod()
                  ? glideraFactory.sandboxAddress : data['address'];
      return $q(function(resolve, reject) {
        if (address) {
          var opts = {'priceUuid': Prices.buyUuid() };
          glideraFactory.buy(TwoFactor.getCode(), address, qty, opts, function(e, r, b) {
            console.log(JSON.stringify(b));
            r === 200 ? resolve() : reject(errorMap(b));
          });
        } else {
          reject('Unable to obtain a destination address. Please try again later.');
        }
      });
    }, function(error) {
      return $q(function(resolve, reject) {
        reject(error);
      });
    });
  };

  var btcToSatoshi = function(btc) {
    return btc * 100000000;
  };

  factory.sell = function(wallet, qty) {
    return $q(function(resolve, reject) {
      glideraFactory.sellAddress(qty, function(e, r, b) {
        (r == 200) ? resolve(b) : reject(b);
      });
    }).then(function(data) {
      var sellAddress = data["sellAddress"];
      return $q(function(resolve, reject) {
        createAddress(wallet, 'Glidera Refund', '', function(req) {
          resolve({'sellAddress': sellAddress,
                   'refundAddress': req['address']});
        }, reject);
      });
    }).then(function(data) {
      console.log('sellAddress: ' + data.sellAddress);
      console.log('refundAddress: ' + data.refundAddress);
      return $q(function(resolve, reject) {
        Airbitz.core.requestSpend(wallet, data.sellAddress, btcToSatoshi(qty), {
          success: function(signedTx) {
            resolve({'sellAddress': data.sellAddress,
                     'refundAddress': data.refundAddress,
                     'signedTx': signedTx});
          },
          error: function() {
            reject('Aborted spend');
          }
        });
      });
    }).then(function(data) {
      return $q(function(resolve, reject) {
        var opts = {'priceUuid': Prices.sellUuid()};
        glideraFactory.sell(TwoFactor.getCode(), data.refundAddress, data.signedTx, opts, function(e, r, b) {
          console.log(JSON.stringify(b));
          r === 200 ? resolve(b) : reject(errorMap(b));
        });
      });
    }).catch(function(data) {
      return $q(function(resolve, reject) {
        reject(data);
      });
    });
  };
  return factory;
}]);

angular.module('app.constants', []).
factory('ExchangeFactory', [function() {
  // default exchange data
  return {
    'name': 'Glidera',
    'icon': 'fa-bitcoin',
    'countryCode': 'US', // ISO 3661-1
    'emailVerificationAddress': 'verifications@glidera.com',
    'phoneVerificationNumber': '+1 650-331-0021',
    'depositBankName1': 'Bank of America',
    'depositBankAccount1': '90001923932',
    'depositBankName2': 'METRO BANK',
    'depositBankAccount2': '23002223932',
    'orderTimeout': '60',
    'depositTimeout': '3600',
    'verificationCode': 'someCode',
    'depositId': 'GLIDER-USA-002',
    'supportsBankAccounts': true,
    'supportsCreditCards': false,
    'currencyNum': 840,
    'exchangeRate': Airbitz.core.exchangeRate()
  };
}]).
factory('States', [function() {
  var states = [
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
}]);
