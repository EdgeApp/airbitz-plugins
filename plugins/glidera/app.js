
var app = angular.module('app', ['app.core', 'app.history', 'app.exchange', 'app.user', 'app.2fa', 'app.receipt']);

app.config(['$stateProvider', '$urlRouterProvider', '$sceDelegateProvider', function($stateProvider, $urlRouterProvider, $sceDelegateProvider) {

  $urlRouterProvider.otherwise('/');
  $sceDelegateProvider.resourceUrlWhitelist([
    'self',
    'https://*.glidera.io/**'
  ]);

  $stateProvider
    // route for signup TODO, move partial
    .state("home", {
      url: "/",
      templateUrl: "app/user/partials/redirect.html",
      controller: "homeController",
    })
    .state("disclaimer", {
      url: "/disclaimer",
      templateUrl: "app/user/partials/disclaimer.html",
      controller: "disclaimerController",
    })
    .state("authorize", {
      url: "/authorizeRedirect/",
      controller: "authController",
      templateUrl: "app/user/partials/redirect.html",
    })
    // route for email verification
    .state("verifyEmail", {
      url: "/signup/verify/email/",
      templateUrl: "app/user/partials/verify.email.html",
      controller: "verifyEmailController",
    })
    // route for phone verification
    .state("verifyPhone", {
      url: "/signup/verify/phone/:change",
      templateUrl: "app/user/partials/verify.phone.html",
      controller: "verifyPhoneController",
    })
    // route for two factor verifications
    .state("verify2FA", {
      url: "/verify/twofa/:confirmNumber",
      templateUrl: "app/2fa/partials/verify.twofactor.html",
      controller: "verify2faController",
    })
    // route for dashboard
    .state("dashboard", {
      url: "/dashboard/",
      templateUrl: "app/user/partials/dashboard.html",
      controller: "dashboardController",
    })
    // route for reviewing order
    .state("reviewOrder", {
      url: "/exchange/order/review/",
      templateUrl: "app/exchange/partials/order.review.html",
      controller: "reviewOrderController",
    })
    // route for creating an order
    .state("exchangeOrder", {
      url: "/exchange/order/:orderAction/",
      templateUrl: "app/exchange/partials/order.html",
      controller: "orderController",
    })
    // route for creating an order
    .state("orderReceipt", {
      url: "/receipt/",
      templateUrl: "app/receipt/partials/receipt.html",
      controller: "receiptController",
    })
    // route for transactions
    .state("exchangeTransactions", {
      url: "/exchange/transactions/",
      templateUrl: "app/exchange/partials/transactions.html",
      controller: "transactionsController",
    })
    // route for executing order
    .state("executeOrder", {
      url: "/exchange/order/execute/",
      templateUrl: "app/exchange/partials/order.execute.html",
      controller: "executeOrderController",
    })
    // route for account
    .state("account", {
      url: "/account/",
      templateUrl: "app/user/partials/userAccount.html",
      controller: "userAccountController",
    })
    // route for glidera bank account access
    .state("bankAccount", {
      url: "/bankAccount/",
      templateUrl: "app/user/partials/bankAccount.html",
      controller: "bankAccountController",
    })
    // route for glidera increased limits access
    .state("increaseLimits", {
      url: "/increaseLimits/",
      templateUrl: "app/user/partials/increaseLimits.html",
      controller: "increaseLimitsController",
    })
    // route for errors
    .state("error", {
      url: "/error/",
      templateUrl: "app/error/partials/error.html",
      controller: "errorController",
    })
}]).
run(['$rootScope', 'DataFactory', function ($rootScope, DataFactory) {
  DataFactory.getSelectedWallet().then(function(newWallet) {
    Airbitz.currentWallet = newWallet;
    $rootScope.currentWallet = newWallet;
  });
  Airbitz.core.setWalletChangeListener(function(newWallet) {
    $rootScope.$apply(function() {
      Airbitz.currentWallet = newWallet;
      $rootScope.currentWallet = newWallet;
    });
  });
  Airbitz.cryptoDenom = Airbitz.core.getBtcDenomination();
  $rootScope.cryptoDenom = Airbitz.core.getBtcDenomination();
  Airbitz.core.setDenominationChangeListener(function(newDenom) {
    $rootScope.$apply(function() {
      Airbitz.cryptoDenom = newDenom;
      $rootScope.cryptoDenom = newDenom;
    });
    $rootScope.$broadcast('DenominationChange', newDenom);
  });
  $rootScope.exchange = DataFactory.getExchange();
  $rootScope.countryCode = Airbitz.config.get('COUNTRY_CODE');
  $rootScope.countryName = Airbitz.config.get('COUNTRY_NAME');
}]);
