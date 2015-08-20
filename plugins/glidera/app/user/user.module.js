(function () {
  'use strict';

  angular
    .module('app.user', ['app.dataFactory', 'app.constants'])
    .controller('homeController', ['$scope', '$state', '$location', 'UserFactory', homeController])
    .controller('dashboardController', ['$scope', '$sce', '$state', 'Error', 'DataFactory', 'UserFactory', 'Limits', dashboardController])
    .controller('userAccountController', ['$scope', '$state', 'Error', 'States', 'Occupations', 'UserFactory', userAccountController])
    .controller('bankController', ['$scope', '$state', 'UserFactory', bankController])
    .controller('disclaimerController', ['$scope', '$state', 'Error', 'States', 'UserFactory', disclaimerController])
    .controller('authController', ['$scope', '$state', '$location', 'UserFactory', authController])
    .controller('verifyEmailController', ['$scope', '$state', 'Error', 'UserFactory', verifyEmailController])
    .controller('verifyPhoneController', ['$scope', '$state', 'Error', 'DataFactory', 'UserFactory', 'TwoFactor', verifyPhoneController])
    .directive('phoneNumberValidator', phoneNumberValidator);

  function homeController($scope, $state, $location, UserFactory) {
    var d = parseParameters($location);
    if (d && d['state']) {
      handleUri($state, UserFactory, d);
    } else {
      if (UserFactory.isAuthorized()) {
        $state.go("dashboard");
      } else {
        if (Airbitz.core.readData('disclaimer')) {
          $state.go("authorize");
        } else {
          Airbitz.core.writeData('disclaimer', false);
          $state.go("disclaimer");
        }
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

  function handleUri($state, UserFactory, d) {
    if ("authorize" === d.state) {
      Airbitz.ui.title('Authenticating');
      UserFactory.requestAccessToken(d.code, function(success, results) {
        if (success) {
          $state.go('dashboard');
        } else {
          $state.go('authorize');
        }
      });
    } else {
      $state.go('dashboard');
    }
  }

  function dashboardController($scope, $sce, $state, Error, DataFactory, UserFactory, Limits) {
    Airbitz.ui.title('Glidera ' + $scope.countryName);
    // set variables that might be cached locally to make sure they load faster if available
    $scope.account = UserFactory.getUserAccount();
    $scope.userStatus = UserFactory.getUserAccountStatus();
    $scope.limits = Limits.getLimits();
    $scope.showOptions = !$scope.userStatus.userCanTransact;
    $scope.debugClicks = 0;

    UserFactory.fetchUserAccountStatus().then(function(b) {
      $scope.userStatus = b;
      $scope.showOptions = !$scope.userStatus.userCanTransact;
    }).then(function() {
      return UserFactory.getFullUserAccount();
    }).then(function() {
      return Limits.fetchLimits().then(function(limits) {
        $scope.limits = limits;
      });
    }).then(function() {
      DataFactory.checkPhoneNumber($scope.account);
    });

    $scope.regMessage = function() {
      var msg = '';
      var counter = 0;

      if (!$scope.userStatus.userEmailIsSetup) {
        counter++;
        msg += '<h5><strong class="step">' + counter + "</strong> Verify email</h5>";
      }
      if (!$scope.userStatus.userBasicInfoIsSetup) {
        counter++;
        msg += '<h5><strong class="step">' + counter + "</strong> Verify account info</h5>";
      }
      if (!$scope.userStatus.userPhoneIsSetup) {
        counter++;
        msg += '<h5><strong class="step">' + counter + "</strong> Verify mobile phone</h5>";
      }
      if (!$scope.userStatus.userBankAccountIsSetup) {
        counter++;
        msg += '<h5><strong class="step">' + counter + "</strong> Verify bank account & deposit amount</h5>";
      }
      if (msg !== '') {
        msg = '<h4 style="margin-top: 0;">To Buy or Sell Bitcoin:</h4>' + msg;
      }
      return $sce.trustAsHtml(msg);
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

    $scope.routeBankAccount = function() {
      $state.go('bankAccounts')
    };

    $scope.logout = function() {
      UserFactory.clearUser();
      $state.go('home');
    }
  }

  function userAccountController($scope, $state, Error, States, Occupations, UserFactory) {
    var title = 'User Information';
    Airbitz.ui.title(title);
    $scope.states = States.getStates();
    $scope.occupations = Occupations.getOccupations();
    $scope.account = UserFactory.getUserAccount();
    UserFactory.getFullUserAccount().then(function(account) {
      $scope.account = account;
    }, function() {
      // ignore errors on get so that new accounts don't get the wrong impression.
    });

    $scope.cancelSignup = function(){
      $state.go('dashboard');
    };

    $scope.saveUserAccount = function() {
      Airbitz.ui.title('Saving...');
      UserFactory.updateUserAccount($scope.account).then(function() {
        Airbitz.ui.showAlert('Saved', 'User information has been updated.');
        $state.go('dashboard');
      }, function(e) {
        Error.reject(e);
        Airbitz.ui.title(title);
      });
    };
  }

  function bankController($scope, $state, UserFactory) {
    Airbitz.ui.title('Edit Bank Account');
    location.href = UserFactory.createBankAccountUrl();
  }

  function disclaimerController($scope, $state, Error, States, UserFactory) {
    Airbitz.ui.title('Disclaimer');
    $scope.showDisclaimer = true;

    $scope.cancelSignup = function(){
      Airbitz.ui.exit();
    };

    $scope.continueSignup = function(form) {
      $state.go('authorize');
      Airbitz.core.writeData('disclaimer', true);
    };
  }

  function authController($scope, $state, $location, UserFactory) {
    console.log('authController');
    location.href = UserFactory.authorizeUrl();
  }

  function verifyEmailController($scope, $state, Error, UserFactory) {
    Airbitz.ui.title('Verify Email');
    $scope.account = UserFactory.getUserAccount();

    $scope.next = function() {
      UserFactory.fetchUserAccountStatus().then(function(userStatus) {
        if (userStatus.userEmailIsSetup) {
          $state.go('verifyPhone');
        } else {
          Airbitz.ui.showAlert('Verify Email', 'Please verify your email address before proceeding!');
          $state.go('verifyEmail');
        }
      }, Error.reject);
    };
  }

  function verifyPhoneController($scope, $state, Error, DataFactory, UserFactory, TwoFactor) {
    Airbitz.ui.title('Verify Phone');
    $scope.account = UserFactory.getUserAccount();

    var verifyCode = function() {
      DataFactory.confirmPhoneNumber(TwoFactor.getCode(), TwoFactor.getOldCode()).then(function() {
        $state.go('dashboard');
      }, Error.reject);
    };
    $scope.submitPhone = function(){
      DataFactory.addPhoneNumber($scope.account.phone).then(function() {
        TwoFactor.confirmTwoFactor(verifyCode);
      }, Error.reject);
    };
    $scope.cancelSignup = function(){
      $state.go('dashboard');
    };
  }

  function phoneNumberValidator() {
    var PHONE_REGEXP = /^\+?[0-9]*[ -]?[0-9]{3}[ -]?[0-9]{3}[ -]?[0-9]{4}$/i;
    return {
      require: 'ngModel',
      link: function(scope, elm, attrs, ctrl) {
        ctrl.$validators.tel = function(modelValue) {
          return !ctrl.$isEmpty(modelValue) && PHONE_REGEXP.test(modelValue.replace(/-/g, ''));
        }
      }
    };
  }
})();
