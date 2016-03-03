'use strict';

//////////////////////////////////////////////////
//Clean Task
//// /////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
	return function(){
		gulp.task('clean', function() {
			process.stdout.write('CLeaning up jsmin/css/target/tmp/build folders...\r\n');

			var stream =
				gulp.src(['./.build', './tmp', './public/css', './public/jsmin', './target'], {read: false})
		    	.pipe(plugins.clean());

				return stream;
		});

	};
};
