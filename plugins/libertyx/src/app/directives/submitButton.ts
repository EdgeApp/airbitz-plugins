angular.module('libertyx')
    .directive('submitButton', function () {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template: function (elem, attrs: any) {
                const type = attrs.type || 'submit';
                const cls = attrs.class || 'btn btn-primary';
                return '<button type="' + type + '" class="' + cls + '" style="position: relative;">' +
                    '<div style="position:absolute; display: inline-block; left:0; right:0; bottom:0; top:0;" ng-hide="!loading">' +
                    '  <div style="display: table; width: 100%; height: 100%;">' +
                    '    <div style="display: table-cell; vertical-align: middle;">' +
                    '      <div style="margin-left: auto; margin-right: auto;">' +
                    '        <div class="sk-three-bounce">' +
                    '          <div class="sk-child sk-bounce1"></div>' +
                    '          <div class="sk-child sk-bounce2"></div>' +
                    '          <div class="sk-child sk-bounce3"></div>' +
                    '        </div>' +
                    '      </div>' +
                    '    </div>' +
                    '  </div>' +
                    '</div>' +
                    '<div ng-transclude ng-style="loading && {opacity: 0} || {opacity: 1}"></div>' +
                    '</button>';
            }
        };
    });