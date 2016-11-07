'use strict';

let shell = require('gulp-shell');

let _ = require("underscore");

let _buildBundleList = (pageConfig, locale, device) => {
	let moduleConfigPriority, tempBundleConfig = {};

	let _applyConfiguration = (moduleConfig) => {
		_.keys(moduleConfig).forEach((moduleName) => {
			let modulePath = moduleConfig[moduleName];
			if (modulePath) {
				tempBundleConfig[moduleName] = moduleConfig[moduleName];
			} else {
				// "overwriting with empty"
				delete tempBundleConfig[moduleName];
			}
		});
	};

	let commonDeviceMC = pageConfig.common[device];
	let commonCoreMC = pageConfig.common.core;

	if (locale) {
		let localeDeviceMC = pageConfig.locales[locale][device];
		let localeCoreMC = pageConfig.locales[locale].core;

		moduleConfigPriority = [
			commonCoreMC,
			localeCoreMC,
			commonDeviceMC,
			localeDeviceMC
		];
	} else {
		moduleConfigPriority = [
			commonCoreMC,
			commonDeviceMC,
		];
	}

	//
	moduleConfigPriority.forEach(_applyConfiguration);

	// flatten to an array
	return _.values(tempBundleConfig);
};


// ////////////////////////////////////////////////
// webpack Task
// ///////////////////////////////////////////////
module.exports = function webpack(gulp) {
	return function() {
		let webpack = require("webpack");
		let runSequence = require("gulp-run-sequence");
		let walk = require("walkdir");
		let fs = require("fs");
		let argv = require('yargs').argv;
		let openingFileLine = '"use strict";\n\n';
		let closingFileLine = '\n'
		let flatten = require("gulp-flatten");
		let del = require("del");

		// CLIENT TEMPLATING TASKS
		gulp.task("webpackCleanTemplates", () => {
			return del([
				"app/templateStaging",
				"public/js/precompTemplates.js*"
			]);
		});

		gulp.task('webpackStageTemplates', () => {
			let globs = require(`${process.cwd()}/app/config/precompilingTemplates/precompileConfig`).files;
			return gulp.src(globs)
				.pipe(flatten())
				.pipe(gulp.dest("app/templateStaging"));
		});

		gulp.task("webpackTemplateMaker", shell.task(["bash bin/scripts/templateMaker.sh public/js/precompTemplates.js"]));

		gulp.task('webpackPrecompile2', (done) => {
			runSequence("webpackCleanTemplates", "webpackStageTemplates", "webpackTemplateMaker", done)
		});

		gulp.task('webpack:prepare', (done) => {
			let pages = [];

			let walker = walk(process.cwd() + "/app/config/bundling/pages");

			walker.on("file", (filename) => {
				//Added to ignore .DS_Store
				if (filename.indexOf("js") > 0) {
					pages.push(filename);
				}
			});

			walker.on("end", () => {
				_prepareWebpackBundles()
			});

			let _genCompiledFile = (outputPath, moduleFileList) => {
				fs.writeFileSync(outputPath, openingFileLine);

				moduleFileList.forEach((modulePath) => {
					fs.appendFileSync(outputPath, `require("${modulePath}").initialize();\n`);
				});

				fs.appendFileSync(outputPath, closingFileLine);
			};


			let _prepareWebpackBundles = () => {
				let pageConfigMap = {};
				pages.forEach((filename) => {
					let pageConfig = require(filename);

					["mobile", "desktop"].forEach((device) => {
						// device general compile
						let outputPath = `${process.cwd()}/${pageConfig.outputEntry}_${device}.compiled.js`;
						pageConfigMap[`${pageConfig.bundleName}_${device}`] = outputPath;
						let moduleFileList = _buildBundleList(pageConfig, null, device);
						_genCompiledFile(outputPath, moduleFileList);

						_.keys(pageConfig.locales).forEach((locale) => {
							let outputPath = `${process.cwd()}/${pageConfig.outputEntry}_${device}_${locale}.compiled.js`;
							pageConfigMap[`${pageConfig.bundleName}_${device}_${locale}`] = outputPath;
							let moduleFileList = _buildBundleList(pageConfig, locale, device);
							_genCompiledFile(outputPath, moduleFileList);
						})
					});
				});

				fs.writeFileSync(`${process.cwd()}/app/config/bundling/bundleMap.json`, JSON.stringify(pageConfigMap, 0, 3));
				done();
			};
		});

		// CLIENT UNIT TEST TASKS
		gulp.task('webpack:build', (done) => {
			let config;

			if (argv.noUglifyJS || argv.CI) {
				config = require(process.cwd() + "/app/config/bundling/webpack.noUglifyApp.config.js");
			} else {
				config = require(process.cwd() + "/app/config/bundling/webpack.app.config.js");
			}

			// run webpack
			webpack(config, function(err, stats) {
				if (err) {
					throw new gutil.PluginError("webpack", err);
				}
				if (stats.hasErrors()) {
					console.log("[webpack]", stats.toString());
				}

				done();
			});
		});

		gulp.task('webpack:rui', (done) => {
			// run webpack
			webpack(require(process.cwd() + "/app/config/bundling/webpack.rui.config.js"), function(err, stats) {
				if (err) {
					throw new gutil.PluginError("webpack", err);
				}
				if (stats.hasErrors()) {
					console.log("[webpack]", stats.toString());
				}

				done();
			});
		});

		gulp.task("webpack", (done) => {
			runSequence("webpackPrecompile2", "webpack:prepare", "webpack:build", done);
		});
	}
};
