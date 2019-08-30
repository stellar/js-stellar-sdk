'use strict';

var cp = require('child_process');
var gulp = require('gulp');
var isparta = require('isparta');
var plugins = require('gulp-load-plugins')();
var server = require('gulp-develop-server');
var webpack = require('webpack');
var webpackStream = require('webpack-stream');
var webpackConfigBrowser = require('./webpack.config.browser.js');
var clear = require('clear');
var plumber = require('gulp-plumber');
var del = require('del');

gulp.task('lint:src', function lintSrc() {
  return gulp
    .src(['src/**/*.ts'])
    .pipe(plumber())
    .pipe(plugins.tslint({ formatter: "verbose" }))
    .pipe(plugins.tslint.report());
});

// Lint our test code
gulp.task('lint:test', function lintTest() {
  return gulp
    .src(['test/unit/**/*.js', 'gulpfile.js'])
    .pipe(plumber())
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format())
    .pipe(plugins.eslint.failAfterError());
});

gulp.task('clean', function clean() {
  return del(['dist/', 'lib/']);
});

gulp.task(
  'build:node',
  gulp.series(
    function buildNode(done) {
      // TODO: Gulp-ify using `gulp-typescript`.
      try {
        cp.execSync(`tsc`, {stdio: 'inherit'})
        done()
      } catch(err) {
        done(err)
      }
    }
    )
);

gulp.task(
  'build:docs',
  gulp.series(
    function buildNode(done) {
      // TODO: Gulp-ify using `gulp-typescript`.
      try {
        cp.execSync(`tsc --removeComments false --outDir libdocs --target es6 --module esnext`, {stdio: 'inherit'})
        done()
      } catch(err) {
        done(err)
      }
    }
    )
);

gulp.task(
  'build:browser',
  gulp.parallel(
    'lint:src',
    function buildBrowser() {
      return gulp
        .src('src/browser.ts')
        .pipe(
          webpackStream(webpackConfigBrowser), webpack
        )
        .pipe(gulp.dest('dist'))
    }
  )
);

gulp.task(
  'test:unit',
  gulp.series('build:node', function testUnit() {
    return gulp.src(['test/test-nodejs.js', 'test/unit/**/*.js']).pipe(
      plugins.mocha({
        reporter: ['spec']
      })
    );
  })
);

gulp.task(
  'test:browser',
  gulp.series('build:browser', function testBrowser(done) {
    var Server = require('karma').Server;
    var server = new Server(
      { configFile: __dirname + '/karma.conf.js' },
      (exitCode) => {
        if (exitCode !== 0) {
          done(new Error(`Bad exit code ${exitCode}`));
        } else {
          done();
        }
      }
    );
    server.start();
  })
);

gulp.task(
  'test:sauce',
  gulp.series(gulp.parallel('build:browser', 'build:node'), function testSauce(done) {
    var Server = require('karma').Server;
    var server = new Server(
      { configFile: __dirname + '/karma-sauce.conf.js' },
      (exitCode) => {
        if (exitCode !== 0) {
          done(new Error(`Bad exit code ${exitCode}`));
        } else {
          done();
        }
      }
    );
    server.start();
  })
);

gulp.task('clear-screen', function clearScreen(cb) {
  clear();
  cb();
});

gulp.task('clean-coverage', function cleanCoverage() {
  return del(['coverage']);
});

gulp.task(
  'test:init-istanbul',
  gulp.series('clean-coverage', function testInitIstanbul() {
    return gulp
      .src(['src/**/*.js'])
      .pipe(
        plugins.istanbul({
          instrumenter: isparta.Instrumenter
        })
      )
      .pipe(plugins.istanbul.hookRequire());
  })
);

gulp.task(
  'test:integration',
  gulp.series('build:node', 'test:init-istanbul', function testIntegration() {
    return gulp
      .src([
        'test/test-nodejs.js',
        'test/unit/**/*.js',
        'test/integration/**/*.js'
      ])
      .pipe(
        plugins.mocha({
          reporter: ['spec']
        })
      )
      .pipe(plugins.istanbul.writeReports());
  })
);

gulp.task('submit-coverage', function submitCoverage() {
  return gulp.src('./coverage/**/lcov.info').pipe(plugins.coveralls());
});

gulp.task('build', gulp.series('clean', 'build:node', 'build:browser'));

gulp.task(
  'test',
  gulp.series('clean', 'test:unit', 'test:browser', function test(done) {
    server.kill();
    done();
  })
);

gulp.task(
  'watch',
  gulp.series('build', function watch() {
    return gulp.watch('lib/**/*', ['clear-screen', 'build']);
  })
);

gulp.task('default', gulp.series('build'));
