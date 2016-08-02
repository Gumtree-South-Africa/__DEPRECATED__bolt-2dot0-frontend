'use strict';

//////////////////////////////////////////////////
// Bump Up release version Task
//// /////////////////////////////////////////////

var cwd = process.cwd(),
	runSequence = require('gulp-run-sequence');

module.exports = function watch(gulp, plugins) {
	return function() {
		// Bumpup App Version
		gulp.task('bumpup:app', function() {
			process.stdout.write('App Version Bumpup Task is running...\r\n');

			return gulp.src([cwd + '/package.json'])
				.pipe(plugins.bump({key: 'version', type: 'patch'}))
				.pipe(gulp.dest(cwd));
		});

		// Bumpup Static Version
		gulp.task('bumpup:static', function() {
			process.stdout.write('Static Version Bumpup Task is running...\r\n');

			return gulp.src([
				cwd + '/server/config/prod_ix5_deploy.json',
				cwd + '/server/config/prod_phx_deploy.json',
				cwd + '/server/config/lnp_phx_deploy.json',
				cwd + '/server/config/pp_phx_deploy.json'
				//TODO: add localhost once assets are deployed in apache
				//cwd + '/server/config/localhost.json',
			])
				.pipe(plugins.bump({key: 'static.server.version', type: 'patch'}))
				.pipe(gulp.dest(cwd + '/server/config/'));
		});

		// Bumpup
		gulp.task('bumpup', function(callback) {
			var stream =
				runSequence(
					['bumpup:app', 'bumpup:static'],
					function(error) {
						if (error) {
							console.log(error.message);
						} else {
							console.log('Congratulations!!! APP & STATIC BUMPUP DONE SUCCESSFULLY');
						}
						callback(error);
					});

			return stream;
		});

	}
}
