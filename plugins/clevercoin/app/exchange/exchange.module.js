(function () {
  'use strict';

  angular
    .module('app.exchange', ['app.dataFactory', 'app.prices', 'app.core'])
    .controller('orderController', ['$scope', '$state', '$stateParams', '$filter', 'Error', 'DataFactory', 'UserFactory', 'Prices', orderController])
    .controller('reviewOrderController', ['$scope', '$state', 'Error', 'DataFactory', 'UserFactory', 'Prices', reviewOrderController])
    .controller('executeOrderController', ['$scope', '$state', 'DataFactory', 'UserFactory', executeOrderController])
    .controller('receiptController', ['$scope', '$state', 'DataFactory', 'UserFactory', receiptController]);

  function orderController($scope, $state, $stateParams, $filter, Error, DataFactory, UserFactory, Prices) {
    $scope.account = UserFactory.getUserAccount();
    $scope.order = DataFactory.getOrder(false); // initialize new order and clear existing order
    $scope.order.orderAction = $stateParams.orderAction; // set order action

    if ($scope.order.orderAction == 'buy') {
      Airbitz.ui.title('Buy Bitcoin');
      $scope.order.paymentMethod = {"name":"Wallet","lockDuration":0,"type":"pull"};
    } else {
      Airbitz.ui.title('Sell Bitcoin');
       $scope.order.paymentMethod = {"name":"DirectDeposit","lockDuration":1,"type":"pull"};
    }

    Prices.setBuyQty(1).then(function() {
      Prices.setSellQty(1);
    });

    $scope.convertFiatValue = function(input) {
      var d = Prices.convertFiatValue($scope.order.orderAction, input);
      $scope.order.orderValueSatoshi = d.orderValueSatoshi;
      $scope.order.orderValueInput = d.orderValueInput;
      $scope.order.orderBtcInput = d.orderBtcInput;
    };

    $scope.convertBtcValue = function(input) {
      var d = Prices.convertBtcValue($scope.order.orderAction, input);
      $scope.order.orderBtcInput = d.orderBtcInput;
      $scope.order.orderValueSatoshi = d.orderValueSatoshi;
      $scope.order.orderFiatInput = d.orderFiatInput;
    };
    $scope.next = function() {
      if ($scope.order.orderFiatInput < 1.0) {
        Airbitz.ui.showAlert('', 'Orders must be greater than 1 Euro.');
      } else {
        Airbitz.ui.showAlert('', 'Requesting quote...', { 'showSpinner': true });
        var $amount = 0;
        var $currency = "BTC";

        // Check if Euro value has not more than 2 digits
        var $pattern = /^\d(\.\d{1,2})?$/;
        if ($pattern.test($scope.order.orderFiatInput)) {  //buy/sell as Euros
          $amount = parseFloat($scope.order.orderFiatInput).toFixed(2);
          $currency = "EUR"
        }
        else  // buy/sell as Bitcoins
        {
          $amount = parseFloat($scope.order.orderBtcInput).toFixed(8);
          $currency = "BTC"
        }
        DataFactory.requestExchange($amount, $currency, $scope.order.paymentMethod.name).then(function(data) {
          Airbitz.ui.hideAlert();
          $scope.order.quote = data;
          $state.go("reviewOrder");
        }, function(b) {
          Airbitz.ui.showAlert('', 'Unable to receive quote. ' + Error.errorMap(b));
        });
      }
    };
  }
  function reviewOrderController($scope, $state, Error, DataFactory, UserFactory, Prices) {
    var order = DataFactory.getOrder(false);
    Airbitz.ui.title('Confirm Order');
    $scope.order = order;
    $scope.account = UserFactory.getUserAccount();
    if (!order.orderAction) {
      $state.go('dashboard');
    }
    $scope.editOrder = function() {
      $state.go('exchangeOrder', {'orderAction': order.orderAction});
    };
    $scope.executeOrder = function() {
      if (order.orderAction == 'buy') {
        Airbitz.ui.showAlert('', 'Placing order...', { 'showSpinner': true });
        DataFactory.confirmBuy(order.quote.linkOrCode).then(function(data) {
          Airbitz.ui.showAlert('Bought Bitcoin', 'You bought bitcoin!');
          $state.go('orderReceipt');
        }, Error.reject);
      } else {
        DataFactory.confirmSell(order.quote.linkOrCode, order.quote.toPay, order.quote.amount).then(function(data) {
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
  function receiptController($scope, $state, DataFactory, UserFactory) {
    Airbitz.ui.title('Order Receipt');
    $scope.order = DataFactory.getOrder(false);
    $scope.account = UserFactory.getUserAccount();
    $scope.finish = function() {
      $state.go('dashboard');
    };
  }
})();
