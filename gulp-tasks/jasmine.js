'use strict';

//////////////////////////////////////////////////
//Jasmine Test Task
//// /////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
	return function(){
		gulp.task('jasmine', function() {
			var stream =
				gulp.src(['test/spec/**/*.js'])
			 		.pipe(plugins.jasmineNode({
				 		timeout: 10000,
				 		isVerbose: true,
				 		includeStackTrace: true,
				 		color: true
					}));

			return stream;
		});
	};
};
