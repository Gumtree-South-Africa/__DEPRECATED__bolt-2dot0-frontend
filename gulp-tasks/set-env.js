'use strict';

//////////////////////////////////////////////////
//Set Environment Tasks
/////////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
  return function(){
	gulp.task('set-env', function () {
    var stream =
  	  plugins.env({
  	    vars: {
  	    	NODE_CONFIG_DIR: process.cwd() + "/server/config"
  	    }
  	  });

    return stream;
	});
  };
}
