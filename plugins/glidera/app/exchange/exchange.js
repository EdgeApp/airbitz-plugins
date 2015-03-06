
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
    $scope.accountStatus = DataFactory.getAccountStatus();

    DataFactory.getBankAccounts().then(function(bankAccounts) {
      $scope.bankAccounts = bankAccounts;
    }, function() {
      // TODO: error
      alert('TODO: Error! Error!');
    });

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
    $scope.bankAccount = {};
    $scope.bankAccount.bankAccountType = 'CHECKING';

    $scope.saveBankAccount = function() {
      DataFactory.createBankAccount($scope.bankAccount).then(function() {
        $state.go('exchange');
      }, function() {
        // TODO: error
        alert('TODO: Error! Error!');
      });
    };
  }])
.controller('updateAccountController', ['$scope', '$state', 'DataFactory',
  function ($scope, $state, DataFactory) {
    $scope.exchange = DataFactory.getExchange();
    $scope.account = DataFactory.getAccount();
    $scope.bankAccount = DataFactory.getBankAccount();

    $scope.saveBankAccount = function() {
      DataFactory.updateBankAccount().then(function() {
        $state.go('exchange');
      });
    };
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
