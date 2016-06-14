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
	walkdir = require('walkdir'),
	argv = require('yargs').argv,
	browserSync = require('browser-sync'),
	map = require('map-stream'),
	plugins = require('gulp-load-plugins')(),
	compass = require('gulp-compass'),
	jasmineNode = require('gulp-jasmine-node'),
	jasmineBrowser = require('gulp-jasmine-browser'),
	clean = require('gulp-clean'),
	tar = require('gulp-tar'),
	gzip = require('gulp-gzip'),
	asynch = require('async'),
	bump = require('gulp-bump'),
	gulpif = require('gulp-if'),
	rename = require('gulp-rename'),
	cssmin = require('gulp-cssmin'),
	conventionalChangelog = require('gulp-conventional-changelog'),
	conventionalGithubReleaser = require('conventional-github-releaser'),
	gutil = require('gulp-util'),
	git = require('gulp-git'),
	fs = require('fs'),
	runSequence = require('gulp-run-sequence'),
	nodeInspector = require('gulp-node-inspector'),
	loadingSpinner = require('loading-spinner'),
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
gulp.task('precommit', ['eslint', 'jsonlint']);
gulp.task('clean', getTask('clean'));
gulp.task('compass', getTask('compass'));
gulp.task('icons', getTask('icons'));
gulp.task('precompile', getTask('precompile'));
gulp.task('component', getTask('component'));
gulp.task('set-env', getTask('set-env'));
gulp.task('develop', getTask('develop'));
gulp.task('jsonlint', getTask('jsonlint'));
gulp.task('prop2json', getTask('prop2json'));
gulp.task('jscs', getTask('jscs'));
gulp.task('eslint', getTask('eslint'));
gulp.task('watch', getTask('watch'));

// PRE-COMMIT
gulp.task('precommit', ['jsonlint', 'eslint']);

// BUILD
gulp.task('build', ['set-env', 'eslint', 'bundlejs', 'icons', 'compass', 'precompile', 'jsonlint']);

// DEFAULT is used by Developers
gulp.task('default', function (done) {
    runSequence('build', ['develop', 'watch'], done);
});

// TEST
gulp.task('jasmine', getTask('jasmine'));
gulp.task('jasminebrowser', getTask('jasminebrowser'));


//TODO: move to a separate file
gulp.task('test', function(callback) {
	process.stdout.write('Test Task is running...\r\n');
	var stream =
    runSequence(
      'build',
			'develop',
			'jasmine',
			function(error) {
				if (error) {
					console.log(error.message);
				} else {
					console.log('Congratulations!!! TEST TASK DONE SUCCESSFULLY');
				}
				callback(error);
			});
	return stream;
});

// PACKAGE
gulp.task('pak', getTask('pak'));

//RELEASE
gulp.task('release', getTask('release'));
