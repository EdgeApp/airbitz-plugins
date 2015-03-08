
angular.module('app.exchange', ['app.dataFactory'])
.filter('statusFilter', function() {
  return function(status) {
    switch(status) {
      case 'BASIC_INFO_NOT_VERIFIED':
      case 'BASIC_INFO_VERIFIED_BANK_ACCOUNT_NEEDED':
        return 'Not Verified';
      case 'BASIC_INFO_VERIFIED':
        return 'Verified';
      default:
        return 'ACCOUNT UNKNOWN';
    }
  };
})
.controller('homeController', ['$scope', '$state', 'DataFactory', 'UserFactory',
  function ($scope, $state, DataFactory, UserFactory) {
    $scope.exchange = DataFactory.getExchange();
    $scope.account = UserFactory.getUserAccount();
  }])
.controller('dashboardController', ['$scope', '$state', 'DataFactory', 'UserFactory',
  function ($scope, $state, DataFactory, UserFactory) {
    $scope.exchange = DataFactory.getExchange();
    $scope.account = UserFactory.getUserAccount();

    DataFactory.getBankAccounts().then(function(bankAccounts) {
      $scope.bankAccounts = bankAccounts;
    }, function() {
      // TODO: error
      alert('TODO: Error! Error!');
    });

    $scope.exchange.buy = function(){
      $state.go('exchangeOrderBuy');
    };

    $scope.exchange.sell = function(){
      $state.go('exchangeOrderSell');
    };

    $scope.exchange.addBankAccount = function(){
      $state.go('exchangeAddBankAccount');
    };

    $scope.exchange.addCreditCard = function(){
      $state.go('exchangeAddCreditCard');
    };
  }])
.controller('addAccountController', ['$scope', '$state', 'DataFactory', 'UserFactory',
  function ($scope, $state, DataFactory, UserFactory) {
    $scope.exchange = DataFactory.getExchange();
    $scope.account = UserFactory.getUserAccount();
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
.controller('editBankAccountController', ['$scope', '$state', '$stateParams', 'DataFactory', 'UserFactory',
  function ($scope, $state, $stateParams, DataFactory, UserFactory) {
    $scope.account = UserFactory.getUserAccount();
    DataFactory.getBankAccount($stateParams.uuid).then(function(bankAccount) {
      $scope.bankAccount = bankAccount;
    }, function() {
      // TODO!!!
      alert('Error!1!111!1');
    });

    $scope.deposit = {};
    $scope.verifyAccount = function() {
      DataFactory.verifyBankAccount(
          $scope.bankAccount.bankAccountUuid, $scope.deposit.amount1,
          $scope.deposit.amount2, $scope.bankAccount.description).then(function() {
        $state.go('exchange');
      }, function() {
        alert('TODO: Error! Error!');
      });
    };

    $scope.saveBankAccount = function() {
      DataFactory.updateBankAccount($scope.bankAccount).then(function() {
        $state.go('exchange');
      }, function() {
        // TODO: error
        alert('TODO: Error! Error!');
      });
    };

    $scope.deleteBankAccount = function() {
      DataFactory.deleteBankAccount('123456', $scope.bankAccount.bankAccountUuid).then(function() {
        $state.go('exchange');
      }, function() {
        alert('TODO: Error! Error!');
      });
    };
  }])
.controller('addCreditCardController', ['$scope', '$state', 'DataFactory', 'UserFactory',
  function ($scope, $state, DataFactory, UserFactory) {
    $scope.exchange = DataFactory.getExchange();
    $scope.account = UserFactory.getUserAccount();
  }])
.controller('orderBuyController', ['$scope', '$state', 'DataFactory', 'UserFactory',
  function ($scope, $state, DataFactory, UserFactory) {
    $scope.exchange = DataFactory.getExchange();
    $scope.account = UserFactory.getUserAccount();

    DataFactory.getBankAccounts().then(function(bankAccounts) {
      $scope.bankAccounts = bankAccounts;
      $scope.transferFromBankAccount = bankAccounts[0];
    }, function() {
      // TODO: error
      alert('TODO: Error! Error!');
    });

    DataFactory.getUserWallets().then(function(userWallets) {
      $scope.userWallets = userWallets;
      $scope.transferToWallet = userWallets[0]
    }, function(error) {
      $scope.error = 'Error: Cannot get user wallets.';
    });




    // ui toggle state setup
    $scope.outputSatoshi = true;
    $scope.prependSymbol = 'USD';
    $scope.placeholderValue = '20.00';


    // function for ui to switch input/output
    $scope.toggleOutputState = function() {
      $scope.outputSatoshi = !$scope.outputSatoshi;

      if($scope.outputSatoshi) {
        $scope.prependSymbol = 'USD';

      } else {
        $scope.prependSymbol = 'BTC';
      }

      $scope.orderValueInput = $scope.convertedOutput;
    };


    // convert user input to converted value for live display
    $scope.convertedValue = function(input) {
      if (typeof(input)==='undefined') input = 0;

      if($scope.outputSatoshi) {
        output = Airbitz.core.formatSatoshi(Airbitz.core.currencyToSatoshi(input, $scope.exchange.currencyNum), false);
      } else {
        output = Airbitz.core.formatCurrency(Airbitz.core.satoshiToCurrency(input, $scope.exchange.currencyNum), false);
      }

      return output;
    };





    $scope.exchange.reviewOrder = function(){
      $scope.exchange.order = {};
      $scope.exchange.order.type = 'Buy';
      $state.go('reviewOrder');
    };
  }])
.controller('orderSellController', ['$scope', '$state', 'DataFactory', 'UserFactory',
  function ($scope, $state, DataFactory, UserFactory) {
    $scope.exchange = DataFactory.getExchange();
    $scope.account = UserFactory.getUserAccount();

    DataFactory.getBankAccounts().then(function(bankAccounts) {
      $scope.bankAccounts = bankAccounts;
      $scope.transferFromBankAccount = bankAccounts[0];
    }, function() {
      // TODO: error
      alert('TODO: Error! Error!');
    });

    DataFactory.getUserWallets().then(function(userWallets) {
      $scope.userWallets = userWallets;
      $scope.transferToWallet = userWallets[0]
    }, function(error) {
      $scope.error = 'Error: Cannot get user wallets.';
    });
  }])
.controller('revirewOrderController', ['$scope', '$state', 'DataFactory', 'UserFactory',
  function ($scope, $state, DataFactory, UserFactory) {
    $scope.exchange = DataFactory.getExchange();
    $scope.account = UserFactory.getUserAccount();

    $scope.exchange.executeOrder = function(){
      alert('SEND ORDER TO GLIDERA VIA API');
      $state.go('executeOrder');
    };
  }])
.controller('executeOrderController', ['$scope', '$state', 'DataFactory', 'UserFactory',
  function ($scope, $state, DataFactory, UserFactory) {
    $scope.exchange = DataFactory.getExchange();
    $scope.account = UserFactory.getUserAccount();

    $scope.exchange.confirmDeposit = function(){
      $state.go('confirmDeposit');
    };
  }]);
