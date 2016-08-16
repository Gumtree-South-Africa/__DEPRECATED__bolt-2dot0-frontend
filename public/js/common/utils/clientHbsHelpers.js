"use strict";

let StringUtils = require("public/js/common/utils/StringUtilsV2.js");

let comparisonHelpers = require("../../../../modules/hbs-helpers/lib/comparisons/index.js").rawHelpers;

let locale;
let _loadPartial = (name) => {
	return Handlebars.partials[name];
};

let setLocale = (newLocale) => {
	locale = newLocale;
	$("html").attr("data-locale", newLocale);
};

let initialize = (Handlebars) => {
	Handlebars.registerHelper("partial", (name, options) => {
			if (!name) {
				return;
			}
			Handlebars.registerPartial(`override_${name}`, options.fn);
		}
	);

	Handlebars.registerHelper("block", (name, options) => {
			if (!name) {
				return;
			}
			let partial = _loadPartial(`override_${name}`) || options.fn;
			return partial(this, {data: options.hash});
		}
	);

	Handlebars.registerHelper('dynamic', function(partialName) {
		if (!partialName) {
			return;
		}

		if (!locale) {
			throw Error ("No Locale Set. Please set a locale when setting up a templated testing environment");
		}
		return new Handlebars.SafeString(`${partialName}_${locale}`);
	});

	Handlebars.registerHelper('base', function(partialName) {
		if (!partialName) {
			return;
		}
		return new Handlebars.SafeString(partialName);
	});


	Handlebars.registerHelper('i18n', (msg) => {
		return msg;
	});

	Handlebars.registerHelper('json', (context) => {
		if (!context) {
			return;
		}
		return new Handlebars.SafeString(JSON.stringify(context));
	});

	Handlebars.registerHelper('obfuscateUrl', (value) => {
		if (!value) {
			return;
		}
		return new Handlebars.SafeString(StringUtils.obfsucate(value));
	});

	Handlebars.registerHelper('digitGrouping', (number, separator) => {
		if (!number) {
			return;
		}
		number = parseFloat(number);
		separator = (separator === undefined) ? ',' : separator;
		return number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + separator);
	});

	Handlebars.registerHelper('splitKeyValueShowKey', (keyvalue) => {
		if (!keyvalue) {
			return;
		}
		let str = keyvalue.split(":");
		return new Handlebars.SafeString(str[0]);
	});

	Handlebars.registerHelper('splitKeyValueShowValue', (keyvalue) => {
		if (!keyvalue) {
			return;
		}
		let str = keyvalue.split(":");
		return new Handlebars.SafeString(str[1]);
	});

	Object.keys(comparisonHelpers).forEach((helperName) => {
		Handlebars.registerHelper(helperName, comparisonHelpers[helperName]);
	});


	// TODO commenting these out as we are trying to do mobile/desktop split entirely in CSS
	// Handlebars.registerHelper('ifDesktop', function(val, options) {
	// 	if (!val) return;
	// 	let fnTrue=options.fn, fnFalse=options.inverse;
	// 	return val.isDesktop ? fnTrue(this) : fnFalse(this);
	// });
	//
	// Handlebars.registerHelper('ifMobile', function(val, options) {
	// 	if (!val) return;
	// 	let fnTrue=options.fn, fnFalse=options.inverse;
	// 	return val.isMobile ? fnTrue(this) : fnFalse(this);
	// });
	//
	// Handlebars.registerHelper('ifTablet', function(val, options) {
	// 	if (!val) return;
	// 	let fnTrue=options.fn, fnFalse=options.inverse;
	// 	return val.isTablet ? fnTrue(this) : fnFalse(this);
	// });
	//
	// Handlebars.registerHelper('unlessMobile', function(val, options) {
	// 	if (!val) return;
	// 	// console.log("isTablet xxxxxxxxxxxxxxxxxxxxxxxxxx"  + util.inspect(val.isTablet, {showHidden: false, depth: 1}));
	// 	let fnTrue=options.fn, fnFalse=options.inverse;
	// 	return val.isTablet || val.isDesktop? fnTrue(this) : fnFalse(this);
	// });
};

module.exports = {
	initialize,
	setLocale
};
