'use strict';

//////////////////////////////////////////////////
// Sprite tasks
//// /////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
	let del = require('del');
	let runSequence = require('gulp-run-sequence');
	return function() {
		gulp.task('icons2', (done) => {
			//Task for spriting svgs and pngs
			runSequence('svgSprite', 'svgFallback', done);
		});

		gulp.task('rebuildSprites', (done) => {
			runSequence('cleanSprites', 'icons2', done);
		});

		gulp.task('cleanSprites', (done) => {
			del([
				'public/css/*_*/svg/sprite.css-*.svg',
				'public/css/*_*/*_*.css',
				'public/css/*_*/*_*.png',
				'public/css/*_*/sprite.css',
				'public/css/*_*/sprite.*.html'
			]).then(() => {
				done();
			});
		});
	};
};
