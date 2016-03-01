/**
 * @module Environment midleware loader
 * @description a bootstrap for middleware
 * @author aganeshalingam@ebay.com
 */

"use strict";

module.exports = function(env) {

        if (!env) {
            env = process.env.NODE_ENV;
        }
        // default to development
        // works for 'dev' or 'mock'
        if (env == 'mock') {
            env = 'dev';
        } else {
            env = env || 'dev';
        }

       // console.log("xxxxxx env " + env);
        return function(env2, callback) {
            if (env === env2) {
               callback();
            }
        }
}