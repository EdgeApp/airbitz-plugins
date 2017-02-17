const uuid: any = require('uuid/v4');

angular.module('libertyx')
    .factory('user', ['$rootScope', ($rootScope) => ({
            authenticated() {
                return !!Airbitz.core.readData('sessionToken');
            },
            setSessionToken(token) {
                Airbitz.core.writeData('sessionToken', token);
                this.notifyAuthenticated();
            },
            sessionToken() {
                return Airbitz.core.readData('sessionToken');
            },
            deviceId() {
                let deviceId = Airbitz.core.readData('deviceId');
                if (!deviceId) {
                    deviceId = uuid();
                    Airbitz.core.writeData('deviceId', deviceId);
                }
                return deviceId;
            },
            logout() {
                this.setSessionToken(undefined);
            },
            notifyAuthenticated() {
                console.log('user:authenticated', this.authenticated());
                $rootScope.$emit('user:authenticated', this.authenticated());
            },
            selectedLocation: null,
            searchResults: []
        }
    )]);