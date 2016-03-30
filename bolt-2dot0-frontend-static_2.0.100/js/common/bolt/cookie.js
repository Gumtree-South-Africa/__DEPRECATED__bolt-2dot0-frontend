/**
 * Created by moromero on 1/6/14.
 * Modified by: uroblesmellin@3ebay.com on 2/26/2016.
 */

// @todo: Revisit this code using requirejs.
// constructor
// define("js/common/bolt/Cookie", function(jsonObj) {
var Cookie = function(jsonObj) {

    var
    // set the prefix of the cookie
        prefix = "BOLT_",

    // get the client cookie name
        name = prefix + (Bolt.id || "NA");




    function getName(type){
        switch(type.toString().toLowerCase()){
            case 'forever':
                return name + '_ALWS';
                break;
            case 'never': case 'perm': case 'permanent':
            return name + '_PERM';
            break;
            case 'temp': case 'temporary':
            return name + '_TEMP';
            break;
            case 'settings':
                return name + '_STNGS';
            default:
                return name + '_SESS';
        }
    }




    function getExpiration(type){
        if(typeof type === "number")
            return type;
        switch(type){
            case 'never': case 'perm': case 'permanent':
                return 7;
                break;
            case 'temp': case 'temporary':
                return 3;
                break;
            case 'settings':
                return 180;
                break;
            case 'forever':
                return 7300;
                break;
            default:
                return 3;
        }
    }



    function cookieFn(key, value, options){

        // key and at least value given, set cookie...
        if (arguments.length > 1 && String(value) !== "[object Object]") {
            options = Bolt.extend({ path:'/' }, options);

            if(value === null || value === undefined)
                options.expires = -1;

            if(typeof options.expires === 'number') {
                var days = options.expires,
                    t = options.expires = new Date();
                t.setDate(t.getDate() + days);
            }

            value = new String(value);

            return (document.cookie = [
                encodeURIComponent(key), '=',
                options.raw ? value : encodeURIComponent(value),
                options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                options.path ? '; path=' + options.path : '',
                options.domain ? '; domain=' + options.domain : '',
                options.secure ? '; secure' : ''
            ].join(''));
        }

        // key and possibly options given, get cookie...
        options = value || {};
        var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
        var posRes = (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
        return posRes;
        //return (posRes || '').match('{.*}') ? jsonObj.parse(posRes) : posRes;
    }

    function deleteCookie(name, expires){
        var cname = getName(expires),
            newCoo = {},
            coo = cookieFn(cname),
            ea;
        for(ea in coo)
            if(ea !== name)
                newCoo = coo[ea];
        cookieFn(cname, jsonObj.stringify(newCoo), { expires:getExpiration(expires), path:"/" });
    }

    function getCookie(name, expires, defVal){
        var coo = cookieFn(getName(expires));
        if(coo)
            return coo[name] || defVal || '';
        return defVal || '';
    }

    function setCookie(name, value, expires){
        var cname = getName(expires);
        var coo = cookieFn(cname) || {};
        coo[name] = value;
        cookieFn(cname, jsonObj.stringify(coo), { expires:getExpiration(expires), path:"/" });
        return value;
    }

    function setHardCookie(name, value, expires){
        if(typeof expires !== "undefined")
            cookieFn(name, value, { expires:getExpiration(expires) });
        else
            cookieFn(name, value);
        return value;
    }

    function getHardCookie(name, defValue){
        return cookieFn(name) || defValue;
    }

    function deleteHardCookie(name){
        cookieFn(name, "", { expires:0.1 });
    }

    //function BoltCookie(){
        this.set = this.setSoftCookie = setCookie;
        this.get = this.setSoftCookie = getCookie;
        this["delete"] = this.deleteSoftCookie = deleteCookie;
        this.setHardCookie = setHardCookie;
        this.getHardCookie = getHardCookie;
        this.deleteHardCookie = deleteHardCookie;
    //}

    //return BoltCookie;
//});
};

/*
// default instance
define("cookie", ["Cookie"], function(Cookie) {
    Bolt.Cookie = new Cookie;

    return Bolt.Cookie;
});
*/

var Bolt = Bolt || {};
Bolt.Cookie = new Cookie(JSON);