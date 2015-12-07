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
      'reject': reject,
      'errorMap': errorMap
    };
    return factory;

    function errorMap(res) {
      if (res.error) {
        return res.error;
      } else {
        return '';
      }
    }

    function reject(res) {
      console.log(res);
      if (res.error) {
        Airbitz.ui.showAlert('Error', res.error);
      } else {
        Airbitz.ui.showAlert('Error', 'An unknown error occurred.');
      }
    }
  }

})();
