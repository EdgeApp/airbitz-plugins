
angular.module('app.user', ['app.dataFactory', 'app.constants'])
.controller('signupController', ['$scope', '$state', 'DataFactory', 'States', 'UserFactory',
  function ($scope, $state, DataFactory, States, UserFactory) {
    Airbitz.ui.title('Glidera Signup');
    $scope.exchange = DataFactory.getExchange();
    $scope.account = UserFactory.getUserAccount();
    $scope.hasRegistered = UserFactory.getRegistrationStatus();
    $scope.states = States.getStates();

    $scope.cancelSignup = function(){
      $state.go('home');
    };

    $scope.submitSignUp = function(account) {
      Airbitz.ui.title('Saving...');
      UserFactory.updateUserAccount($scope.account).then(function() {
        $state.go('verifyEmail');
      });
    };
  }])
.controller('userAccountController', ['$scope', '$state', 'DataFactory', 'States', 'UserFactory',
  function ($scope, $state, DataFactory, States, UserFactory) {
    $scope.states = States.getStates();
    $scope.account = UserFactory.getUserAccount();
    $scope.hasRegistered = UserFactory.getRegistrationStatus();
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
.controller('verifyEmailController', ['$scope', '$state', 'DataFactory', 'UserFactory',
    function($scope, $state, DataFactory, UserFactory) {
      Airbitz.ui.title('Glidera: Verify Email');

      $scope.exchange = DataFactory.getExchange();
      $scope.account = UserFactory.getUserAccount();

      $scope.resendEmail = function(email){
        Airbitz.ui.showAlert('Resending', 'Resending to ' + email);
      };
      $scope.verifyEmail = function(){
        Airbitz.ui.title('Saving...');
        UserFactory.updateUserAccount($scope.account).then(function() {
          $scope.account.setRegistrationStatus(true);
          $state.go('verifyPhone');
        });
      };
    }])
.controller('verifyPhoneController', ['$scope', '$state', 'DataFactory', 'UserFactory',
    function($scope, $state, DataFactory, UserFactory) {
      Airbitz.ui.title('Glidera: Verify Phone');

      $scope.exchange = DataFactory.getExchange();
      $scope.account = UserFactory.getUserAccount();

      $scope.verifyPhone = function(){
        $state.go('verifyPhone');
      };

      $scope.submitPhone = function(phone){
        Airbitz.ui.showAlert('Send', 'Send ' + phone + ' to Glidera for verification code');
        $state.go('verify2FA');
      };

      $scope.changePhone = function(phone){
        Airbitz.ui.showAlert('Change Phone', 'Change phone: ' + phone);
      };
    }])
