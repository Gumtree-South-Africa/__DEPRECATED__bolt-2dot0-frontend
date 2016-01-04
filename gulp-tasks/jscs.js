'use strict';

//////////////////////////////////////////////////
//JSCS Coding Style
//// /////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
  return function(){
	gulp.task('jscs', function() {
	    gulp.src(['gulpfile.js', 'app/**/*.js', 'server/**/*.js'])
	        .pipe(jscs('.jscsrc'))
	        .pipe(notify({
	            title: 'JSCS',
	            message: 'Coding Style checking is Passed. Wonderful!'
	        }));
	});
  };
};