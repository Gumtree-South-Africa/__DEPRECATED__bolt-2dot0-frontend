'use strict';
/////////////////////////////////////////////////
// Required tasks
// gulp build
// bulp build:serve
// // /////////////////////////////////////////////


var gulp = require('gulp'),
	plugins = require('gulp-load-plugins')(),
	runSequence = require('gulp-run-sequence');

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
