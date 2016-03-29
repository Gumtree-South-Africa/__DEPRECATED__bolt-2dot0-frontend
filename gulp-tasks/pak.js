'use strict';

// ////////////////////////////////////////////////
// PACKAGING Tasks
// ///////////////////////////////////////////////
var exec = require('child_process').exec;

module.exports = function watch(gulp, plugins) {
	return function() {
		var appVersion = JSON.parse(fs.readFileSync(process.cwd() + '/package.json', 'utf8')).version;
		var staticVersion = JSON.parse(fs.readFileSync(process.cwd() + '/server/config/prod_ix5_deploy.json', 'utf8')).static.server.version;

		// Package App
		gulp.task('pak:app', function(){
			  var command = 'mkdir bolt-2dot0-frontend_' + appVersion
					+ '; cp -R app bolt-2dot0-frontend_' + appVersion
					+ '; cp -R bin bolt-2dot0-frontend_' + appVersion
					+ '; cp -R modules bolt-2dot0-frontend_' + appVersion
					+ '; cp -R node_modules bolt-2dot0-frontend_' + appVersion
					+ '; cp -R server bolt-2dot0-frontend_' + appVersion
					+ '; cp app.js bolt-2dot0-frontend_' + appVersion
					+ '; cp package.json bolt-2dot0-frontend_' + appVersion
					+ '; cp README.md bolt-2dot0-frontend_' + appVersion
					+ '; cp CHANGELOG.md bolt-2dot0-frontend_' + appVersion
					+ '; mkdir target/app'
					+ '; tar -cf target/app/bolt-2dot0-frontend_' + appVersion + '.tar.gz'
					+ ' bolt-2dot0-frontend_' + appVersion;

				var stream =
				  exec(command, function (err, stdout, stderr) {
					console.log(stdout);
					console.log(stderr);
				  });

			return stream;
		});

		// Package Static Assets
		gulp.task('pak:static', function(){
			  var command = 'mkdir bolt-2dot0-frontend-static_' + staticVersion
					+ '; cp -R public bolt-2dot0-frontend-static_' + staticVersion
					+ '; mkdir target; mkdir target/static'
					+ '; tar -cf target/static/bolt-2dot0-frontend-static_' + staticVersion + '.tar.gz'
					+ ' bolt-2dot0-frontend-static_' + staticVersion;

				var stream =
				  exec(command, function (err, stdout, stderr) {
					console.log(stdout);
					console.log(stderr);
				  });

			return stream;
		});

		// Package
		gulp.task('pak', function (callback) {
			loadingSpinner.start();

			var stream =
				runSequence(
						['pak:app', 'pak:static'],
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
