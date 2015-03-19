(function() {
  'use strict';

  angular
    .module('app.history', ['app.dataFactory'])
    .run(['$rootScope', '$window', '$location', 'UserFactory', history]);

  /* TODO: remove match(//) regexp and replace with state lookups */
  function history($rootScope, $window, $location, UserFactory) {
    var history = [];
    var skip = false;
    $rootScope.$on('$locationChangeStart', function(event, next, current) {
      if (!UserFactory.isRegistered() && !next.match(/signup.html/)) {
        console.log('Not registered. Redirecting to registration form.');
        $location.path('/signup/');
        return;
      }
      if (!skip) {
        history.push(current);
        Airbitz.ui.navStackPush(current);
      }
      // if we are on the dashboard screen, empty history
      if (next.match(/\.html#\/exchange\/$/)
        || next.match(/\.html#\/signup\/$/)) {
        history.length = 0;
        Airbitz.ui.navStackClear();
      }
      skip = false;
    });
    Airbitz._bridge.back = function() {
      if (history.length == 0) {
        Airbitz._bridge.exit();
      } else {
        var el = history.pop().replace(/.*#/, '');
        Airbitz.ui.navStackPop();

        $location.path(el).replace();
        skip = true; // don't record this change in the history stack
      }
      $rootScope.$apply();
    };
  };
})();
