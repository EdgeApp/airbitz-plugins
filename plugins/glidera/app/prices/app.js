
angular.module('app.directives', ['app.glidera']).
factory('Prices', ['$q', 'glideraFactory',
  function($q, glideraFactory) {
    var currentBuy = { };
    var currentSell = { };
    var timeDiff = function(date) {
      return (new Date(date).getTime() - new Date().getTime()) / 1000.0;
    };
    var work = function(data, callback) {
      if (data && timeDiff(data.expires) > 30) {
        return $q(function(resolve, reject) {
          return data;
        });
      } else {
        return callback();
      }
    };
    /* TODO: clean this up....its fugly */
    return {
      updateBuy: function() {
        console.log('updateBuy');
        return work(currentBuy, function() {
          return $q(function(resolve, reject) {
            glideraFactory.buyPrices(1, function(e, r, b) {
              if (r == 200) {
                currentBuy = b;
                resolve(b);
              } else {
                reject();
              }
            });
          });
        });
      },
      updateSell: function() {
        console.log('updateSell');
        return work(currentSell, function() {
          return $q(function(resolve, reject) {
            glideraFactory.sellPrices(1, function(e, r, b) {
              if (r == 200) {
                currentSell = b;
                resolve(b);
              } else {
                reject();
              }
            });
          });
        });
      }
    };
  }]).
directive('priceUpdate', ['$interval', '$filter', 'Prices',
  function($interval, $filter, Prices) {
    function link(scope, element, attrs) {
      var netTimeout;

      function updateView() {
        var f = attrs.priceType === 'sell' ? Prices.updateSell : Prices.updateBuy;
        f().then(function(b) {;
          scope.price = $filter('currency')(b.price, '$', 2);
          scope.expires = moment(b.expires).fromNow();
        });
      }

      scope.$watch(attrs.sellPrice, function(value) {
        updateView();
      });

      element.on('$destroy', function() {
        $interval.cancel(netTimeout);
      });

      netTimeout = $interval(function() {
        updateView(); // update DOM
      }, 5000);
    }
    return {
      templateUrl: 'app/prices/partials/rate.html',
      link: link
    };
  }]);
