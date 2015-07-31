(function() {
  'use strict';

  angular.module('app.receipt', ['app.dataFactory'])
    .controller('receiptController',
      ['$scope','$state', 'DataFactory', 'UserFactory', receiptController]);

  function receiptController($scope, $state, DataFactory, UserFactory) {
    Airbitz.ui.title('Order Receipt');
    $scope.order = DataFactory.getOrder(false);
    $scope.account = UserFactory.getUserAccount();
    $scope.finish = function() {
      $state.go('dashboard');
    };
  }
})();
