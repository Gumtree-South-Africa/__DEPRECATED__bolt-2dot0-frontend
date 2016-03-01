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

        // default to development for process.env.NODE_ENV == 'dev' && process.env.NODE_ENV == 'vm'
        if (env == 'mock') {
            env = 'dev';
        } else {
            env = env || 'dev';
        }


        return function(env2, callback) {

            env2.forEach(function(envItem, index, arr){

                if (envItem === env) {
                    console.log('envItem ' + envItem);
                    callback();

                    arr.length = 0;
                }

            });

        }
}