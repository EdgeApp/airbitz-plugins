
(function() {
  angular.module('app.limits', ['app.glidera'])
    .factory('Limits', ['$q', 'glideraFactory', limitsFactory])
    .directive('exchangeLimits', exchangeLimits)
    .directive('buyLimits', buyLimits)
    .directive('sellLimits', sellLimits);

  function limitsFactory($q, glideraFactory) {
    var limits = {};
    var factory = {};
    var toFiat = function(input) {
      if (typeof(input)==='undefined') input = 0;
      input = input * 100000000;

      var output = Airbitz.core.formatCurrency(
        Airbitz.core.satoshiToCurrency(input, 840), false
      );
      return parseFloat(output);
    };
    factory.reset = function() {
        limits = {}; 
    };
    factory.getLimits = function() {
        return limits;
    };
    factory.isBuyAllowed = function(btc) {
      if (!limits.dailyBuyRemaining|| !limits.monthlyBuyRemaining) {
        return false;
      }
      var fiat = toFiat(btc);
      return fiat < limits.dailyBuyRemaining
          && fiat < limits.monthlyBuyRemaining;
    },
    factory.isSellAllowed = function(btc) {
      if (!limits.dailySellRemaining || !limits.monthlySellRemaining) {
        return false;
      }
      var fiat = toFiat(btc);
      return fiat < limits.dailySellRemaining
          && fiat < limits.monthlySellRemaining;
    },
    factory.fetchLimits = function() {
      var deferred = $q.defer();
      if (limits.length) {
        deferred.resolve(limits);
      } else {
        glideraFactory.userLimits(function(e, r, b) {
          if (r == 200) {
            limits = b;
            deferred.resolve(b);
          } else {
            deferred.reject();
          }
        });
        return deferred.promise;
      }
    }
    return factory;
  }
  function exchangeLimits() {
    return {
      templateUrl: 'app/limits/partials/limits.html'
    };
  }
  function buyLimits() {
    return {
      templateUrl: 'app/limits/partials/buy.html'
    };
  }
  function sellLimits() {
    return {
      templateUrl: 'app/limits/partials/sell.html'
    };
  }
})();
