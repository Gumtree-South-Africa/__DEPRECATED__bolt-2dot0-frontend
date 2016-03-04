'use strict';

//////////////////////////////////////////////////
// RELEASE Tasks
//// /////////////////////////////////////////////

module.exports = function watch(gulp, plugins) {
	return function() {
	    // Append release comments to CHANGELOG.md
	    gulp.task('changelog', function () {
				var stream =
					gulp.src('CHANGELOG.md', {buffer: false})
			       	   .pipe(conventionalChangelog({preset: 'angular'}))
			       	   .pipe(gulp.dest('./'));

				return stream;
	    });

	    // Perform Release in Github
	    gulp.task('github-release', function(done) {
			var stream =
	    	conventionalGithubReleaser( {
		        type: 'oauth',
		        token: '4545aa5a9c99ea848bd0f72064809b541301bff1' // vrajendiran personal access token for public repo
	    	}, {
	    		preset: 'express' // Or to any other commit message convention you use.
	    	},
	    	done);
			return stream;
	    });

	    // Commit all files that got updated by release
	    gulp.task('commit-changes', function () {
			var stream =
	    		gulp.src('.')
	        		.pipe(git.add())
	        		.pipe(git.commit('[Prerelease] Bumped version number --> app: '+ getAppVersion() + ', static: ' + getStaticVersion()));

	    	function getAppVersion () {
	    	    return JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
	    	};

	    	function getStaticVersion () {
	    	    return JSON.parse(fs.readFileSync('./server/config/production.json', 'utf8')).static.server.version;
	    	};

			return stream;
	    });

	    // Push all committed changes to Git
	    gulp.task('push-changes', function (cb) {
			var stream =
	    		git.push('origin', 'master', cb);

			return stream;
	    });

	    // Create a new Tag in Git
	    gulp.task('create-new-tag', function (cb) {
	    	var appVersion = getAppVersion();
			var stream  =
		    	git.tag(appVersion, 'Created Tag for app with version: ' + appVersion, function (error) {
			        if (error) {
			          return cb(error);
			        }
			        git.push('origin', 'master', {args: '--tags'}, cb);
		    	});

	    	function getAppVersion () {
	    	    return JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
	    	};

			return stream;
	    });

	    // RELEASE
	    gulp.task('release', function (callback) {
	    	runSequence(
    			//'bumpup',
    			//'changelog',
    			'commit-changes',
    			'push-changes',
				//TODO: uncomment the remaining once
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
