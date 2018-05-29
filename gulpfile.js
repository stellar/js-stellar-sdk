'use strict';

var gulp        = require('gulp');
var isparta     = require('isparta');
var plugins     = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var server      = require('gulp-develop-server' );
var webpack     = require("webpack");
var exec        = require('child_process').exec;
var fs          = require("fs");
 
gulp.task('default', ['build']);

gulp.task('lint:src', function() {
  return gulp.src(['src/**/*.js'])
    .pipe(plugins.plumber())
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('jshint-stylish'))
    .pipe(plugins.jshint.reporter('fail'));
});

// Lint our test code
gulp.task('lint:test', function() {
  return gulp.src(['test/unit/**/*.js'])
    .pipe(plugins.plumber())
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('jshint-stylish'))
    .pipe(plugins.jshint.reporter('fail'));
});

gulp.task('build', function(done) {
  runSequence('clean', 'build:node', 'build:browser', done);
});

gulp.task('test', function(done) {
  runSequence('clean', 'test:unit', 'test:browser', function (err) {
    server.kill();
    done();
  });
});


gulp.task('hooks:precommit', ['build'], function() {
  return gulp.src(['dist/*', 'lib/*'])
    .pipe(plugins.git.add());
});

gulp.task('build:node', ['lint:src'], function() {
    return gulp.src('src/**/*.js')
        .pipe(plugins.babel())
        .pipe(gulp.dest('lib'));
});

gulp.task('build:browser', ['lint:src'], function() {
  return gulp.src('src/browser.js')
    .pipe(plugins.webpack({
      output: { library: 'StellarSdk' },
      module: {
        loaders: [
          { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'}
        ],
      },
      plugins: [
        // Ignore native modules (ed25519)
        new webpack.IgnorePlugin(/ed25519/)
      ]
    }))
    // Add EventSource polyfill for IE11
    .pipe(plugins.insert.prepend(fs.readFileSync('./node_modules/event-source-polyfill/src/eventsource.min.js')))
    .pipe(plugins.rename('stellar-sdk.js'))
    .pipe(gulp.dest('dist'))
    .pipe(plugins.uglify({
      output: {
        ascii_only: true
      }
    }))
    .pipe(plugins.rename('stellar-sdk.min.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('test:init-istanbul', ['clean-coverage'], function () {
  return gulp.src(['src/**/*.js'])
    .pipe(plugins.istanbul({
      instrumenter: isparta.Instrumenter
    }))
    .pipe(plugins.istanbul.hookRequire());
});

gulp.task('test:integration', ['build:node', 'test:init-istanbul'], function() {
  return gulp.src(["test/test-helper.js", "test/unit/**/*.js", "test/integration/**/*.js"])
    .pipe(plugins.mocha({
      reporter: ['spec']
    }))
    .pipe(plugins.istanbul.writeReports());
});

gulp.task('test:unit', ['build:node'], function() {
  return gulp.src(["test/test-helper.js", "test/unit/**/*.js"])
    .pipe(plugins.mocha({
      reporter: ['spec']
    }));
});


gulp.task('test:browser', ["build:browser"], function (done) {
  var Server = require('karma').Server;
  var server = new Server({ configFile: __dirname + '/karma.conf.js' });
  server.start(function() {
    done();
  });
});

gulp.task('test:sauce', ["build:browser"], function (done) {
  var Server = require('karma').Server;
  var server = new Server({ configFile: __dirname + '/karma-sauce.conf.js' });
  server.start(function() {
    done();
  });
});

gulp.task('clean', function () {
  return gulp.src('dist', { read: false })
      .pipe(plugins.rimraf());
});

gulp.task('watch', ['build'], function() {
  gulp.watch('lib/**/*', ['build']);
});

gulp.task('clean-coverage', function() {
  return gulp.src(['coverage'], { read: false })
    .pipe(plugins.rimraf());
});

gulp.task('submit-coverage', function() {
  return gulp
    .src("./coverage/**/lcov.info")
    .pipe(plugins.coveralls());
});
