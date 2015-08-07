
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
    .state("disclaimer", {
      url: "/",
      templateUrl: "app/user/partials/disclaimer.html",
      controller: "disclaimerController",
    })
    // route for signup
    .state("signup", {
      url: "/signup/",
      templateUrl: "app/user/partials/signup.html",
      controller: "signupController",
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
    .state("userTransactions", {
      url: "/user/transactions/",
      templateUrl: "app/user/partials/transactions.html",
      controller: "transactionsController",
    })
    .state("userFunds", {
      url: "/user/funds/",
      templateUrl: "app/user/partials/funds.html",
      controller: "fundsController",
    })
    // route for executing order
    .state("executeOrder", {
      url: "/exchange/order/execute/",
      templateUrl: "app/exchange/partials/order.execute.html",
      controller: "executeOrderController",
    })
    .state("addressVerification", {
      url: "/account/",
      templateUrl: "app/user/partials/addressVerification.html",
      controller: "addressVerificationController",
    })
    .state("identityVerification", {
      url: "/identity/",
      templateUrl: "app/user/partials/identityVerification.html",
      controller: "identityVerificationController",
    })
    // route for errors
    .state("error", {
      url: "/error/",
      templateUrl: "app/error/partials/error.html",
      controller: "errorController",
    });
}]);
