if (DEVELOPMENT) {

    const bridge: any = require('exports?_bridge=_bridge!/usr/src/app/lib/js/airbitz-bridge-dev.js');
    window._bridge = bridge._bridge;

    const airbitz: any = require('/usr/src/app/lib/js/airbitz-core.js');
    window.Airbitz = airbitz.Airbitz;

    require('exports?LIBERTYX_LABEL,LIBERTYX_CATEGORY,LIBERTYX_API_KEY!/usr/src/app/lib/js/config.js');
}

angular.module('libertyx')
    .factory('airbitz', ['$rootScope', '$q', '$filter', ($rootScope, $q, $filter) => {

        const label = Airbitz.config.get('LIBERTYX_LABEL');
        const category = Airbitz.config.get('LIBERTYX_CATEGORY');
        const bizIdStr = Airbitz.config.get('BIZID');

        Airbitz.core.setupWalletChangeListener(wallet => $rootScope.$emit('airbitz:wallet', {wallet}));

        const airbitz = {

            getSelectedWallet: () =>
                $q((resolve, reject) =>
                    Airbitz.core.getSelectedWallet({
                        success: resolve,
                        error: () => {
                            reject('Error getting Airbitz wallet');
                        }
                    })
                ),

            createReceiveRequest: wallet =>
                $q(function (resolve, reject) {
                    console.log('createReceiveRequest', {wallet});
                    Airbitz.core.createReceiveRequest(wallet, {
                        label,
                        category,
                        bizId: parseInt(bizIdStr),
                        success: request => {
                            Airbitz.core.finalizeReceiveRequest(wallet, request.address);
                            resolve(request.address);
                        },
                        error: () => {
                            reject('Error creating Airbitz receive request');
                        }
                    })
                }),

            navStackPush: path => {
                path = '/' + path;
                console.log('navStackPush:', path);
                Airbitz.ui.navStackPush(path);
            },
            navStackClear: () => {
                console.log('navStackClear');
                Airbitz.ui.navStackClear();
            },

            API_KEY: Airbitz.config.get('LIBERTYX_API_KEY')
        };

        $rootScope.launchExternal = (event, uri, queryParam) => {
            queryParam = queryParam || '';
            event.preventDefault();
            const target = uri + encodeURIComponent(queryParam);
            console.log('launchExternal()', target);
            Airbitz.ui.launchExternal(target);
        };

        return airbitz;
    }]);