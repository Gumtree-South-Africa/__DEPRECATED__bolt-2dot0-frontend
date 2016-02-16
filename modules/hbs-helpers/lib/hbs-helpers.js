/**
 * @module hbs-helpers
 * @description Handlebar template inhertiance and helpers
 * @author aganeshalingam@ebay.com
 */

"use strict";

var util = require('util');

var StringUtils = require(process.cwd() + "/app/builders/utils/StringUtils");
var exphbs = null;


module.exports  =  {

    init: function(obj) {
        exphbs = obj.hbs;
        // i18n = i18ns;
       // console.log("i18n xxxxxxxxxxxxxxxxxxxxxxxxxx"  + util.inspect(i18n, {showHidden: false, depth: 1}));

        function loadPartial(name){
            var partial = exphbs.handlebars.partials[name];
            if(typeof partial === "string"){
                //partial = exphbs.handlebars.compile(partial);
                exphbs.handlebars.partials[name] = partial;
            }
            delete exphbs.handlebars.partials[name];
            return partial;
        }
        exphbs.handlebars.registerHelper("partial",
            function (name, options) { //console.log( "partial " + name);
                // console.log("--------" +  util.inspect(options.fn, {showHidden: false, depth: null}));
                exphbs.handlebars.registerPartial(name, options.fn);
            }
        );

        exphbs.handlebars.registerHelper("block",
            function (name, options) { //console.log("block++++++++++++++ " + util.inspect(options, {showHidden: false, depth: null}));

                var partial = loadPartial(name) || options.fn;
                return new exphbs.handlebars.SafeString(partial(this, { data : options.hash }));
            }
        );

        exphbs.handlebars.registerHelper('dynamic', function(partialName, options) {
            //console.log("dp " + options.explicitPartialContext);
            return new exphbs.handlebars.SafeString(partialName + "/views/hbs/" + partialName + "_" + this.locale);
        });

        exphbs.handlebars.registerHelper('base', function(partialName, options) {
            return new exphbs.handlebars.SafeString(partialName + "/views/hbs/" + partialName);
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


        exphbs.handlebars.registerHelper('i18n', function (msg) {
            return new exphbs.handlebars.SafeString( obj.app.locals.i18n.__(msg));
        });

        exphbs.handlebars.registerHelper('json', function(context) {
            return new exphbs.handlebars.SafeString(JSON.stringify(context));
        });

        exphbs.handlebars.registerHelper('obfuscateUrl', function(value) {
            return new exphbs.handlebars.SafeString(StringUtils.obfuscate(value));
        });

        exphbs.handlebars.registerHelper('formatCommas', function(value) {
            return new exphbs.handlebars.SafeString(value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
        });


        exphbs.handlebars.registerHelper('ifDesktop', function(val, options) {
            var fnTrue=options.fn, fnFalse=options.inverse;
            return val.isDesktop ? fnTrue() : fnFalse();
        });

        exphbs.handlebars.registerHelper('ifMobile', function(val, options) {
            var fnTrue=options.fn, fnFalse=options.inverse;
            return val.isMobile ? fnTrue() : fnFalse();
        });

        exphbs.handlebars.registerHelper('ifTablet', function(val, options) {
            var fnTrue=options.fn, fnFalse=options.inverse;
            return val.isTablet ? fnTrue() : fnFalse();
        });

    }



};


exports.what = function () {
    return util.inspect(exphbs, {showHidden: false, depth: null});
};

