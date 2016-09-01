/**
 * @module CORS
 * @description a middleware for CORS for
 * @author aganeshalingam@ebay.com
 */

"use strict";

var CORS = require('cors');

var corsOptionsDelegate = function(req, callback){
var err;
    //var whitelist = ['http://www.gumtree.co.za.localhost:8000', 'http://gumtree.co.za.localhost:8000'];
    var whitelistRegExp = req.app.locals.config.hostnameRegex,
        corsOptions;


	corsOptions = { origin: false }; // reflect (enable) the requested origin in the CORS response

    callback(err, corsOptions); // callback expects two parameters: error and options
};



var cors = CORS(corsOptionsDelegate);

module.exports = cors;
