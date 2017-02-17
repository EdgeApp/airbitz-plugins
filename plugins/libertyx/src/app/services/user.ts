const uuidV4: any = require('uuid/v4');
const uuidV1: any = require('uuid/v1');

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
                    deviceId = uuidV4() || uuidV1();
                    Airbitz.core.writeData('deviceId', deviceId);
                }
                return deviceId;
            },
            logout() {
                this.setSessionToken(false);
            },
            notifyAuthenticated() {
                console.log('user:authenticated', this.authenticated());
                $rootScope.$emit('user:authenticated', this.authenticated());
            },
            selectedLocation: null,
            searchResults: []
        }
    )]);