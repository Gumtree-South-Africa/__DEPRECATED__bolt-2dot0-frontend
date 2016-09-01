/**
 * @module hbs-helpers
 * @description Handlebar template inhertiance and helpers
 * @author aganeshalingam@ebay.com
 */

"use strict";

var util = require('util');
var comparisons = require('./comparisons');

var StringUtils = require(process.cwd() + "/app/utils/StringUtils");
var exphbs = null;


module.exports  =  {

    init: function(obj) {
        exphbs = obj.hbs;

		function translate(msg) {
			// cast arguments to actual array
			let args = Array.prototype.slice.call(arguments);
			// get object container __ i18n translation library
			let i18nFuncObj = this.__ ? this : obj.req.i18n;

			if (!msg) {
				return;
			}

			// apply aguments to i18n translation library
			return i18nFuncObj.__.apply(i18nFuncObj, args);
		}


        function loadPartial(name){
            var partial = exphbs.handlebars.partials[name];
            if(typeof partial === "string"){
                //partial = exphbs.handlebars.compile(partial);
                exphbs.handlebars.partials[name] = partial;
            }
            delete exphbs.handlebars.partials[name];
            return partial;
        }

        comparisons.registerHelper(exphbs, {} );

        exphbs.handlebars.registerHelper("partial",
            function (name, options) { //console.log( "partial " + name);
                if (!name) return;
                // console.log("--------" +  util.inspect(options.fn, {showHidden: false, depth: null}));
                exphbs.handlebars.registerPartial(name, options.fn);
            }
        );

        exphbs.handlebars.registerHelper("block",
            function (name, options) { //console.log("block++++++++++++++ " + util.inspect(options, {showHidden: false, depth: null}));
                if (!name) return;
                var partial = loadPartial(name) || options.fn;
                return new exphbs.handlebars.SafeString(partial(this, { data : options.hash }));
            }
        );

        exphbs.handlebars.registerHelper('dynamic', function(partialName, options) {
            if (!partialName) return;
           // console.log("dp " + options.explicitPartialContext);
            return new exphbs.handlebars.SafeString(partialName + "/views/hbs/" + partialName + "_" + this.locale);
        });

        exphbs.handlebars.registerHelper('base', function(partialName, options) {
            if (!partialName) return;
            return new exphbs.handlebars.SafeString(partialName + "/views/hbs/" + partialName);
        });

        exphbs.handlebars.registerHelper('include', function(component, subPartialName, options) {
            if (!component) return;
            return new exphbs.handlebars.SafeString(component + "/views/hbs/" + subPartialName);
        });

        exphbs.handlebars.registerHelper("debug", function(optionalValue) {
            console.log("Current Context");
            console.log("====================");
            console.log(this);

            if (optionalValue) {
                console.log("Value");
                console.log("====================");
                console.log(optionalValue);
            }
            return new exphbs.handlebars.SafeString(util.inspect(this, {showHidden: false, depth: null}));
        });


        exphbs.handlebars.registerHelper('i18n', function () { //console.log("xxxxxxx -" + msg);
			let args = Array.prototype.slice.call(arguments);
			args.pop(); // remove handlebars helper option object
			return new exphbs.handlebars.SafeString(translate.apply(this, args));
        });

        exphbs.handlebars.registerHelper('json', function(context) {
            if (!context) return;
            return new exphbs.handlebars.SafeString(JSON.stringify(context));
        });

		exphbs.handlebars.registerHelper('blueStars', function(n, block) {
			var result = '';
			for(var i = 0; i < n; ++i)
				result += block.fn(i);
			return result;
		});

		exphbs.handlebars.registerHelper('grayStars', function(n, block) {
			var result = '';
			for(var i = 0; i < 5 - n; ++i)
				result += block.fn(i);
			return result;
		});

		exphbs.handlebars.registerHelper('obfuscateUrl', function(value) {
            if (!value) return;
            return new exphbs.handlebars.SafeString(StringUtils.obfuscate(value));
        });

		exphbs.handlebars.registerHelper("formatPrice", (number, separator) => {
			if (!number || !separator)  {
				return;
			}

			if (number >= 1000000000) {
				number /= 1000000000;
				return new exphbs.handlebars.SafeString("$" + number.toFixed(1) + "B");
			} else if (number >= 1000000) {
				number /= 1000000;
				return new exphbs.handlebars.SafeString("$" + number.toFixed(1) + "M");
			} else {
				return new exphbs.handlebars.SafeString("$" + _groupDigits(number, separator));
			}
		});

		let _groupDigits = function(number, separator) {
			if (!number) return;
			number = parseFloat(number);
			separator = util.isUndefined(separator) ? ',' : separator;
			return number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + separator);
		};
        exphbs.handlebars.registerHelper('digitGrouping', _groupDigits);

        exphbs.handlebars.registerHelper('splitKeyValueShowKey', function(keyvalue) {
            if (!keyvalue) return;
            var str = keyvalue.split(":");
            return new exphbs.handlebars.SafeString(str[0]);
        });

        exphbs.handlebars.registerHelper('splitKeyValueShowValue', function(keyvalue) {
            if (!keyvalue) return;
            var str = keyvalue.split(":");
            return new exphbs.handlebars.SafeString(str[1]);
        });


        exphbs.handlebars.registerHelper('ifDesktop', function(val, options) {
            if (!val) return;
            var fnTrue=options.fn, fnFalse=options.inverse;
            return val.isDesktop ? fnTrue(this) : fnFalse(this);
        });

        exphbs.handlebars.registerHelper('ifMobile', function(val, options) {
            if (!val) return;
            var fnTrue=options.fn, fnFalse=options.inverse;
            return val.isMobile ? fnTrue(this) : fnFalse(this);
        });

        exphbs.handlebars.registerHelper('ifTablet', function(val, options) {
            if (!val) return;
            var fnTrue=options.fn, fnFalse=options.inverse;
            return val.isTablet ? fnTrue(this) : fnFalse(this);
        });

        exphbs.handlebars.registerHelper('unlessMobile', function(val, options) {
            if (!val) return;
            // console.log("isTablet xxxxxxxxxxxxxxxxxxxxxxxxxx"  + util.inspect(val.isTablet, {showHidden: false, depth: 1}));
            var fnTrue=options.fn, fnFalse=options.inverse;
            return val.isTablet || val.isDesktop? fnTrue(this) : fnFalse(this);
        });

		exphbs.handlebars.registerHelper('clientI18nTranslate', function (translations) {
			let returnObj = {};
			translations.forEach((trans) => {
				returnObj[trans] = translate.call(this, trans);
			});

			return new exphbs.handlebars.SafeString(JSON.stringify(returnObj));
		});

		exphbs.handlebars.registerHelper('ifValueIn', function(object, field, value, options) {
			if (!object || !field || value === undefined){
				return;
			}
			let entry = object[field];
			if (!isNaN(entry)) {
				return (entry === Number(value)) ? options.fn(this) : options.inverse(this);
			} else {
				return (entry === value) ? options.fn(this) : options.inverse(this);
			}
		});

		exphbs.handlebars.registerHelper('ifIn', function(object, field, options) {
			if (!object || !field) {
				return;
			}
			return (field in object) ? options.fn(this) : options.inverse(this);
		});
    }
};


exports.what = function () {
    return util.inspect(exphbs, {showHidden: false, depth: null});
};
