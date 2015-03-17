
angular.module('app.exchange', ['app.dataFactory', 'app.2fa', 'app.prices', 'app.limits', 'app.core'])
.controller('homeController', ['$scope', '$state', 'DataFactory', 'UserFactory',
  function ($scope, $state, DataFactory, UserFactory) {
    $scope.exchange = DataFactory.getExchange();
    $scope.account = UserFactory.getUserAccount();
  }])
.controller('dashboardController', ['$scope', '$sce', '$state', 'Error', 'DataFactory', 'UserFactory', 'Limits',
  function ($scope, $sce, $state, Error, DataFactory, UserFactory, Limits) {
    Airbitz.ui.title('Glidera');
    // set variables that might be cached locally to make sure they load faster if available
    $scope.exchange = DataFactory.getExchange();
    $scope.account = UserFactory.getUserAccount();
    $scope.userStatus = UserFactory.getUserAccountStatus();
    $scope.showOptions = !$scope.userStatus.userCanTransact;
    $scope.showDebug = false;
    $scope.debugClicks = 0;

    UserFactory.fetchUserAccountStatus().then(function(b) {
      $scope.userStatus = b;
      $scope.showOptions = !$scope.userStatus.userCanTransact;
    });

    $scope.limits = Limits.getLimits();
    Limits.fetchLimits().then(function(limits) {
      $scope.limits = limits;
    });

    $scope.bankAccounts = DataFactory.getBankAccounts();
    DataFactory.fetchBankAccounts().then(function(bankAccounts) {
      $scope.bankAccounts = bankAccounts;
    }, Error.reject);

    $scope.routeBankAccount = function() {
      if ($scope.bankAccounts.length) {
        var bankAccount = $scope.bankAccounts[0]; // get first bank account if available
        if(bankAccount.status == 'Pending') {
          $state.go('exchangeVerifyBankAccount', {'uuid': bankAccount.bankAccountUuid});
        } else {
          $state.go('exchangeEditBankController', {'uuid': bankAccount.bankAccountUuid});
        }
      } else {
        $state.go('exchangeAddBankAccount')
      }
    };

    $scope.regMessage = function() {
      var msg = '';
      var counter = 0;

      if (!$scope.userStatus.userEmailIsSetup) {
        counter++;
        msg += '<h5><strong>' + counter + "</strong>. Please verify email</h5>";
      }
      if (!$scope.userStatus.userBasicInfoIsSetup) {
        counter++;
        msg += '<h5><strong>' + counter + "</strong>. Please verify account info</h5>";
      }
      if (!$scope.userStatus.userPhoneIsSetup) {
        counter++;
        msg += '<h5><strong>' + counter + "</strong>. Please verify mobile phone</h5>";
      }
      if (!$scope.userStatus.userBankAccountIsSetup) {
        counter++;
        msg += '<h5><strong>' + counter + "</strong>. Please verify bank account & deposit amount</h5>";
      }
      if (msg !== '') {
        msg = '<h4 style="margin-top: 0;">To Buy or Sell Bitcoin:</h4>' + msg;
      }
      return $sce.trustAsHtml(msg);
    };

    $scope.buy = function(){
      DataFactory.getOrder(true);
      $state.go('exchangeOrder', {'orderAction': 'buy'});
    };

    $scope.sell = function(){
      DataFactory.getOrder(true);
      $state.go('exchangeOrder', {'orderAction': 'sell'});
    };

    $scope.showAccountOptions = function() {
      $scope.showOptions = !$scope.showOptions;
    };

    $scope.showAccountDebug = function() {
      $scope.debugClicks++
      console.log('TOGGLE DEBUG');
      if($scope.debugClicks++ > 7) {
        $scope.showDebug = !$scope.showDebug;
      }
    };

    $scope.addBankAccount = function(){
      $state.go('exchangeAddBankAccount');
    };
  }])
.controller('addBankAccountController',
  ['$scope', '$state', 'Error', 'DataFactory', 'UserFactory', 'TwoFactor',
  function ($scope, $state, Error, DataFactory, UserFactory, TwoFactor) {
    Airbitz.ui.title('Add Bank Account');
    $scope.exchange = DataFactory.getExchange();
    $scope.account = UserFactory.getUserAccount();
    $scope.bankAccount = {};
    $scope.bankAccount.bankAccountType = 'CHECKING';

    $scope.saveBankAccount = function() {
      TwoFactor.showTwoFactor(function() {
        DataFactory.createBankAccount($scope.bankAccount).then(function() {
          $state.go('exchange');
        }, Error.reject);
      });
    };
  }])
.controller('verifyBankAccountController',
  ['$scope', '$state', '$stateParams', 'Error', 'DataFactory', 'UserFactory', 'TwoFactor',
  function ($scope, $state, $stateParams, Error, DataFactory, UserFactory, TwoFactor) {
    Airbitz.ui.title('Verify Bank Account');
    $scope.account = UserFactory.getUserAccount();
    $scope.bankAccount = DataFactory.getBankAccount($stateParams.uuid);

    DataFactory.fetchBankAccount($stateParams.uuid).then(function(bankAccount) {
        $scope.bankAccount = bankAccount;
      }, Error.reject);

    $scope.deposit = {};
    $scope.verifyAccount = function() {
      DataFactory.verifyBankAccount(
        $scope.bankAccount.bankAccountUuid,
        $scope.deposit.amount1
      )
      .then(function() {
        $state.go('exchange');
      }, Error.reject);
    };
  }])
