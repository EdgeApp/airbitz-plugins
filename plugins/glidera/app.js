
var app = angular.module('exchangeGlidera', ['ui.router', 'ngAnimate']);

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
    .state("exchangeBuy", {
      url: "/exchange/buy/",
      templateUrl: "/partials/exchange.buy.html",
      controller: "mainCtrl",
    })
    // route for selling on exchange
    .state("exchangeSell", {
      url: "/exchange/sell/",
      templateUrl: "/partials/exchange.buy.html",
      controller: "mainCtrl",
    })


}]);
