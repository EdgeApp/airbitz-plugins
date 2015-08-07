(function() {
  'use strict';

  function priceLink($interval, Prices, scope, element, attrs, callback) {
    var netTimeout;

    function updateView() {
      var f = attrs.priceType === 'sell' ? Prices.updateSell : Prices.updateBuy;
      f().then(function(b) {;
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
    .module('app.prices', ['app.clevercoin'])
    .factory('Prices', ['$q', 'CcFactory', Prices])
    .directive('priceUpdate', ['$interval', '$filter', 'Prices', priceUpdate])
    .directive('priceExpires', ['$interval', '$filter', 'Prices', priceExpires])

  function Prices($q, CcFactory) {
    var factory = {};
    var timeDiff = function(timestamp) {
      return timestamp - new Date().getTime();
    };
    var cached = function(data) {
      if (data && data.ask && !data.expires) {
        data.expires = new Date().getTime() + (60 * 1000); // expires in a minute
      }
      return (data && timeDiff(data.expires) > 30) ? data : null;
    };
    factory.currentBuy = {};
    factory.currentSell = {};
    factory.buyQty = 1;
    factory.sellQty = 1;

    factory.setBuyQty = function(qty) {
      factory.buyQty = qty;
      factory.currentBuy = {};
      return factory.updateBuy();
    }
    factory.setSellQty = function(qty) {
      factory.sellQty = qty;
      factory.currentSell = {};
      return factory.updateSell();
    }
    factory.updateBuy = function() {
      var deferred = $q.defer();
      if (cached(factory.currentBuy)) {
        deferred.resolve(cached(factory.currentBuy));
      } else {
        CcFactory.ticker(function(e, r, b) {
          factory.currentBuy = b;
          (r == 200) ?  deferred.resolve(b) : deferred.reject();
        });
      }
      return deferred.promise;
    };
    factory.updateSell = function() {
      var deferred = $q.defer();
      if (cached(factory.currentSell)) {
        deferred.resolve(cached(factory.currentSell));
      } else {
        CcFactory.ticker(function(e, r, b) {
          factory.currentSell = b;
          (r == 200) ?  deferred.resolve(b) : deferred.reject();
        });
      }
      return deferred.promise;
    };
    return factory;
  }
  function priceUpdate($interval, $filter, Prices) {
    return {
      templateUrl: 'app/prices/partials/rate.html',
      link: function(scope, elements, attrs){
        return priceLink($interval, Prices, scope, elements, attrs, function(scope, b) {
          scope.price = $filter('currency')(b.ask, '€', 2);
          scope.currency = '';
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
