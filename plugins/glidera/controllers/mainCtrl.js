var app = angular.module('exchangeGlidera');

app.controller('mainCtrl', [
'$scope',
'$state',
'$stateParams',
function ($scope, $state, $stateParams) {

  // default exchange data
  $scope.exchange = {
    'name': 'Glidera',
    'icon': 'fa-bitcoin',
    'countryCode': 'US', // ISO 3661-1
    'emailVerificationAddress': 'verifications@glidera.com'
  };

  $scope.getUserInfo = function(){
    if($scope.user) {
      return $scope.user;
    } else {
      return {};
    }
  } // collect data from signup form


  // --- signup
  $scope.user = $scope.getUserInfo();

  $scope.submitSignUp = function(data){
    $state.go('verifyEmail');
  };


  // --- verify email
  $scope.changeEmail = function(email){
    alert('User Email: ' + email);
  };

  $scope.resendEmail = function(email){
    alert('User Email: ' + email);
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
    $state.go('exchangeBuy');
  };

  $scope.exchange.sell = function(){
    $state.go('exchangeSell');
  };


}]);
