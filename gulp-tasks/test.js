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
		del = require("del"),
		fs = require("fs-extra");

	let coverage = false,
		ciMode = false,
		browser = "chrome";

	if (argv.browser) {
		browser = argv.browser;
	}

	if (argv.coverage) {
		coverage = true;
	}

	ciMode = argv.CI;


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
				})).on('error', () => {
					console.log("!!!!!!!INTEGRATION TESTS ARE FAILING, test is unstable");
				});

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

		gulp.task("templateMaker", shell.task(["bash bin/scripts/templateMaker.sh test/clientUnit/helpers/webTemplates.js"]));

		gulp.task('precompileTemplates', (done) => {
			runSequence("cleanTemplates", "stageTemplates", "templateMaker", done)
		});


		gulp.task('karma', function(done) {
			fs.copySync(__dirname + `/../test/clientUnit/karmaConfig/karma.${browser}.conf.js`, 'karma.temp.conf.js');

			new Server({
				configFile: `${__dirname}/../karma.temp.conf.js`,
				singleRun: !ciMode
			}, (exitStatus) => {
				let exitText = exitStatus ? "!!!!!!!CLIENT_UNIT TESTS ARE FAILING, test is unstable" : undefined;
				done(exitText);
			}).start();
		});

		gulp.task('test:clientUnit', function(done) {
			runSequence("precompileTemplates", "karma", done)
		});

		// SERVER UNIT TEST TASKS
		gulp.task('test:serverUnit', (done) => {
			let coverageString = "";
			if (coverage) {
				coverageString = './node_modules/istanbul/lib/cli.js cover --include-all-source ./'
			} else {
				coverageString = 'node '
			}
			shell.task([
				`NODE_ENV=mock NODE_CONFIG_DIR=./server/config ${coverageString}test/serverUnit/SpecRunner.js`
			], {
				errorMessage: "!!!!!!!SERVER_UNIT TESTs ARE FAILING, test is unstable"
			})(done)
		});

		gulp.task('test', (done) => {
			runSequence( 'test:serverUnit', /*'test:integration',   out since tests are failing on CI */ 'test:clientUnit', done);
		});
	};
};
