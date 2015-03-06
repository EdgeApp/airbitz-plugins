
angular.module('app.history', []).
run(function($rootScope, $window) {
  var history = [];
  $rootScope.$on('$locationChangeStart', function(event, next, current) {
    if (history.length == 0) {
      history.push(current);
    }
    // if we are on the dashboard screen, empty history
    if (next.match(/\.html#\/exchange\/$/)
      || next.match(/\.html#\/signup\/$/)) {
      history.length = 0;
    }
    history.push(next);
  });
  Airbitz._bridge.back = function() {
    var el = history.pop();
    if (history.length == 0) {
      Airbitz._bridge.exit();
    } else {
      $window.history.back();
    }
  };
});
