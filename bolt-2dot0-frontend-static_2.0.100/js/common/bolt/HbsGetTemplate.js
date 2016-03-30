/*!
 * HbsGetTemplate.js
 *
 * Copyright 2015 eBay Inc.
 * @author: Ulises Robles (uroblesmellin@)
 * @description Extension of Handlebars that retrieves the precompiled hbs object given a key
 * @class Handlebars
 */
  "use strict";

(function ($) {
    var hbsExtension = ".hbs",
        templatesFolder = "/views/precompiled/";

    Handlebars = Handlebars || {};
    Handlebars.getTemplate = function (name) {
        if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
            $.ajax({
                url : templatesFolder + name + hbsExtension,
                success : function (data) {
                    if (Handlebars.templates === undefined) {
                        Handlebars.templates = {};
                    }

                    Handlebars.templates[name] = Handlebars.compile(data);
                },
                async: false
            });
        }

        return Handlebars.templates[name];
    }

}(jQuery));



