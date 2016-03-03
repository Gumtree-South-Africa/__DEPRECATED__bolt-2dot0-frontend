'use strict';

//////////////////////////////////////////////////
//JSCS Coding Style
//// /////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
  return function(){
	gulp.task('jscs', function() {
    var stream =
	    gulp.src(['gulpfile.js', 'app/**/*.js', 'server/**/*.js'])
	        .pipe(plugins.jscs('.jscsrc'))
	        .pipe(plugins.notify({
	            title: 'JSCS',
	            message: 'Coding Style checking is Passed. Wonderful!'
	        }));

      return stream;
	});
  };
};
