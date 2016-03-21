'use strict';

// ////////////////////////////////////////////////
// Compass Tasks
// ///////////////////////////////////////////////


module.exports = function watch(gulp, plugins) {

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
        .pipe(plugins.rename({suffix:'.min'}))
        .pipe(gulp.dest(process.cwd() + '/public/test'))
  }

	return function(){
		var articles = [
        {"foldername":"all", "breakpoint":"desktop"},
        {"foldername":"mobile", "breakpoint":"mobile"},
        {"foldername":"tablet", "breakpoint":"tablet"}
      ],
        assets = require(process.cwd() + '/app/config/ruby/compassConfig'),
        output_style = 'expanded';

    if (process.env.NODE_ENV !== 'development'){
      output_style = 'compressed';
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
          .pipe(plugins.plumber({
            errorHandler: function (error) {
              console.log(error.message);
              this.emit('end');
          }}))
          .pipe(plugins.compass({
            config_file: process.cwd() + '/app/config/ruby/config_' + articles[i].breakpoint + '.rb',
            css: 'public/css/' + articles[i].foldername,
            sass: './app/styles'
          }))
          .pipe(plugins.cssmin())
          .pipe(plugins.rename({suffix:'.min'}))
          .pipe(gulp.dest(process.cwd() + '/public/css/'+ articles[i].foldername))
          .pipe(synchro(incDoneCounter));
      }
		})
	}
}
