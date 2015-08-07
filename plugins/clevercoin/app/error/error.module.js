(function (){
  'use strict';

  angular
    .module('app.error', [])
    .factory('Error', ['$state', errorService])
    .controller('errorController', ['$scope', '$state', '$stateParams', errorController]);

  function errorController($scope, $state, $stateParams) {
    $scope.title = 'Authentication Error';
    $scope.message = 'Please try again.';
    $scope.refresh = function() {
      $state.go('exchange');
    }
  }

  function errorService($state) {
    var factory = {
      'reject': reject
    };
    return factory;

    function reject(res) {
      Airbitz.ui.showAlert('Error', 'An unknown error occurred.');
    }
  }

})();
