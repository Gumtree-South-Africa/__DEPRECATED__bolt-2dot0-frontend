'use strict';

//////////////////////////////////////////////////
//JSCS Coding Style
//// /////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
	return function () {
		gulp.task('jscs', function () {
			var stream =
				gulp.src(['gulpfile.js', 'app/**/*.js', 'server/**/*.js'])
					.pipe(plugins.jscs())
					.pipe(plugins.jscs.reporter())
					.pipe(plugins.jscs.reporter('fail'));

			return stream;
		});
	};
};
