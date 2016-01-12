'use strict';

// ////////////////////////////////////////////////
// Watch Tasks
// ///////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
   return
	  gulp.task('watch', function(){
	  //gulp.watch('./public/styles/**/**/*.scss', ['styles']);
	  gulp.watch('./app/styles/**/**/*.scss', ['compass']);
	  gulp.watch('./public/js', ['scripts']);
	  gulp.watch('./app/views/**/*.hbs', ['hbs']);
	});
};