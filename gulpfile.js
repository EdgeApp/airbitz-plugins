var gulp    = require('gulp'),
    inline  = require('gulp-inline'),
    concat  = require('gulp-concat'),
    listing = require('gulp-task-listing'),
    uglify  = require('gulp-uglify'),
    ngHtml2Js = require("gulp-ng-html2js"),
    watch     = require('gulp-watch'),
    fs        = require('fs');

var plugins = fs.readdirSync('plugins');
var core = function(bridge) {
  return gulp.src(['./lib/vendor/js/jquery-2.1.3.min.js',
            './lib/vendor/js/bootstrap.min.js',
            './lib/vendor/js/qrcode.min.js',
            bridge,
            './lib/js/airbitz-core.js'])
    .pipe(concat('core.js'))
    .pipe(gulp.dest('./build/intermediates/js'));
}

gulp.task('corestyle', function() {
  return gulp.src(['./lib/vendors/css/bootstrap.min.css'])
    .pipe(concat('core.css'))
    .pipe(gulp.dest('./build/intermediates/css'));
});

gulp.task('coredev', ['corestyle'], function() {
  return core('./lib/js/airbitz-bridge-dev.js');
});

gulp.task('core', ['corestyle'], function() {
  return core('./lib/js/airbitz-bridge.js');
});

plugins.map(function(plugin) {
  var build = function(platform, plugin) {
    gulp.src('./plugins/' + plugin + '/index.html')
    .pipe(inline({
      base: './plugins/' + plugin
    }))
    .pipe(inline({
      base: './build/intermediates'
    }))
    .pipe(gulp.dest('build/' + platform + '/' + plugin));
  };
  gulp.task(plugin + '-partials', function() {
    return gulp.src("./plugins/glidera/partials/*.html")
      .pipe(ngHtml2Js({
          moduleName: "exchangeGlidera",
          prefix: "/partials/"
      }))
      .pipe(concat('partials.js'))
      .pipe(gulp.dest("./build/intermediates/js/"));
  });
  gulp.task(plugin + '-dev', ['coredev', plugin + '-partials'], function() {
    build('dev', plugin);
  });
  gulp.task(plugin + '-android', ['core', plugin + '-partials'], function() {
    build('android', plugin);
  });
  gulp.task(plugin + '-watch', function () {
      watch('./plugins/' + plugin + '/**/*', function () {
          gulp.start(plugin + '-dev');
      });
  });
})

gulp.task('partials', function() {
    gulp.src("./plugins/glidera/partials/*.html")
      .pipe(ngHtml2Js({
          moduleName: "exchangeGlidera",
          prefix: "/partials/"
      }))
      .pipe(concat('partials.js'))
      .pipe(gulp.dest("./plugins/glidera/vendors/js/"));
});


gulp.task('help', listing);
gulp.task('default', ['help']);
