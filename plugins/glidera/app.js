
var app = angular.module('app', ['app.core', 'app.history', 'app.exchange', 'app.user', 'app.2fa']);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/');

  $stateProvider
    // route for signup TODO, move partial
    .state("home", {
      url: "/",
      templateUrl: "app/core/partials/index.html",
      controller: "homeController",
    })
    // route for signup
    .state("signup", {
      url: "/signup/",
      templateUrl: "app/user/partials/signup.html",
      controller: "signupController",
    })
    // route for email verification
    .state("verifyEmail", {
      url: "/signup/verify/email/",
      templateUrl: "app/user/partials/verify.email.html",
      controller: "verifyEmailController",
    })
    // route for phone verification
    .state("verifyPhone", {
      url: "/signup/verify/phone/",
      templateUrl: "app/user/partials/verify.phone.html",
      controller: "verifyPhoneController",
    })
    // route for two factor verifications
    .state("verify2FA", {
      url: "/verify/twofa/",
      templateUrl: "app/2fa/partials/verify.twofactor.html",
      controller: "verify2faController",
    })
    // route for exchange
    .state("exchange", {
      url: "/exchange/",
      templateUrl: "app/exchange/partials/exchange.html",
      controller: "dashboardController",
    })
    // route for adding exchange bank account
    .state("exchangeAddBankAccount", {
      url: "/exchange/add/bankAccount/",
      templateUrl: "app/exchange/partials/add.bankAccount.html",
      controller: "addAccountController",
    })
    .state("exchangeEditBankController", {
      url: "/exchange/edit/bankAccount/:uuid/",
      templateUrl: "app/exchange/partials/edit.bankAccount.html",
      controller: "editBankAccountController",
    })
    // route for adding exchange credit card
    .state("exchangeAddCreditCard", {
      url: "/exchange/add/creditCard/",
      templateUrl: "app/exchange/partials/add.creditCard.html",
      controller: "addCreditCardController",
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
}]);
