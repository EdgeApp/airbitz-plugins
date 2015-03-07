
angular.module('app.signup', ['app.dataFactory'])
.controller('signupController', ['$scope', '$state', 'DataFactory',
  function ($scope, $state, DataFactory) {
    Airbitz.ui.title('Glidera Signup');

    $scope.exchange = DataFactory.getExchange();
    $scope.account = DataFactory.getUserAccount();

    $scope.cancelSignup = function(){
      $state.go('home');
    };

    $scope.submitSignUp = function(account) {
      Airbitz.ui.title('Saving...');
      DataFactory.updateUserAccount().then(function() {
        $state.go('verifyEmail');
      });
    };
  }])
.controller('userAccountController', ['$scope', '$state', 'DataFactory',
  function ($scope, $state, DataFactory) {
    $scope.account = DataFactory.getUserAccount();

    $scope.cancelSignup = function(){
      $state.go('exchange');
    };

    $scope.saveUserAccount = function() {
      DataFactory.updateUserAccount().then(function() {
        $state.go('exchange');
      });
    };
  }])
.controller('verifyEmailController', ['$scope', '$state', 'DataFactory',
    function($scope, $state, DataFactory) {
      Airbitz.ui.title('Glidera: Verify Email');

      $scope.exchange = DataFactory.getExchange();
      $scope.account = DataFactory.getUserAccount();

      $scope.resendEmail = function(email){
        alert('Resending to: ' + email);
      };
      $scope.verifyEmail = function(){
        Airbitz.ui.title('Saving...');
        DataFactory.updateUserAccount().then(function() {
          $scope.account.setRegistrationStatus(true);
          $state.go('verifyPhone');
        });
      };
    }])
.controller('verifyPhoneController', ['$scope', '$state', 'DataFactory',
    function($scope, $state, DataFactory) {
      Airbitz.ui.title('Glidera: Verify Phone');

      $scope.exchange = DataFactory.getExchange();
      $scope.account = DataFactory.getUserAccount();

      $scope.verifyPhone = function(){
        $state.go('verifyPhone');
      };

      $scope.submitPhone = function(phone){
        alert('Send: ' + phone + ' to Glider for verification code.');
        $state.go('verify2FA');
      };

      $scope.changePhone = function(phone){
        alert('Change phone: ' + phone);
      };
    }])
.controller('verify2faController', ['$scope', '$state', 'DataFactory',
    function($scope, $state, DataFactory) {
      Airbitz.ui.title('Glidera: 2FA');

      $scope.submit2FA = function(code, redirect){
        alert('Send: ' + code + ' to Glider to check if valid.');
        if(redirect){
          $state.go(redirect);
        }else{
          $state.go('loadExchange');
        }
      };

      $scope.resendSMS = function(phone){
        alert('Resend verfication SMS to: ' + phone);
        $state.go('');
      };
    }]);
