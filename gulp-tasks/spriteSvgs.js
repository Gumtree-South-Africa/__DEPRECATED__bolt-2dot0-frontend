'use strict';

const gulpSvg = require('gulp-svg-sprite'),
	es = require('event-stream'),
	newer = require('gulp-newer');

const locales = [
	'en_IE',
	'en_SG',
	'en_ZA',
	'es_AR',
	'es_MX',
	'es_US',
	'pl_PL'
];

//////////////////////////////////////////////////
//Icon SVG research
//// /////////////////////////////////////////////
module.exports = function watch(gulp) {
	return function() {
		gulp.task('svgSprite', () => {
			let dest = './public';
			return es.merge(locales.map((locale) => {
				let config = {
					log: 'info',
					shape: {
						dimension: {
							attributes: true
						}
					},
					mode: {}
				};
				config.mode[locale] = {
					dest: `css/${locale}`,
					mode: 'css',
					example: true,
					prefix: '.icon-%s',
					dimensions: true,
					render: {
						css: true
					}
				};
				return gulp.src(`./public/svgs/${locale}/*.svg`)
					.pipe(newer(`./public/css/${locale}/sprite.css`))
					.pipe(gulpSvg(config))
					.pipe(gulp.dest(dest));
			}));
		});
	};
};
