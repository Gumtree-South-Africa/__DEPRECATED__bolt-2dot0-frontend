/**
 * Created by moromero on 1/6/14.
 */


// constructor
define("Json", [], function(){



	function json(value){
		return json[ typeof value === "object" ? "stringify" : "parse" ](value);
	}



	function parseJson(string){
		try{
			return JSON.parse(string);
		}catch(any){
			return string;
		}
	};

	function stringifyJson(obj){
		return JSON.stringify(obj);
	};


	function BoltJson(){
		this.parse = parseJson;
		this.stringify = stringifyJson;
	}


	return BoltJson;

});




// default instance
define("json", ["Json"], function(Json){


	Bolt.JSON = Bolt.Json = new Json;
	Bolt.parseJSON = Bolt.JSON.parse;
	Bolt.stringifyJSON = Bolt.JSON.stringify;


	return Bolt.Json;

});