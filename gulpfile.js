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
	reload = browserSync.reload;

// ////////////////////////////////////////////////
// Get Tasks //
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

gulp.task('test', getTask("test"));

gulp.task('jasminebrowser', getTask('jasminebrowser'));

gulp.task('sass', function() {
	gulp.src(process.cwd() + '/app/styles/v2/**/**/*.scss')
			.pipe(sass().on('error', sass.logError))
			//.pipe(plugins.cssmin())
			//.pipe(plugins.rename({suffix:'.min'}))
			.pipe(gulp.dest(process.cwd() + '/public/css/v2'))
})

// PACKAGE
gulp.task('pak', getTask('pak'));

//RELEASE
gulp.task('release', getTask('release'));
