'use strict';

//////////////////////////////////////////////////
//Jasmine Browser Task
//// /////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
	return function() {
		gulp.task('jasminebrowser', function() {
			var stream =
				gulp.src(['app/**/*.js', 'server/**/*.js', 'test/spec/**/*.js'])
					.pipe(plugins.jasmineBrowser.specRunner({console: true}))
					.pipe(plugins.jasmineBrowser.server({port: 8888}));
			// .pipe(jasmineBrowser.headless());

			return stream;
		});
	};
};
