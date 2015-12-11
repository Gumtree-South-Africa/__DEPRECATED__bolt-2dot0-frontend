#! /usr/local/bin/node

module.exports = function properties2Json(input,output,options){

	var _ = require('lodash'),
		Q = require('Q'),
		glob = require("glob"),
		fs = require('fs'),
		mkdirp = require('mkdirp'),
		file, errors = [], warnings = [], input_stats, output_stats, deferred = Q.defer(),promise = deferred.promise,
		DELIMITER="/",
		PARENT_APPEND = ".$$",
		ERR_BAD_FOLDER = 1;

	// Add options to the default options
	options = _.merge({
		errors:false,
		fix:false
	},options);

	return _init();

	function _init(){

		if(options.errors){
			errors = options.errors;
			return _help();
		}

		if(options.help){
			return _help();
		}
		// check the validity of the input and output file
		if(!input && !output){
			errors.push("missing input and output parameters")
			return _help();
		}
		if(!input){
			errors.push("missing input filename")
			return _help();
		}
		if(!output){
			errors.push("missing output filename")
			return _help();
		}

		// remove trailing slash from output file
		if(output.slice(-1) === DELIMITER)
			output = output.slice(0,-1);

		try {
			input_stats = fs.lstatSync(input);
		} catch(e){
			errors.push("invalid input file: " + input + ":"+e);
			return _help();
		}

		if(!input_stats.isFile()){
			errors.push("input is not a file: " + input);
			return _help();
		}

		try {

			// prevent file globbing when an output folder is specfied
			Q.fcall(getFileName)	// returns filename
				.then(readFile)		// returns collection object {filename:,contents:,warnings:,errors} objects
				.then(mapFile)		// removes all comment s
				// adds lines (array) and hash (object)
				// adds duplicate, whitespace-around-= warnings
				.then(findErrors)	// adds illegal child and parent assignment errors
				.then(reportErrors)	// reports all errors and warnings to console
				.then(fixErrors)// if the options.fix flag is set writes hashmap to file
				.then(writeJSON)	// creates the json object from hashmap
				.fail(function(err){
					throw err;
				});
		} catch(e){
			errors.push("an error occurred",e);
			return _help();
		}
		return promise;
	}
	function _help(){

		_.each(errors,function(v,i){
			if(!i)
				console.log("\n\x1b[1m");
			console.log('\x1b[31m',"\t" + v, '\x1b[0m');
		})
		_.each(warnings,function(v,i){
			if(!i)
				console.log("\n");
			console.log("\t",v);
		})
		console.log("\x1b[0m \x1b[32m \n \
	USAGE:\n\
	./properties2Json.js --fix src [src2, src3...] dest\n\
		src, src2, etc.: src files to convert (you can use wildcards)\n\
		dest: the folder containing locale specific folders (`../locales` points to '../locales/es-AR', 'locales/es-MX_VNS', etc.)\n\
		--fix: append this switch to automatically fix errors in the source files\n\
		--help: get context specific help\n\
	\n\
	This is currently all you need:\n\
	\x1b[0m\n\
	./properties2Json.js ../locales/src/*.properties  ../locales/json\n\
	\x1b[32m\n\
	--fix 		add this switch to automatically fix warnings and errors in source file\n\
	--output	absolute or relative path from working directory\n\
	\n\
	\x1b[31m\n\
	Don't check in the json files this script generates!\n\
	\x1b[0m\
	");
		deferred.resolve({});
		return promise;;
	}

// exits with code after process.nextTick. Allowing console messages to complete before exit
	function exit(code){
		process.nextTick(function(){
			process.exit(code || 0);
		});
	}

// bad assignments overwrite existing values:
// bad parent assignment (a.b=string followed by a=string)
// bad child assignment (a=string followed by a.b=string)
	function findAssignmentErrors(){
		var assignments={};
		_.each(file.hash,function(u,i){
			_.each(file.hash,function(w,j){
				if(i!==j && i.indexOf(j+".") === 0){
					file.hash[j + PARENT_APPEND] = file.hash[j];
					delete file.hash[j];
					assignments[j]=assignments[j] || [];
					assignments[j].push(i);
				}
			})
		})
		_.each(assignments,function(s,i){
			file.errors.push(
				("invalid child:$value: overwrites $key. Moved parent to parent" + PARENT_APPEND)
					.replace(/\$key/g,i)
					.replace(/\$value/g,s.join(","))

			);
		});
	}

	function findErrors(){
		findAssignmentErrors();
		findSomeOtherError();
	}

	function findSomeOtherError(){}

	function fixErrors(){
		if(!options.fix)
			return;
		var content = _.reduce(file.hash,function(result,v,i){
			if(i.slice(0,1) === "#"){
				if(v){
					result.push(i + "=" + v);
				} else {
					result.push(i);
				}
			} else {
				result.push(i + "=" + v);
			}
			return result;
		},[]);
		//console.log(content.join("\n"))
		fs.writeFile(file.filename, content.join("\n"), function(err) {
			if(err) {
				return console.log(err);
			}
		});

	}

// get file names from command line parameters/switches
	function getFileName(){
		file = input;
	}

	function mapFile(){

		// ignore comments
		var comments = /^(#.*)$/gm;
		file.content = file.raw
		file.content = file.content.replace(/[^\x00-\x7F]/g, nonAsciiReplacer);
		file.splitKey = "(((split-value-here" + Math.random() + "" + Math.random();
		file.lines = file.content
			.replace(/(^[A-za-z0-9\._-]+(\$)*(\s)*)=/mg,file.splitKey + "$1=")
			.split(file.splitKey);
		// comments are combined with previous value, lets strip them into their own "row"
		file.lines = _.reduce(file.lines,function(results,v,i){
			var matches = v.match(comments);
			v = v.replace(comments,"").trim();
			results.push(v);
			if(matches){
				results = results.concat(matches);
			}
			return results;
		},[]);
		//\n# BEGIN - localized text related to BOLT-2090\n

		var whitespaceErrors=0;

		file.hash =  _.reduce(file.lines,function(result,line,i){
			var a = line.split("="),
				key=a.shift(),
				value=a.join("=").trim();
			// ignore blank lines
			if(key === ''){
				return result;
			}
			// find whitespaces around key value delimiter
			if(!key.slice(0,1) == "#" && key.trim().length < key.length || value.trimLeft().length < value.length){
				whitespaceErrors++;
			}
			// warn about  duplicate keys when finding key already exists
			// don't warn about duplicate comments
			if(!key.slice(0,1) == "#" && result[key.trim()] !== undefined){
				file.warnings.push("remove duplicate key '$key'"
						.replace("$key",key)
				);
			}
			result[key.trim()] = value.trim();
			return result;
		},{});
		if(whitespaceErrors)
			file.warnings.push("remove whitespaces around $whitespaceErrors key value delimiters (eg. key = value,key =value,key= value)"
					.replace("$whitespaceErrors",whitespaceErrors)
			);
		return file;
	}
	function nonAsciiReplacer(c) {
		var unicode = c.charCodeAt(0).toString(16),
			ascii = "\\u" + new Array(5 - unicode.length).join("0") + unicode;
		file.errors.push(["Non Ascii Character ",c,". Replace with",ascii].join(" "))
		return ascii;
	}

	function readFile(){
		file = {
			filename:file,
			raw:fs.readFileSync(file).toString(),
			warnings:[],
			errors:[]
		}
		return file;
	}

	function reportErrors(){
		var errorCount = 0;
		var warningCount = 0;
		var ERROR = "\n\tERROR:";
		var WARNING = "\n\tWARNING:";

		var msg = "";
		errorCount+=file.errors.length;
		warningCount+=file.warnings.length;
		msg += " Errors:"+errorCount;
		msg += " Warnings:"+warningCount;
		msg += " " + file.filename
		if(file.errors.length)
			msg+=ERROR+file.errors.join(ERROR);
		if(file.warnings.length)
			msg+=WARNING+file.warnings.join(WARNING);
		msg += (!!errorCount || !!warningCount) && (options.fix ? " Fixed!!!" : " To fix "+(file.errors.length+file.warnings.length)+" issues, run with --fix") || "";
		console.log(msg);
		return file;
	}


	function writeJSON(){
		var json;

		// CREATE JSON OBJECT
		json= {"DO_NOT_EDIT":"GENERATED_FILE. For details see toJson.js"}; // added to stop devs from thinking they can edit the output document
		_.each(file.hash,function(hash,i){
			// skip comments when writing JSON
			if(i.slice(0,1) === "#"){
				return;
			}
			if(i){
				setObject(json,i,hash);
			}
		});
		json = JSON.stringify(json,null,"\t");

		// WRITE JSON FILE
		return getOutputPath(file.filename).then(function(filename){
			fs.writeFile(filename, json, function(err) {
				if(err){
					console.log(err);
					deferred.reject(err);
				} else {
					console.log(" writing",file.filename," -> ",filename);
					deferred.resolve(file);
				}
			});
		});
	}

	function getOutputPath(filename){

		var deferred = Q.defer();

		var inputDir,
			lstat,
			re = /^.*\/(.*)_([a-z]{2})_([A-Z_]{2,6})\.properties$/m,
			outputDir = filename.replace(re,output + "/$2_$3"),
			outputPath = filename.replace(re,output + "/$2_$3/$1.json");

		if(outputDir === filename)
			return __dirname + "/properties2Json.error.json";

		// make the directory
		mkdirp(outputDir, function (err) {
			if (err)
				deferred.reject(new Error(err));
			else
				deferred.resolve(outputPath);
		});
		return deferred.promise;
	}

// setObject({},"one.two.three",3) -> {one:{two:{three:3}}}
	function setObject(o,key,value){
		key = key.split(".");
		var a = "o",result=o;
		while(key.length){
			var index = key.shift();
			o[index] = o[index] || {};
			if(key.length === 0){
				o[index] = value;
			} else {
				o = o[index];
			}
		}
		return result;
	}
}

if(require.main === module){
	var _ = require('lodash'),
		fs = require('fs'),
		mkdirp = require('mkdirp'),
		argv = require('minimist')(process.argv.slice(2)),
		output = argv._.pop();
	if(argv.help) {
		module.exports(undefined, undefined, {help: true});
	} else if(argv._.length === 0){
		module.exports(undefined, undefined, {help: true, errors: ["no output argument"]});
	} else {
		var stats;
		console.log("Converting .properties files to .json...")
		try {
			var outstat = fs.lstatSync(output);
		} catch(e){
			console.log("output folder not found. writeJson will create the output folder",output);
		}
		_.each(argv._,function(v){
			module.exports(v,output,{fix:argv.fix});
		});
	}
}

