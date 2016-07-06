'use strict';

const gulpEslint = require('gulp-eslint');

//////////////////////////////////////////////////
//ES Lint
//// /////////////////////////////////////////////
module.exports = function watch(gulp) {
	return function() {
		gulp.task('eslint', function() {
			let stream = gulp.src([
				// 'app/controllers/page/isotopePrototype/*.js',
				// 'app/views/components/responsiveBreakpointDetection/js/*.js',
				// 'app/views/components/adTile/js/*.js',
				// 'app/views/components/recentActivity/js/*.js',
				// 'app/views/components/tileGrid/js/*.js',
				'app.js',
				'app/**/*.js',
				'server/**/*.js',
				'test/**/*.js',
				'gulp-tasks/eslint.js',
				'.eslintignore',
				'.eslintrc'
			])
				.pipe(gulpEslint())
				.pipe(gulpEslint.format())
				.pipe(gulpEslint.failAfterError());

			return stream;
		});
	};
};
