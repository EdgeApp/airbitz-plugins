
angular.module('app.user', ['app.dataFactory', 'app.constants'])
.controller('userAccountController', ['$scope', '$state', 'Error', 'States', 'UserFactory',
  function ($scope, $state, Error, States, UserFactory) {
    $scope.states = States.getStates();
    $scope.account = UserFactory.getUserAccount();
    UserFactory.getFullUserAccount().then(function(account) {
      $scope.account = account;
    }, Error.reject);

    $scope.cancelSignup = function(){
      $state.go('exchange');
    };

    $scope.saveUserAccount = function() {
      Airbitz.ui.title('Saving...');
      UserFactory.updateUserAccount($scope.account).then(function() {
        Airbitz.ui.showAlert('Saved', 'User information has been updated.');
        $state.go('exchange');
      }, Error.reject);
    };
  }])
.controller('apiKeyController', ['$scope', '$state', 'glideraFactory', 'UserFactory',
  function ($scope, $state, glideraFactory, UserFactory) {
    Airbitz.ui.title('Glidera API Keys');
    $scope.account = UserFactory.getUserAccount();

    $scope.cancel = function(){
      if (UserFactory.isRegistered()) {
        $state.go('exchange');
      } else {
        $state.go('signup');
      }
    };

    $scope.deleteAccount = function(form) {
      // Empty account
      $scope.account = {};
      UserFactory.clearUser();
      // Clear api
      glideraFactory.key = null;
      glideraFactory.secret = null;
      // Clear all storage
      Airbitz.core.clearData();
      $state.go('signup');

      Airbitz.ui.showAlert('Acctoun Removed', 'Your account has been removed. Please register a new account or enter your access keys from Glidera.');
    };

    $scope.submit = function(form) {
      Airbitz.ui.title('Saving...');
      Airbitz.core.clearData();
      glideraFactory.key = $scope.account.key;
      glideraFactory.secret = $scope.account.secret;
      UserFactory.getFullUserAccount().then(function() {
        Airbitz.core.writeData('account', $scope.account);
        $state.go("exchange");
      }, function() {
        Airbitz.ui.showAlert('Authentication Error', 'Unable to connect to API with new api keys');
        glideraFactory.key = '';
        glideraFactory.secret = '';
      });
    };
  }])
.controller('signupController', ['$scope', '$state', 'Error', 'States', 'UserFactory',
  function ($scope, $state, Error, States, UserFactory) {
    Airbitz.ui.title('Glidera Signup');
    $scope.account = UserFactory.getUserAccount();

    $scope.cancelSignup = function(){
      $state.go('home');
    };

    $scope.submitSignUp = function(form) {
      Airbitz.ui.title('Saving...');
      if (UserFactory.isRegistered()) {
        $state.go('verifyEmail');
      } else {
        UserFactory.registerUser($scope.account.firstName, $scope.account.lastName, $scope.account.email).then(function() {
          $state.go('verifyEmail');
        }, Error.reject);
      }
    };
  }])
.controller('verifyEmailController', ['$scope', '$state', 'Error', 'UserFactory',
    function($scope, $state, Error, UserFactory) {
      Airbitz.ui.title('Glidera: Verify Email');
      $scope.account = UserFactory.getUserAccount();

      $scope.next = function() {
        UserFactory.fetchUserAccountStatus().then(function(userStatus) {
          if (userStatus.userEmailIsSetup) {
            $state.go('verifyInfo');
          } else {
            Airbitz.ui.showAlert('Verify Email', 'Please verify your email address before proceeding!');
            $state.go('verifyEmail');
          }
        }, Error.reject);
      };
    }])
.controller('verifyInfoController', ['$scope', '$state', 'Error', 'States', 'UserFactory',
  function($scope, $state, Error, States, UserFactory) {
    $scope.states = States.getStates();
    $scope.account = UserFactory.getUserAccount();

    $scope.saveUserAccount = function() {
      Airbitz.ui.title('Saving...');
      UserFactory.updateUserAccount($scope.account).then(function() {
        Airbitz.ui.showAlert('Saved', 'User information has been updated.');
        $state.go('verifyPhone');
      }, Error.reject);
    };
  }])
.controller('verifyPhoneController', ['$scope', '$state', 'Error', 'DataFactory', 'UserFactory', 'TwoFactor',
    function($scope, $state, Error, DataFactory, UserFactory, TwoFactor) {
      Airbitz.ui.title('Glidera: Verify Phone');
      $scope.account = UserFactory.getUserAccount();

      var verifyCode = function() {
        DataFactory.confirmPhoneNumber(TwoFactor.getCode(), TwoFactor.getOldCode()).then(function() {
          $state.go('exchange');
        }, Error.reject);
      };
      $scope.submitPhone = function(){
        DataFactory.addPhoneNumber($scope.account.phone).then(function() {
          TwoFactor.confirmTwoFactor(verifyCode);
        }, Error.reject);
      };
    }]).
directive('phoneNumberValidator', [function() {
  var PHONE_REGEXP = /^[0-9]{3}-?[0-9]{3}-?[0-9]{4}$/i;

  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.tel = function(modelValue) {
        return !ctrl.$isEmpty(modelValue) && PHONE_REGEXP.test(modelValue.replace(/-/g, ''));
      }
    }
  };
}]);
