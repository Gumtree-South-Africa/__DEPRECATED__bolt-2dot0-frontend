'use strict';

// ////////////////////////////////////////////////
// sass Tasks
// ///////////////////////////////////////////////

var sass = require('gulp-sass');
var gulpif = require('gulp-if');


module.exports = function watch(gulp, plugins) {
  return function(){
    var isCompressed = true;
    var configFileName = 'default';
    gulp.task('sass', function() {

      if(process.env.NODE_ENV !== undefined) {
        configFileName = process.env.NODE_ENV;
        isCompressed = require(process.cwd() + '/server/config/' + configFileName + '.json').static.min;
      }

      var stream =
      	gulp.src(process.cwd() + '/app/styles/v2/**/*.scss')
      			.pipe(sass().on('error', sass.logError))
            .pipe(gulpif(isCompressed, plugins.cssmin()))
            .pipe(gulpif(isCompressed, plugins.rename({suffix:'.min'})))
      			.pipe(gulp.dest(process.cwd() + '/public/css/v2'));

        return stream;
    })
  }
}
