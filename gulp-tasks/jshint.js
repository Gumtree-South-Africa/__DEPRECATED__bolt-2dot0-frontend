'use strict';

// ////////////////////////////////////////////////
// JS Hint Tasks
// // /////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
  return function(){
	  gulp.task('jshint', function() {
	  var exitOnJshintError = map(function (file, cb) {
	    if (!file.jshint.success) {
	      console.error('jshint failed');
	      process.exit(1);
	    }
	  });
	  return gulp.src([process.cwd() + '/app/builders/**/*.js', process.cwd() + '/app/controllers/**/*.js',
	    process.cwd() + '/app/views/components/**/*.js'])
	    .pipe(jshint())
	    .pipe(jshint.reporter('jshint-stylish'))
	    //.pipe(jshint.reporter('fail'))
	    .pipe(exitOnJshintError);
	});
  };
};