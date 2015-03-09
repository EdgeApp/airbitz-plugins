
angular.module('app.dataFactory', ['app.glidera', 'app.2fa', 'app.constants']).
factory('UserFactory', [
  '$q', '$filter', 'States', 'ExchangeFactory', 'glideraFactory', 'TwoFactor',
  function($q, $filter, States, ExchangeFactory, glideraFactory, TwoFactor) {
    var factory = {};

    // account prepopulate dummy data
    var account = {
      'firstName': '',
      'middleName': '',
      'lastName': '',
      'email': '',
      'address1': '',
      'address2': '',
      'city': '',
      'zipCode': '',
      'state': '',
      'birthDate': '',
      'registered': true,
      'status': ''
    };

    account.getRegistrationStatus = function() {
      return this.registered;
    };
    account.setRegistrationStatus = function(status) {
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
            resolve(account);
          } else {
            reject();
          }
        });
      });
    }
    factory.updateUserAccount = function(account) {
      console.log(account);
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
            resolve();
          } else {
            reject();
          }
        });
      });
    };


    // Fetch the user data if available
    if (glideraFactory.hasRegistered()) {
      factory.getFullUserAccount();
    }

    return factory;

  }]).
factory('DataFactory', [
  '$q', '$filter', 'States', 'ExchangeFactory', 'glideraFactory', 'TwoFactor',
  function($q, $filter, States, ExchangeFactory, glideraFactory, TwoFactor) {
  var factory = {};

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

  // default bank account data
  var bankAccount = {
    'description': 'Glidera',
    'bankAccountType': 'CHECKING',
    'accountNumber': '77223399339',
    'routingNumber': '10022291191',
    'isPrimary': 'true',
    'status': 'PENDING',
  };

  factory.getBankAccounts = function() {
      return $q(function(resolve, reject) {
        glideraFactory.getBankAccounts(function(e, s, b) {
          if (e === null) {
            resolve(b.bankAccounts);
          } else {
            reject();
          }
        });
      });
  };
  factory.getBankAccount = function(uuid) {
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
    console.log('Get order:');
    if(clear) {
      this.clearOrder();
    }
    return exchangeOrder;
  };

  factory.clearOrder = function() {
    exchangeOrder = {};
  };
  console.log(TwoFactor);

  factory.buy = function(walletId, qty) {
    return $q(function (resolve, reject) {
      Airbitz.core.createReceiveRequest(walletId, {name: 'Glidera', notes: '', success: resolve, error: reject})
    }).then(function(data) {
      var address = Airbitz._bridge.inDevMod() 
                  ? glideraFactory.sandboxAddress : data['address'];
      return $q(function(resolve, reject) {
        if (address) {
          glideraFactory.buy(TwoFactor.getCode(), address, qty, {}, function(e, r, b) {
            r === 200 ? resolve() : reject(b.message);
          });
        } else {
          reject('Unable to obtain a destination address. Please try again later.');
        }
      });
    });
  };

  factory.sell = function(walletId, amountSatoshi) {
    return $q(function(resolve, reject) {
      glideraFactory.sellAddress(amountSatoshi, {
        success:resolve,
        error:reject
      });
    }).then(function(data) {
      var sellAddress = data["sellAddress"];
      return $q(function(resolve, reject) {
        Airbitz.core.requestSpend(walletId, sellAddress, amountSatoshi, {
          success: resolve,
          error: reject
        });
      });
    }).then(function(data) {
      var refundAddress = data["address"];
      var signedTx = data["tx"];
      glideraFactory.sell(TwoFactor.getCode(), refundAddress, signedTx, {useCurrentPrice:true}, function(e, r, b) {
        e === null ? resolve() : reject();
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
