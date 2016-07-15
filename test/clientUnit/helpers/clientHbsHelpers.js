"use strict";
let locale;
let _loadPartial = (name) => {
	return Handlebars.partials[name];
};

let setLocale = (newLocale) => {
	locale = newLocale;
};

let initialize = () => {
	Handlebars.registerHelper("partial", (name, options) => { //console.log( "partial " + name);
			if (!name) {
				return;
			}
			// console.log("--------" +  util.inspect(options.fn, {showHidden: false, depth: null}));
			Handlebars.registerPartial(`override_${name}`, options.fn);
		}
	);

	Handlebars.registerHelper("block", (name, options) => { //console.log("block++++++++++++++ " + util.inspect(options, {showHidden: false, depth: null}));
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
		// console.log("dp " + options.explicitPartialContext);
		return new Handlebars.SafeString(`${partialName}_${locale}`);
	});

	Handlebars.registerHelper('base', function(partialName) {
		if (!partialName) {
			return;
		}
		return new Handlebars.SafeString(partialName);
	});


	Handlebars.registerHelper('i18n', (msg) => { //console.log("xxxxxxx -" + msg);
		return msg;
	});

	Handlebars.registerHelper('json', (context) => {
		if (!context) {
			return;
		}
		return new Handlebars.SafeString(JSON.stringify(context));
	});

	// TODO Once string utils have been modified for commonJS, require it
	// and hookup
	// Handlebars.registerHelper('obfuscateUrl', (value) => {
	// 	if (!value) {
	// 		return;
	// 	}
	// 	return new Handlebars.SafeString(StringUtils.obfsucate(value));
	// });

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

	// commenting these out as we are trying to do mobile/desktop split entirely in CSS
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

afterEach(() => {
	locale = null;
});

module.exports = {
	initialize,
	setLocale
};
