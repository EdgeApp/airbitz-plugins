import toastr = require('toastr');
import angular = require('angular');

angular.module('libertyx')
    .factory('notice', [() => ({
        success: (text, title = 'Success', opt) => toastr.success(text, title, opt),
        error: (text, title = 'Error', opt) => toastr.error(text, title, opt),
        warning: (text, title = 'Warning', opt) => toastr.warning(text, title, opt),
        clear: () => toastr.clear()
    })]);