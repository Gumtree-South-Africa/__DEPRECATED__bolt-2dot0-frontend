'use strict';

// ////////////////////////////////////////////////
// watch Task
// ///////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
	return function() {
		let shell = require("gulp-shell"),
			runSequence = require('gulp-run-sequence'),
			argv = require('yargs').argv;

		gulp.task('watch:scss', function() {
			return gulp.watch('./app/styles/v2/**/**/*.scss', ['sass']);
		});

		gulp.task('watch:webpack', (done) => {
			let configName;

			if (argv.noUglifyJS || argv.CI) {
				configName = "app/config/bundling/webpack.noUglifyApp.config.js";
			} else {
				configName = "app/config/bundling/webpack.app.config.js";
			}
			return shell.task([`./node_modules/webpack/bin/webpack.js --config ${configName} --watch`])(done);
		});

		gulp.task('watch', (done) => {
			runSequence(["watch:webpack", "watch:scss"], done);
		});
	}
};
