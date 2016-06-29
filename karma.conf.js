module.exports = function (config) {
    config.set({
        frameworks: ["jasmine"],
        files: [
			"public/js/libraries/handlebars/handlebars.js",
			"public/jsmin/Main.min.js",
            "test/clientUnit/SpecRunnerBundle.js"
        ],
        browsers: ["Chrome"],
		logLevel: config.LOG_DEBUG,
		hostname: "127.0.0.1"
    });
};

