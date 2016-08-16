'use strict';

//////////////////////////////////////////////////
//Test Tasks
//// /////////////////////////////////////////////
module.exports = function precompile2(gulp, plugins) {
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

	let ciMode = false,
		browser = "chrome";

	if (argv.browser) {
		browser = argv.browser;
	}

	ciMode = argv.CI;


	return function() {
		// CLIENT UNIT TEST TASKS
		gulp.task("cleanTemplates", () => {
			return del([
				"app/templateStaging",
				"public/js/precompTemplates.js*"
			]);
		});

		gulp.task('stageTemplates', () => {
			let globs = require(`${process.cwd()}/app/config/precompilingTemplates/precompileConfig`).files;
			return gulp.src(globs)
				.pipe(flatten())
				.pipe(gulp.dest("app/templateStaging"));
		});

		gulp.task("templateMaker", shell.task(["bash bin/scripts/templateMaker.sh public/js/precompTemplates.js"]));

		gulp.task('precompile2', (done) => {
			runSequence("cleanTemplates", "stageTemplates", "templateMaker", done)
		});
	};
};
