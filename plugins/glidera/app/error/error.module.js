(function (){
  'use strict';

  angular
    .module('app.error', ['app.2fa'])
    .factory('Error', ['$state', 'TwoFactor', errorService])
    .controller('errorController', [
      '$scope',
      '$state',
      '$stateParams',
      errorController
    ]);

  function errorController($scope, $state, $stateParams) {
    $scope.title = 'Authentication Error';
    $scope.message = 'Please try again.';
    $scope.refresh = function() {
      $state.go('exchange');
    }
  }

  function errorService($state, TwoFactor) {
    var factory = {
      'reject': reject
    };
    return factory;

    function reject(res) {
      if (!res || !res.code) {
        Airbitz.ui.showAlert('Error', 'An unknown error occurred.');
      } else {
        if (res.code == 'IgnoreAction') {
          return;
        } else if (2006 == res.code) {
          Airbitz.ui.showAlert('Unauthorized', 'Invalid 2 Factor code.');
          TwoFactor.reset();  // reset the old token
          TwoFactor.showTwoFactor(function() {
            $state.go("reviewOrder");
          });
        } else if (3105 == res.code) {
          $state.go('dashboard');
          Airbitz.ui.showAlert('Error', 'Please verify your email address before continuing.');
        } else {
          Airbitz.ui.showAlert('Error', errorMap(res.code));
        }
      }
    }
  }

  function errorMap(code) {
    if (415 == code) {
      return "Unsupported media type";
    } else if (400 == code) {
      return "Bad Request";
    } else if (404 == code) {
      return "Resource not found";
    } else if (500 == code) {
      return "Internal service error";
    } else if (1100 == code) {
      return "Missing required parameter";
    } else if (1101 == code) {
      return "Invalid parameter value";
    } else if (2001 == code) {
      return "Invalid or incorrect access_token";
    } else if (2002 == code) {
      return "access_token revoked";
    } else if (2003 == code) {
      return "Inactive partner API key";
    } else if (2004 == code) {
      return "User has been exited and cannot access Glidera services.";
    } else if (2005 == code) {
      return "access_token does not have permission to access this resource";
    } else if (2006 == code) {
      return "Invalid or incorrect 2FA_Code";
    } else if (2007 == code) {
      return "Can't find authorization request with provided client_id and code";
    } else if (2008 == code) {
      return "Authorization code has been revoked";
    } else if (2009 == code) {
      return "Invalid redirect_uri";
    } else if (2010 == code) {
      return "Invalid client_secret";
    } else if (2011 == code) {
      return "Authorization code already redeemed, access_token has been revoked";
    } else if (2012 == code) {
      return "Authorization code expired, access_token has been revoked";
    } else if (3100 == code) {
      return "Unsupported state due to regulatory requirements";
    } else if (3101 == code) {
      return "Web endpoints required for completing user setup";
    } else if (3102 == code) {
      return "User phone number not setup or verified";
    } else if (3103 == code) {
      return "Buying bitcoin is not supported in user's state";
    } else if (3104 == code) {
      return "Selling bitcoin is not supported in user's state";
    } else if (3105 == code) {
      return "User email not verified";
    } else if (3106 == code) {
      return "User personal info not verified";
    } else if (3107 == code) {
      return "Buy/sell has been temporarily disabled for this user pending investigation into recent failed transaction";
    } else if (3108 == code) {
      return "Invalid bank account";
    } else if (3109 == code) {
      return "User's first transaction must clear before transacting again";
    } else if (3110 == code) {
      return "Invalid priceUuid";
    } else if (3111 == code) {
      return "Transaction amount is below minimum threshold";
    } else if (3112 == code) {
      return "Transaction cannot be processed because daily limit would be exceeded";
    } else {
      return "An error occurred";
    }
  }

})();
