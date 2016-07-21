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
		Server = require('karma').Server,
		webpack = require("webpack"),
		flatten = require("gulp-flatten"),
		del = require("del");

	let browser = "chrome";

	if (argv.browser) {
		browser = argv.browser;
	}

	return function() {
		// Integration Tests Tasks
		gulp.task('protractor', function() {
			let port = argv.port || "8000";
			var stream = gulp.src(['test/integration/**/*.js'])
				.pipe(protractor({
					configFile: 'test/integration/protractor.chrome.conf.js', // defaulting to chrome since it passes both locally and in CI
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
		gulp.task("cleanTemplates", () => {
			return del([
				"app/templateStaging",
				"test/clientUnit/helpers/webTemplates.js*"
			]);
		});

		gulp.task('stageTemplates', () => {
			return gulp.src("app/**/*.hbs")
				.pipe(flatten())
				.pipe(gulp.dest("app/templateStaging"));
		});

		gulp.task("templateMaker", shell.task(["bash bin/scripts/templateMaker.sh"]));

		gulp.task('precompileTemplates', (done) => {
			runSequence("cleanTemplates", "stageTemplates", "templateMaker", done)
		});

		gulp.task('webpackTest', (done) => {
			// run webpack
			webpack(require(process.cwd() + "/app/config/bundling/webpack.test.config.js"), function(err, stats) {
				if(err) throw new gutil.PluginError("webpack", err);
				console.log("[webpack]", stats.toString());

				done();
			});
		});

		gulp.task('karma', function (done) {
			new Server({
				configFile: __dirname + `/../test/clientUnit/karmaConfig/karma.${browser}.conf.js`,
				singleRun: true
			}, done).start();
		});

		gulp.task('test:clientUnit', function (done) {
			runSequence("precompileTemplates", "webpackTest", "karma", done)
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
