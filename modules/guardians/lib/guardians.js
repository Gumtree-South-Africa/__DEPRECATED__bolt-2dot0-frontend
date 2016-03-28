/**
 * @module guardians
 * @description the gurdians of the bolt 2.0
 * @author aganeshalingam@ebay.com
 */

'use strict';

var helmet = require('helmet');

module.exports = function(app) {

      app.use(helmet());
      app.use(helmet.xssFilter());

      return  helmet.csp({
            
            // Set to true if you only want browsers to report errors, not block them
            reportOnly: false,

            // Set to true if you want to blindly set all headers: Content-Security-Policy,
            // X-WebKit-CSP, and X-Content-Security-Policy.
            setAllHeaders: false,

            // Set to true if you want to disable CSP on Android where it can be buggy.
            disableAndroid: false,

            // Set to false if you want to completely disable any user-agent sniffing.
            // This may make the headers less compatible but it will be much faster.
            // This defaults to `true`.
            browserSniff: true
        });



}



