/////////////////////////////////////////////////
// Required tasks
// gulp build
// bulp build:serve
// // /////////////////////////////////////////////

var gulp = require('gulp'),
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  autoprefixer = require('gulp-autoprefixer'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  del = require('del');
  nodemon = require('gulp-nodemon'),
  plumber = require('gulp-plumber'),
  jscs = require('gulp-jscs'),
  jshint = require('gulp-jshint'),
  jsonlint = require('gulp-jsonlint'),
  livereload = require('gulp-livereload'),
  handlebars = require('gulp-handlebars'),
  notify = require('gulp-notify'),
  declare = require('gulp-declare'),
  copy = require('gulp-copy'),
  path = require('path'),
  env = require('gulp-env'),
  walkdir = require('walkdir'),
  argv = require('yargs').argv,
  browserSync = require('browser-sync'),
  map = require('map-stream'),
  plugins = require('gulp-load-plugins')(),
  props = require('gulp-props2json'),
  compass = require('gulp-compass'),
  jasmineNode = require('gulp-jasmine-node'),
  jasmineBrowser = require('gulp-jasmine-browser'),
  gulpicon = require("gulpicon/tasks/gulpicon"),
  clean = require('gulp-clean'),
  tar = require('gulp-tar'),
  gzip = require('gulp-gzip'),
  asynch = require('async'),
  bump = require('gulp-bump'),
  nodeInspector = require('gulp-node-inspector'),
  reload = browserSync.reload;


// ////////////////////////////////////////////////
// Get Tasks
// // /////////////////////////////////////////////
function getTask(task) {
    return require('./gulp-tasks/' + task)(gulp, plugins, concat, uglify, errorlog, rename, sourcemaps, sass, autoprefixer);
}


// ////////////////////////////////////////////////
// Log Errors
// // /////////////////////////////////////////////
function errorlog(err){
  console.error(err.message);
  this.emit('end');
}


gulp.task('pak:dist', getTask('dist'));
gulp.task('bundlejs', getTask('bundlejs'));
gulp.task('bumpup', getTask('bumpup'));
gulp.task('precommit', ['jscs', 'jshint', 'jsonlint']);
gulp.task('clean', getTask('clean'));
gulp.task('compass', getTask('compass'));
gulp.task('icons', getTask('icons'));
gulp.task('scripts', getTask('scripts'));
gulp.task('hbs', getTask('hbs'));
gulp.task('precompile', getTask('precompile'));
gulp.task('component', getTask('component'));
gulp.task('set-env', getTask('set-env'));
gulp.task('develop', getTask('develop'));
gulp.task('watch', getTask('watch'));
gulp.task('jsonlint', getTask('jsonlint'));
gulp.task('jshint', getTask('jshint'));
gulp.task('prop2json', getTask('prop2json'));
gulp.task('jscs', getTask('jscs'));


// DEFAULT is used by Developers
gulp.task('default', ['set-env', 'jscs', 'scripts', 'icons', 'compass', 'hbs', 'precompile', 'jshint', 'jsonlint', 'prop2json', 'develop', 'watch']);

// PRE-COMMIT
gulp.task('precommit', ['jscs', 'jshint', 'jsonlint']);

// BUILD
gulp.task('build', ['set-env', 'jscs', 'scripts', 'icons', 'compass', 'hbs', 'precompile', 'jshint', 'jsonlint', 'prop2json', 'bundlejs']);

// TEST
gulp.task('jasmine', getTask('jasmine'));
gulp.task('jasminebrowser', getTask('jasminebrowser'));
gulp.task('test', ['build', 'develop', 'jasmine']);

// PACKAGE
gulp.task('pak', ['pak:dist'], getTask('pak'));
