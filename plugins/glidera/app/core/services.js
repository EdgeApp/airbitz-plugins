
angular.module('app.dataFactory', ['app.glidera', 'app.stateFactory'])
.factory('DataFactory', ['$q', '$filter', 'StateFactory', 'glideraFactory', function($q, $filter, StateFactory, glideraFactory) {
  var factory = {};
  // account prepopulate dummy data
  var account = {
    'firstName': 'Ricky',
    'middleName': 'Walleye',
    'lastName': 'Bobby',
    'email': 'jimmy@hendrix',
    'address1': '1001 east high st',
    'address2': 'apt 2',
    'city': 'Pottstown',
    'zipCode': '19464',
    'state': 'PA',
    'birthDate': '01-22-1980',
    'registered': true,
    'status': 'BASIC_INFO_NOT_VERIFIED'
  };

  account.getRegistrationStatus = function() {
    return this.registered;
  };
  account.setRegistrationStatus = function(status) {
    this.registered = status;
  };

  factory.getUserAccountStatus = function() {
    switch(account.status) {
      case 'BASIC_INFO_NOT_VERIFIED':
      case 'BASIC_INFO_VERIFIED_BANK_ACCOUNT_NEEDED':
        return 'Not Verified';
      case 'BASIC_INFO_VERIFIED':
        return 'Verified';
      default:
        return 'ACCOUNT UNKNOWN';
    }
  };

  // default exchange data
  var exchange = {
    'name': 'Glidera',
    'icon': 'fa-bitcoin',
    'countryCode': 'US', // ISO 3661-1
    'emailVerificationAddress': 'verifications@glidera.com',
    'phoneVerificationNumber': '+1 650-331-0021',
    'depositBankName1': 'Bank of America',
    'depositBankAccount1': '90001923932',
    'depositBankName2': 'METRO BANK',
    'depositBankAccount2'
    : '23002223932',
    'orderTimeout': '60',
    'depositTimeout': '3600',
    'verificationCode': 'someCode',
    'depositId': 'GLIDER-USA-002',
    'supportsBankAccounts': true,
    'supportsCreditCards': false,
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
          account.state = StateFactory.findState(b.state);
          account.status = b.status.status;

          // XXX: This is kind of hacky
          var birthDate = b.birthDate.replace(/T.*/, '');
          account.birthDate = $filter('date')(birthDate, 'MM/dd/yyyy');

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
  factory.getExchange = function() {
    return exchange;
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
        '123456',
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
  factory.deleteBankAccount = function(otpCode, accountId) {
    return $q(function(resolve, reject) {
      glideraFactory.deleteBankAccount(otpCode, accountId, function(e, s, b) {
        e === null && s == 200 ? resolve() : reject();
      });
    });
  };

  return factory;
}]);

angular.module('app.stateFactory', [])
.factory('StateFactory', [function() {
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
      code = code.replace(/.*, /, ''); /* XXX: AHHHHHHHHH GLIDERA!!!!!!!! */
      var l = states.filter(function(s) {
        return s.id === code;
      });
      return l.length >= 1 ? l[0] : null;
    }
  }
}]);
