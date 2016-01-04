'use strict';

// ////////////////////////////////////////////////
// Hbs (Handlebars) Tasks
// ///////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
  return function(){
	gulp.task('hbs', function() {
	  gulp.src(process.cwd() + '/app/views/**/*.hbs')
	    .pipe(livereload());
	});
  };
};