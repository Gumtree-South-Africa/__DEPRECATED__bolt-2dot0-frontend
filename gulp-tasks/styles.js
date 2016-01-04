'use strict';

// ////////////////////////////////////////////////
// Styles Tasks
// ///////////////////////////////////////////////
module.exports = function watch(gulp, plugins, concat, uglify, errorlog, rename, sourcemaps, sass, autoprefixer) {
  return function(){
    gulp.task('styles', function() {
      gulp.src('./public/styles/**/**/*.scss')
        .pipe(sourcemaps.init())
          .pipe(sass({outputStyle: 'compressed'}))
          .on('error', errorlog)
          .pipe(autoprefixer({
                  browsers: ['last 3 versions'],
                  cascade: false
              })) 
        .pipe(sourcemaps.write('../maps'))
        .pipe(gulp.dest('./public/css'))
        .pipe(livereload());
    });
  };
};