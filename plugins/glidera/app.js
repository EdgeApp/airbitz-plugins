
var app = angular.module('app', ['app.core', 'app.exchange', 'app.signup']);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/');

  $stateProvider
    // route for signup TODO, move partial
    .state("home", {
      url: "/",
      templateUrl: "core/partials/index.html",
      controller: "homeController",
    })
    // route for signup
    .state("signup", {
      url: "/signup/",
      templateUrl: "signup/partials/signup.html",
      controller: "signupController",
    })
    // route for email verification
    .state("verifyEmail", {
      url: "/signup/verify/email/",
      templateUrl: "signup/partials/verify.email.html",
      controller: "verifyEmailController",
    })
    // route for phone verification
    .state("verifyPhone", {
      url: "/signup/verify/phone/",
      templateUrl: "signup/partials/verify.phone.html",
      controller: "verifyPhoneController",
    })
    // route for two factor verifications
    .state("verify2FA", {
      url: "/signup/verify/twofa/",
      templateUrl: "exchange/partials/verify.twofactor.html",
      controller: "verify2faController",
    })
    // route for exchange
    .state("exchange", {
      url: "/exchange/",
      templateUrl: "exchange/partials/exchange.html",
      controller: "dashboardController",
    })
    // route for adding exchange bank account
    .state("exchangeAddBankAccount", {
      url: "/exchange/add/bankAccount/",
      templateUrl: "exchange/partials/add.bankAccount.html",
      controller: "addAccountController",
    })
    // route for adding exchange credit card
    .state("exchangeAddCreditCard", {
      url: "/exchange/add/creditCard/",
      templateUrl: "exchange/partials/add.creditCard.html",
      controller: "addCreditCardController",
    })

    // route for buying on exchange
    .state("exchangeOrder", {
      url: "/exchange/order/",
      templateUrl: "exchange/partials/order.html",
      controller: "orderController",
    })
    // route for selling on exchange
    .state("exchangeSell", {
      url: "/exchange/sell/",
      templateUrl: "exchange/partials/order.html",
      controller: "orderController",
    })

    // route for selling on exchange
    .state("reviewOrder", {
      url: "/exchange/order/review/",
      templateUrl: "exchange/partials/order.review.html",
      controller: "revirewOrderController",
    })

    // route for selling on exchange
    .state("executeOrder", {
      url: "/exchange/order/execute/",
      templateUrl: "exchange/partials/order.execute.html",
      controller: "executeOrderController",
    })
}]);
