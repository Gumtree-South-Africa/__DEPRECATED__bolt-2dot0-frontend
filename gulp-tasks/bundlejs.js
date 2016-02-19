'use strict';

//////////////////////////////////////////////////
// javascript Aggragation and Minification Task
//// /////////////////////////////////////////////

var es = require('event-stream'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify');

var bundles = require(process.cwd() + '/app/config/ruby/jsmin');

module.exports = function watch(gulp, plugins) {
	return function(){
		gulp.task('bundlejs', function() {
      es.merge(bundles.map(function (obj) {
        return gulp.src(obj.src)
              .pipe(concat(obj.bundleName))
              .pipe(plumber({
								errorHandler: function (error) {
									console.log(error.message);
									this.emit('end');
							}}))
              .pipe(uglify())
              .pipe(gulp.dest(obj.dest));
      }))
			//return gulp.src(['./.build', './public/css', './target'], {read: false})
		    //	.pipe(clean());
		});
	};
};
