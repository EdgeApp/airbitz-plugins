
angular.module('app.dataFactory', ['app.glidera'])
.factory('DataFactory', ['$q', 'glideraFactory', function($q, glideraFactory) {
  var factory = {};
  // account prepopulate dummy data
  var account = {
    'firstName': 'Ricky',
    'middleName': 'Walleye',
    'lastName': 'Bobby',
    'email': 'jimmy@hendrix',
    'street': '1001 east high st',
    'street2': 'apt 2',
    'city': 'Pottstown',
    'zip': '19464',
    'state': 'PA',
    'country': 'US',
    'dob': '01-22-1980',
    'registered': false,
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
  }
  factory.updateUserAccount = function() {
    return $q(function(resolve, reject) {
      setTimeout(function() {
        resolve(true);
      }, 500);
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
  factory.getBankAccount = function() {
    return bankAccount;
  }

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
  factory.verifyBankAccount = function() {

  };

  // MAPS TO: https://sandbox.glidera.com/documentation.xhtml#apiReference-updateBankAccount
  factory.updateBankAccount = function(bankAccount) {
    console.log(bankAccount);
    return $q(function(resolve, reject) {
      glideraFactory.updateBankAccount(accountId, desc, setPrimary, function(e, s, b) {
        if (e === null || b.success === true) {
          resolve();
        } else {
          reject();
        }
      });
    });
  };

  // MAPS TO: https://sandbox.glidera.com/documentation.xhtml#apiReference-deleteBankAccount
  factory.deleteBankAccount = function() {
    return $q(function(resolve, reject) {
      glideraFactory.deleteBankAccount(accountId, function(e, s, b) {
        if (e === null && s == 200) {
          resolve();
        } else {
          reject();
        }
      });
    });
  };

  return factory;
}]);

