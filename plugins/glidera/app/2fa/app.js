
angular.module('app.2fa', ['app.dataFactory', 'app.glidera']).
controller('verify2faController', ['$scope', '$state', '$stateParams', 'DataFactory', 'UserFactory', 'TwoFactor',
  function ($scope, $state, $stateParams, DataFactory, UserFactory, TwoFactor) {
    Airbitz.ui.title('2 Factor Verification');
    $scope.exchange = DataFactory.getExchange();
    $scope.account = UserFactory.getUserAccount();
    $scope.hasNumber = false;

    var requestCode = function() {
      TwoFactor.requestCode().then(function(hasNumber) {
        if ($stateParams.confirmNumber == 'confirm') {
          $scope.hasNumber = hasNumber;
        }
      }, function(error) {
        Airbitz.ui.showAlert('Error', error);
      });
    };
    $scope.submit2FA = function() {
      TwoFactor.finish($scope.verificationCode, $scope.oldVerificationCode);
    };
    $scope.resendSMS = function(phone){
      requestCode();
    };
    requestCode();
  }]).
factory('TwoFactor', ['$state', '$q', 'glideraFactory',
  function($state, $q, glideraFactory) {
    'use strict';

    var code = '';
    var oldCode = '';
    var nextAction = function() { };
    var factory = {};
    factory.confirmTwoFactor = function(finishedCallback) {
      if (finishedCallback) {
        this.nextAction = finishedCallback;
      }
      $state.go('verify2FA', {'confirmNumber': 'confirm'});
    };
    factory.showTwoFactor = function(finishedCallback) {
      if (finishedCallback) {
        this.nextAction = finishedCallback;
      }
      $state.go('verify2FA', {'confirmNumber': ''});
    };
    factory.checkPhone = function() {
      var deferred = $q.defer();
      glideraFactory.getPhoneNumber(function(e, r, b) {
        200 == r ? deferred.resolve(b) : deferred.reject(b);
      });
      return deferred.promise;
    };
    factory.requestCode = function() {
      return factory.checkPhone().then(function(data) {
        var hasNumber = data.phoneNumber !== null ? true : false;
        var d = $q.defer();
        glideraFactory.getTwoFactorCode(function(e, r, b) {
          r >= 200 && r < 300 ? d.resolve(hasNumber) : d.reject(b);
        });
        return d.promise;
      });
    };
    factory.finish = function(c, o) {
      this.code = c;
      this.oldCode = o;
      if (this.nextAction) {
        this.nextAction();
      }
    };
    factory.getCode = function() {
      return this.code;
    };
    factory.getOldCode = function() {
      return this.oldCode;
    }
    return factory;
  }]);
