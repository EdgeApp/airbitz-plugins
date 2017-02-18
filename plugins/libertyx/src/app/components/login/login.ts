// Possible states:
//     initial
//     sms_sending
//     sms_successful
//     code_sending

angular.module('libertyx')
    .controller('LoginController', ['$state', '$scope', '$q', 'api', 'notice', 'user', ($state, $scope, $q, api, notice, user) => {
        $scope.loading = false;
        $scope.formData = {};
        $scope.state = 'initial';

        $scope.submitLogin = () => {

            // --- Send SMS ---
            if ($scope.state == 'initial') {
                $scope.loading = true;
                $scope.state = 'sms_sending';
                api.post('/sessions/actions/send-secret-code', $scope.formData)
                    .then(() => $scope.state = 'sms_successful')
                    .catch(() => $scope.state = 'initial')
                    .finally(stopLoadingIndicator)
            }

            // --- Submit secret code ---
            else if ($scope.state == 'sms_successful') {
                $scope.loading = true;
                $scope.state = 'code_sending';
                api.post('/sessions', $scope.formData)
                    .then(parseSessionId)
                    .then(() => $state.go('location_details'))
                    .catch(error => {
                        $scope.state = 'sms_successful';
                        console.log(error);
                    })
                    .finally(stopLoadingIndicator)
            }

            function stopLoadingIndicator() {
                $scope.loading = false;
            }

            function parseSessionId(response) {
                const sessionId = response.data.id;
                if (!sessionId) {
                    notice.error('Error confirming phone');
                    return $q.reject();
                }
                user.setSessionToken(response.data.id);
            }
        };

        $scope.$watch('formData.phone_number', value => {
            $scope.state = 'initial';
        });
    }]);