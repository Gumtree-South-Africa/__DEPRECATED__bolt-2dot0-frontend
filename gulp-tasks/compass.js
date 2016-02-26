'use strict';

// ////////////////////////////////////////////////
// Compass Tasks
// ///////////////////////////////////////////////

var gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    cssmin = require('gulp-cssmin'),
    through2 = require('through2');

function synchro(done) {
    return through2.obj(function (data, enc, cb) {
        cb();
    },
    function (cb) {
        cb();
        done();
    });
}

function rename(){
  gulp.src(['./public/css/all/*', './public/css/mobile/*'])
      .pipe(rename({suffix:'.min'}))
      .pipe(gulp.dest(process.cwd() + '/public/test'))
}

module.exports = function watch(gulp, plugins) {
	return function(){
		var articles = ['config_desktop.rb', 'config_mobile.rb', 'default_config'],
        assets = require(process.cwd() + '/app/config/ruby/compassConfig'),
        output_style = 'expanded';

    if (process.env.NODE_ENV !== 'development'){
      output_style = 'compressed';
      console.log('it is compressed');
    };

    gulp.task('compass', function(){
			var doneCounter = 0;
	    function incDoneCounter() {
	        doneCounter += 1;
	        if (doneCounter >= articles.length) {
	            done();
	        }
          else{
            //console.log('DONNNNNNNNNNEEEEEEEEEEEE');
          }
	    }

			for (var i = 0; i < articles.length -1; ++i) {
  		  gulp.src('./app/styles/**/**/*.scss')
            .pipe(compass({
                    project: process.cwd(),
                    http_path: '/',
                    css: assets[i].cssPath,
                    sass: assets[i].sassPath,
                    lineNumbers: assets[i].lineNumbers,
                    style: 'expanded', //gulpif(output_style === 'compressed', 'expanded'),
                    require: ['susy']
            }))
            .pipe(plumber({
              errorHandler: function (error) {
                console.log(error.message);
                this.emit('end');
            }}))
            .pipe(cssmin())
          //  .pipe(gulpif(output_style === 'compressed', rename({suffix:'.min'})))
            .pipe(rename({suffix:'.min'}))
            .pipe(gulp.dest(process.cwd() + '/public/cssmin'))
  					.pipe(synchro(incDoneCounter))
			}

		})
	}
}
