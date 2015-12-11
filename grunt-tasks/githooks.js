'use strict';


module.exports = function githooks(grunt) {
    // Options
    return {
        githooks: {
        	options:{
                template: 'git-hooks/pre-commit.js'
            },
		    'pre-commit': 'git-commit'		    
		}
    };
};