.controller('editBankAccountController',
  ['$scope', '$state', '$stateParams', 'Error', 'DataFactory', 'UserFactory', 'TwoFactor',
  function ($scope, $state, $stateParams, Error, DataFactory, UserFactory, TwoFactor) {
    Airbitz.ui.title('Edit Bank Account');
    $scope.account = UserFactory.getUserAccount();
    $scope.bankAccount = DataFactory.getBankAccount($stateParams.uuid);
    DataFactory.fetchBankAccount($stateParams.uuid).then(function(bankAccount) {
      $scope.bankAccount = bankAccount;
    }, Error.reject);

    $scope.saveBankAccount = function() {
      DataFactory.updateBankAccount($scope.bankAccount).then(function() {
        Airbitz.ui.showAlert('Saved', 'Bank account information has been updated.');
        $state.go('exchange');
      }, Error.reject);
    };

    $scope.deleteBankAccount = function() {
      TwoFactor.showTwoFactor(function() {
        DataFactory.deleteBankAccount($scope.bankAccount.bankAccountUuid).then(function() {
          Airbitz.ui.showAlert('Bank Account Deleted', $scope.bankAccount.description + ' deleted');
          $state.go('exchange');
        }, Error.reject);
      });
    };
  }])

.controller('orderController',
  ['$scope', '$state', '$stateParams', 'Error', 'DataFactory', 'UserFactory', 'TwoFactor', 'Limits',
  function ($scope, $state, $stateParams, Error, DataFactory, UserFactory, TwoFactor, Limits) {
    Airbitz.ui.title('Place Order');
    $scope.exchange = DataFactory.getExchange();
    $scope.account = UserFactory.getUserAccount();

    $scope.limits = Limits.getLimits();
    Limits.fetchLimits().then(function(limits) {
      $scope.limits = limits;
    });

    $scope.order = DataFactory.getOrder(false); // initialize new order and clear existing order
    $scope.order.orderAction = $stateParams.orderAction; // set order action

    $scope.bankAccounts = DataFactory.getBankAccounts();
    DataFactory.fetchBankAccounts().then(function(bankAccounts) {
      $scope.bankAccounts = bankAccounts;
      $scope.order.transferFromBankAccount = bankAccounts[0];
    }, Error.reject);

    DataFactory.getUserWallets().then(function(userWallets) {
      $scope.userWallets = userWallets;
      $scope.order.transferToWallet = userWallets[0]
    }, Error.reject);


    $scope.convertFiatValue = function(input) {
      // console.log('convert: ' + input + ' fiat to btc');
      if (typeof(input)==='undefined') input = 0;

      output = Airbitz.core.formatSatoshi(
        Airbitz.core.currencyToSatoshi(input, $scope.exchange.currencyNum), false
      );

      $scope.order.orderBtcInput = parseFloat(output);
    };

    $scope.convertBtcValue = function(input) {
      // console.log(input + ' satoshi = ' + input / 100000000 + ' BTC');
      if (typeof(input)==='undefined') input = 0;
      // convert to btc before currency conversion to match ui
      input = input * 100000000;

      output = Airbitz.core.formatCurrency(
        Airbitz.core.satoshiToCurrency(input, $scope.exchange.currencyNum), false
      );
      $scope.order.orderFiatInput = parseFloat(output);
    };
    $scope.next = function() {
      if ($scope.order.orderAction == 'buy' && !Limits.isBuyAllowed($scope.order.orderBtcInput)) {
        Airbitz.ui.showAlert('Error', 'The buy limit will be exceeded. Please reduce your buy amount.');
        return;
      } else if ($scope.order.orderAction == 'sell' && !Limits.isSellAllowed($scope.order.orderBtcInput)) {
        Airbitz.ui.showAlert('Error', 'The sell limit will be exceeded. Please reduce your sell amount.');
        return;
      }
      TwoFactor.showTwoFactor(function() {
        $state.go("reviewOrder");
      });
    };
  }])

.controller('reviewOrderController', ['$scope', '$state', 'Error', 'DataFactory', 'UserFactory', 'TwoFactor',
  function ($scope, $state, Error, DataFactory, UserFactory, TwoFactor) {
    var order = DataFactory.getOrder(false);
    console.log(JSON.stringify(order));
    $scope.order = order;
    $scope.exchange = DataFactory.getExchange();
    $scope.account = UserFactory.getUserAccount();
    if (!order.orderAction) {
      $state.go('exchange');
    }
    $scope.editOrder = function() {
      $state.go('exchangeOrder', {'orderAction': order.orderAction});
    };
    $scope.executeOrder = function() {
      console.log(JSON.stringify(order));
      if (order.orderAction == 'buy') {
        DataFactory.buy(order.transferToWallet, order.orderBtcInput, order.orderFiatInput).then(function(data) {
          Airbitz.ui.showAlert('Bought Bitcoin', 'You bought bitcoin!');
          $state.go('orderReceipt');
        }, Error.reject);
      } else {
        DataFactory.sell(order.transferToWallet, order.orderBtcInput, order.orderFiatInput).then(function(data) {
          Airbitz.ui.showAlert('Sold Bitcoin', 'You sold bitcoin!');
          $state.go('orderReceipt');
        }, Error.reject);
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

  }]).
directive('accountSummary', [function() {
  return {
    templateUrl: 'app/user/partials/account.html'
  };
}]).
directive('routingNumberValidator', [function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.routingNumber = function(mv) {
        if (!mv || !mv.toString().match(/^\d{9}$/)) {
          return false;
        }
        var s = mv.toString().split('').map(function(i) {
          return parseInt(i);
        });
        checksum = (7 * (s[0] + s[3] + s[6]) +
                    3 * (s[1] + s[4] + s[7]) +
                    9 * (s[2] + s[5])) % 10;
        return s[8] == checksum;
      }
    }
  };
}]);
