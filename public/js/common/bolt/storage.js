/**
 * Created by moromero on 1/6/14.
 */



(function(){

	var // check if there's HTML5
		isHTML5 = false && "localStorage" in window,

	// cookie or item name in storage
		defaultName = 'General',

	// storage prefix
		prefix = "",

	// cookie limit
		cookieLimit = 1024,

	// storage
		storageType = "forever",

	// this value will be inserted into the main cookie when
	// the user attempts to save a large cookie.
	// then it will be split into multiple cookies (vSiMc)
		placeholderValue = "_{([%vSiMc%])}_";



	if(isHTML5){


		define("storageRead", ["json"], function(jsonObj){
			return function (name, defaultValue){
				var storedValue = window.localStorage.getItem(prefix + (name || defaultName));
				if(storedValue)
					return jsonObj.parse(storedValue);
				return defaultValue;
			};
		});

		define("storageWrite", ["json"], function(jsonObj){
			return function(name, value){
				window.localStorage.setItem(prefix + (name || defaultName), jsonObj.stringify(value));
				return value;
			};
		});


	}else{


		define("storageRead", ["cookie", "json"], function(cookieObj, jsonObj){
			return function(name, defaultValue){

				var cookieName = prefix + (name || defaultName),
					cookieValue = cookieObj.getHardCookie(cookieName, defaultValue),
					totalCookies, i;

				if(cookieValue === placeholderValue){

					totalCookies = parseInt(cookieObj.getHardCookie(cookieName + "c", 0));
					cookieValue = "";

					for(i = 0; i < totalCookies; i++)
						cookieValue += cookieObj.getHardCookie(cookieName + i);

				}

				if(cookieValue == "" || cookieValue == null)
					return defaultValue;

				if(typeof cookieValue !== "string")
					return cookieValue;

				return jsonObj.parse(cookieValue);
			};
		});

		define("storageWrite", ["cookie", "json"], function(cookieObj, jsonObj){
			return function(name, value){

				var cookieName = prefix + (name || defaultName),
					cookieValue = (typeof value == "string" || typeof value == "number") ? value : jsonObj.stringify(value),
					len = cookieValue.length,
					i, totalCookies;

				if(len > cookieLimit){

					totalCookies = Math.ceil(len / cookieLimit);
					cookieObj.setHardCookie(cookieName, placeholderValue, storageType);
					cookieObj.setHardCookie(cookieName + "c", totalCookies, storageType);
					for(i = 0; i < totalCookies; i++)
						cookieObj.setHardCookie(cookieName + i, cookieValue.substr(i * cookieLimit, cookieLimit), storageType);

				}else{

					cookieObj.setHardCookie(cookieName, cookieValue, storageType);

				}

				return value;
			};
		});


	}





	// constructor
	define("Storage", ["storageRead", "storageWrite"], function(readStorage, writeStorage){


		// setter function (turns value into JSON)
		function setStorage(name, value){
			writeStorage(name, value);
			return value;
		}

		// getter function (parses value from JSON)
		function getStorage(name, defaultValue){
			return readStorage(name, defaultValue || '""');
		}


		function BoltStorage(config){

			if(typeof config === "undefined")
				config = {};

			if(config.storageType)
				storageType = config.storageType;

			this.set =  setStorage;
			this.get = getStorage;

		}


		return BoltStorage;


	});






	// default instance
	define("storage", ["Storage"], function(Storage){

		// construct the default instance of this function
		Bolt.Storage = new Storage;

		return Bolt.Storage;

	});




})();