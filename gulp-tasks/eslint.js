'use strict';

const gulpEslint = require('gulp-eslint');

//////////////////////////////////////////////////
//ES Lint
//// /////////////////////////////////////////////
module.exports = function eslint(gulp) {
	return function() {
		gulp.task('eslint', function() {
			let argv = require('yargs').argv;
			let stream = gulp.src([
				// 'app/controllers/page/isotopePrototype/*.js',
				// 'app/appWeb/views/components/responsiveBreakpointDetection/js/*.js',
				// 'app/appWeb/views/components/adTile/js/*.js',
				// 'app/appWeb/views/components/recentActivity/js/*.js',
				// 'app/appWeb/views/components/tileGrid/js/*.js',
				'app.js',
				'app/**/*.js',
				'server/**/*.js',
				'test/**/*.js',
				'gulp-tasks/eslint.js',
				'.eslintignore',
				'.eslintrc'
			])
				.pipe(gulpEslint())
				.pipe(gulpEslint.format());

			if (!argv.hasOwnProperty("noLintHalt")) {
				stream = stream.pipe(gulpEslint.failAfterError());
			}

			return stream;
		});
	};
};
