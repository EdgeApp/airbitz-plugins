angular.module('libertyx')
    .factory('api', ['$http', '$q', '$state', 'user', 'notice', 'airbitz', ($http, $q, $state, user, notice, airbitz) => {
        let api: any = {};
        let baseUrl = DEVELOPMENT ? '/wallet-api/v1' : 'https://libertyx.com/wallet-api/v1';
        let requestId = 0;

        api.post = (path, params, notifyErrors = true) => apiRequest('POST', path, params, notifyErrors);
        api.get = (path, params, notifyErrors = true) => apiRequest('GET', path, params, notifyErrors);

        function apiRequest(method, path, params, notifyErrors) {
            console.log(`api ${method} ${path} -- ${JSON.stringify(params)}`);
            return airbitz
                .getSelectedWallet()
                .then(wallet => $http({
                    method,
                    url: baseUrl + path,
                    headers: {
                        Authorization: airbitz.API_KEY,
                        'X-User-Device-Id': user.deviceId(),
                        'X-Airbitz-Wallet-Id': wallet.id,
                        'X-User-Session': user.authenticated() ? user.sessionToken() : undefined
                    },
                    [method == 'GET' ? 'params' : 'data']: params,
                    cacheBust: `${Date.now()}.${requestId++}`
                }), () => notice.error('Error getting Airbitz wallet'))
                .then(
                    response => onHttpResponse(response, notifyErrors),
                    response => onHttpResponse(response, notifyErrors)
                )
        }

        function onHttpResponse(response, notifyErrors: boolean) {
            console.log('onHttpResponse(): ', response);

            // ---- Login required ----
            if (response.status == 401 || (response.data && response.data.code == 401)) {
                user.logout();
                return $q.reject(response);
            }

            let success = (200 <= response.status && response.status <= 299);

            // ---- Error ----
            if (!success) {
                console.log(JSON.stringify(response));
                let status = (response.status > 0) ? response.status : null;
                let msg: any = null;

                if (response.data && response.data.message)
                    msg = response.data.message;

                else if (status && response.statusText)
                    msg = status + ' ' + response.statusText;

                if (notifyErrors)
                    notice.error(msg || 'Unable to communicate with LibertyX');
                return $q.reject(response);
            }

            // ---- Success ----
            return response;
        }

        return api;
    }]);