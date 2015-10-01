'use strict';

var gulp        = require('gulp');
var plugins     = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var server      = require('gulp-develop-server' );
var webpack     = require("webpack");
var coveralls   = require('coveralls');
var exec        = require('child_process').exec;
 
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
  runSequence('clean', 'test:node', 'test:browser', function (err) {
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
    .pipe(plugins.rename('stellar-sdk.js'))
    .pipe(gulp.dest('dist'))
    .pipe(plugins.uglify())
    .pipe(plugins.rename('stellar-sdk.min.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('test:node', ['build:node'], function() {
  return gulp.src(["test/unit/**/*.js"])
    .pipe(plugins.mocha({
      require: ['./test/test-helper.js'],
      reporter: ['dot']
    }));
});

gulp.task('test:browser', ["build:browser"], function (done) {
  var Server = require('karma').Server;
  var server = new Server({ configFile: __dirname + '/karma.conf.js' });
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

gulp.task('submit-coverage', function(done) {
  var child = exec('node ./node_modules/coveralls/bin/coveralls.js < ./coverage/lcov.info', 
    function(err, stdout, stderr) {
      done(err);
    });
});
