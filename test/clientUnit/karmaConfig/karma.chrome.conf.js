module.exports = function (config) {
    config.set({
        frameworks: ["jasmine"],
        files: [
			"../../../public/js/libraries/handlebars/handlebars.js",
			"../../../public/jsmin/Main.min.js",
			"../SpecRunnerBundle.js"
        ],
        browsers: ["Chrome"]
    });
};

