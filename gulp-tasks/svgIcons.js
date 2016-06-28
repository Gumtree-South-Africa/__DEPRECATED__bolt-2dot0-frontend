'use strict';

const gulpSvgFallback = require('gulp-svgfallback'),
	rename = require('gulp-rename'),
	svgcss = require('gulp-svg-inline-css'),
	svgmin = require('gulp-svgmin'),
	es = require('event-stream'),
	concat = require('gulp-concat'),
	cssmin = require('gulp-cssmin'),
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
		gulp.task('svgIcons', () => {
			return es.merge(locales.map((locale) => {
				let dest = `./public/css/${locale}/icons.css`;
				return gulp.src(`public/svgs/${locale}/*.svg`)
					.pipe(newer(dest))
					.pipe(svgmin())
					.pipe(svgcss({
						className: (fileName) => {
							//Template didn't have an option for background-repeat, inject CSS for simple fix.
							return `.icon-${fileName} {\n  background-repeat: no-repeat;\n}\n.icon-${fileName}`;
						}
					}))
					.pipe(concat('icons.css'))
					.pipe(cssmin())
					.pipe(gulp.dest(`./public/css/${locale}`));
			}));
		});
	};
};
