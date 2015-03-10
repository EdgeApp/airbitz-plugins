
angular.module('app.exchange', ['app.dataFactory', 'app.2fa'])
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
      Airbitz.ui.showAlert('Error', 'TODO: Error! Error!');
    });

    // $scope.exchange.buy = function(){
    //   $state.go('exchangeOrderBuy');
    // };

    // $scope.exchange.sell = function(){
    //   $state.go('exchangeOrderSell');
    // };

    $scope.exchange.addBankAccount = function(){
      $state.go('exchangeAddBankAccount');
    };

    $scope.exchange.addCreditCard = function(){
      $state.go('exchangeAddCreditCard');
    };
  }])
.controller('addAccountController',
  ['$scope', '$state', 'DataFactory', 'UserFactory', 'TwoFactor',
  function ($scope, $state, DataFactory, UserFactory, TwoFactor) {
    $scope.exchange = DataFactory.getExchange();
    $scope.account = UserFactory.getUserAccount();
    $scope.bankAccount = {};
    $scope.bankAccount.bankAccountType = 'CHECKING';

    $scope.saveBankAccount = function() {
      TwoFactor.showTwoFactor(function() {
        DataFactory.createBankAccount($scope.bankAccount).then(function() {
          $state.go('exchange');
        }, function() {
          Airbitz.ui.showAlert('Error', 'TODO: Error! Error!');
        });
      });
    };
  }])
.controller('editBankAccountController',
  ['$scope', '$state', '$stateParams', 'DataFactory', 'UserFactory', 'TwoFactor',
  function ($scope, $state, $stateParams, DataFactory, UserFactory, TwoFactor) {
    $scope.account = UserFactory.getUserAccount();
    DataFactory.getBankAccount($stateParams.uuid).then(function(bankAccount) {
      $scope.bankAccount = bankAccount;
    }, function() {
      Airbitz.ui.showAlert('Error', 'TODO: Error! Error!');
    });

    $scope.deposit = {};
    $scope.verifyAccount = function() {
      DataFactory.verifyBankAccount(
          $scope.bankAccount.bankAccountUuid, $scope.deposit.amount1,
          $scope.deposit.amount2, $scope.bankAccount.description).then(function() {
        $state.go('exchange');
      }, function() {
        Airbitz.ui.showAlert('Error', 'TODO: Error! Error!');
      });
    };

    $scope.saveBankAccount = function() {
      DataFactory.updateBankAccount($scope.bankAccount).then(function() {
        $state.go('exchange');
      }, function() {
        Airbitz.ui.showAlert('Error', 'TODO: Error! Error!');
      });
    };

    $scope.deleteBankAccount = function() {
      TwoFactor.showTwoFactor(function() {
        DataFactory.deleteBankAccount($scope.bankAccount.bankAccountUuid).then(function() {
          $state.go('exchange');
        }, function() {
          Airbitz.ui.showAlert('Error', 'TODO: Error! Error!');
        });
      });
    };
  }])

.controller('orderController',
  ['$scope', '$state', '$stateParams', 'DataFactory', 'UserFactory', 'TwoFactor',
  function ($scope, $state, $stateParams, DataFactory, UserFactory, TwoFactor) {
    $scope.exchange = DataFactory.getExchange();
    $scope.account = UserFactory.getUserAccount();

    $scope.order = DataFactory.getOrder(true); // initialize new order and clear existing order
    $scope.order.orderAction = $stateParams.orderAction; // set order action


    DataFactory.getBankAccounts().then(function(bankAccounts) {
      $scope.bankAccounts = bankAccounts;
      $scope.order.transferFromBankAccount = bankAccounts[0];
    }, function() {
      Airbitz.ui.showAlert('Error', 'TODO: Error! Error!');
    });

    DataFactory.getUserWallets().then(function(userWallets) {
      $scope.userWallets = userWallets;
      $scope.order.transferToWallet = userWallets[0]
    }, function(error) {
      $scope.error = 'Error: Cannot get user wallets.';
    });


    $scope.convertFiatValue = function(input) {
      // console.log('convert: ' + input + ' fiat to btc');
      if (typeof(input)==='undefined') input = 0;

      output = Airbitz.core.formatSatoshi(
        Airbitz.core.currencyToSatoshi(input, $scope.exchange.currencyNum), false
      );

      $scope.order.orderBtcInput = output;
    };

    $scope.convertBtcValue = function(input) {
      // console.log(input + ' satoshi = ' + input / 100000000 + ' BTC');
      if (typeof(input)==='undefined') input = 0;
      // convert to btc before currency conversion to match ui
      input = input * 100000000;

      output = Airbitz.core.formatCurrency(
        Airbitz.core.satoshiToCurrency(input, $scope.exchange.currencyNum), false
      );
      $scope.order.orderFiatInput = output;
    };
    $scope.next = function() {
      TwoFactor.showTwoFactor(function() {
        $state.go("reviewOrder");
      });
    };
  }])

.controller('reviewOrderController', ['$scope', '$state', 'DataFactory', 'UserFactory', 'TwoFactor',
  function ($scope, $state, DataFactory, UserFactory, TwoFactor) {
    var order = DataFactory.getOrder(false);
    console.log(JSON.stringify(order));
    $scope.order = order;
    $scope.exchange = DataFactory.getExchange();
    $scope.account = UserFactory.getUserAccount();
    if (!order.orderAction) {
      $state.go('exchange');
    }
    $scope.exchange.executeOrder = function() {
      console.log(JSON.stringify(order));
      if (order.orderAction == 'buy') {
        DataFactory.buy(order.transferToWallet, order.orderBtcInput).then(function() {
          Airbitz.ui.showAlert('Bought Bitcoin', 'You bought bitcoin!');
          $state.go('exchange');
        }, function(error) {
          Airbitz.ui.showAlert('Error', error);
        });
      } else {
        DataFactory.requestSpend(order.transferFromWallet, order.orderBtcInput).then(function() {
          Airbitz.ui.showAlert('Bought Bitcoin', 'You sold bitcoin!');
          $state.go('exchange');
        }, function(error) {
          Airbitz.ui.showAlert('Error', error);
        });
      }
    };
  }])
.controller('executeOrderController', ['$scope', '$state', 'DataFactory', 'UserFactory',
  function ($scope, $state, DataFactory, UserFactory) {
    $scope.exchange = DataFactory.getExchange();
    $scope.account = UserFactory.getUserAccount();

    $scope.exchange.confirmDeposit = function(){
      $state.go('confirmDeposit');
    };
  }])
.controller('transactionsController', ['$scope', '$state', 'DataFactory',
  function ($scope, $state, DataFactory) {
    // $scope.transactions = DataFactory.getTransactions();
    // console.log('TRANSACTIONS: ' + $scope.transactions);
    DataFactory.getTransactions().then(function(transactions) {
      $scope.transactions = transactions;
    })

  }]);













