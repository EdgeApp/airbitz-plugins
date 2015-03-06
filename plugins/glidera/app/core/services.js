
angular.module('app.dataFactory', [])
.factory('DataFactory', ['$q', function($q) {
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
    'registered': false
  };

  account.getRegistrationStatus = function() {
    return this.registered;
  }
  account.setRegistrationStatus = function(status) {
    this.registered = status;
  }

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
    'depositBankAccount2': '23002223932',
    'orderTimeout': '60',
    'depositTimeout': '3600',
    'verificationCode': 'someCode',
    'depositId': 'GLIDER-USA-002',
  };

  var factory = {};
  factory.getAccount = function() {
    return account;
  }
  factory.saveAccount = function() {
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

  factory.getBankAccount = function() {
    return bankAccount;
  }

  // MAPS TO: https://sandbox.glidera.com/documentation.xhtml#apiReference-createBankAccount
  factory.createBankAccount = function(bankAccount) {
    console.log(bankAccount);
    return $q(function(resolve, reject) {
      setTimeout(function() {
        resolve(true);
      }, 500);
    });
  }
  // MAPS TO: https://sandbox.glidera.com/documentation.xhtml#apiReference-verifyBankAccount
  factory.verifyBankAccount = function() {

  }
  // MAPS TO: https://sandbox.glidera.com/documentation.xhtml#apiReference-updateBankAccount
  factory.updateBankAccount = function(account) {
    return $q(function(resolve, reject) {
      setTimeout(function() {
        resolve(true);
      }, 500);
    });
  }
  // MAPS TO: https://sandbox.glidera.com/documentation.xhtml#apiReference-deleteBankAccount
  factory.deleteBankAccount = function() {

  }

  return factory;
}]);

