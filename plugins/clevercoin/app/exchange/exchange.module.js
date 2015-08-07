(function () {
  'use strict';

  angular
    .module('app.exchange', ['app.dataFactory', 'app.prices', 'app.core'])
    .controller('orderController', ['$scope', '$state', '$stateParams', '$filter', 'Error', 'DataFactory', 'UserFactory', 'Prices', orderController])
    .controller('reviewOrderController', ['$scope', '$state', 'Error', 'DataFactory', 'UserFactory', 'Prices', reviewOrderController])
    .controller('executeOrderController', ['$scope', '$state', 'DataFactory', 'UserFactory', executeOrderController]);

  function orderController($scope, $state, $stateParams, $filter, Error, DataFactory, UserFactory, Prices) {
    $scope.account = UserFactory.getUserAccount();
    $scope.order = DataFactory.getOrder(false); // initialize new order and clear existing order
    $scope.order.orderAction = $stateParams.orderAction; // set order action

    if ($scope.order.orderAction == 'buy') {
      Airbitz.ui.title('Buy Bitcoin');
    } else {
      Airbitz.ui.title('Sell Bitcoin');
    }

    Prices.setBuyQty(1).then(function() {
      Prices.setSellQty(1);
    }).then(function() {
      return DataFactory.getUserWallets().then(function(userWallets) {
        $scope.userWallets = userWallets;
        $scope.order.transferToWallet = userWallets[0]
      }, Error.reject);
    });

    $scope.convertFiatValue = function(input) {
      if (typeof(input)==='undefined') input = 0;

      var price = ($scope.order.orderAction == 'buy')
                ? Prices.currentBuy.ask : Prices.currentSell.ask;
      var btcValue = input / parseFloat(price);
      $scope.order.orderBtcInput = parseFloat($filter('roundBtc')(btcValue));
    };

    $scope.convertBtcValue = function(input) {
      if (typeof(input)==='undefined') input = 0;

      var price = ($scope.order.orderAction == 'buy')
          ? Prices.currentBuy.ask : Prices.currentSell.ask;
      var output = input * price;
      $scope.order.orderFiatInput = parseFloat($filter('roundFiat')(parseFloat(output)));
    };
    $scope.next = function() {
      $state.go("reviewOrder");
    };
  }
  function reviewOrderController($scope, $state, Error, DataFactory, UserFactory, Prices) {
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
        DataFactory.buy(order.orderBtcInput).then(function(data) {
          Airbitz.ui.showAlert('Bought Bitcoin', 'You bought bitcoin!');
          $state.go('orderReceipt');
        }, Error.reject);
      } else {
        DataFactory.sell(order.orderBtcInput).then(function(data) {
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
})();
