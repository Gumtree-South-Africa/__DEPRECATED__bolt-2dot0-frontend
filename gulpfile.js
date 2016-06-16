/////////////////////////////////////////////////
// Required tasks
// gulp build
// bulp build:serve
// // /////////////////////////////////////////////


var gulp = require('gulp'),
	sass = require('gulp-sass'),
	concat = require('gulp-concat'),
	del = require('del'),
	plumber = require('gulp-plumber'),
	jscs = require('gulp-jscs'),
	livereload = require('gulp-livereload'),
	handlebars = require('gulp-handlebars'),
	notify = require('gulp-notify'),
	declare = require('gulp-declare'),
	copy = require('gulp-copy'),
	env = require('gulp-env'),
	browserSync = require('browser-sync'),
	map = require('map-stream'),
	plugins = require('gulp-load-plugins')(),
	compass = require('gulp-compass'),
	jasmineBrowser = require('gulp-jasmine-browser'),
	clean = require('gulp-clean'),
	tar = require('gulp-tar'),
	bump = require('gulp-bump'),
	rename = require('gulp-rename'),
	cssmin = require('gulp-cssmin'),
	fs = require('fs'),
	runSequence = require('gulp-run-sequence'),
	shell = require("gulp-shell"),
	reload = browserSync.reload;

// ////////////////////////////////////////////////
// Get Tasks
// // /////////////////////////////////////////////
function getTask(task) {
	return require('./gulp-tasks/' + task)(gulp, plugins);
}

// ////////////////////////////////////////////////
// Log Errors
// // /////////////////////////////////////////////
function errorlog(err) {
	console.error(err.message);
	this.emit('end');
}

// STAND ALONE TASKS
gulp.task('bundlejs', getTask('bundlejs'));
gulp.task('bumpup', getTask('bumpup'));
gulp.task('precommit', ['jscs', 'jshint', 'jsonlint']);
gulp.task('clean', getTask('clean'));
gulp.task('compass', getTask('compass'));
gulp.task('icons', getTask('icons'));
gulp.task('precompile', getTask('precompile'));
gulp.task('component', getTask('component'));
gulp.task('set-env', getTask('set-env'));
gulp.task('develop', getTask('develop'));
gulp.task('jsonlint', getTask('jsonlint'));
gulp.task('jshint', getTask('jshint'));
gulp.task('prop2json', getTask('prop2json'));
gulp.task('jscs', getTask('jscs'));
gulp.task('watch', getTask('watch'));

// PRE-COMMIT
gulp.task('precommit', ['jscs', 'jshint', 'jsonlint']);

// BUILD
gulp.task('build', ['set-env', 'jscs', 'bundlejs', 'icons', 'compass', 'precompile', 'jshint', 'jsonlint']);

// DEFAULT is used by Developers
gulp.task('default', function (done) {
    runSequence('build', ['develop', 'watch'], done);
});

// TEST
gulp.task('jasmine', shell.task([
	'NODE_ENV=mock NODE_CONFIG_DIR=./server/config ' +
	'JASMINE_CONFIG_PATH=./test/jasmine.json ' +
	'./node_modules/jasmine/bin/jasmine.js'
]));

gulp.task('test', (done) => {
	runSequence('build', 'jasmine', done);
});

gulp.task('jasminebrowser', getTask('jasminebrowser'));

// PACKAGE
gulp.task('pak', getTask('pak'));

//RELEASE
gulp.task('release', getTask('release'));
