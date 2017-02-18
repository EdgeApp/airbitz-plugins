angular.module('libertyx')
    .controller('LocationSearchController', ['$scope', '$http', '$q', '$state', 'api', 'notice', 'user', ($scope, $http, $q, $state, api, notice, user) => {
        $scope.nearbyLocations = user.searchResults || [];
        $scope.submitSearch = () => {

            const address = $scope.query;

            $q.when(true)
                .then(showLoadingIndicator)
                .then(geocodeAddress)
                .then(parseGeocodeResponse)
                .then(findNearbyLocations)
                .then(parseLocations)
                .catch(catchExceptions)
                .finally(hideLoadingIndicator);

            function showLoadingIndicator() {
                $scope.loading = true;
                $scope.nearbyLocations = [];
            }

            function geocodeAddress() {
                return $http({
                    method: 'GET',
                    headers: {'X-Requested-With': undefined},
                    url: 'https://maps.googleapis.com/maps/api/geocode/json',
                    params: {address}
                })
            }

            function parseGeocodeResponse(response) {
                const status = response && response.data && response.data.status;

                // --- No results ---
                if (status == 'ZERO_RESULTS') {
                    return $q.reject({msg: 'Unable to find the address or ZIP'});
                }

                // --- Other problems ---
                if (status != 'OK') {
                    return $q.reject({msg: 'Error using Google Maps to find the address or ZIP'});
                }

                // --- Found some results ---
                return response.data.results[0].geometry.location; // {lat, lng}
            }

            function findNearbyLocations({lat, lng}) {
                return api.get('/store-locations', {lat, lng})
            }

            function parseLocations(results) {
                user.searchResults = results.data.store_locations;
                $scope.nearbyLocations = user.searchResults;
                if ($scope.nearbyLocations.length == 0)
                    notice.warning('We didn\'t find any nearby locations', null);
            }

            function catchExceptions(error) {
                notice.error(error && error.msg || 'Error searching for locations');
            }

            function hideLoadingIndicator() {
                $scope.loading = false;
            }

        };

        $scope.onLocationChosen = l => {
            console.log('onLocationChosen', l);
            user.selectedLocation = l;
            $state.go('location_details');
        };
    }]);