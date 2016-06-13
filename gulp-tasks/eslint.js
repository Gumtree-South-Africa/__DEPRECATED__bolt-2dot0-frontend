'use strict';

const gulpEslint = require("gulp-eslint");

//////////////////////////////////////////////////
//ES Lint
//// /////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
	return function () {

		gulp.task('eslint', function () {
			var stream =
				gulp.src([
					'app/controllers/page/isotopePrototype/*.js',
					'app/views/components/tileGrid/js/*.js'
				])
					.pipe(gulpEslint())
					.pipe(gulpEslint.format())
					.pipe(gulpEslint.failAfterError());

			return stream;
		});
	};
};
