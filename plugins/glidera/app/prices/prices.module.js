(function() {
  'use strict';

  function priceLink($interval, Prices, scope, element, attrs, callback) {
    var netTimeout;

    function updateView() {
      var f = attrs.priceType === 'sell' ? Prices.updateSell : Prices.updateBuy;
      f().then(function(b) {;
        console.log("B = " + JSON.stringify(b));
        callback(scope, b);
      });
    }

    element.on('$destroy', function() {
      $interval.cancel(netTimeout);
    });

    netTimeout = $interval(function() {
        updateView(); // update DOM
    }, 5000);

    updateView();
  }

  angular
    .module('app.prices', ['app.glidera'])
    .factory('Prices', ['$rootScope', '$q', 'glideraFactory', Prices])
    .directive('priceUpdate', ['$interval', '$filter', 'Prices', priceUpdate])
    .directive('priceExpires', ['$interval', '$filter', 'Prices', priceExpires])

  function Prices($rootScope, $q, glideraFactory) {
    var factory = {};
    var timeDiff = function(date) {
      return (new Date(date).getTime() - new Date().getTime()) / 1000.0;
    };
    var cached = function(data) {
      return (data && timeDiff(data.expires) > 30) ? data : null;
    };
    factory.currentBuy = {};
    factory.currentSell = {};
    factory.buyQty = 1;
    factory.sellQty = 1;

    factory.setBuyQty = function(qty, fiat, mode) {
      factory.buyQty = qty;
      factory.buyFiatQty = fiat;
      factory.buyMode = mode;
      factory.currentBuy = {};
      return factory.updateBuy();
    }
    factory.setSellQty = function(qty, fiat, mode) {
      factory.sellQty = qty;
      factory.sellFiatQty = fiat;
      factory.sellMode = mode;
      factory.currentSell = {};
      return factory.updateSell();
    }
    factory.buyUuid = function() {
      return factory.currentBuy.priceUuid;
    };
    factory.updateBuy = function() {
      console.log('updateBuy');
      var deferred = $q.defer();
      if (cached(factory.currentBuy)) {
        deferred.resolve(cached(factory.currentBuy));
      } else {
        var qty = factory.buyMode == 'fiat' ? factory.buyFiatQty : factory.buyQty;
        glideraFactory.buyPrices(qty, factory.buyMode, function(e, r, b) {
          factory.currentBuy = b;
          if (r == 200) {
            deferred.resolve(b);
            broadcastUpdate($rootScope, 'buy');
          } else {
            deferred.reject();
          }
        });
      }
      return deferred.promise;
    };
    factory.sellUuid = function() {
      return factory.currentSell.priceUuid;
    };
    factory.updateSell = function() {
      console.log('updateSell');
      var deferred = $q.defer();
      if (cached(factory.currentSell)) {
        deferred.resolve(cached(factory.currentSell));
      } else {
        var qty = factory.sellMode == 'fiat' ? factory.sellFiatQty : factory.sellQty;
        glideraFactory.sellPrices(qty, factory.sellMode, function(e, r, b) {
          factory.currentSell = b;
          if (r == 200) {
            deferred.resolve(b);
            broadcastUpdate($rootScope, 'sell');
          } else {
            deferred.reject();
          }
        });
      }
      return deferred.promise;
    };
    return factory;
  }
  function broadcastUpdate($rootScope, type) {
    $rootScope.$broadcast('PriceUpdate', type);
  }
  function priceUpdate($interval, $filter, Prices) {
    return {
      templateUrl: 'app/prices/partials/rate.html',
      link: function(scope, elements, attrs){
        return priceLink($interval, Prices, scope, elements, attrs, function(scope, b) {
          scope.price = $filter('currency')(b.price, '$', 2);
          scope.currency = b.currency;
        });
      }
    };
  }
  function priceExpires($interval, $filter, Prices) {
    return {
      templateUrl: 'app/prices/partials/expires.html',
      link: function(scope, elements, attrs){
        return priceLink($interval, Prices, scope, elements, attrs, function(scope, b) {
          scope.expires = moment(b.expires).fromNow();
        });
      }
    };
  }
})();
