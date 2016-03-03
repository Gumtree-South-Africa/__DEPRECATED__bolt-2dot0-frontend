'use strict';

// ////////////////////////////////////////////////
// PACKAGING Tasks
// ///////////////////////////////////////////////

module.exports = function watch(gulp, plugins) {
	return function(){
    var appVersion = require(process.cwd() + "/server/config/production.json").static.server.version;

		// Distribution Package
		gulp.task('pak:dist', function(){
			process.stdout.write('Distribution Package Task is running...\r\n');

			var stream =
         gulp.src(['./**/*', '!./{target,target/**}', '!./{public,public/**}'], {base: './'})
          .pipe(plugins.tar('bolt-2dot0-frontend-' + appVersion + '.tar'))
        	.pipe(plugins.gzip())
          .pipe(gulp.dest('./target/' + appVersion + '/dist'))
          .on('end', function(){
              console.log('Congratulations!!! DIST PACKAGING DONE SUCCESSFULLY');
          });

					return stream;
    });

		//Static Package
    gulp.task('pak:static', function() {
			process.stdout.write('Static Package Task is running...\r\n');

			var stream =
      gulp.src(process.cwd() + "/" + "public/**/*/")
        .pipe(plugins.tar('bolt-2dot0-frontend-static-'+ appVersion +'.tar'))
        .pipe(plugins.gzip())
        .pipe(gulp.dest('./target/' + appVersion + '/static'))
				.on('end', function(){
	          console.log('Congratulations!!! STATIC PACKAGING DONE SUCCESSFULLY');
	      })

				return stream;
    });

		
		gulp.task('pak', function (callback) {
			loadingSpinner.start();

			var stream =
			runSequence(
				['pak:dist', 'pak:static'],
				function (error) {
					if (error) {
						console.log(error.message);
					} else {
						loadingSpinner.stop();
						console.log('Congratulations!!! PACKAGING DONE SUCCESSFULLY');
					}
					callback(error);
				});

				return stream;
		 });
  }
}
