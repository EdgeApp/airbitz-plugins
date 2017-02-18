// Possible states:
//     initial
//     token_loading
//     token_valid

angular.module('libertyx')
    .controller('LocationDetailsController', ['$rootScope', '$scope', '$q', '$state', 'user', 'api', 'notice', 'airbitz', 'ticker', ($rootScope, $scope, $q, $state, user, api, notice, airbitz, ticker) => {


        // ==== Listeners ====
        const listeners = [];


        // --- Reload if we get logged out ---
        listeners[0] = $rootScope.$on('user:authenticated', (e, {authenticated}) => {
            $state.reload();
        });

        // --- Reload if Airbitz wallet changes ---
        listeners[1] = $rootScope.$on('airbitz:wallet', (e, {wallet}) => {
            $state.reload();
        });

        // --- Subscribe to price ticker ---
        listeners[2] = $rootScope.$on('ticker:usd_per_btc', (e, {usd_per_btc, timestamp}) => {
            $scope.usd_per_btc = usd_per_btc;
            $scope.timestamp = timestamp;
        });

        // --- Subscribe to price loading ---
        listeners[3] = $rootScope.$on('ticker:loading', (e, loading) => {
            console.log('price loading', loading);
            $scope.priceLoading = loading;
        });

        // --- Unsubscribe when done ---
        $scope.$on('$destroy', () => {
            for (const f of listeners)
                if (f)
                    f();
        });


        // ==== Config ====
        // --- Selected location ---
        if (!user.selectedLocation) {
            $state.go('locations');
            return;
        }
        $scope.priceLoading = ticker.loading;
        $scope.location = user.selectedLocation;
        $scope.state = 'initial';
        $scope.usd_per_btc = ticker.usd_per_btc;
        $scope.timestamp = ticker.timestamp;


        // ==== Functions ====
        $scope.fetchPrice = () => {
            ticker.fetchNow(true);
        };

        $scope.requestToken = () => {

            // --- Require login ---
            if (!user.authenticated()) {
                $state.go('login');
                return;
            }

            // --- Request a token ---
            $scope.loading = 'true';
            $scope.state = 'token_loading';

            airbitz.getSelectedWallet()
                .then(wallet => {
                    $scope.walletName = wallet.name;
                    return airbitz.createReceiveRequest(wallet);
                })
                .then(bitcoin_address => api.post('/me/libertyx-codes', {
                    location_id: user.selectedLocation.id,
                    bitcoin_address
                }))
                .then(parseResponse)
                .catch(msg => {
                    if (msg)
                        notice.error(msg);
                    $scope.state = 'initial';
                })
                .finally(() => $scope.loading = false)
        };

        function parseResponse(response) {
            $scope.token = response.data.token;
            $scope.expiration = response.data.expiration * 1000;
            $scope.additionalNotes = response.data.additionalNotes;
            $scope.state = 'token_valid';
        }

        let notes = [$scope.location.fee_string];
        let stars = $scope.location.stars;
        let popular = $scope.location.popular;

        if (stars)
            notes.push(`${stars} ${stars > 1 ? 'stars' : 'star'}`);

        if (popular)
            notes.push('popular location');

        $scope.location.notes = notes;
    }]);