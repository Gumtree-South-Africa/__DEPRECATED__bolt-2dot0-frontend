var path = require("path");
var webpack = require("webpack");

module.exports = function (config) {
    config.set({
        frameworks: ["jasmine"],
        files: [
            "dist/jasmineUnitTest_bundle.js"
        ],
        browsers: ["Chrome"]
    });
}