'use strict';

//////////////////////////////////////////////////
// RELEASE Tasks
//// /////////////////////////////////////////////

module.exports = function watch(gulp, plugins) {
	return function() {
	    // Append release comments to CHANGELOG.md
	    gulp.task('changelog', function () {
	    	return gulp.src('CHANGELOG.md', {buffer: false})
			       	   .pipe(conventionalChangelog({preset: 'express'}))
			       	   .pipe(gulp.dest('./'));
	    });
	
	    // Perform Release in Github
	    gulp.task('github-release', function(done) {
	    	conventionalGithubReleaser( {
		        type: 'oauth',
		        token: '0126af95c0e2d9b0a7c78738c4c00a860b04acc8' // change this to your own GitHub token or use an environment variable
	    	}, {
	    		preset: 'express' // Or to any other commit message convention you use.
	    	}, 
	    	done);
	    });
	
	    // Commit all files that got updated by release
	    gulp.task('commit-changes', function () {
	    	return gulp.src('.')
	        	.pipe(git.add())
	        	.pipe(git.commit('[Prerelease] Bumped version number --> app: '+ getAppVersion() + ', static:' + getStaticVersion()));
	    	
	    	function getAppVersion () {
	    	    return JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
	    	};
	    	
	    	function getStaticVersion () {
	    	    return JSON.parse(fs.readFileSync('./server/config/production.json', 'utf8')).static.server.version;
	    	};
	    });
	
	    // Push all committed changes to Git
	    gulp.task('push-changes', function (cb) {
	    	git.push('origin', 'master', cb);
	    });
	
	    // Create a new Tag in Git
	    gulp.task('create-new-tag', function (cb) {
	    	var appVersion = getAppVersion();
	    	git.tag(appVersion, 'Created Tag for app with version: ' + appVersion, function (error) {
		        if (error) {
		          return cb(error);
		        }
		        git.push('origin', 'master', {args: '--tags'}, cb);
	    	});
	    	
	    	function getAppVersion () {
	    	    return JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
	    	};
	    });
	
	    // RELEASE
	    gulp.task('release', function (callback) {
	    	runSequence(
		    	'changelog',
		        //'commit-changes',
		        //'push-changes',
		        //'create-new-tag',
		        //'github-release',
		        function (error) {
		        	if (error) {
		        		console.log(error.message);
		        	} else {
		        		console.log('RELEASE FINISHED SUCCESSFULLY');
		        	}
		        	callback(error);
		        });
	    });

	}

}
