angular.module('libertyx').directive('formField', [function () {
    let idGen = 1;
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        require: '^?form',
        template: (elem, attrs: any) => {
            let options;
            const inputId = 'form-field-' + idGen++;
            const ngModel = attrs.ngModel || '';
            const ngDisabled = attrs.ngDisabled || '';
            const label = attrs.label || '';

            if (attrs.type == 'radio') {
                // ---- Radio button ----
                options = attrs.options.split('|');
                let html = '<div>' +
                    '<label class="control-label">' + label + '</label>' +
                    '<div>';
                angular.forEach(options, option => {
                    const labelValue = option.split(':');
                    html += '<label class="radio-inline radio-styled">' +
                        '<input type="radio" name="' + inputId + '" ng-disabled="' + ngDisabled + '" ng-model="' + ngModel + '" value="' + labelValue[1] + '"><span>' + labelValue[0] + '</span>' +
                        '</label>';
                });
                return html + '</div></div>';

            } else if (attrs.type == 'checkbox') {
                // ---- Checkbox ----
                options = attrs.options ? attrs.options.split('|') : [true, false];
                return '<div class="checkbox checkbox-styled">' +
                    '<label>' +
                    '<input ' +
                    'type="checkbox" ' +
                    'name="' + inputId + '" ' +
                    'ng-model="' + ngModel + '" ' +
                    'ng-disabled="' + ngDisabled + '" ' +
                    'ng-true-value="' + options[0] + '" ' +
                    'ng-false-value="' + options[1] + '" ' +
                    '/>' +
                    '<span>' + label + '</span>' +
                    '</label>' +
                    '</div>';

            } else if (attrs.type == 'number') {
                // ---- Number ----
                const step = attrs.step ? 'step="' + attrs.step + '" ' : "";
                const min = attrs.min ? 'min="' + attrs.min + '" ' : "";
                const max = attrs.max ? 'max="' + attrs.max + '" ' : "";

                return '<div>' +
                    '<label class="control-label hovering" for="' + inputId + '" >' + label + '</label>' +
                    '<input ' +
                    'name="' + inputId + '" ' +
                    'type="number" ' + step + min + max +
                    'class="form-control hovering" ' +
                    'ng-model="' + ngModel + '" ng-disabled="' + ngDisabled + '" />' +
                    '<div class="form-control-line"></div>' +
                    '<span style="left: 0;" class="help-block"></span>' +
                    '</div>';

            } else {
                // ---- Other ----
                const attrItems: any[] = [];
                angular.forEach(attrs.$attr, (name, key) => {
                    const value = attrs[key];
                    const attrString = name + (value ? '="' + value + '"' : '');
                    attrItems.push(attrString);
                });
                const attrString = attrItems.join(' ');

                return '<div class="col-xs-12 col-sm-6">' +
                    '<input ' +
                    'name="' + inputId + '" ' +
                    'class="form-control hovering" ' +
                    attrString +
                    '/>' +
                    '<label class="control-label hovering" for="' + inputId + '" >' + label + '</label>' +
                    '<div class="form-control-line"></div>' +
                    '<span style="left: 0;" class="help-block"></span>' +
                    '<ng-transclude></ng-transclude>' +
                    '</div>';
            }
        },
        link: function (scope, elem, attrs: any, ctrl) {
            const input = elem.find('input');
            const name = input.attr('name');
            ctrl = ctrl || {};
            const inputCtrl = ctrl[name];

            // ---- CSS: .focused ----
            if (attrs.type != 'radio' && attrs.type != 'checkbox') {
                elem.addClass('form-group hovering');

                input.bind('focus', () => elem.addClass('focused'));

                input.bind('blur', function () {
                    if (!this.value) {
                        elem.removeClass('focused');
                    }
                });

                scope.$watch(attrs.ngModel, val => {
                    if (!input.is(':focus') && (val === null || val === "")) {
                        elem.removeClass('focused');
                    } else if (val !== null || val !== "") {
                        elem.addClass('focused');
                    }
                });
            }

            // ---- Watch for errors ----
            if (attrs.ngModel) {
                const modelName = attrs.ngModel.split('.')[0];
                const modelKeyPath = attrs.ngModel.split('.').slice(1).join('.');
                scope.$watch('schemaErrors.' + modelName, schemaErrors => {
                    const schemaError = (schemaErrors || {})[modelKeyPath];
                    let isValid = !schemaError;
                    if (inputCtrl) {
                        inputCtrl.$setValidity('schemaValid', isValid);
                    }
                    elem.toggleClass('has-error', !isValid);
                    elem.find('.help-block').html((schemaError || {}).message || '');
                });
            }

        }
    };
}]);