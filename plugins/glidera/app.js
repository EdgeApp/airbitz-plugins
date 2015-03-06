
var app = angular.module('app', ['app.core', 'app.history', 'app.exchange', 'app.signup']);

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
      templateUrl: "app/signup/partials/signup.html",
      controller: "signupController",
    })
    // route for email verification
    .state("verifyEmail", {
      url: "/signup/verify/email/",
      templateUrl: "app/signup/partials/verify.email.html",
      controller: "verifyEmailController",
    })
    // route for phone verification
    .state("verifyPhone", {
      url: "/signup/verify/phone/",
      templateUrl: "app/signup/partials/verify.phone.html",
      controller: "verifyPhoneController",
    })
    // route for two factor verifications
    .state("verify2FA", {
      url: "/signup/verify/twofa/",
      templateUrl: "app/exchange/partials/verify.twofactor.html",
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
    // route for adding exchange credit card
    .state("exchangeAddCreditCard", {
      url: "/exchange/add/creditCard/",
      templateUrl: "app/exchange/partials/add.creditCard.html",
      controller: "addCreditCardController",
    })

    // route for buying on exchange
    .state("exchangeOrder", {
      url: "/exchange/order/",
      templateUrl: "app/exchange/partials/order.html",
      controller: "orderController",
    })
    // route for selling on exchange
    .state("exchangeSell", {
      url: "/exchange/sell/",
      templateUrl: "app/exchange/partials/order.html",
      controller: "orderController",
    })

    // route for selling on exchange
    .state("reviewOrder", {
      url: "/exchange/order/review/",
      templateUrl: "app/exchange/partials/order.review.html",
      controller: "revirewOrderController",
    })

    // route for selling on exchange
    .state("executeOrder", {
      url: "/exchange/order/execute/",
      templateUrl: "app/exchange/partials/order.execute.html",
      controller: "executeOrderController",
    })
}]);
