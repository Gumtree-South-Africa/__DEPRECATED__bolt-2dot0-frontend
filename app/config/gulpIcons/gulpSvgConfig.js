var path = require("path");
var customselectors = require('./customSelectors');

module.exports = function(locale) {
	var sufix = locale.split('_')[1].toLowerCase();

	var config = {

		// CSS filenames
		datasvgcss: "icons.data.svg_" + locale + ".css",
		datapngcss: "icons.data.png_" + locale + ".css",
		urlpngcss: "icons.fallback_" + locale + ".css",

		// preview HTML filename
		previewhtml: "preview-" + sufix + ".html",

		// grunticon loader code snippet filename
		loadersnippet: "grunticon.loader.js",

		// Include loader code for SVG markup embedding
		enhanceSVG: true,

		// Make markup embedding work across domains (if CSS hosted externally)
		corsEmbed: false,

		// folder name (within dest) for png output
		pngfolder: "png-" + sufix,

		// prefix for CSS classnames
		cssprefix: ".icon-",

		defaultWidth: "300px",
		defaultHeight: "200px",

		// define vars that can be used in filenames if desirable,
		// like foo.colors-primary-secondary.svg
		colors: {
			primary: "red", secondary: "#666"
		},

		dynamicColorOnly: true,

		// css file path prefix
		// this defaults to "/" and will be placed before the "dest" path
		// when stylesheets are loaded. It allows root-relative referencing
		// of the CSS. If you don't want a prefix path, set to to ""
		//cssbasepath: "/public",
		customselectors: customselectors[locale],

		// template: path.join( __dirname, "default-css.hbs" ),
		// previewTemplate: path.join( __dirname, "preview-custom.hbs" ),

		compressPNG: true
	}

	return config;
};
