///<reference path="../app.d.ts"/>
angular.module('libertyx').factory('$exceptionHandler', [() => {
    return function myExceptionHandler(exception, cause) {
        console.error({exception, cause});
    };
}]);