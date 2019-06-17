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
  return gulp
    .src(['dist', 'lib'], { read: false, allowEmpty: true })
    .pipe(plugins.rimraf());
});

gulp.task(
  'build:node',
  gulp.series(
    // TODO: output directly to "lib" folder (see tsconfig.json).
    function buildNode(done) {
      // TODO: Gulp-ify using `gulp-typescript`.
      try {
        cp.execSync(`tsc`, {stdio: 'inherit'})
        done()
      } catch(err) {
        done(err)
      }
    },
    function flatten() {
      return gulp.src('lib/src/**')
          .pipe(gulp.dest('lib'))
    },
    function flattenClean() {
      return gulp.src('lib/src')
          .pipe(plugins.rimraf());
    }
    )
);

gulp.task(
  'build:docs',
  gulp.series(
    // TODO: output directly to "lib" folder (see tsconfig.json).
    function buildNode(done) {
      // TODO: Gulp-ify using `gulp-typescript`.
      try {
        cp.execSync(`tsc --removeComments false --outDir libdocs --target es6 --module esnext`, {stdio: 'inherit'})
        done()
      } catch(err) {
        done(err)
      }
    },
    function flatten() {
      return gulp.src('libdocs/src/**')
          .pipe(gulp.dest('libdocs'))
    },
    function flattenClean() {
      return gulp.src('libdocs/src')
          .pipe(plugins.rimraf());
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
  return gulp
    .src(['coverage'], { read: false, allowEmpty: true })
    .pipe(plugins.rimraf());
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

gulp.task(
  'hooks:precommit',
  gulp.series('build', function hooksPrecommit() {
    return gulp.src(['dist/*', 'lib/*']).pipe(plugins.git.add());
  })
);

gulp.task('default', gulp.series('build'));