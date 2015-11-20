(function () {
  'use strict';

  angular
    .module('app.user', ['app.dataFactory', 'app.constants'])
    .controller('homeController', ['$scope', '$state', '$location', 'UserFactory', homeController])
    .controller('pendingActivationController', ['$scope', '$state', 'Error', 'UserFactory', pendingActivationController])
    .controller('activateController', ['$scope', '$state', '$stateParams', 'Error', 'UserFactory', activateController])
    .controller('dashboardController', ['$scope', '$sce', '$state', 'Error', 'DataFactory', 'UserFactory', dashboardController])
    .controller('signupController', ['$scope', '$state', 'Error', 'UserFactory', signupController])
    .controller('addressVerificationController', ['$scope', '$state', 'Error', 'UserFactory', addressVerificationController])
    .controller('identityVerificationController', ['$scope', '$state', 'Error', 'UserFactory', identityVerificationController])
    .controller('transactionsController', ['$scope', '$state', 'DataFactory', transactionsController])
    .controller('fundsController', ['$scope', '$state', 'DataFactory', fundsController])
    .directive('accountSummary', accountSummary);

  function homeController($scope, $state, $location, UserFactory) {
    var d = parseParameters($location);
    if (d.token) {
      $state.go('activate', {'token': d.token});
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
      Airbitz.ui.title('Saving...');
      UserFactory.registerUser($scope.account.firstName, $scope.account.email, $scope.account.password).then(function() {
        $state.go('pendingActivation');
      }, function(e) {
        Airbitz.ui.showAlert('Error', 'Error signing up');
      });
    };
  }

  function pendingActivationController($scope, $state, Error, UserFactory) {
    Airbitz.ui.title('Activate account');
    $scope.account = UserFactory.getUserAccount();
    $scope.resendEmail = function() {
      Airbitz.ui.showAlert('', 'Resending activation link.', {
        'showSpinner': true
      });
      UserFactory.requestLink().then(function() {
        Airbitz.ui.showAlert('', 'Activation email resent. Please check your inbox.');
      }, function() {
        Airbitz.ui.showAlert('', 'Unable to resend activation email at this time.');
      });
    };
  }

  function activateController($scope, $state, $stateParams, Error, UserFactory) {
    Airbitz.ui.title('Activating your account');
    Airbitz.ui.showAlert('', 'Activating account.', {
      'showSpinner': true
    });
    UserFactory.activate($stateParams.token).then(function(b) {
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

    UserFactory.fetchAccount().then(function(account) {
      $scope.account = account;
      $scope.showOptions = !($scope.account && $scope.account.verificationState === 'Verified');
    }, function() {
      // Error, error
    }).then(function() {
      UserFactory.fetchUserAccountStatus().then(function(b) {
console.log(b);
        $scope.userStatus = b;
      });
    });

    $scope.regMessage = function() {
      var msg = '';
      var counter = 0;

      if (!$scope.userStatus.userIdentitySetup) {
        counter++;
        msg += '<h5><strong>' + counter + "</strong>. Please verify email</h5>";
      }
      if (!$scope.userStatus.userAddressSetup) {
        counter++;
        msg += '<h5><strong>' + counter + "</strong>. Please verify account info</h5>";
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
  }

  function addressVerificationController($scope, $state, Error, UserFactory) {
    var title = 'User Information';
    Airbitz.ui.title(title);
    $scope.account = UserFactory.getUserAccount();
    UserFactory.fetchAccount().then(function(account) {
      $scope.account = account;
    }, function() {
    });

    $scope.cancelSignup = function(){
      $state.go('dashboard');
    };

    $scope.saveUserAccount = function() {
      Airbitz.ui.title('Saving...');
      UserFactory.updateUserAccount($scope.account).then(function() {
        Airbitz.ui.showAlert('Saved', 'User information has been updated.');
        $state.go('exchange');
      }, function(e) {
        Error.reject(e);
        Airbitz.ui.title(title);
      });
    };
  }
  function identityVerificationController($scope, $state, Error, UserFactory) {
    var title = 'User Information';
    Airbitz.ui.title(title);
    $scope.account = UserFactory.getUserAccount();
    UserFactory.fetchAccount().then(function(account) {
      $scope.account = account;
    }, function() {
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
})();
