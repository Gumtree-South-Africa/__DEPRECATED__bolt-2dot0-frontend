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
				// 'app/views/components/feedTile/js/*.js',
				// 'app/views/components/tileGrid/js/*.js',
				'app/builders/common/**/*.js',
				'test/integration/**/*.js',
				'gulp-tasks/eslint.js',
				'.eslintrc'
			])
				.pipe(gulpEslint())
				.pipe(gulpEslint.format())
				.pipe(gulpEslint.failAfterError());

			return stream;
		});
	};
};
