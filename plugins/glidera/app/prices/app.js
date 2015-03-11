
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

angular.module('app.prices', ['app.glidera']).
factory('Prices', ['$q', 'glideraFactory',
  function($q, glideraFactory) {
    var factory = {};
    var timeDiff = function(date) {
      return (new Date(date).getTime() - new Date().getTime()) / 1000.0;
    };
    var cached = function(data) {
      return (data && timeDiff(data.expires) > 30) ? data : null;
    };
    factory.currentBuy = {};
    factory.currentSell = {};
    factory.buyUuid = function() {
      return this.currentBuy.priceUuid;
    };
    factory.updateBuy = function() {
      console.log('updateBuy');
      var deferred = $q.defer();
      if (cached(this.currentBuy)) {
        deferred.resolve(cached(this.currentBuy));
      } else {
        glideraFactory.buyPrices(1, function(e, r, b) {
          this.currentBuy = b;
          (r == 200) ?  deferred.resolve(b) : deferred.reject();
        });
      }
      return deferred.promise;
    };
    factory.sellUuid = function() {
      return this.currentSell.priceUuid;
    };
    factory.updateSell = function() {
      console.log('updateSell');
      var deferred = $q.defer();
      if (cached(this.currentSell)) {
        deferred.resolve(cached(this.currentSell));
      } else {
        glideraFactory.sellPrices(1, function(e, r, b) {
          this.currentSell = b;
          (r == 200) ?  deferred.resolve(b) : deferred.reject();
        });
      }
      return deferred.promise;
    };
    return factory;
  }]).
directive('priceUpdate', ['$interval', '$filter', 'Prices',
  function($interval, $filter, Prices) {
    return {
      templateUrl: 'app/prices/partials/rate.html',
      link: function(scope, elements, attrs){
        return priceLink($interval, Prices, scope, elements, attrs, function(scope, b) {
          scope.price = $filter('currency')(b.price, '$', 2);
        });
      }
    };
  }]).
directive('priceExpires', ['$interval', '$filter', 'Prices',
  function($interval, $filter, Prices) {
    return {
      templateUrl: 'app/prices/partials/expires.html',
      link: function(scope, elements, attrs){
        return priceLink($interval, Prices, scope, elements, attrs, function(scope, b) {
          scope.expires = moment(b.expires).fromNow();
        });
      }
    };
  }]);
