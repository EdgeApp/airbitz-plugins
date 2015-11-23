(function () {
  'use strict';

  angular
    .module('app.exchange', ['app.dataFactory', 'app.2fa', 'app.prices', 'app.limits', 'app.core'])
    .controller('orderController', ['$scope', '$state', '$stateParams', '$filter', 'Error', 'DataFactory', 'UserFactory', 'TwoFactor', 'Limits', 'Prices', orderController])
    .controller('reviewOrderController', ['$scope', '$state', 'Error', 'DataFactory', 'UserFactory', 'TwoFactor', 'Prices', reviewOrderController])
    .controller('executeOrderController', ['$scope', '$state', 'DataFactory', 'UserFactory', executeOrderController])
    .controller('transactionsController', ['$scope', '$state', 'DataFactory', 'UserFactory', transactionsController])
    .directive('accountSummary', accountSummary)
    .directive('routingNumberValidator', routingNumberValidator);

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
    });

    $scope.$on('DenominationChange', function(events, args){
      var btcValue = $scope.order.orderValueSatoshi / 100000000;
      $scope.$apply(function() {
        $scope.order.orderValueInput = parseFloat($filter('roundBtc')(btcValue));
        $scope.convertBtcValue(val);
      });
    });

    $scope.convertFiatValue = function(input) {
      if (typeof(input)==='undefined') input = 0;

      var price = ($scope.order.orderAction == 'buy')
                ? Prices.currentBuy.price : Prices.currentSell.price;
      var btcValue = input / parseFloat(price);
      var valueSatoshi = Math.floor(btcValue * 100000000);
      valueSatoshi = (Math.floor(valueSatoshi / 100) * 100)
      btcValue = valueSatoshi / 100000000;

      $scope.order.orderValueInput = parseFloat($filter('roundBtc')(btcValue));
      $scope.order.orderBtcInput = btcValue;
    };

    $scope.convertBtcValue = function(input) {
      if (typeof(input)==='undefined') input = 0;

      var price = ($scope.order.orderAction == 'buy')
          ? Prices.currentBuy.price : Prices.currentSell.price;
      var btc = $filter('valToBtc')(input);
      var output = btc * price;
      $scope.order.orderBtcInput = btc;
      $scope.order.orderValueSatoshi = btc * 100000000;
      $scope.order.orderFiatInput = parseFloat($filter('roundFiat')(parseFloat(output)));
    };
    $scope.next = function() {
      // Trim extra decimals off BTC amount
      try {
        $scope.order.orderBtcInput = parseFloat($scope.order.orderBtcInput).toFixed(8);
      } catch (e) {
        console.log('Unable to round btc input');
        console.log(JSON.stringify($scope.order));
      }
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
    var update = function() {
      $scope.priceObj = ($scope.order.orderAction == 'buy')
                      ? Prices.currentBuy : Prices.currentSell;
    };
    update();
    $scope.$on('PriceUpdate', function(events, args){
      update();
    })
    if (!order.orderAction) {
      $state.go('dashboard');
    }
    $scope.editOrder = function() {
      $state.go('exchangeOrder', {'orderAction': order.orderAction});
    };
    $scope.executeOrder = function() {
      console.log(JSON.stringify(order));
      var wallet = order.transferToWallet = Airbitz.currentWallet;
      var amountFiat = DataFactory.getExchange().currencyNum == wallet.currencyNum
                     ? order.orderFiatInput : 0;
      if (order.orderAction == 'buy') {
        DataFactory.buy(wallet, order.orderBtcInput, amountFiat).then(function(data) {
          Airbitz.ui.showAlert('Bought Bitcoin', 'You bought bitcoin!');
          $state.go('orderReceipt');
        }, Error.reject);
      } else {
        DataFactory.sell(wallet, order.orderBtcInput, amountFiat).then(function(data) {
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
  function transactionsController($scope, $state, DataFactory, UserFactory) {
    Airbitz.ui.title('Transaction History');
    DataFactory.getTransactions().then(function(transactions) {
      $scope.transactions = transactions;
    });

    $scope.logout = function() {
      UserFactory.clearUser();
      Airbitz.ui.exit();
    }
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
          var checksum = (7 * (s[0] + s[3] + s[6]) +
                      3 * (s[1] + s[4] + s[7]) +
                      9 * (s[2] + s[5])) % 10;
          return s[8] == checksum;
        }
      }
    };
  }
})();
