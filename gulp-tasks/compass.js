'use strict';

// ////////////////////////////////////////////////
// Compass Tasks
// ///////////////////////////////////////////////
module.exports = function watch(gulp, plugins) {
	return function(){
		var folderList = [];
		gulp.task('compass', function(){

      var emitter = walkdir(process.cwd() + '/app/config/ruby', {no_recurse: true}, function(dir, stat, depth){
        var base = path.basename(dir);
        folderList.push(base);
      });

			emitter.on('end', function(){
				//(function(){
				var config = require(process.cwd() + '/app/config/ruby/compassConfig');
				console.log(config);
				//for (var i=0; i<folderList.length; i++){
				  gulp.src('./app/styles/**/**/*.scss')
							.pipe(plumber({
								errorHandler: function (error) {
									console.log(error.message);
									this.emit('end');
							}}))
				      .pipe(compass({
				        project: process.cwd(),
								lineNumbers: config.lineNumbers,
								css: config.cssPath,
								sass: config.sassPath,
								require: ['susy']
				      }))
				      .pipe(gulp.dest('./public/css'))
				      .pipe(notify({
			            title: 'Compass',
			            message: 'Style Compilation done. Wonderful!'
			        }));
				//	}
				//})

			//})();
			})
		})
	}
}

//
// (function() {
// 		var index = 0;
// 		folderList.push('default_country');
// 		function perLocale(){
// 			var listItem = folderList[index];
// 			var config = require(process.cwd() + "/app/config/gulpIcons/gulpsvgconfig.js")(listItem);
// 					config.dest = "./public/css";
// 			var files = glob.sync("./public/svgs/"+ listItem +"/*.svg");
// 			if(index < folderList.length-1){
// 				index++;
// 				gulpicon(files, config)(perLocale);
// 			}
// 			else{
// 				notify({
// 						title: 'Compass',
// 						message: 'SVGs Tasks done. Please start your app on a Browser'
// 				})
// 			}
// 		}
// 		perLocale();
// })();
