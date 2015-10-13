
(function() {
  angular.module('app.limits', ['app.glidera'])
    .factory('Limits', ['$q', 'glideraFactory', 'Prices', limitsFactory])
    .directive('exchangeLimits', exchangeLimits)
    .directive('buyLimits', buyLimits)
    .directive('sellLimits', sellLimits);

  function limitsFactory($q, glideraFactory, Prices) {
    var limits = {};
    var factory = {};
    factory.reset = function() {
        limits = {}; 
    };
    factory.getLimits = function() {
        return limits;
    };
    factory.isBuyAllowed = function(btc) {
      if (!limits.dailyBuyRemaining || !limits.monthlyBuyRemaining) {
        return false;
      }
      var fiat = parseFloat(btc) * parseFloat(Prices.currentBuy.price);
      return fiat <= limits.dailyBuyRemaining
          && fiat <= limits.monthlyBuyRemaining;
    },
    factory.isSellAllowed = function(btc) {
      if (!limits.dailySellRemaining || !limits.monthlySellRemaining) {
        return false;
      }
      var fiat = parseFloat(btc) * parseFloat(Prices.currentSell.price);
      return fiat <= limits.dailySellRemaining
          && fiat <= limits.monthlySellRemaining;
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
