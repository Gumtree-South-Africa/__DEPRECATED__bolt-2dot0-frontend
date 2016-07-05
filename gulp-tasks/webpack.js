'use strict';

let	shell = require('gulp-shell');

// ////////////////////////////////////////////////
// webpack Task
// ///////////////////////////////////////////////
module.exports = function webpack(gulp, plugins) {
	return function(){
		// CLIENT UNIT TEST TASKS
		gulp.task('webpack', (done) => {
			return shell.task(["node node_modules/webpack/bin/webpack.js"])(done);
		});
	}
}
