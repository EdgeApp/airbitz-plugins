
angular.module('app.exchange', ['app.dataFactory'])
.controller('homeController', ['$scope', '$state', 'DataFactory',
  function ($scope, $state, DataFactory) {
    $scope.exchange = DataFactory.getExchange();
    $scope.account = DataFactory.getAccount();
  }])
.controller('dashboardController', ['$scope', '$state', 'DataFactory',
  function ($scope, $state, DataFactory) {
    $scope.exchange = DataFactory.getExchange();
    $scope.account = DataFactory.getAccount();

    $scope.exchange.buy = function(){
      $state.go('exchangeOrder');
    };

    $scope.exchange.sell = function(){
      $state.go('exchangeSell');
    };

    $scope.exchange.addBankAccount = function(){
      $state.go('exchangeAddBankAccount');
    };

    $scope.exchange.addCreditCard = function(){
      $state.go('exchangeAddCreditCard');
    };
  }])
.controller('addAccountController', ['$scope', '$state', 'DataFactory',
  function ($scope, $state, DataFactory) {
    $scope.exchange = DataFactory.getExchange();
    $scope.account = DataFactory.getAccount();
  }])
.controller('addCreditCardController', ['$scope', '$state', 'DataFactory',
  function ($scope, $state, DataFactory) {
    $scope.exchange = DataFactory.getExchange();
    $scope.account = DataFactory.getAccount();
  }])
.controller('orderController', ['$scope', '$state', 'DataFactory',
  function ($scope, $state, DataFactory) {
    $scope.exchange = DataFactory.getExchange();
    $scope.account = DataFactory.getAccount();
  }])
.controller('revirewOrderController', ['$scope', '$state', 'DataFactory',
  function ($scope, $state, DataFactory) {
    $scope.exchange = DataFactory.getExchange();
    $scope.account = DataFactory.getAccount();
  }])
.controller('executeOrderController', ['$scope', '$state', 'DataFactory',
  function ($scope, $state, DataFactory) {
    $scope.exchange = DataFactory.getExchange();
    $scope.account = DataFactory.getAccount();
  }]);
    /*
    // ------ exchange stubs
    $scope.loadExchange = function(){
      $state.go('exchange');
    };

    $scope.exchange.getBtcBalance = function(){
      return 13.37010101;
    };
    $scope.exchange.getFiatBalance = function(){
      return 1337.01;
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
    */
