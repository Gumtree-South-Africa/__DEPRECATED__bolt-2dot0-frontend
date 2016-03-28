'use strict';

// ////////////////////////////////////////////////
// PACKAGING Tasks
// ///////////////////////////////////////////////

module.exports = function watch(gulp, plugins) {
	return function() {
		var appVersion = JSON.parse(fs.readFileSync(process.cwd() + '/package.json', 'utf8')).version;
		var staticVersion = JSON.parse(fs.readFileSync(process.cwd() + '/server/config/production.json', 'utf8')).static.server.version;

		// Package App
		gulp.task('pak:app', function(){
			process.stdout.write('App Package Task is running...\r\n');

			var stream =
				gulp.src(process.cwd() + '/bolt-2dot0-frontend_' + appVersion + '/**/*/')
		        	.pipe(plugins.tar('bolt-2dot0-frontend_' + appVersion + '.tar'))
		        	.pipe(plugins.gzip())
		        	.pipe(gulp.dest('./target' + '/app'))
		        	.on('end', function(){
		        		console.log('Congratulations!!! APP PACKAGING DONE SUCCESSFULLY');
		        	});

			return stream;
		});

		// Package Static Assets
		gulp.task('pak:static', function() {
			process.stdout.write('Static Package Task is running...\r\n');

			var stream =
				gulp.src(process.cwd() + '/' + 'public/**/*/')
			    	.pipe(plugins.tar('bolt-2dot0-frontend-static_'+ staticVersion + '.tar'))
			        .pipe(plugins.gzip())
			        .pipe(gulp.dest('./target' + '/static'))
					.on('end', function(){
						console.log('Congratulations!!! STATIC PACKAGING DONE SUCCESSFULLY');
				    });

			return stream;
		});

		gulp.task('pak:copy', function(){
			var stream =
				gulp.src(['./**/*', '!./{target,target/**}', '!./{public,public/**}'], {base: './'})
						.pipe(gulp.dest(process.cwd() + '/bolt-2dot0-frontend_' + appVersion));

			return stream;
		});

		gulp.task('pak:clean', function(){
			var stream =
				gulp.src(process.cwd() + '/bolt-2dot0-frontend_' + appVersion)
						.pipe(plugins.clean());

			return stream;
		});

		// Package
		gulp.task('pak', function (callback) {
			loadingSpinner.start();

			var stream =
				runSequence(
						'pak:copy',
						['pak:app', 'pak:static'],
						'pak:clean',
						function (error) {
							if (error) {
								console.log(error.message);
							} else {
								loadingSpinner.stop();
								console.log('Congratulations!!! APP & STATIC PACKAGING DONE SUCCESSFULLY');
							}
							callback(error);
						});

			return stream;
		});

	}
}
