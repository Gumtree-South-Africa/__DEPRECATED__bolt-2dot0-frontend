'use strict';

// ////////////////////////////////////////////////
// Compass Tasks
// ///////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
	return function(){
		gulp.task('compass', function(){
		  gulp.src('./app/styles/**/**/*.scss')
		      .pipe(compass({
		        config_file: process.cwd() + '/config.rb',
		        css: 'public/css',
		        sass: './app/styles',
		        require: ['susy']
		      }))
		      .pipe(gulp.dest('./public/css'));
		})
	}
}
