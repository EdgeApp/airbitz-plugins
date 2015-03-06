
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
    'depositBankAccount2': '23002223932',
    'orderTimeout': '60',
    'depositTimeout': '3600',
    'verificationCode': 'someCode',
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
  return factory;
}]);

