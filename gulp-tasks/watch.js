'use strict';

// ////////////////////////////////////////////////
// watch Task
// ///////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
	return function() {
		let shell = require("gulp-shell"),
			runSequence = require('gulp-run-sequence');

		gulp.task('watch:scss', function() {
			return gulp.watch('./app/styles/v2/**/**/*.scss', ['sass']);
		});

		gulp.task('watch:webpack', shell.task(["./node_modules/webpack/bin/webpack.js --config app/config/bundling/webpack.app.config.js --watch"]));

		gulp.task('watch', (done) => {
			runSequence(["watch:webpack", "watch:scss"], done);
		});
	}
};
