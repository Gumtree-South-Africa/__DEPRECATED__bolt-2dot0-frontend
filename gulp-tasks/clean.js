'use strict';

//////////////////////////////////////////////////
//Clean Task
//// /////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
	return function() {
		gulp.task('clean', function() {
			process.stdout.write('CLeaning up jsmin/css/target/tmp/build/locales folders...\r\n');

			var stream =
				gulp.src([
					'./.build',
					'./app/locales/json',
					'./tmp',
					'./public/css',
					'./public/jsmin',
					'./target',
					'./bolt-2dot0-frontend*'
				], {read: false})
					.pipe(plugins.clean());

			return stream;
		});

	};
};
