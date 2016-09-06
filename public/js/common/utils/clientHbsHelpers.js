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
			throw Error ("No Locale Set. Please set a locale if you are using dynamic locale based templating.");
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

	Handlebars.registerHelper("formatPrice", (number, separator) => {
		if (!number)  {
			return;
		}

		if (number >= 1000000000) {
			number /= 1000000000;
			return new Handlebars.SafeString("$" + number.toFixed(1) + "B");
		} else if (number >= 1000000) {
			number /= 1000000;
			return new Handlebars.SafeString("$" + number.toFixed(1) + "M");
		} else {
			return new Handlebars.SafeString("$" + _groupDigits(number, separator));
		}
	});

	let _groupDigits = (number, separator) => {
		if (!number) {
			return;
		}
		number = parseFloat(number);
		separator = (separator === undefined) ? ',' : separator;
		return number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + separator);
	};
	Handlebars.registerHelper('digitGrouping', _groupDigits);

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

	Handlebars.registerHelper('ifValueIn', function(object, field, value, options) {
		if (!object || !field || value === undefined){
			return;
		}
		return (object[field] === value) ? options.fn(this) : options.inverse(this);
	});

	Handlebars.registerHelper('ifIn', function(object, field, options) {
		if (!object || !field) {
			return;
		}
		return (field in object) ? options.fn(this) : options.inverse(this);
	});

	Handlebars.registerHelper('lookupLocalDate', (attrVals, name) => {
		let thisVal = attrVals[name];
		let month = thisVal.monthOfYear.toString();
		let day = thisVal.dayOfMonth.toString();

		if (month.length === 1) {
			month = "0" + month;
		}

		if (day.length === 1) {
			day = "0" + day;
		}
		return `${thisVal.year}-${month}-${day}`;
	});

	Handlebars.registerHelper('formatDate', (date) => {
		let hours12, halfOfDay,
			hours24 = date.getHours();

		// converting to 12 hours time
		if (hours24 > 12) {
			hours12 = hours24 - 12;
			halfOfDay = 'pm';
		} else {
			hours12 = hours24;
			halfOfDay = 'am';
		}

		// grabbing localized month abbreviation from i18n
		let monthString = exphbs.handlebars.helpers.i18n(`common.abbreviations.months.${date.getMonth()}`, {}); // passing an empty object as the second parameter as i18n expects an extra parameter from handlebars
		return `${date.getDate()} ${monthString} ${hours12}:${date.getMinutes()}:${date.getSeconds()} ${halfOfDay}`; // 29 dec 12:13:14 pm
	});

	Object.keys(comparisonHelpers).forEach((helperName) => {
		Handlebars.registerHelper(helperName, comparisonHelpers[helperName]);
	});
};

module.exports = {
	initialize,
	setLocale
};
