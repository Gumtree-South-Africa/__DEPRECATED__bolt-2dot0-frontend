'use strict';

let shell = require("gulp-shell");

module.exports = function watch(gulp) {
	return function () {
		gulp.task('webpack', shell.task(["node node_modules/webpack/bin/webpack.js"]));
	};
};

