'use strict';

// ////////////////////////////////////////////////
// JSON Lint Tasks
// // /////////////////////////////////////////////

var map = require('map-stream'),
	jsonlint = require('gulp-jsonlint');

module.exports = function watch(gulp, plugins) {
	return function() {
		gulp.task('jsonlint', () => {
			var exitOnJsonlintError = map(function(file, cb) {
				if (!file.jsonlint.success) {
					console.error('jsonlint failed');
					process.exit(1);
				}
			});
			var stream =
				gulp.src(process.cwd() + "./app/config/*.json")
					.pipe(plugins.jsonlint())
					.pipe(plugins.jsonlint.reporter('fail'))
					.pipe(exitOnJsonlintError);

			return stream;
		});
	};
};
