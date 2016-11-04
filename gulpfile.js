'use strict';
/////////////////////////////////////////////////
// Required tasks
// gulp build
// bulp build:serve
// // /////////////////////////////////////////////


var gulp = require('gulp'),
	concat = require('gulp-concat'),
	del = require('del'),
	plumber = require('gulp-plumber'),
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
	through2 = require('through2'),
	path = require('path'),
	mkdirp = require('mkdirp'),
	newer = require('gulp-newer'),
	phantom = require('phantom'),
	cssmin = require('gulp-cssmin'),
	fs = require('fs'),
	runSequence = require('gulp-run-sequence'),
	reload = browserSync.reload;


// ////////////////////////////////////////////////
// Log Errors
// // /////////////////////////////////////////////
function errorlog(err) {
	console.error(err.message);
	this.emit('end');
}

// ////////////////////////////////////////////////
// Register gulp tasks
// // /////////////////////////////////////////////
(function runTaskRegisters(taskRegisterNames) {
	// Each gulp-task file will actually return a function which will register
	// corresponding tasks.
	taskRegisterNames.forEach(
		taskRegisterName => require('./gulp-tasks/' + taskRegisterName)(gulp, plugins)());
})([
	'bundlejs',
	'bumpup',
	'clean',
	'compass',
	'sass',
	'icons',
	'precompile',
	'precompile2',
	'component',
	'set-env',
	'develop',
	'jsonlint',
	'prop2json',
	'eslint',
	'watch',
	'webpack',
	'svgSprite',
	'svgFallback',
	'webpackPrepare',
	'svgIcons',
	'test',
	'icons2',
	'jasminebrowser',
	'pak',
	'release'
]);

// PRE-COMMIT
gulp.task('precommit', ['jsonlint', 'eslint']);

// BUILD

gulp.task('build', ['set-env', 'eslint', 'webpack', 'svgSprite', 'svgFallback', 'bundlejs', 'svgIcons', 'icons', 'sass', 'compass', 'precompile', 'jsonlint']);

// DEFAULT is used by Developers
gulp.task('default', function(done) {
	runSequence('build', ['develop', 'watch'], done);
});
