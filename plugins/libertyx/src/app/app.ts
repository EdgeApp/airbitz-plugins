// --- Webpack ---
function requireAll(r) {
    r.keys().forEach(r);
}


// --- jQuery ---
require('script-loader!jquery');


// --- Angular ---
require('angular');
require('angular-ui-router');


// --- CSS ---
requireAll(require.context('./components', true, /\.scss$/));
requireAll(require.context('../assets', true, /\.scss$/));
require('toastr/build/toastr.min.css');


// --- LibertyX ---
angular.module('libertyx', ['ui.router']);

require('./app.config.ts');
require('./app.routes.ts');
requireAll(require.context('./components', true, /\.ts$/));
requireAll(require.context('./directives', true, /\.ts$/));
requireAll(require.context('./services', true, /\.ts$/));