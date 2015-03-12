
angular.module('app.user', ['app.dataFactory', 'app.constants'])
.controller('userAccountController', ['$scope', '$state', 'DataFactory', 'States', 'UserFactory',
  function ($scope, $state, DataFactory, States, UserFactory) {
    $scope.states = States.getStates();
    $scope.account = UserFactory.getUserAccount();
    $scope.hasRegistered = UserFactory.isRegistered();
    UserFactory.getFullUserAccount().then(function(account) {
      $scope.account = account;
    }, function() {
      Airbitz.ui.showAlert('Error', 'TODO: Error. Error');
    });

    $scope.cancelSignup = function(){
      $state.go('exchange');
    };

    $scope.saveUserAccount = function() {
      Airbitz.ui.title('Saving...');
      UserFactory.updateUserAccount($scope.account).then(function() {
        Airbitz.ui.showAlert('Saved', 'User information has been updated.');
        $state.go('exchange');
      }, function(error) {
        Airbitz.ui.showAlert('Error', error);
      });
    };
  }])
.controller('signupController', ['$scope', '$state', 'DataFactory', 'States', 'UserFactory',
  function ($scope, $state, DataFactory, States, UserFactory) {
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
        }, function(error) {
          if (error.message) {
            Airbitz.ui.showAlert('Error', error.message);
          } else {
            // TODO: abstract the error messages
            Airbitz.ui.showAlert('Error', 'An unknown error occurred.');
          }
        });
      }
    };
  }])
.controller('verifyEmailController', ['$scope', '$state', 'DataFactory', 'UserFactory',
    function($scope, $state, DataFactory, UserFactory) {
      Airbitz.ui.title('Glidera: Verify Email');

      $scope.exchange = DataFactory.getExchange();
      $scope.account = UserFactory.getUserAccount();

      $scope.resendEmail = function(email){
        Airbitz.ui.showAlert('Resending', 'Resending to ' + email);
        // TODO resend email...
      };
      $scope.verifyEmail = function(){
        Airbitz.ui.title('Saving...');
        UserFactory.updateUserAccount($scope.account).then(function() {
          $state.go('verifyPhone');
        });
      };
    }])
.controller('verifyPhoneController', ['$scope', '$state', 'DataFactory', 'UserFactory', 'TwoFactor',
    function($scope, $state, DataFactory, UserFactory, TwoFactor) {
      Airbitz.ui.title('Glidera: Verify Phone');

      $scope.exchange = DataFactory.getExchange();
      $scope.account = UserFactory.getUserAccount();

      $scope.verifyPhone = function(){
        $state.go('verifyPhone');
      };

      $scope.submitPhone = function(phone){
        TwoFactor.showTwoFactor(function() {
          $state.go('exchange');
        });
      };
    }]).
directive('phoneNumberValidator', [function() {
  var PHONE_REGEXP = /^[0-9]{3}-?[0-9]{3}-?[0-9]{4}$/i;

  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.tel = function(modelValue) {
        return PHONE_REGEXP.test(modelValue.replace(/-/g, ''));
      }
    }
  };
}]);
