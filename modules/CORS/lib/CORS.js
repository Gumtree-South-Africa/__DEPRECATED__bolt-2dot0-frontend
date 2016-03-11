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
        corsOptions; console.log(whitelistRegExp);

    if(isOriginOk(req)){
        corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
    }else{
        corsOptions = { origin: false }; // disable CORS for this request
    };

    callback(err, corsOptions); // callback expects two parameters: error and options

    function isOriginOk( req)  {
       return (new RegExp(whitelistRegExp)).test(req.header("Origin"));
    }
};



var cors = CORS(corsOptionsDelegate);

module.exports = cors;