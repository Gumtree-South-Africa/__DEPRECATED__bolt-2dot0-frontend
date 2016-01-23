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
  gulpicon = require("gulpicon/tasks/gulpicon"),
  clean = require('gulp-clean'),
  asynch = require('async'),
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


//TODO: add clean|copyTo Task and env checking.


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
gulp.task('watch', getTask('Watch'));
gulp.task('jsonlint', getTask('jsonlint'));
gulp.task('jshint', getTask('jshint'));
gulp.task('prop2json', getTask('prop2json'));
gulp.task('jscs', getTask('jscs'));
gulp.task('jasmine', getTask('jasmine'));
gulp.task('test', ['build', 'develop', 'jasmine']);
gulp.task('build', ['set-env', 'jscs', 'scripts', 'icons', 'compass', 'hbs', 'precompile', 'jshint', 'jsonlint', 'prop2json']);
gulp.task('default', ['set-env', 'jscs', 'scripts', 'icons', 'compass', 'hbs', 'precompile', 'jshint', 'jsonlint', 'prop2json', 'develop', 'watch']);
