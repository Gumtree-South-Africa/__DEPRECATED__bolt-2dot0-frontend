'use strict';

//////////////////////////////////////////////////
//Set Environment Tasks
/////////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
  return function(){
	gulp.task('set-env', function () {
	  env({
	    vars: {
	    	NODE_CONFIG_DIR: process.cwd() + "/server/config"
	    }
	  })
	});
  };
}
