'use strict';

// ////////////////////////////////////////////////
// THIS IS DEPRECATED
// Styles Tasks
// ///////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
  return function(){
    gulp.task('styles', function() {
      var stream =
        gulp.src('./public/styles/**/**/*.scss')
          .pipe(plugins.sourcemaps.init())
            .pipe(plugins.sass({outputStyle: 'compressed'}))
            .on('error', errorlog)
            .pipe(plugins.autoprefixer({
                    browsers: ['last 3 versions'],
                    cascade: false
                }))
          .pipe(plugins.sourcemaps.write('../maps'))
          .pipe(gulp.dest('./public/css'))
          .pipe(plugins.livereload());

      return stream;
    });
  };
};
