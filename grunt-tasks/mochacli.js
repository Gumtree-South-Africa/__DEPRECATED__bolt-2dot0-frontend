'use strict';


module.exports = function mochacli(grunt) {
    // Options
    return {
        src: ['test/**/*.js'],
        options: {
            timeout: 6000,
            'check-leaks': true,
            ui: 'bdd',
            reporter: 'spec'
        }
    };
};
