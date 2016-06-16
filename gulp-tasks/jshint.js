'use strict';

// ////////////////////////////////////////////////
// JS Hint Tasks
// // /////////////////////////////////////////////

var map = require('map-stream'),
    jshint = require('gulp-jshint');
    
module.exports = function watch(gulp, plugins) {
  return function(){
	  gulp.task('jshint', function() {
  	  var exitOnJshintError = map(function (file, cb) {
  	    if (!file.jshint.success) {
  	      console.error('jshint failed');
  	      process.exit(1);
  	    } else {
			// if hint succeeds trigger the gulp done cb
			cb();
		}
  	  });
  	  var stream =
        gulp.src([process.cwd() + '/app/builders/**/*.js', process.cwd() + '/app/controllers/**/*.js',
    	    process.cwd() + '/app/views/components/**/*.js'])
    	    .pipe(plugins.jshint())
    	    .pipe(jshint.reporter('jshint-stylish'))
    	    //.pipe(jshint.reporter('fail'))
    	    .pipe(exitOnJshintError);

      return stream;
    });
  };
};
