'use strict';

// ////////////////////////////////////////////////
// icons Tasks
// ///////////////////////////////////////////////

let customSelectors = require(`${process.cwd()}/app/config/icons/customSelectors.json`);

let path = require('path'),
	phantom = require('phantom'),
	mkdirp = require('mkdirp'),
	svgmin = require('gulp-svgmin'),
	fs = require('fs'),
	through2 = require('through2'),
	newer = require('gulp-newer'),
	q = require('q');

let fallback = (done) => {
	let obj = {};
	let names = [];
	let svgPrefix = 'data:image/svg+xml;base64,';
	let pngPrefix = 'data:image/png;base64,';

	//Sets the svg dimensions
	function setDims(page, width, height) {

		return page.evaluate(function(width, height) {
			var el = document.documentElement;

			el.setAttribute("width", width + "px");

			el.setAttribute("height", height + "px");
		}, width, height);
	}

	let generate = (instance) => {
		let i = 0;
		let max = names.length;
		mkdirp.sync('./public/css');
		//Write this file so gulp-newer has a single reference point.
		fs.writeFileSync('./public/css/.built_fallback', 'File used for timestamp.');
		names.map((file) => {
			let nameArray = file.split('/');
			let fileName = nameArray.pop().split('.')[0];
			let locale = nameArray.pop();
			if (!fs.existsSync(`./public/css/${locale}`)) {
				mkdirp.sync(`./public/css/${locale}`);
			}
			return instance.createPage()
				.then((page) => {
					//Convert the svg to base 64
					let base64 = new Buffer(obj[file]).toString('base64');
					//Open it in phantom
					return page.open(svgPrefix + base64)
						.then((status) => {
							if (status !== 'success') {
								throw new Error(`Failed to load up ${file}`);
							}
							//Get the size of the SVG
							return page.evaluate(function() {
								var el = document.documentElement;
								return el.getBoundingClientRect();
							});
						})
						.then((rect) => {
							//Clip the SVG to the proper size
							let clipRect = page.property('clipRect', {
								left: rect.left,
								top: rect.top,
								width: rect.width,
								height: rect.bottom
							});
							let dims = setDims(page, rect.width, rect.bottom);
							//Run them in parallel
							return q.all([clipRect, dims]);
						})
						.then(() => {
							//Render a PNG from the opened SVG
							return page.renderBase64('PNG');
						})
						.then((result) => {
							let png = pngPrefix + result;
							//check for icon aliases
							let selector;
							if (customSelectors[locale]) {
								selector = customSelectors[locale][fileName];
								if (selector) {
									selector = `, ${selector[0]}`;
								} else {
									selector = '';
								}
							}
							//Append it to a CSS file for this locale.
							fs.appendFile(`./public/css/${locale}/fallback.css`,
								`.icon-${fileName} ${selector} {
									background-repeat: no-repeat;
									background-image: url(${png});
								}`,
								(err) => {
									if (err) {
										console.error(`Error writing png fallback ${file}`);
										console.error(err);
										console.error(err.stack);
									}
								});
							i++;
							if (i === max) {
								//We've done all the PNGs, exit.
								done();
								instance.exit();
							}
							return result;
						})
						.then(() => {
							//close our phantom pages
							return page.close();
						})
						.catch((err) => {
							console.error(err);
							console.error(err.stack);
						});
				});
		});
	};

	return through2.obj((file, enc, callback) => {
		let contents = file.contents.toString();
		let name = file.path;
		names.push(name);
		obj[name] = contents;
		callback();
	}, () => {
		if (names.length === 0) {
			console.log("No images to fallback.");
			return done();
		} else {
			console.log(`Compiling ${names.length} SVGs into PNGS`);
			phantom.create()
				.then((instance) => {
					return generate(instance);
				})
				.catch((err) => {
					console.error(err);
					console.error(err.stack);
				});
		}
	});
};

module.exports = function watch(gulp, plugins) {
	return function() {
		gulp.task('icons', (done) => {
			return gulp.src('public/svgs/**/*.svg')
				.pipe(newer('public/css/.built_fallback'))
				.pipe(svgmin())
				.pipe(fallback(done));
		});
	};
};
