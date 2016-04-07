function isCORS() {
	return 'XMLHttpRequest' in window && 'withCredentials' in new XMLHttpRequest();
};
			
function isDnDElement() {
	 var div = document.createElement('div');
	 return ('draggable' in div) && !matchMedia("mobile") ;
};

function encode_utf8(s) {
  return encodeURIComponent(s);
};

function decode_utf8(s) {
  return decodeURIComponent(s);
};

var isNumber = function(o) {
    return typeof o === 'number' && isFinite(o);
};

// Detect file input support
var isFileInputSupported = (function () {
 // Handle devices which falsely report support
 if (navigator.userAgent.match(/(Android (1.0|1.1|1.5|1.6|2.0|2.1|4.3))|(Windows Phone (OS 7|8.0))|(XBLWP)|(ZuneWP)|(w(eb)?OSBrowser)|(webOS)|(Kindle\/(1.0|2.0|2.5|3.0))/)) {
   return false;
 }
 // Create test element
 var el = document.createElement("input");
 el.type = "file";
 return !el.disabled;
})();

function isAndroidNoImageResizeSupport() {
	 if (navigator.userAgent.match(/(Android (2.3|4.1|4.2))/)) {
		   return true;
		 }
	 return false;
};

function isBlackBerryCurve() {
	 if (navigator.userAgent.match(/(BlackBerry (9320|9360))/)) {
		   return true;
		 }
	 return false;
};

function IsSafariMUSupport() {
	// a work around for safari 5.1 browsers which has bug for fileList
	
	if ($.isSafari4Else5()) { 
	        var regExp = /Version\/(\d+\.\d+)/g;
	        var safariVersions = ["5.0", "4.0"];    
	        var v = regExp.exec(navigator.userAgent);
            var result = false;
	        if ($.isArray(v)) {
	            $.map( safariVersions, function( ele, i) {
	            	
	                if ($.trim(ele) === $.trim(v[1])) {  
	                    return true;
	                }
	            });
	            return result;       
	        }
	    }
};

function isIOS() {
	return !!navigator.userAgent.match(/(iPad|iPhone|iPod)/i);
}