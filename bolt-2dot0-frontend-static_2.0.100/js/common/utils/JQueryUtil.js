/*
 * Anton Ganeshalingam
 *  Check if an element exist
 */
$.fn.doesExist = function(){
	return jQuery(this).length > 0;
}

/* Get a current lang setting.
 * 
 */
jQuery.extend({
	ISOCode: function() {
    	return Bolt.LOCALE;
    }
});

jQuery.extend({
	isSafari: function() {
		return Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    }
});

jQuery.extend({
	isSafari4Else5: function() {
		 return !!navigator.userAgent.match(' Safari/') && !navigator.userAgent.match(' Chrom') && (!!navigator.userAgent.match(/Version\/5/) || !!navigator.userAgent.match(/Version\/4/));
    }
});

/* Object Serialization */
$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

/* Form Serialization */
$.fn.serializeForm = function() {

    // don't do anything if we didn't get any elements
    if ( this.length < 1) {
        return false;
    }

    var data = {};
    var lookup = data; //current reference of data
    var selector = ':input[type!="checkbox"][type!="radio"], input:checked';
    var parse = function() {

        // data[a][b] becomes [ data, a, b ]
        var named = this.name.replace(/\[([^\]]+)?\]/g, ',$1').split(',');
        var cap = named.length - 1;
        var $el = $( this );

        // Ensure that only elements with valid `name` properties will be serialized
        if ( named[ 0 ] ) {
            for ( var i = 0; i < cap; i++ ) {
                // move down the tree - create objects or array if necessary
                lookup = lookup[ named[i] ] = lookup[ named[i] ] ||
                    ( named[ i + 1 ] === "" ? [] : {} );
            }

            // at the end, push or assign the value
            if ( lookup.length !==  undefined ) {
                lookup.push( $el.val() );
            }else {
                lookup[ named[ cap ] ]  = $el.val();
            }

            // assign the reference back to root
            lookup = data;
        }
    };

    // first, check for elements passed into this function
    this.filter( selector ).each( parse );

    // then parse possible child elements
    this.find( selector ).each( parse );

    // return data
    return data;
}

