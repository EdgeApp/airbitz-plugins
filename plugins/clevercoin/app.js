
var app = angular.module('app', ['app.core']);
app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');
  $stateProvider
    // route for signup TODO, move partial
    .state("home", {
      url: "/",
      templateUrl: "app/user/partials/redirect.html",
      controller: "homeController",
    })
    // route for signup
    .state("signup", {
      url: "/signup/",
      templateUrl: "app/user/partials/signup.html",
      controller: "signupController",
    })
    .state("link", {
      url: "/link/",
      templateUrl: "app/user/partials/linkAccount.html",
      controller: "linkController",
    })
    // route for signup
    .state("pendingActivation", {
      url: "/pendingActivation/",
      templateUrl: "app/user/partials/pendingActivation.html",
      controller: "pendingActivationController",
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
      templateUrl: "app/exchange/partials/receipt.html",
      controller: "receiptController",
    })
    .state("userFunds", {
      url: "/user/funds/",
      templateUrl: "app/user/partials/funds.html",
      controller: "fundsController",
    })
    .state("userInformation", {
      url: "/account/information",
      templateUrl: "app/user/partials/userInformation.html",
      controller: "userInformationController",
    })
    .state("addressVerification", {
      url: "/account/verification/address",
      templateUrl: "app/user/partials/addressVerification.html",
      controller: "addressVerificationController",
    })
    .state("identityVerification", {
      url: "/account/verification/identity",
      templateUrl: "app/user/partials/identityVerification.html",
      controller: "identityVerificationController",
    })
    .state("editBank", {
      url: "/account/bank/add",
      templateUrl: "app/user/partials/bankVerification.html",
      controller: "editBankController",
    })
    .state("sepaDeposit", {
      url: "/account/bank/deposit",
      templateUrl: "app/user/partials/bankDeposit.html",
      controller: "sepaDepositBankController",
    })
    // route for errors
    .state("error", {
      url: "/error/",
      templateUrl: "app/error/partials/error.html",
      controller: "errorController",
    });
}]).
run(['$rootScope', 'DataFactory', function ($rootScope, DataFactory) {
  DataFactory.getSelectedWallet().then(function(newWallet) {
    Airbitz.currentWallet = newWallet;
    $rootScope.currentWallet = newWallet;
  });
  Airbitz.core.setupWalletChangeListener(function(newWallet) {
    $rootScope.$apply(function() {
      Airbitz.currentWallet = newWallet;
      $rootScope.currentWallet = newWallet;
    });
  });
  Airbitz.cryptoDenom = Airbitz.core.getBtcDenomination();
  $rootScope.cryptoDenom = Airbitz.core.getBtcDenomination();
  $rootScope.launchExternal = Airbitz.ui.launchExternal;
  Airbitz.core.setDenominationChangeListener(function(newDenom) {
    $rootScope.$apply(function() {
      Airbitz.cryptoDenom = newDenom;
      $rootScope.cryptoDenom = newDenom;
    });
    $rootScope.$broadcast('DenominationChange', newDenom);
  });
  $rootScope.exchange = DataFactory.getExchange();
}]);
