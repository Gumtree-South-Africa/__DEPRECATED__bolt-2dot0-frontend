'use strict';

// ////////////////////////////////////////////////
// Compass Tasks
// ///////////////////////////////////////////////

var glob = require('glob');

module.exports = function watch(gulp, plugins) {
	return function(){
    var appVersion = require(process.cwd() + "/server/config/production.json").static.server.version;
    var folderList = [];

    gulp.task('pak', function() {

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
              var config = require(process.cwd() + "/app/config/gulpIcons/gulpsvgconfig.js")(listItem);
                  config.dest = "./public/css";
              var files = glob.sync("./public/svgs/"+ listItem +"/*.svg");
              if(index < folderList.length-1){
                index++;
                gulpicon(files, config)(perLocale);
              }
              else{
                gulp.src('./app/styles/**/**/*.scss')
            				.pipe(plumber({
            					errorHandler: function (error) {
            						console.log(error.message);
            						this.emit('end');
            				}}))
            				.pipe(compass({
            					config_file: process.cwd() + '/app/config/ruby/config.rb',
            					lineNumbers: true,
            					css: 'public/css',
            					sass: './app/styles',
            					require: ['susy']
            				}))
            				.on('error', function(error) {
            					// Would like to catch the error here
            					console.log(error);
            					this.emit('end');
            				})
            				.pipe(gulp.dest('./public/css'))
                    .on('end', function(){
                      gulp.src(process.cwd() + "/" + "public/**/*/")
                        .pipe(tar('bolt-2dot-0-frontend-static-'+ appVersion +'.tar'))
                        .pipe(gzip())
                        .pipe(gulp.dest('./target/' + appVersion + '/static'))
                        .on('end', function(){
                          gulp.src(['./README.md', '!./{target,target/**}', './**/*/'])
                              .pipe(gulp.dest('./' + appVersion))
                              .on('end', function(){
                                gulp.src(process.cwd() + "/" + appVersion + '/**/*/')
                                  .pipe(tar('bolt-2dot0-frontend-'+appVersion+'.tar'))
                                  .pipe(gzip())
                                  .pipe(gulp.dest('./target/' + appVersion + '/app'))
                                  .on('end', function(){
                                    gulp.src(['./'+ appVersion], {read: false})
                                       .pipe(clean());
                                    console.log('Congratulaitons!!! PACKAGING DONE SUCCESSFULLY');
                                  })
                              })
                        })
                    })
              }
            }
            perLocale();
        })();
     });
    });

    }
}
