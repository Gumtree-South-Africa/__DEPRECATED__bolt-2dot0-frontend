'use strict';

//////////////////////////////////////////////////
//Jasmine Browser Task
//// /////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
	return function(){
		gulp.task('jasminebrowser', function() {
			return gulp.src(['app/**/*.js', 'server/**/*.js', 'test/spec/**/*.js'])
			 	.pipe(jasmineBrowser.specRunner({console: true}))
			 	.pipe(jasmineBrowser.server({port: 8888}));
				// .pipe(jasmineBrowser.headless());
		});
	};
};