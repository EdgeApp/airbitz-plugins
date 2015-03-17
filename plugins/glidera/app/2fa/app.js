(function() {
  'use strict';

  angular.module('app.2fa', ['app.dataFactory', 'app.glidera'])
    .controller('verify2faController',
      ['$scope','$state', '$stateParams', 'DataFactory', 'UserFactory', 'TwoFactor', otpController])
    .factory('TwoFactor',
      ['$state', '$q', 'glideraFactory', otpFactory])
    .directive('autofocus', ['$document', function($document) {
      return {
        link: function($scope, $element, attrs) {
          setTimeout(function() {
            $element[0].focus();
          }, 100);
        }
      };
    }]);

  function otpController($scope, $state, $stateParams, DataFactory, UserFactory, TwoFactor) {
    Airbitz.ui.title('2 Factor Verification');
    $scope.exchange = DataFactory.getExchange();
    $scope.account = UserFactory.getUserAccount();
    $scope.hasNumber = false;

    var requestCode = function() {
      UserFactory.fetchUserAccountStatus().then(function(userStatus) {
        if ($stateParams.confirmNumber == 'confirm' && userStatus.userPhoneIsSetup) {
          $scope.hasNumber = true;
        }
        TwoFactor.requestCode().then(function() { }, function(error) {
          $state.go('exchange');
          Airbitz.ui.showAlert('Error', 'Unable to request 2fa token. Please retry again later.');
        });
      });
    };
    $scope.submit2FA = function() {
      TwoFactor.finish($scope.verificationCode, $scope.oldVerificationCode);
    };
    $scope.resendSMS = function(phone){
      requestCode();
    };
    requestCode();
  }

  function otpFactory($state, $q, glideraFactory) {
      var code = '';
      var oldCode = '';
      var lastFetch = null;
      var nextAction = function() { };
      var factory = {};
      var that = this;
      factory.cached = function() {
        if (!that.lastFetch || !that.code) {
          return false;
        }
        // if the code is less than 2 minutes old, don't ask for 2fa
        return ((new Date().getTime() - that.lastFetch.getTime()) / 1000.0) <= 2 * 60;
      };
      factory.confirmTwoFactor = function(finishedCallback) {
        if (finishedCallback) {
          that.nextAction = finishedCallback;
        }
        $state.go('verify2FA', {'confirmNumber': 'confirm'});
      };
      factory.showTwoFactor = function(finishedCallback) {
        if (factory.cached())  {
          finishedCallback(that.code);
        } else {
          if (finishedCallback) {
            that.nextAction = finishedCallback;
          }
          $state.go('verify2FA', {'confirmNumber': ''});
        }
      };
      factory.requestCode = function() {
        var d = $q.defer();
        glideraFactory.getTwoFactorCode(function(e, r, b) {
          that.lastFetch = new Date();
          r >= 200 && r < 300 ? d.resolve(b) : d.reject(b);
        });
        return d.promise;
      };
      factory.reset = function() {
        that.lastFetch = null;
        that.code = '';
      };
      factory.finish = function(c, o) {
        that.code = c;
        that.oldCode = o;
        if (that.nextAction) {
          that.nextAction();
        }
      };
      factory.getCode = function() {
        return that.code;
      };
      factory.getOldCode = function() {
        return that.oldCode;
      }
      return factory;
    };
})();
