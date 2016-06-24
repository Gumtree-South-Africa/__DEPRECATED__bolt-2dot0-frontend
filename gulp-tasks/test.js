'use strict';

//////////////////////////////////////////////////
//Test Tasks
//// /////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
	let runSequence = require('gulp-run-sequence'),
		gulpProtractor = require('gulp-protractor'),
		protractor = gulpProtractor.protractor,
		webdriver_update = gulpProtractor.webdriver_update,
		shell = require('gulp-shell'),
		argv = require('yargs').argv,
		Server = require('karma').Server;

	return function() {
		// Integration Tests Tasks
		gulp.task('protractor', function() {
			let port = argv.port || "8000";
			var stream = gulp.src(['test/integration/**/*.js'])
				.pipe(protractor({
					configFile: 'test/integration/protractor.conf.js',
					args: [
						'--param.debug=true', `--params.baseUrl=http://www.vivanuncios.com.mx.localhost:${port}`
					]
				}));

			return stream;
		});

		gulp.task('webdriverUpdate', webdriver_update);

		gulp.task('test:integration', function(done) {
			runSequence('webdriverUpdate', 'protractor', done);
		});

		// CLIENT UNIT TEST TASKS
		gulp.task('webpack', (done) => {
			return shell.task(["node node_modules/webpack/bin/webpack.js"])(done);
		});

		gulp.task('karma', function (done) {
			new Server({
				configFile: __dirname + '/../karma.conf.js',
				singleRun: true
			}, done).start();
		});

		gulp.task('test:clientUnit', ["webpack"], function () {
			gulp.start("karma");
		});

		// SERVER UNIT TEST TASKS
		gulp.task('test:serverUnit', shell.task([
			'NODE_ENV=mock NODE_CONFIG_DIR=./server/config ' + 'JASMINE_CONFIG_PATH=./test/serverUnit/jasmine.json ' + './node_modules/jasmine/bin/jasmine.js'
		]));

		gulp.task('test', (done) => {
			runSequence('build', 'test:clientUnit', 'test:serverUnit', 'test:integration', done);
		});
	};
};
