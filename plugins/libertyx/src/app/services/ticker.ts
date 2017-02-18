const REFRESH_INTERVAL = 60 * 1000;
const TTL = REFRESH_INTERVAL * 1.33;

angular.module('libertyx')
    .factory('ticker', ['$rootScope', '$interval', 'api', function ($rootScope, $interval, api) {

        const self = {
            timestamp: Date.now(),
            usd_per_btc: null,
            loading: false,
            promise: null,
            nextAttempt: Date.now(),
            failures: 0,

            start() {
                if (self.promise)
                    return;

                self.loading = false;
                self.promise = $interval(self.tick, 1000);
            },

            stop() {
                if (!self.promise)
                    return;

                $interval.cancel(self.promise);
                self.promise = null;
            },

            _setPrice(usd_per_btc) {
                self.usd_per_btc = usd_per_btc;
                if (usd_per_btc)
                    self.timestamp = Date.now();
                $rootScope.$emit('ticker:usd_per_btc', {usd_per_btc, timestamp: self.timestamp});
            },

            _setLoading(value) {
                self.loading = value;
                $rootScope.$emit('ticker:loading', value);
            },

            fetchNow(userRequested = false) {

                if (userRequested)
                    self._setPrice(null);

                // --- Only 1 request at a time ---
                if (self.loading)
                    return;

                // --- Get the price ---
                self._setLoading(true);

                return api.get('/bitcoin-price', {}, false)
                    .then(response => {
                        self._setPrice(response.data.usd_per_btc);
                        self.nextAttempt = Date.now() + REFRESH_INTERVAL;
                        self.failures = 0;
                    })
                    .catch(() => {
                        const delay = Math.min(1000 * Math.pow(2, ++self.failures), REFRESH_INTERVAL);
                        self.nextAttempt = Date.now() + delay;
                    })
                    .finally(() => self._setLoading(false))
            },

            tick() {
                // --- Expire old prices ---
                if (self.timestamp + TTL < Date.now() && self.usd_per_btc)
                    self._setPrice(null);

                // --- Only 1 request per `refresh_interval` ---
                if (Date.now() < self.nextAttempt)
                    return;

                self.fetchNow();
            }

        };
        return self;
    }]);