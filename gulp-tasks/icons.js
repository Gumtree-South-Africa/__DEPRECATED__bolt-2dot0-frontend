'use strict';

// ////////////////////////////////////////////////
// icons Tasks
// ///////////////////////////////////////////////

var glob = require('glob'),
    notify = require('gulp-notify');

module.exports = function watch(gulp, plugins) {
	return function(){
    var folderList = [];
    gulp.task('icons', function() {

      var emitter = walkdir(process.cwd() + '/public/svgs', {no_recurse: true}, function(dir, stat, depth){
        var base = path.basename(dir);
        folderList.push(base);
      });

      emitter.on('end', function(){
        (function() {
            var index = 0;
            folderList.push('default_country');
            function perLocale(){
              var listItem = folderList[index];
              var config = require(process.cwd() + "/app/config/gulpIcons/gulpSvgConfig.js")(listItem);
                  config.dest = "./public/css";
              var files = glob.sync("./public/svgs/"+ listItem +"/*.svg");
              if(index < folderList.length-1){
                index++;
                gulpicon(files, config)(perLocale);
              }
              else{
                plugins.notify({
      	            title: 'Compass',
      	            message: 'SVGs Tasks done. Please start your app on a Browser'
      	        })
              }
            }
            perLocale();
        })();
     });
    });
  }
};
