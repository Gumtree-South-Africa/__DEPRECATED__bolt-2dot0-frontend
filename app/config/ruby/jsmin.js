//former uglify.js 

module.exports =
  [
    {
      "dest": process.cwd() + "/public/jsmin",
      "src":
      [
         process.cwd() + "/public/js/common/*.js",
         process.cwd() + "/public/js/libraries/jquery-2.0.0.js"
      ],
      "bundleName": "my-component.min.js"
    },
    {
      "dest": process.cwd() + "/public/jsmin",
      "src":
      [
         process.cwd() + "/public/js/libraries/handlebars/*.js"
      ],
      "bundleName": "my-other-component.min.js"
    }
  ];
