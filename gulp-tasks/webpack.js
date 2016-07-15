'use strict';

let	shell = require('gulp-shell');

// ////////////////////////////////////////////////
// webpack Task
// ///////////////////////////////////////////////
module.exports = function webpack(gulp) {
	return function(){
		let webpack = require("webpack");
		// CLIENT UNIT TEST TASKS
		gulp.task('webpack', (done) => {
			// run webpack
			webpack(require(process.cwd() + "/webpack.config.js"), function(err, stats) {
				if(err) throw new gutil.PluginError("webpack", err);
				console.log("[webpack]", stats.toString());

				done();
			});
		});
	}
};
