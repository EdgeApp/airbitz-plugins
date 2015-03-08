
var app = angular.module('app', ['app.core', 'app.history', 'app.exchange', 'app.user']);

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
    // route for buying on exchange
    .state("exchangeOrderBuy", {
      url: "/exchange/order/buy/",
      templateUrl: "app/exchange/partials/order.buy.html",
      controller: "orderBuyController",
    })
    // route for selling on exchange
    .state("exchangeOrderSell", {
      url: "/exchange/order/sell/",
      templateUrl: "app/exchange/partials/order.sell.html",
      controller: "orderSellController",
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
    // route for account
    .state("account", {
      url: "/account/",
      templateUrl: "app/user/partials/userAccount.html",
      controller: "userAccountController",
    })
}]);
