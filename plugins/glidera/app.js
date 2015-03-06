
var app = angular.module('exchangeGlidera', [
  // 3rd party custom
  'ui.router',
  'ngAnimate',
  ]);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/');

  $stateProvider
    // route for signup
    .state("home", {
      url: "/",
      templateUrl: "/partials/index.html",
      controller: "mainCtrl",
    })
    // route for signup
    .state("signup", {
      url: "/signup/",
      templateUrl: "/partials/signup.html",
      controller: "mainCtrl",
    })
    // route for email verification
    .state("verifyEmail", {
      url: "/signup/verify/email/",
      templateUrl: "/partials/signup.verify.email.html",
      controller: "mainCtrl",
    })
    // route for phone verification
    .state("verifyPhone", {
      url: "/signup/verify/phone/",
      templateUrl: "/partials/signup.verify.phone.html",
      controller: "mainCtrl",
    })
    // route for two factor verifications
    .state("verify2FA", {
      url: "/signup/verify/twofa/",
      templateUrl: "/partials/exchange.verify.twofactor.html",
      controller: "mainCtrl",
    })
    // route for exchange
    .state("exchange", {
      url: "/exchange/",
      templateUrl: "/partials/exchange.html",
      controller: "mainCtrl",
    })
    // route for adding exchange bank account
    .state("exchangeAddBankAccount", {
      url: "/exchange/add/bankAccount/",
      templateUrl: "/partials/exchange.add.bankAccount.html",
      controller: "mainCtrl",
    })
    // route for adding exchange credit card
    .state("exchangeAddCreditCard", {
      url: "/exchange/add/creditCard/",
      templateUrl: "/partials/exchange.add.creditCard.html",
      controller: "mainCtrl",
    })

    // route for buying on exchange
    .state("exchangeOrder", {
      url: "/exchange/order/",
      templateUrl: "/partials/exchange.order.html",
      controller: "mainCtrl",
    })
    // route for selling on exchange
    .state("exchangeSell", {
      url: "/exchange/sell/",
      templateUrl: "/partials/exchange.order.html",
      controller: "mainCtrl",
    })

    // route for selling on exchange
    .state("reviewOrder", {
      url: "/exchange/order/review/",
      templateUrl: "/partials/exchange.order.review.html",
      controller: "mainCtrl",
    })

    // route for selling on exchange
    .state("executeOrder", {
      url: "/exchange/order/execute/",
      templateUrl: "/partials/exchange.order.execute.html",
      controller: "mainCtrl",
    })


}]);
