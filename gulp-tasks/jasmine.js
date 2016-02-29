'use strict';

//////////////////////////////////////////////////
//Jasmine Test Task
//// /////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
	return function(){
		gulp.task('jasmine', function() {
			return gulp.src(['test/spec/**/*.js'])
		 		.pipe(jasmineNode({
			 		timeout: 10000,
			 		isVerbose: true,
			 		includeStackTrace: true,
			 		color: true }));
		});
	};
};