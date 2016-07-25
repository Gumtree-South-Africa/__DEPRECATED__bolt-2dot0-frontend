'use strict';

// ////////////////////////////////////////////////
// PACKAGING Tasks
// ///////////////////////////////////////////////
var exec = require('child_process').exec,
	fs = require('fs'),
	loadingSpinner = require('loading-spinner'),
	runSequence = require('gulp-run-sequence');

module.exports = function watch(gulp, plugins) {
	return function() {

		var packageJson = JSON.parse(fs.readFileSync(process.cwd() + '/package.json', 'utf8'));
		var appVersion = packageJson.version;
		var nodeModulesToCopy = Object.keys(packageJson.dependencies);
		var staticVersion = JSON.parse(fs.readFileSync(process.cwd() + '/server/config/prod_ix5_deploy.json', 'utf8')).static.server.version;

		// Package App
		gulp.task('pak:app', function() {

			var nodeModuleCmdString = `; mkdir bolt-2dot0-frontend_${appVersion}/node_modules`;

			nodeModulesToCopy.forEach((nodeModuleName) => {
				nodeModuleCmdString += `; cp -R node_modules/${nodeModuleName} bolt-2dot0-frontend_${appVersion}/node_modules`
			});


			var command = 'mkdir bolt-2dot0-frontend_' + appVersion
				+ '; cp -R app bolt-2dot0-frontend_' + appVersion
				+ '; cp -R bin bolt-2dot0-frontend_' + appVersion
				+ '; cp -R modules bolt-2dot0-frontend_' + appVersion
				+ nodeModuleCmdString
				+ '; cp -R server bolt-2dot0-frontend_' + appVersion
				+ '; cp app.js bolt-2dot0-frontend_' + appVersion
				+ '; cp package.json bolt-2dot0-frontend_' + appVersion
				+ '; cp README.md bolt-2dot0-frontend_' + appVersion
				+ '; cp CHANGELOG.md bolt-2dot0-frontend_' + appVersion
				+ '; mkdir target/app'
				+ '; tar -czf target/app/bolt-2dot0-frontend_' + appVersion + '.tar.gz'
				+ ' bolt-2dot0-frontend_' + appVersion;

			var stream = exec(command, function(err, stdout, stderr) {
				console.log(stdout);
				console.log(stderr);
			});

			return stream;
		});

		// Package Static Assets
		gulp.task('pak:static', function() {
			var command = 'mkdir bolt-2dot0-frontend-static_' + staticVersion
				+ '; cp -R public/* bolt-2dot0-frontend-static_' + staticVersion
				+ '; mkdir target; mkdir target/static'
				+ '; tar -czf target/static/bolt-2dot0-frontend-static_' + staticVersion + '.tar.gz'
				+ ' bolt-2dot0-frontend-static_' + staticVersion;

			var stream =
				exec(command, function(err, stdout, stderr) {
					console.log(stdout);
					console.log(stderr);
				});

			return stream;
		});

		// Package
		gulp.task('pak', function(callback) {
			loadingSpinner.start();

			var stream =
				runSequence(
					['pak:app', 'pak:static'],
					function(error) {
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
