/**
 * @module bolt-handlebars-helpers
 * @description
 * @author uroblesmellin@ebay
 */
var _i18n = require('i18next');

exports = module.exports  = nc;
exports.registerLocalePartials = regLocPartials;

// -----------------------------------------------------------------------------

// ************************************************
// @ngarga: Todo: Modify this code to avoid hardcoding paths/routes.
// ************************************************

/**
 * @method regLocPartials
 * @description Register the partials specific for a given locale
 * @param {Object} module The module Object from which to get the hb instance
 * @public
 */
function regLocPartials (module, locale) {
    // @todo: Parameterize the code below:
    var country_sufix = locale,
        country_sufix_repl = '_' + country_sufix,
        configPath = '../../app/config/'+ country_sufix,
        partialsConfig = require(configPath),
        filenamePath = {}; //[];

    var that = module.instance,
        prop,
        idx,
        origFile,
        baseFile,
        regFileName,
        matches,
        fs = require('fs'),
        regPartialFromFile = function(fileName, partialName) {
            var template = fs.readFileSync(fileName, 'utf8');
            that.handlebars.registerPartial(partialName, template);
        };

    filenamePath[country_sufix] = [];

    for (prop in partialsConfig) {
      for(idx=0; idx < partialsConfig[prop].partialsDir.length; idx++){
         filenamePath[country_sufix].push(partialsConfig[prop].partialsDir[idx]);
      }
    }

    for (idx=0; idx < filenamePath.length; idx++) {
      origFile = filenamePath[country_sufix][idx];
      baseFile = origFile.replace(country_sufix_repl, '');
      matches = origFile.match(/\/([^/]*)$/);

      if (!matches) {
          return;
      }
      // Register the locale-specific file partial from the configuration
      regFileName = matches[1].replace('.hbs','').replace(country_sufix_repl, '');
      // regPartialFromFile(origFile, regFileName + "-file");
      regPartialFromFile(origFile, regFileName);

      // Register the base file partial
      regPartialFromFile(baseFile, regFileName + "-base")
    }
}

/**
 * @method nc
 * @description Defines the extra handlebars helpers needed for BOLT 2.0 app
 * @param {Object} module The module Object from which to get the hb instance
 * @public
 * @return {Object} JSON structure with the handlebars helper methods
 */
function nc(module, i18nObj) {
    var engines;

    // *******************************
    // handlebars partial/Block logic
    // *******************************
    function loadPartial(instance, name) {
        var partial = instance.handlebars.partials[name];

        if (typeof partial === "string"){
           partial = instance.handlebars.compile(partial);
           instance.handlebars.partials[name] = partial;
        }

        return partial;
    }

    // *******************************
    // Function that replaces the parameters in a string with the format
    // {0}, {1} with the corresponding values
    // *******************************
    function replaceParamValues (instance, val, argsArr) {
        var idx = 0;

        // val is the original string e.g, "The salary is {0}"
        // argsArr is an array with the values to replace.
        if (typeof val !== "undefined") {
            for (idx = 0; idx < argsArr.length; idx++) {

            if (typeof argsArr[idx] === "number") {
              argsArr[idx] = boltHelpers.helpers.formatCommas(argsArr[idx]);
            }

              val = val.replace("{" + idx + "}", argsArr[idx]);
            }
        }
        return val;
    }

    // ********************************
    // Handlebars ecg BOLT 2.0. helpers
    // ********************************
    var boltHelpers = {
        helpers : {

            'block' : function(name, options) {
              var context = module.instance;
              var partial = loadPartial(context, name) || options.fn;
              var args = Array.prototype.slice.call(arguments);

              // Read the context passed as part of the arguments, if any.
              if (args.length > 2) {
                context = args[1];
              }
              return partial(context, { data:options.hash });
            },

            'partial' : function(name, options) {
                var that = module.instance;
                that.handlebars.registerPartial(name, options.fn);
            },

            'json' : function(context) {
                return JSON.stringify(context);
            },

            'obfuscateUrl' : function(value) {
                return value;
            },

            'formatCommas' : function(value) {
              return value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
            },

            // Handlebars helper from i18next
            'i18n' : function(i18n_key, par) {
                var context = module.instance;
                //console.log("I NEED I18N OBJECT NOW.........");
                var result = _i18n.t(i18n_key),
                  argsArr;

                if (par && (typeof par === "number" ||typeof par === "string")) {
                  argsArr = Array.prototype.slice.call(arguments).splice(1,2);
                  return replaceParamValues(context, result, argsArr);
                }

                // console.log("RETRIEVING AN SPECIFIC I18N....");
                // var result = i18nObj.t(i18n_key);
                return result;
            }
        }
    };

    return boltHelpers;
};
