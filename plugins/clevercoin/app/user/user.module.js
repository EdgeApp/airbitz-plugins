(function () {
  'use strict';

  // var BASE_64_IMAGE = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH3woTCxIgaG9bcAAAAAxJREFUCNdjuHvzJgAFJgKQH8bAMAAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxNS0xMS0yNFQxNjoyMDoxMS0wODowMJ/OiOMAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTUtMTAtMTlUMTE6MTg6MzItMDc6MDC/SYTBAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAABJRU5ErkJggg==';
  var BASE_64_IMAGE = '/tmp/resize.png';

  angular
    .module('app.user', ['app.dataFactory', 'app.constants'])
    .controller('homeController', ['$scope', '$state', '$location', 'UserFactory', homeController])
    .controller('pendingActivationController', ['$scope', '$state', 'Error', 'UserFactory', pendingActivationController])
    .controller('activateController', ['$scope', '$state', '$stateParams', 'Error', 'UserFactory', activateController])
    .controller('dashboardController', ['$scope', '$sce', '$state', 'Error', 'DataFactory', 'UserFactory', dashboardController])
    .controller('signupController', ['$scope', '$state', 'Error', 'UserFactory', signupController])
    .controller('linkController', ['$scope', '$state', 'Error', 'UserFactory', linkController])
    .controller('userInformationController', ['$scope', '$state', 'Error', 'UserFactory', userInformationController])
    .controller('identityVerificationController', ['$scope', '$state', 'Error', 'UserFactory', identityVerificationController])
    .controller('addressVerificationController', ['$scope', '$state', 'Error', 'UserFactory', addressVerificationController])
    .controller('transactionsController', ['$scope', '$state', 'DataFactory', transactionsController])
    .controller('fundsController', ['$scope', '$state', 'DataFactory', fundsController])
    .directive('accountSummary', accountSummary)
    .directive('fileModel', fileModel);

  function homeController($scope, $state, $location, UserFactory) {
    var d = parseParameters($location);
    if (d.token) {
      $state.go('activate', {'token': d.token, 'email': d.email});
    } else {
      if (UserFactory.isSignedIn()) {
        if (UserFactory.isActivated()) {
          $state.go("dashboard");
        } else {
          $state.go("pendingActivation");
        }
      } else {
        $state.go("signup");
      }
    }
  }

  function parseParameters($location) {
    var d = $location.search();
    if (!d.state) {
      var url = window.location.href;
      url = url.replace(/\#.*/, ''); // strip hash
      url = url.replace(/.*\?/, ''); // strip up to ?
      var params = url.split("&");
      params.forEach(function(e) {
        var pair = e.split("=");
        d[pair[0]] = pair[1];
      });
    }
    return d;
  }

  function signupController($scope, $state, Error, UserFactory) {
    Airbitz.ui.title('CleverCoin');
    $scope.account = UserFactory.getUserAccount();

    $scope.cancelSignup = function() {
      Airbitz.ui.exit();
    };

    $scope.submitSignUp = function(form) {
      Airbitz.ui.showAlert('', 'Creating account...', {
        'showSpinner': true
      });
      UserFactory.registerUser($scope.account.firstName, $scope.account.email, $scope.account.password).then(function() {
        $state.go('pendingActivation');
      }, function(e) {
        Airbitz.ui.showAlert('Error', 'Error signing up');
      });
    };
  }

  function linkController($scope, $state, Error, UserFactory) {
    Airbitz.ui.title('Link account');
    $scope.link = function() {
      UserFactory.requestLink($scope.email).then(function() {
      });
    }
  }

  function pendingActivationController($scope, $state, Error, UserFactory) {
    Airbitz.ui.title('Activate account');
    $scope.account = UserFactory.getUserAccount();
    // If we can fetch the account, we know the user has been activated
    UserFactory.fetchAccount().then(function(account) {
      $scope.account.isActivated = true;
      Airbitz.core.write('account', $scope.account);
      $state.go("dashboard");
    });
  }

  function activateController($scope, $state, $stateParams, Error, UserFactory) {
    Airbitz.ui.title('Activating your account');
    Airbitz.ui.showAlert('', 'Activating account.', {
      'showSpinner': true
    });
    UserFactory.activate($stateParams.email, $stateParams.token).then(function(b) {
      Airbitz.ui.showAlert('', 'Account activated');
      $state.go("dashboard");
    }, function(b) {
      Airbitz.ui.showAlert('', 'Unable to activate account.');
      $state.go("pendingActivation");
    });
  }

  function dashboardController($scope, $sce, $state, Error, DataFactory, UserFactory) {
    Airbitz.ui.title('CleverCoin');
    // set variables that might be cached locally to make sure they load faster if available
    $scope.account = UserFactory.getUserAccount();
    $scope.userStatus = UserFactory.getUserAccountStatus();

    var showOpts = function(s) {
      $scope.showOptions = !s.userCanTransact;
    };
    showOpts($scope.userStatus);

    UserFactory.fetchAccount().then(function(account) {
      $scope.account = account;
    }, function() {
      // Error, error
    }).then(function() {
      UserFactory.fetchUserAccountStatus().then(function(b) {
        $scope.userStatus = b;
        showOpts($scope.userStatus);
      });
    });

    $scope.regMessage = function() {
      var msg = '';
      var counter = 0;

      if (!$scope.userStatus.userIdentitySetup) {
        counter++;
        msg += '<h5><strong>' + counter + "</strong>. Please verify your identity</h5>";
      }
      if (!$scope.userStatus.userAddressSetup) {
        counter++;
        msg += '<h5><strong>' + counter + "</strong>. Please verify your address</h5>";
      }
      if (msg !== '') {
        msg = '<h4 style="margin-top: 0;">To Buy or Sell Bitcoin:</h4>' + msg;
      }
      return $sce.trustAsHtml(msg);
    };

    $scope.identity = function() {
      if (["Exported", "Verified"].indexOf($scope.userStatus.userIdentityState) > -1) {
        Airbitz.ui.showAlert('', 'Verification documents have already been submitted. Please wait for them to be reviewed.');
      } else {
        $state.go("identityVerification");
      }
    };
    $scope.address = function() {
      if (["Exported", "Verified"].indexOf($scope.userStatus.userAddressState) > -1) {
        Airbitz.ui.showAlert('', 'Address documents have already been submitted. Please wait for them to be reviewed.');
      } else {
        $state.go("addressVerification");
      }
    };

    $scope.buy = function(){
      DataFactory.getOrder(true);
      $state.go('exchangeOrder', {'orderAction': 'buy'});
    };

    $scope.sell = function(){
      DataFactory.getOrder(true);
      $state.go('exchangeOrder', {'orderAction': 'sell'});
    };

    $scope.showAccountOptions = function() {
      $scope.showOptions = !$scope.showOptions;
    };
  }

  function userInformationController($scope, $state, Error, UserFactory) {
    Airbitz.ui.title('User Information');
    $scope.account = UserFactory.getUserAccount();
    $scope.countries = UserFactory.getCountries();
    UserFactory.fetchCountries().then(function(b) {
      $scope.countries = b;
      $scope.account.birthcountryObject = UserFactory.findCountry($scope.account.birthcountry);
      $scope.account.addresscountryObject = UserFactory.findCountry($scope.account.addresscountry);
    });

    $scope.cancel = function() {
      $state.go('dashboard');
    };

    $scope.save = function() {
      $scope.account.birthcountry = $scope.account.birthcountryObject.codeAlpha3;
      $scope.account.addresscountry = $scope.account.addresscountryObject.codeAlpha3;
      Airbitz.ui.showAlert('Saved', 'Submitting user information...', {
        'showSpinner': true
      });
      UserFactory.updateUserAccount($scope.account).then(function() {
        Airbitz.ui.showAlert('Saved', 'User information has been updated.');
        $state.go('dashboard');
      }, function(e) {
        Airbitz.ui.showAlert('', 'Unable to save user data');
      });
    };
  }

  function identityVerificationController($scope, $state, Error, UserFactory) {
    Airbitz.ui.title('Identity Verification');
    $scope.account = UserFactory.getUserAccount();
    UserFactory.fetchCountries().then(function(b) {
      $scope.countries = b;
      $scope.account.nationalityObject = UserFactory.findCountry($scope.account.birthcountry);
    });

    $scope.loadIdentityFront = function() {
      Airbitz.core.requestFile({
        success: function() { },
        error: function() { }
      });
    };

    $scope.loadIdentityBack = function() {
      Airbitz.core.requestFile({
        success: function() { },
        error: function() { }
      });
    };

    $scope.cancel = function(){
      $state.go('dashboard');
    };

    $scope.save = function() {
      Airbitz.ui.showAlert('Saved', 'Submitting identity information...', {
        'showSpinner': true
      });
      // Update the address value
      $scope.account.birthcountry = $scope.account.nationalityObject.codeAlpha3;
      UserFactory.verifyIdentity($scope.identityType, $scope.account.birthcountry, $scope.primaryFile, $scope.secondaryFile).then(function() {
        Airbitz.ui.showAlert('Saved', 'Identity information has been submitted.');
        $state.go('dashboard');
      }, function(e) {
        Airbitz.ui.showAlert('', 'Unable to submit identity information at this time.');
      });
    };
  }

  function addressVerificationController($scope, $state, Error, UserFactory) {
    Airbitz.ui.title('Address Verification');
    $scope.account = UserFactory.getUserAccount();
    UserFactory.fetchCountries().then(function(b) {
      $scope.countries = b;
      $scope.account.addresscountryObject = UserFactory.findCountry($scope.account.addresscountry);
    });
    $scope.loadProofFile = function() {
      Airbitz.core.requestFile({
        success: function() { },
        error: function() { }
      });
    };

    $scope.cancel = function() {
      $state.go('dashboard');
    };

    $scope.save = function() {
      $scope.account.addresscountry = $scope.account.addresscountryObject.codeAlpha3;
      Airbitz.ui.showAlert('Saved', 'Submitting address information...', {
        'showSpinner': true
      });
      UserFactory.verifyAddress($scope.addressType, $scope.account.address, $scope.account.city,
                                $scope.account.zipcode, $scope.account.addresscountry, $scope.proofFile).then(function() {
        Airbitz.ui.showAlert('Saved', 'Address information has been submitted.');
        $state.go('dashboard');
      }, function(e) {
        Airbitz.ui.showAlert('', 'Unable to submit address information');
      });
    };
  }
  function transactionsController($scope, $state, DataFactory) {
    Airbitz.ui.title('Transactions');
    DataFactory.getTrades().then(function(transactions) {
      $scope.transactions = transactions;
    })
  }
  function fundsController($scope, $state, DataFactory) {
    Airbitz.ui.title('Funds');
    DataFactory.getFundsLedger().then(function(funds) {
      $scope.funds = funds;
    })
  }
  function accountSummary() {
    return {
      templateUrl: 'app/user/partials/accountSummary.html'
    };
  }

  function fileModel($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
  };
})();
