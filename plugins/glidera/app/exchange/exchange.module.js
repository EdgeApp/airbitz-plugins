(function () {
  'use strict';

  angular
    .module('app.exchange', ['app.dataFactory', 'app.2fa', 'app.prices', 'app.limits', 'app.core'])
    .controller('dashboardController', ['$scope', '$sce', '$state', 'Error', 'DataFactory', 'UserFactory', 'Limits', dashboardController])
    .controller('addBankAccountController', ['$scope', '$state', 'Error', 'DataFactory', 'UserFactory', 'TwoFactor', addBankAccountController])
    .controller('verifyBankAccountController', ['$scope', '$state', '$stateParams', 'Error', 'DataFactory', 'UserFactory', 'TwoFactor', verifyBankAccountController])
    .controller('editBankAccountController', ['$scope', '$state', '$stateParams', 'Error', 'DataFactory', 'UserFactory', 'TwoFactor', editBankAccountController])
    .controller('orderController', ['$scope', '$state', '$stateParams', '$filter', 'Error', 'DataFactory', 'UserFactory', 'TwoFactor', 'Limits', 'Prices', orderController])
    .controller('reviewOrderController', ['$scope', '$state', 'Error', 'DataFactory', 'UserFactory', 'TwoFactor', 'Prices', reviewOrderController])
    .controller('executeOrderController', ['$scope', '$state', 'DataFactory', 'UserFactory', executeOrderController])
    .controller('transactionsController', ['$scope', '$state', 'DataFactory', transactionsController])
    .directive('accountSummary', accountSummary)
    .directive('routingNumberValidator', routingNumberValidator);

  function dashboardController($scope, $sce, $state, Error, DataFactory, UserFactory, Limits) {
    Airbitz.ui.title('Buy/Sell Bitcoin');
    // set variables that might be cached locally to make sure they load faster if available
    $scope.account = UserFactory.getUserAccount();
    $scope.userStatus = UserFactory.getUserAccountStatus();
    $scope.bankAccounts = DataFactory.getBankAccounts();
    $scope.limits = Limits.getLimits();
    $scope.showOptions = !$scope.userStatus.userCanTransact;
    $scope.showDebug = false;
    $scope.debugClicks = 0;

    UserFactory.fetchUserAccountStatus().then(function(b) {
      $scope.userStatus = b;
      $scope.showOptions = !$scope.userStatus.userCanTransact;
    }).then(function() {
      return Limits.fetchLimits().then(function(limits) {
        $scope.limits = limits;
      });
    }).then(function() {
      return DataFactory.fetchBankAccounts().then(function(bankAccounts) {
        $scope.bankAccounts = bankAccounts;
      }, Error.reject);
    });

    $scope.routeBankAccount = function() {
      if ($scope.bankAccounts.length) {
        var bankAccount = $scope.bankAccounts[0]; // get first bank account if available
        if (bankAccount.status === 'Pending Verification') {
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
  }
  function addBankAccountController($scope, $state, Error, DataFactory, UserFactory, TwoFactor) {
    Airbitz.ui.title('Add Bank Account');
    $scope.account = UserFactory.getUserAccount();
    $scope.bankAccount = {};
    $scope.bankAccount.bankAccountType = 'CHECKING';

    $scope.saveBankAccount = function() {
      var accountDepositText = "Please check your bank account in the next 24 to 48 hours for a small deposit from Glidera to complete the bank account verification process.";
      var account = $scope.bankAccount.accountNumber;
      var accountSuffix = account.substr(account.length - 4);
      $scope.bankAccount.description = $scope.bankAccount.bankAccountType + " - " + accountSuffix; // auto generate description

      TwoFactor.showTwoFactor(function() {
        DataFactory.createBankAccount($scope.bankAccount).then(function() {
          Airbitz.ui.showAlert('Bank Account Added', accountDepositText);
          $state.go('exchange');
        }, Error.reject);
      });
    };
  }
  function verifyBankAccountController($scope, $state, $stateParams, Error, DataFactory, UserFactory, TwoFactor) {
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
  }
  function editBankAccountController($scope, $state, $stateParams, Error, DataFactory, UserFactory, TwoFactor) {
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
        }, function(res) {
          if (res && res.message && res.message.match(/2FACode/i)) {
            Airbitz.ui.showAlert('Unauthorized', 'Invalid 2 Factor code.');
            TwoFactor.reset();
            $state.go('exchangeEditBankController', {'uuid': $stateParams.uuid});
          } else {
            Error.reject(res);
          }
        });
      });
    };
  }
  function orderController($scope, $state, $stateParams, $filter, Error, DataFactory, UserFactory, TwoFactor, Limits, Prices) {
    $scope.account = UserFactory.getUserAccount();
    $scope.limits = Limits.getLimits();
    $scope.order = DataFactory.getOrder(false); // initialize new order and clear existing order
    $scope.order.orderAction = $stateParams.orderAction; // set order action

    if ($scope.order.orderAction == 'buy') {
      Airbitz.ui.title('Buy Bitcoin');
    } else {
      Airbitz.ui.title('Sell Bitcoin');
    }

    Limits.fetchLimits().then(function(limits) {
      $scope.limits = limits;
    }).then(function() {
      return Prices.setBuyQty(1).then(function() {
        Prices.setSellQty(1);
      });
    }).then(function() {
      return DataFactory.getUserWallets().then(function(userWallets) {
        $scope.userWallets = userWallets;
        $scope.order.transferToWallet = userWallets[0]
      }, Error.reject);
    });

    $scope.convertFiatValue = function(input) {
      if (typeof(input)==='undefined') input = 0;

      var price = ($scope.order.orderAction == 'buy')
                ? Prices.currentBuy.price : Prices.currentSell.price;
      var btcValue = input / parseFloat(price);
      $scope.order.orderBtcInput = parseFloat($filter('roundBtc')(btcValue));
    };

    $scope.convertBtcValue = function(input) {
      if (typeof(input)==='undefined') input = 0;

      var price = ($scope.order.orderAction == 'buy')
          ? Prices.currentBuy.price : Prices.currentSell.price;
      output = input * price;
      $scope.order.orderFiatInput = parseFloat($filter('roundFiat')(parseFloat(output)));
    };
    $scope.next = function() {
      if ($scope.order.orderAction == 'buy' && !Limits.isBuyAllowed($scope.order.orderBtcInput)) {
        Airbitz.ui.showAlert('Error', 'The buy limit will be exceeded. Please reduce your buy amount.');
        return;
      } else if ($scope.order.orderAction == 'sell' && !Limits.isSellAllowed($scope.order.orderBtcInput)) {
        Airbitz.ui.showAlert('Error', 'The sell limit will be exceeded. Please reduce your sell amount.');
        return;
      }
      var d = $scope.order.orderAction == 'buy' ? Prices.setBuyQty($scope.order.orderBtcInput) : Prices.setSellQty($scope.order.orderBtcInput);
      d.then(function() {
        TwoFactor.showTwoFactor(function() {
          $state.go("reviewOrder");
        });
      });
    };
  }
  function reviewOrderController($scope, $state, Error, DataFactory, UserFactory, TwoFactor, Prices) {
    var order = DataFactory.getOrder(false);
    Airbitz.ui.title('Confirm Order');
    $scope.order = order;
    $scope.account = UserFactory.getUserAccount();
    $scope.priceObj = ($scope.order.orderAction == 'buy')
                    ? Prices.currentBuy : Prices.currentSell;
    if (!order.orderAction) {
      $state.go('exchange');
    }
    $scope.editOrder = function() {
      $state.go('exchangeOrder', {'orderAction': order.orderAction});
    };
    $scope.executeOrder = function() {
      console.log(JSON.stringify(order));
      var amountFiat = DataFactory.getExchange().currencyNum == order.transferToWallet.currencyNum
                     ? order.orderFiatInput : 0;
      if (order.orderAction == 'buy') {
        DataFactory.buy(order.transferToWallet, order.orderBtcInput, amountFiat).then(function(data) {
          Airbitz.ui.showAlert('Bought Bitcoin', 'You bought bitcoin!');
          $state.go('orderReceipt');
        }, Error.reject);
      } else {
        DataFactory.sell(order.transferToWallet, order.orderBtcInput, amountFiat).then(function(data) {
          Airbitz.ui.showAlert('Sold Bitcoin', 'You sold bitcoin!');
          $state.go('orderReceipt');
        }, Error.reject);
      }
    };
  }
  function executeOrderController($scope, $state, DataFactory, UserFactory) {
    $scope.account = UserFactory.getUserAccount();

    $scope.exchange.confirmDeposit = function(){
      $state.go('confirmDeposit');
    };
  }
  function transactionsController($scope, $state, DataFactory) {
    DataFactory.getTransactions().then(function(transactions) {
      $scope.transactions = transactions;
    })
  }
  function accountSummary() {
    return {
      templateUrl: 'app/user/partials/account.html'
    };
  }
  function routingNumberValidator() {
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
  }
})();
