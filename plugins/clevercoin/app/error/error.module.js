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
        if (typeof res.error == 'string') {
          return res.error;
        } else if (typeof res.error == 'object') { 
          var s = '';
          for (var i in res.error) {
            s += res.error[i] + '\n';
          }
          return s.trim();
        } else {
          return '';
        }
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
