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
      // If the user is not authorized and if the query string does not have
      // the glidera 'state' parameter 
      if (!UserFactory.isAuthorized() && !next.match(/state=/)) {
        console.log('Not registered. Redirecting to registration form.');
        $location.path('/authorizeRedirect/');
        return;
      }
      if (current.match(/\.html#\/verify\/twofa/)) {
        return;
      }
      if (!skip && !next.match(/Redirect/)) {
        history.push(current);
        Airbitz.ui.navStackPush(current);
      }
      // if we are on the dashboard screen, empty history
      if (next.match(/\/dashboard\/$/)) {
        history.length = 0;
        Airbitz.ui.navStackClear();
      } else if (next.match(/\.html#\/receipt\/$/)) {
        Airbitz.ui.navStackClear();
        history.length = 0;
        history.push('/dashboard/');
        Airbitz.ui.navStackPush('/dashboard/');
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
