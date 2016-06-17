'use strict';

const gulpEslint = require('gulp-eslint');

//////////////////////////////////////////////////
//ES Lint
//// /////////////////////////////////////////////
module.exports = function watch(gulp) {
	return function() {
		gulp.task('eslint', function() {
			let stream = gulp.src([
				'app/**/*.js',
				'server/**/*.js',
				'test/**/*.js'
			])
				.pipe(gulpEslint())
				.pipe(gulpEslint.format())
				.pipe(gulpEslint.failAfterError());

			return stream;
		});
	};
};
