'use strict';

let shell = require('gulp-shell');

let _ = require("underscore");

let _buildBundleList = (pageConfig, locale, device) => {
	let tempBundleConfig = {};

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

	let localeDeviceMC = pageConfig.locales[locale][device];
	let localeCoreMC = pageConfig.locales[locale].core;
	let commonDeviceMC = pageConfig.common[device];
	let commonCoreMC = pageConfig.common.core;


	let moduleConfigPriority = [
		commonCoreMC,
		localeCoreMC,
		commonDeviceMC,
		localeDeviceMC
	];

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
		let openingFileLine = '"use strict";\n\n';
		let closingFileLine = '\n';

		gulp.task('webpack:prepare', (done) => {
			let pages = [];

			let walker = walk(process.cwd() + "/app/config/bundling/pages");

			walker.on("file", (filename) => {
				pages.push(filename);
			});

			walker.on("end", () => {
				_prepareWebpackBundles()
			});


			let _prepareWebpackBundles = () => {
				let pageConfigMap = {};
				pages.forEach((filename) => {
					let pageConfig = require(filename);

					_.keys(pageConfig.locales).forEach((locale) => {
						["mobile", "desktop"].forEach((device) => {
							let outputPath = `${process.cwd()}/${pageConfig.outputEntry}_${device}_${locale}.compiled.js`;
							pageConfigMap[`${pageConfig.bundleName}_${device}_${locale}`] = outputPath;
							let moduleFileList = _buildBundleList(pageConfig, locale, device);
							fs.writeFileSync(outputPath, openingFileLine);

							moduleFileList.forEach((modulePath) => {
								fs.appendFileSync(outputPath, `require("${modulePath}").initialize();\n`);
							});

							fs.appendFileSync(outputPath, closingFileLine);
						})
					});
				});

				fs.writeFileSync(`${process.cwd()}/app/config/bundling/bundleMap.json`, JSON.stringify(pageConfigMap, 0, 3));
				done();
			};
		});

		// CLIENT UNIT TEST TASKS
		gulp.task('webpack:build', (done) => {
			// run webpack
			webpack(require(process.cwd() + "/app/config/bundling/webpack.app.config.js"), function(err, stats) {
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
			runSequence("webpack:prepare", "webpack:build", done);
		});
	}
};
