var app = angular.module('exchangeGlidera');

app.controller('mainCtrl', [
'$scope',
'$state',
'$stateParams',
function ($scope, $state, $stateParams) {

  Airbitz.ui.title('Glidera');

  // account prepopulate dummy data
  $scope.account = {
    'firstName': 'Ricky',
    'middleName': 'Walleye',
    'lastName': 'Bobby',
    'email': 'jimmy@hendrix',
    'street': '1001 east high st',
    'street2': 'apt 2',
    'city': 'Pottstown',
    'zip': '19464',
    'state': 'PA',
    'country': 'US',
    'dob': '01-22-1980',
  };

  // default exchange data
  $scope.exchange = {
    'name': 'Glidera',
    'icon': 'fa-bitcoin',
    'countryCode': 'US', // ISO 3661-1
    'emailVerificationAddress': 'verifications@glidera.com',
    'phoneVerificationNumber': '+1 650-331-0021',
    'depositBankName1': 'Bank of America',
    'depositBankAccount1': '90001923932',
    'depositBankName2': 'METRO BANK',
    'depositBankAccount2': '23002223932',
    'orderTimeout': '60',
    'depositTimeout': '3600',
    'verificationCode': 'someCode',
  };

  $scope.getAccount = function(){
    if($scope.account) {
      return $scope.account;
    } else {
      return {};
    }
  } // collect data from signup form


  // --- signup
  $scope.account = $scope.getAccount();

  $scope.cancelSignup = function(){
    $state.go('home');
  };

  $scope.submitSignUp = function(account){
    $state.go('verifyEmail');
  };


  // --- verify email address
  $scope.changeEmail = function(email){
    alert('Account Email: ' + email);
  };

  $scope.resendEmail = function(email){
    alert('Account Email: ' + email);
  };


  // --- verify phone number
  $scope.verifyPhone = function(){
    Airbitz.ui.title('Glidera: Verify Phone');
    $state.go('verifyPhone');
  };

  $scope.submitPhone = function(phone){
    alert('Send: ' + phone + ' to Glider for verification code.');
    $state.go('verify2FA');
  }

  $scope.submit2FA = function(code, redirect){
    alert('Send: ' + code + ' to Glider to check if valid.');
    if(redirect){
      $state.go(redirect);
    }else{
      $state.go('loadExchange');
    }
  };

  $scope.changeEmail = function(phone){
    alert('Chang phone: ' + phone);
  };

  $scope.resendSMS = function(phone){
    alert('Resend verfication SMS to: ' + phone);
    $state.go('');
  };


  // --- exchange

  $scope.loadExchange = function(){
    $state.go('exchange');
  };

  // ------ exchange stubs
  $scope.exchange.getBtcBalance = function(){
    return 13.37010101;
  };
  $scope.exchange.getFiatBalance = function(){
    return 1337.01;
  };

  $scope.exchange.addBankAccount = function(){
    $state.go('exchangeAddBankAccount');
  };

  $scope.exchange.addCreditCard = function(){
    $state.go('exchangeAddCreditCard');
  };

  $scope.exchange.buy = function(){
    $state.go('exchangeOrder');
  };

  $scope.exchange.sell = function(){
    $state.go('exchangeSell');
  };


  //------ exchange.order actions
  $scope.exchange.reviewOrder = function(){
    $scope.exchange.order = {};
    $scope.exchange.order.type = 'Buy';
    $state.go('reviewOrder');
  };

  $scope.exchange.editOrder = function(){
    $state.go('exchangeOrder');
  };

  $scope.exchange.executeOrder = function(){
    alert('SEND ORDER TO GLIDERA VIA API');
    $state.go('executeOrder');
  };

  $scope.exchange.confirmDeposit = function(){
    $state.go('confirmDeposit');
  };


}]);
