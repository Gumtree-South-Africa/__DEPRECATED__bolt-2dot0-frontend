'use strict';

// ////////////////////////////////////////////////
// watch Task
// ///////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
  return function(){
    gulp.task('watch', function() {
      var stream = gulp.watch('./app/styles/v2/**/**/*.scss', ['sass']);
      return stream;
    })
  }
}
