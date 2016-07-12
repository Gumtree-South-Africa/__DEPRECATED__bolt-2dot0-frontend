'use strict';

const gulpSvgFallback = require('gulp-svgfallback'),
	rename = require('gulp-rename'),
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
		gulp.task('svgFallback', () => {
			return es.merge(locales.map((locale) => {
				let dest = `./public/css/${locale}`;
				return gulp.src(`./public/svgsV2/${locale}/*.svg`)
					.pipe(newer(`./public/css/${locale}/${locale}.png`))
					.pipe(rename((path) => {
						let name = path.dirname.split(path.sep);
						name.push(path.basename);
						path.basename = name[1];
					}))
					.pipe(rename({prefix: 'icon-'}))
					.pipe(gulpSvgFallback({
						//Custom CSS template to inject background-size: initial
						cssTemplate: './gulp-tasks/spriteFallbackTemplate.css'
					}))
					.pipe(gulp.dest(dest));
			}));
		});
	};
};
