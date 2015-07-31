var gulp    = require('gulp'),
    inline  = require('gulp-inline'),
    concat  = require('gulp-concat'),
    listing = require('gulp-task-listing'),
    uglify  = require('gulp-uglify'),
    ngHtml2Js = require("gulp-ng-html2js"),
    watch     = require('gulp-watch'),
    connect   = require('gulp-connect'),
    fs        = require('fs');

var plugins = fs.readdirSync('plugins');
var core = function(bridge) {
  return gulp.src(['./lib/vendor/js/jquery-2.1.3.min.js',
            './lib/vendor/js/bootstrap.min.js',
            './lib/vendor/js/qrcode.min.js'].
            concat(bridge).concat(
            ['./lib/js/airbitz-core.js']))
    .pipe(concat('abc.js'))
    .pipe(gulp.dest('./build/intermediates/js'));
}

gulp.task('corestyle-android', function() {
  return gulp.src(['./lib/vendors/css/bootstrap.min.css'])
    .pipe(concat('./lib/css/core.css'))
    .pipe(concat('./lib/css/core-android.css'))
    .pipe(gulp.dest('./build/intermediates/css'));
});

gulp.task('corestyle-ios', function() {
  return gulp.src(['./lib/vendors/css/bootstrap.min.css'])
    .pipe(concat('./lib/css/core.css'))
    .pipe(concat('./lib/css/core-ios.css'))
    .pipe(gulp.dest('./build/intermediates/css'));
});

gulp.task('coredev', ['corestyle-android'], function() {
  return core(['./lib/js/config.js', './lib/js/airbitz-bridge-dev.js']);
});

gulp.task('core-android', ['corestyle-android'], function() {
  return core(['./lib/js/airbitz-bridge-android.js']);
});

gulp.task('core-ios', ['corestyle-ios'], function() {
  return core(['./lib/js/airbitz-bridge-ios.js']);
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

    gulp.src('./plugins/' + plugin + '/img/*')
        .pipe(gulp.dest('build/' + platform + '/' + plugin + '/img'))
        .pipe(connect.reload());
  };
  gulp.task(plugin + '-partials', function() {
    return gulp.src(["./plugins/glidera/partials/*.html",
                     "./plugins/glidera/**/partials/*.html"])
      .pipe(ngHtml2Js({
          moduleName: "app"
      }))
      .pipe(concat('partials.js'))
      .pipe(gulp.dest("./build/intermediates/js/"));
  });
  gulp.task(plugin + '-dev', ['coredev', plugin + '-partials'], function() {
    build('dev', plugin);
  });
  gulp.task(plugin + '-android', ['core-android', plugin + '-partials'], function() {
    build('android', plugin);
  });
  gulp.task(plugin + '-ios', ['core-ios', plugin + '-partials'], function() {
    build('ios', plugin);
  });
  gulp.task(plugin + '-serve', [plugin + '-dev'], function() {
    connect.server({
      root: ['build/dev/' + plugin]
    });
  });
  gulp.task(plugin + '-watch', function () {
      watch('./plugins/' + plugin + '/**/*', function () {
          gulp.start(plugin + '-dev');
      });
  });
})

gulp.task('help', listing);
gulp.task('default', ['help']);
