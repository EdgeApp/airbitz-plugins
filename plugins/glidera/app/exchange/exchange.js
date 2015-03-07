
angular.module('app.exchange', ['app.dataFactory'])
.controller('homeController', ['$scope', '$state', 'DataFactory',
  function ($scope, $state, DataFactory) {
    $scope.exchange = DataFactory.getExchange();
    $scope.account = DataFactory.getUserAccount();
  }])
.controller('dashboardController', ['$scope', '$state', 'DataFactory',
  function ($scope, $state, DataFactory) {
    $scope.exchange = DataFactory.getExchange();
    $scope.account = DataFactory.getUserAccount();
    $scope.userAccountStatus = DataFactory.getUserAccountStatus();

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
    $scope.account = DataFactory.getUserAccount();
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
.controller('editBankAccountController', ['$scope', '$state', '$stateParams', 'DataFactory',
  function ($scope, $state, $stateParams, DataFactory) {
    $scope.account = DataFactory.getUserAccount();
    DataFactory.getBankAccount($stateParams.uuid).then(function(bankAccount) {
      $scope.bankAccount = bankAccount;
    }, function() {
      // TODO!!!
      alert('Error!1!111!1');
    });

    $scope.saveBankAccount = function() {
      DataFactory.updateBankAccount($scope.bankAccount).then(function() {
        $state.go('exchange');
      }, function() {
        // TODO: error
        alert('TODO: Error! Error!');
      });
    };
  }])
.controller('addCreditCardController', ['$scope', '$state', 'DataFactory',
  function ($scope, $state, DataFactory) {
    $scope.exchange = DataFactory.getExchange();
    $scope.account = DataFactory.getUserAccount();
  }])
.controller('orderController', ['$scope', '$state', 'DataFactory',
  function ($scope, $state, DataFactory) {
    $scope.exchange = DataFactory.getExchange();
    $scope.account = DataFactory.getUserAccount();
  }])
.controller('revirewOrderController', ['$scope', '$state', 'DataFactory',
  function ($scope, $state, DataFactory) {
    $scope.exchange = DataFactory.getExchange();
    $scope.account = DataFactory.getUserAccount();
  }])
.controller('executeOrderController', ['$scope', '$state', 'DataFactory',
  function ($scope, $state, DataFactory) {
    $scope.exchange = DataFactory.getExchange();
    $scope.account = DataFactory.getUserAccount();
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
