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


        exphbs.handlebars.registerHelper('i18n', function (msg, value) { //console.log("xxxxxxx -" + msg);
            if (!msg) return;
            // if there are 3 param values in {{i18n "my.name is %s. i'm %s old. I live in, %s" "anton" "20" "santa cruz"}}
            if (arguments.length == 5) {
                return new exphbs.handlebars.SafeString( obj.app.locals.i18n.__(msg, arguments[1], arguments[2], arguments[3]));
            }

            // if there are 2 param values in {{i18n "my.name is %s. i'm %s old." "anton" "20" }}
            else if (arguments.length == 4) {
                return new exphbs.handlebars.SafeString( obj.app.locals.i18n.__(msg, arguments[1], arguments[2]));
            }

            // if there are 1 param values in {{i18n "my.name is %s." "anton"  }}
            else if (arguments.length == 3) {
                return new exphbs.handlebars.SafeString( obj.app.locals.i18n.__(msg, arguments[1]));
            }
            // if there are 2 param values in {{i18n "my.name" }}
            else  if (arguments.length == 2) {
                return new exphbs.handlebars.SafeString( obj.app.locals.i18n.__(msg));
            }

        });

        exphbs.handlebars.registerHelper('json', function(context) {
            if (!context) return;
            return new exphbs.handlebars.SafeString(JSON.stringify(context));
        });

        exphbs.handlebars.registerHelper('obfuscateUrl', function(value) {
            if (!value) return;
            return new exphbs.handlebars.SafeString(StringUtils.obfuscate(value));
        });

        exphbs.handlebars.registerHelper('digitGrouping', function(number, separator) {
            if (!number) return;
            number = parseFloat(number);
            separator = util.isUndefined(separator) ? ',' : separator;
            return number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + separator);
        });

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

    }



};


exports.what = function () {
    return util.inspect(exphbs, {showHidden: false, depth: null});
};

