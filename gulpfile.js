var gulp    = require('gulp'),
    inline  = require('gulp-inline'),
    concat  = require('gulp-concat'),
    copy    = require('gulp-copy'),
    listing = require('gulp-task-listing'),
    uglify  = require('gulp-uglify'),
    fs      = require('fs');

var plugins = fs.readdirSync('plugins');
var corestyle = function() {
  return gulp.src('./lib/vendor/css/*')
    .pipe(concat('core.css'))
    .pipe(gulp.dest('./build/intermediates/css'));
}
var core = function(bridge) {
  return gulp.src(['./lib/vendor/js/jquery-2.1.3.min.js',
            './lib/vendor/js/bootstrap.min.js',
            './lib/vendor/js/qrcode.min.js',
            bridge,
            './lib/js/airbitz-core.js'])
    .pipe(concat('core.js'))
    .pipe(gulp.dest('./build/intermediates/js'));
}
gulp.task('coredev', function() {
  corestyle();
  return core('./lib/js/airbitz-bridge-dev.js');
});

gulp.task('core', function() {
  corestyle();
  return core('./lib/js/airbitz-bridge.js');
});

plugins.map(function(plugin) {
  var build = function(platform, plugin) {
    gulp.src('./plugins/' + plugin + '/index.html')
    .pipe(inline({
      base: './plugins/' + plugin,
      js: uglify({compress:false, preserveComments:false})
    }))
    .pipe(inline({
      base: './build/intermediates',
      js: uglify({compress:false, preserveComments:false})
    }))
    .pipe(gulp.dest('build/' + platform + '/' + plugin));
  };
  gulp.task(plugin + '-dev', ['coredev'], function() {
    build('dev', plugin);
  });
  gulp.task(plugin + '-android', ['core'], function() {
    build('android', plugin);
  });
})

gulp.task('help', listing);
gulp.task('default', ['help']);
