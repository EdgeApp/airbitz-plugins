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
    .factory('Prices', ['$q', '$filter', 'CcFactory', Prices])
    .directive('priceUpdate', ['$interval', '$filter', 'Prices', priceUpdate])
    .directive('priceExpires', ['$interval', '$filter', 'Prices', priceExpires])

  function Prices($q, $filter, CcFactory) {
    var factory = {};
    var timeDiff = function(timestamp) {
      return timestamp - new Date().getTime();
    };
    var cached = function(data) {
      if (data && data.btcPrice && !data.expires) {
        data.expires = new Date().getTime() + (60 * 1000); // expires in a minute
      }
      return (data && timeDiff(data.expires) > 30) ? data : null;
    };
    factory.currentBuy = {};
    factory.currentSell = {};
    factory.buyQty = 1;
    factory.sellQty = 1;

    factory.convertFiatValue = function(orderAction, input) {
      if (typeof(input)==='undefined') input = 0;
      var price = (orderAction == 'buy')
                ? factory.currentBuy.btcPrice : factory.currentSell.btcPrice;
      var btcValue = input / parseFloat(price);
      return {
        'orderValueSatoshi': btcValue * 100000000,
        'orderValueInput': parseFloat($filter('roundBtc')(btcValue)),
        'orderBtcInput': btcValue
      };
    };

    factory.convertBtcValue = function(orderAction, input) {
      if (typeof(input)==='undefined') input = 0;
      var price = (orderAction == 'buy')
          ? factory.currentBuy.btcPrice : factory.currentSell.btcPrice;
      var btc = $filter('valToBtc')(input);
      var output = btc * price;
      return {
        'orderBtcInput': btc,
        'orderValueSatoshi': btc * 100000000,
        'orderFiatInput': parseFloat($filter('roundFiat')(parseFloat(output)))
      };
    };

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
        CcFactory.quotePrice(1, 'bid', 'BTC', 'Wallet', function(e, r, b) {
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
        CcFactory.quotePrice(1, 'ask', 'BTC', 'Wallet', function(e, r, b) {
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
          scope.price = $filter('currency')(b.btcPrice, '€', 2);
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
