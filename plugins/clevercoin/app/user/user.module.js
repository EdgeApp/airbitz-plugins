(function () {
  'use strict';

  angular
    .module('app.user', ['app.dataFactory', 'app.constants'])
    .controller('homeController', ['$scope', '$state', 'UserFactory', homeController])
    .controller('dashboardController', ['$scope', '$sce', '$state', 'Error', 'DataFactory', 'UserFactory', dashboardController])
    .controller('disclaimerController', ['$scope', '$state', 'Error', 'UserFactory', disclaimerController])
    .controller('signupController', ['$scope', '$state', 'Error', 'UserFactory', signupController])
    .controller('addressVerificationController', ['$scope', '$state', 'Error', 'UserFactory', addressVerificationController])
    .controller('identityVerificationController', ['$scope', '$state', 'Error', 'UserFactory', identityVerificationController])
    .controller('transactionsController', ['$scope', '$state', 'DataFactory', transactionsController])
    .controller('fundsController', ['$scope', '$state', 'DataFactory', fundsController])
    .directive('accountSummary', accountSummary);

  function homeController($scope, $state, UserFactory) {
    if (UserFactory.isAuthorized()) {
      $state.go("dashboard");
    } else {
      if (Airbitz.core.readData('disclaimer')) {
        $state.go("signup");
      } else {
        Airbitz.core.writeData('disclaimer', false);
        $state.go("disclaimer");
      }
    }
  }
  function disclaimerController($scope, $state, Error, UserFactory) {
    Airbitz.ui.title('Disclaimer');
    $scope.showDisclaimer = true;

    $scope.cancelSignup = function(){
      Airbitz.ui.exit();
    };

    $scope.continueSignup = function(form) {
      $state.go('signup');
      Airbitz.core.writeData('disclaimer', true);
    };
  }
  function signupController($scope, $state, Error, UserFactory) {
    Airbitz.ui.title('CleverCoin - ' + $scope.countryName);
    $scope.account = UserFactory.getUserAccount();
    $scope.registrationCode = '';
    $scope.regCodeRequired = false;
    $scope.showDisclaimer = true;

    UserFactory.fetchUserAccountStatus().then(function(b) {
      console.log(b);
    });
    $scope.cancelSignup = function(){
      $state.go('disclaimer');
    };

    $scope.submitSignUp = function(form) {
      Airbitz.ui.title('Saving...');
      UserFactory.registerUser($scope.account.firstName, $scope.account.email, $scope.account.password).then(function() {
        $state.go('dashboard');
      }, function(e) {
      });
    };
  }
  function dashboardController($scope, $sce, $state, Error, DataFactory, UserFactory) {
    Airbitz.ui.title('CleverCoin ' + $scope.countryName);
    // set variables that might be cached locally to make sure they load faster if available
    $scope.account = UserFactory.getUserAccount();
    $scope.userStatus = UserFactory.getUserAccountStatus();
    $scope.showOptions = !($scope.account && $scope.account.verificationState === 'Verified');

    UserFactory.fetchAccount().then(function(account) {
      $scope.account = account;
      $scope.showOptions = !($scope.account && $scope.account.verificationState === 'Verified');
    }, function() {
      // Error, error
    }).then(function() {
      UserFactory.fetchUserAccountStatus().then(function(b) {
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
      $state.go('exchange');
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
