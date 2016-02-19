'use strict';

// ////////////////////////////////////////////////
// Compass Tasks
// ///////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
	return function(){
		gulp.task('compass', function(){
		  gulp.src('./app/styles/**/**/*.scss')
		      .pipe(compass({
		        config_file: process.cwd() + '/app/config/ruby/config.rb',
		        css: 'public/css',
		        sass: './app/styles',
		        require: ['susy']
		      }))
		      .pipe(gulp.dest('./public/css'))
		      .pipe(notify({
	            title: 'Compass',
	            message: 'Style Compilation done. Wonderful!'
	        }));
		})
	}
}
