
angular.module('app.signup', ['app.dataFactory'])
.controller('signupController', ['$scope', '$state', 'DataFactory',
  function ($scope, $state, DataFactory) {
    Airbitz.ui.title('Glidera');

    $scope.exchange = DataFactory.getExchange();
    $scope.account = DataFactory.getAccount();

    $scope.cancelSignup = function(){
      $state.go('home');
    };

    $scope.submitSignUp = function(account) {
      $state.go('verifyEmail');
      DataFactory.saveAccount();
    };
  }])
.controller('verifyEmailController', ['$scope', '$state', 'DataFactory',
    function($scope, $state, DataFactory) {
      $scope.exchange = DataFactory.getExchange();
      $scope.account = DataFactory.getAccount();

      $scope.changeEmail = function(email){
        alert('Account Email: ' + email);
      };
      $scope.resendEmail = function(email){
        alert('Account Email: ' + email);
      };
      $scope.verifyEmail = function(){
        $state.go('verifyPhone');
      };
    }])
.controller('verifyPhoneController', ['$scope', '$state', 'DataFactory',
    function($scope, $state, DataFactory) {
      Airbitz.ui.title('Glidera: Verify Phone');

      $scope.exchange = DataFactory.getExchange();
      $scope.account = DataFactory.getAccount();

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
