// --- Must do this in global scope for the templates to load properly ---
const templates = {
    login: require('./components/login/login.pug'),
    locations: require('./components/locations/locations.pug'),
    location_details: require('./components/location_details/location_details.pug'),
};

angular.module('libertyx')
    .config(['$urlRouterProvider', '$stateProvider', ($urlRouterProvider, $stateProvider) => {

        const states = [
            {
                name: 'locations',
                url: '/locations',
                controller: 'LocationSearchController',
                templateUrl: templates.locations
            },
            {
                name: 'login',
                url: '/login',
                controller: 'LoginController',
                templateUrl: templates.login
            },
            {
                name: 'location_details',
                url: '/location-details',
                controller: 'LocationDetailsController',
                templateUrl: templates.location_details
            }
        ];
        states.forEach(state => $stateProvider.state(state));

        $urlRouterProvider.otherwise('/locations');
    }])
    .run(['$transitions', '$state', 'airbitz', ($transitions, $state, airbitz) => {

        $transitions.onSuccess({to: '*'}, transition => {
            console.log(transition);
            airbitz.navStackClear();
            const to = transition.$to();
            if (to.name != 'locations')
                airbitz.navStackPush($state.href(to.name));

        });

    }]);