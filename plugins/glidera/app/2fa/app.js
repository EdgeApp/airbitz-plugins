
angular.module('app.2fa', ['app.dataFactory', 'app.glidera']).
controller('verify2faController', ['$scope', '$state', 'DataFactory', 'UserFactory', 'TwoFactor',
  function ($scope, $state, DataFactory, UserFactory, TwoFactor) {
    $scope.exchange = DataFactory.getExchange();
    $scope.account = UserFactory.getUserAccount();

    var requestCode = function() {
      TwoFactor.requestCode(function() {
        // Success, do nothing
      }, function(error) {
        alert(error);
      });
    };
    $scope.submit2FA = function() {
      TwoFactor.finish($scope.verificationCode);
    };
    $scope.resendSMS = function(phone){
      requestCode();
    };
    requestCode();
  }]).
factory('TwoFactor', ['$state', '$q', 'glideraFactory',
  function($state, $q, glideraFactory) {
    var code = '';
    var nextAction = null;
    return {
      showTwoFactor: function(finishedCallback) {
        this.nextAction = finishedCallback;
        $state.go('verify2FA');
      },
      getNext: function() {
        return this.nextAction;
      },
      requestCode: function() {
        return $q(function(resolve, reject) {
          glideraFactory.getTwoFactorCode(function(e, r, b) {
            r == 200 ? resolve(b) : reject(b);
          });
        });
      },

      finish: function(c) {
        this.code = c;
        if (this.nextAction) {
          this.nextAction();
        }
      },
      getCode: function() {
        return this.code;
      }
    }
  }]);
