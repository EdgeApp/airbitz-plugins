angular.module('libertyx')
    .config(['$httpProvider', $httpProvider => {
        $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    }])
    .run(['ticker', (ticker) => {
        ticker.start();
    }]);