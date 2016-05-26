'use strict';


/* getClusterId returns a small integer number to use with
 * metrics reporting.
 *
 * getRestarts(options, callback) increments the restart count on disk
 * and returns the cumulative count.
 *
 */
var path = require('path'),
    fs = require('fs'),
    os = require('os'),
    theId;


// Called when starting up and so also gets called on a restart
// which is when we collect the number of restarts to report and
// bump the number of restarts done.
function getRestarts(options, callback) {
    var restartCountsFile,
        restarts = 0,
        restartCount;

    restartCountsFile = path.resolve('./restarts_' + theId);
    if (fs.existsSync(restartCountsFile)) {
        restartCount = fs.readFileSync(restartCountsFile, 'utf8');
        restarts = Number(restartCount) + 1;
    }
    fs.writeFileSync(restartCountsFile, restarts + '');

    var health = {
        noWorkers: 1,
        restarts: restarts
    };
    callback(null, health);
}


module.exports = {
    getRestarts: getRestarts
};