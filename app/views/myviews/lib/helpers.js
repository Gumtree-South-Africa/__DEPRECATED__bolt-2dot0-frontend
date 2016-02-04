'use strict';

var i18n = require("i18n");



exports.i18n = function (msg, locale) {
    i18n.configure({
        locales:[locale],
        objectNotation: true,
        directory: process.cwd() + "/app/locales/json/" + locale,
        prefix: 'translation-'
    });
    console.log(process.cwd() + "/app/locales/json/" + locale);

    return i18n.__({phrase: msg, locale: locale});
};

