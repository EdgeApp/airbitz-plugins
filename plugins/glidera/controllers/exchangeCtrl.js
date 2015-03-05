var app = angular.module('exchangeGlidera');

app.controller('mainCtrl', [
'$scope',
'$state',
'$stateParams',
function ($scope, $state, $stateParams) {

  Airbitz.ui.title('Glidera Exchange');

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



}]);
