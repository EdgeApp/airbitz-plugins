(function() {
  'use strict';

  angular
    .module('app.dataFactory', ['app.glidera', 'app.2fa', 'app.constants', 'app.limits'])
    .factory('UserFactory', [ '$q', '$filter', 'States', 'Occupations', 'ExchangeFactory', 'glideraFactory', 'TwoFactor', UserFactory])
    .factory('DataFactory', [ '$q', '$filter', 'States', 'ExchangeFactory', 'glideraFactory', 'TwoFactor', 'Prices', DataFactory]);

  angular
    .module('app.constants', [])
    .factory('ExchangeFactory', [ExchangeFactory])
    .factory('States', ['ExchangeFactory', States])
    .factory('Occupations', [Occupations]);

  function UserFactory($q, $filter, States, Occupations, ExchangeFactory, glideraFactory, TwoFactor) {
    var factory = {};
    var account = Airbitz.core.readData('account') || {};
    if (account && account.country) {
      ExchangeFactory.updateCurrency(account.country);
    }

    factory.isAuthorized = function() {
      return glideraFactory.isAuthorized();
    };
    factory.getUserAccount = function() {
      return account;
    };
    factory.clearUser = function() {
      account = {};
      glideraFactory.accessKey = null;
      glideraFactory.secret = null;
      Airbitz.core.writeData('account', {});
    };

    var redirectUri = Airbitz.config.get('REDIRECT_URI');
    var domainUri = Airbitz.config.get('SANDBOX') == 'true'
      ? 'bitid:sandbox.glidera.io/api/v1/authentication/bitid' : 'bitid:www.glidera.io/api/v1/authentication/bitid';
    factory.authorizeUrl = function() {
      var message = glideraFactory.bitidAuthUri();
      console.log(message);
      var address = Airbitz.core.bitidAddress(domainUri, message);
      var signature = Airbitz.core.bitidSignature(domainUri, message);
      return glideraFactory.bitidAuthRedirect(redirectUri, address, message, signature, 'authorize');
    };
    factory.userSetupRedirect = function() {
      return glideraFactory.userSetupRedirect(redirectUri, 'usersetup');
    };
    factory.createBankAccountUrl = function() {
      return glideraFactory.createBankAccountRedirect(redirectUri, 'bankaccount');
    };
    factory.editBankAccountUrl = function() {
      return glideraFactory.bankAccountsRedirect(redirectUri, 'bankaccount');
    };
    factory.requestAccessToken = function(cb) {
      var message = glideraFactory.bitidTokenUri();
      console.log(message);
      var address = Airbitz.core.bitidAddress(domainUri, message);
      var signature = Airbitz.core.bitidSignature(domainUri, message);
      glideraFactory.bitidAccessToken(address, message, signature, function(success, results) {
        if (success) {
          account.accessKey = glideraFactory.accessKey;
          account.secret = glideraFactory.secret;
          Airbitz.core.writeData('account', account);
        }
        cb(success, results);
      });
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
    var userStatus = Airbitz.core.readData('userStatus') || {
      'userCanTransact': false,
      'userEmailIsSetup': false,
      'userBankAccountIsSetup': false,
      'userBasicInfoIsSetup': false
    };
    factory.getUserAccountStatus = function() {
      return userStatus;
    };
    factory.resendEmailVerification = function() {
      var d = $q.defer();
      glideraFactory.resendEmailVerification(function(e,s,b) {
        s >= 200 && s < 300?  d.resolve(b) : d.reject(b);
      });
      return d.promise;
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
    factory.getEmailAddress = function() {
      return $q(function(resolve, reject) {
        glideraFactory.getEmailAddress(function(e, s, b) {
          if (s === 200) {
            account.email = b.email;
            Airbitz.core.writeData('account', account);
            resolve(account.email);
          } else {
            reject(b);
          }
        });
      });
    }
    factory.getFullUserAccount = function() {
      return $q(function(resolve, reject) {
        glideraFactory.getPersonalInfo(function(e, s, b) {
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
            account.employerName = b.employerName;
            account.employerDescription = b.employerDescription;
            ExchangeFactory.updateCurrency(b.country);

            if (b.birthDate) {
              // XXX: This is kind of hacky
              var arr = b.birthDate.split("-");
              account.birthDate = new Date(arr[0], arr[1] - 1, arr[2]);
            }
            account.registered = true;

            // persist locally
            console.log(b);
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
        var d = {
          'firstName': account.firstName,
          'middleName': account.middleName,
          'lastName': account.lastName,
          'birthDate': account.birthDate ? $filter('date')(account.birthDate, 'yyyy-MM-dd') : null,
          'address1': account.address1,
          'address2': account.address2,
          'city': account.city,
          'state': account.state ? account.state.id : null,
          'zipCode': account.zipCode,
          'occupation': account.occupation ? account.occupation.id : null,
          'employerName': account.employerName,
          'employerDescription': account.employerDescription,
          'ip': '127.0.0.1'
        };
        console.log(d);
        glideraFactory.updatePersonalInfo(d, function(e, s, b) {
          if (s === 200) {
            Airbitz.core.writeData('account', account);
            resolve(b);
          } else {
            reject(b);
          }
        });
      });
    };
    return factory;
  }
  function DataFactory($q, $filter, States, ExchangeFactory, glideraFactory, TwoFactor, Prices) {
    var factory = {};

    // transactions
    factory.getTransactions = function() {
      return $q(function(resolve, reject) {
        glideraFactory.transactions(function(e, s, b) {
          s >= 200 && s < 300 ?  resolve(b.transactions) : reject(b);
        });
      });
    };

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

    factory.deletePhoneNumber = function(account) {
      var d = $q.defer();
      glideraFactory.deletePhoneNumber(TwoFactor.getCode(), function(e, r, b) {
        if (r >= 200 && r < 300) {
          account.phone = null;
          Airbitz.core.writeData('account', account);
          d.resolve(b);
        } else {
          d.reject(b);
        }
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
      if (clear) {
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
        Airbitz.ui.showAlert('Processing', 'Processing order...', {'showSpinner': true});
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
            d.reject({"code": "9999", "message": "Error during send"});
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
    var factory = {};
    factory.name = 'Glidera';
    factory.emailVerificationAddress = 'admin@glidera.com';
    factory.depositId = 'Glidera Inc';
    factory.orderTimeout = '60';
    factory.depositTimeout = '3600';
    factory.updateCurrency = function(countryCode) {
      if (!countryCode) {
        return;
      }
      factory.countryCode = countryCode;
      factory.currencyNum = countryCode === 'US' ? 840 : 127;
      factory.currency = countryCode === 'US' ? "USD" : "CAD";
      factory.currencySymbol = '$';
    };
    factory.updateCurrency('US');
    return factory;
  }
  function States(ExchangeFactory) {
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
    var factory = {};
    factory.getStates = function() {
      return ExchangeFactory.countryCode === "US" ? usStates : caProvinces;
    };
    factory.findState = function(code) {
      var l = factory.getStates().filter(function(s) {
        return s.id === code;
      });
      return l.length >= 1 ? l[0] : null;
    };
    return factory;
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
      {"id": "26", "name": "Student"},
      {"id": "27", "name": "Crypto Exchange"},
      {"id": "28", "name": "Crypto Merchant"},
      {"id": "29", "name": "Other"},
      {"id": "30", "name": "Advertising"},
      {"id": "31", "name": "Agent (Tranvel Etc.)"},
      {"id": "32", "name": "Architect"},
      {"id": "33", "name": "Aviation"},
      {"id": "34", "name": "Banking"},
      {"id": "35", "name": "Brokerage"},
      {"id": "36", "name": "Chiropractor"},
      {"id": "37", "name": "Computers"},
      {"id": "38", "name": "Controller"},
      {"id": "39", "name": "Dean"},
      {"id": "40", "name": "Dental"},
      {"id": "41", "name": "Doctor"},
      {"id": "42", "name": "Driver (Truck, Bus)"},
      {"id": "43", "name": "Farmer"},
      {"id": "44", "name": "Film"},
      {"id": "45", "name": "Fireman"},
      {"id": "46", "name": "Fisheries"},
      {"id": "47", "name": "Flight Attendant"},
      {"id": "48", "name": "Forestry"},
      {"id": "49", "name": "Homemaker"},
      {"id": "50", "name": "Insurance"},
      {"id": "51", "name": "Journalism"},
      {"id": "52", "name": "Judge"},
      {"id": "53", "name": "Landscaper, Gardener"},
      {"id": "54", "name": "Lawyer"},
      {"id": "55", "name": "Medical"},
      {"id": "56", "name": "Military"},
      {"id": "57", "name": "Music"},
      {"id": "58", "name": "Non Profit"},
      {"id": "59", "name": "Nursing"},
      {"id": "60", "name": "Paramedic"},
      {"id": "61", "name": "Pilot"},
      {"id": "62", "name": "Police"},
      {"id": "63", "name": "Principal"},
      {"id": "64", "name": "Professor"},
      {"id": "65", "name": "Psychiatric"},
      {"id": "66", "name": "Radiology"},
      {"id": "67", "name": "Restaurant"},
      {"id": "68", "name": "Retail"},
      {"id": "69", "name": "Social Worker"},
      {"id": "70", "name": "Teacher"},
      {"id": "71", "name": "Technician"},
      {"id": "72", "name": "Therapist"},
      {"id": "73", "name": "Veterinarian"}
    ];
    return {
      OTHER: 29,
      getOccupations: function() {
        return occupations;
      },
      find: function(code) {
        var l = occupations.filter(function(s) {
          return code && s.id === code.toString();
        });
        return l.length >= 1 ? l[0] : null;
      }
    }
  }
})();
