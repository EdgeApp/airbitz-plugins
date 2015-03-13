
function errorMap(res) {
  if (!res.code) {
    return "An unknown error occurred.";
  }
  switch(res.code) {
    case "MissingRequiredParameter":
      return "This request is missing required data."
    case "InvalidParameterValue":
    case "UnauthorizedException":
      return res.message;
    default:
      return "An unknown error occurred."
  }
}

angular.module('app.dataFactory', ['app.glidera', 'app.2fa', 'app.constants', 'app.limits']).
factory('UserFactory', [
  '$q', '$filter', 'States', 'ExchangeFactory', 'glideraFactory', 'TwoFactor',
  function($q, $filter, States, ExchangeFactory, glideraFactory, TwoFactor) {
    var factory = {};
    var account = Airbitz.core.readData('account') || {};

    factory.isRegistered = function() {
      return glideraFactory.hasRegistered();
    };
    factory.getUserAccount = function() {
      return account;
    };
    factory.registerUser = function(firstName, lastName, email) {
      var d = $q.defer();
      glideraFactory.register(firstName, lastName, email, '', function(success, b) {
        var account = factory.getUserAccount();
        account.firstName = firstName;
        account.lastName = lastName;
        account.email = email;
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
          'zipCode': account.zipCode
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

  }]).
factory('DataFactory', [
  '$q', '$filter', 'States', 'ExchangeFactory', 'glideraFactory', 'TwoFactor', 'Prices',
  function($q, $filter, States, ExchangeFactory, glideraFactory, TwoFactor, Prices) {
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

  var createAddress = function(wallet, name, category, notes, resolve, reject) {
      Airbitz.core.createReceiveRequest(wallet, {
        name: name,
        category: category,
        notes: notes,
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
          Airbitz.core.finalizeRequest(wallet, requestId);
          deferred.resolve();
        } else {
          deferred.reject(errorMap(b));
        }
      });
    } else {
      deferred.reject('Unable to obtain a destination address. Please try again later.');
    }
    return deferred.promise;
  };

  factory.buy = function(wallet, qty) {
    // TODO: check buy limits
    return $q(function (resolve, reject) {
      createAddress(wallet, 'Glidera', 'Transfer:Glidera', '', resolve, reject);
    }).then(function(request) {
      return executeBuy(wallet, qty, request);
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
    // TODO: check sell limits
    return $q(function(resolve, reject) {
      glideraFactory.sellAddress(qty, function(e, r, b) {
        (r == 200) ? resolve(b) : reject(b);
      });
    }).then(function(data) {
      var sellAddress = data["sellAddress"];
      return $q(function(resolve, reject) {
        createAddress(wallet, 'Glidera Refund', 'Transfer:Refund', '', function(req) {
          resolve({'sellAddress': sellAddress,
                   'refundAddress': req['address']});
        }, reject);
      });
    }).then(function(data) {
      console.log('sellAddress: ' + data.sellAddress);
      console.log('refundAddress: ' + data.refundAddress);
      return $q(function(resolve, reject) {
        Airbitz.core.requestSpend(wallet, data.sellAddress, btcToSatoshi(qty), {
          label: 'Glidera',
          category: 'Transfer:Glidera',
          notes: '',
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
    'emailVerificationAddress': 'admin@glidera.com',
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
