this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["a"] = {"1":function(depth0,helpers,partials,data) {
    return "  <li>"
    + this.escapeExpression(this.lambda(depth0, depth0))
    + "</li>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<p>Hello!, "
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + " </p>\nwhat is your TITLE? "
    + alias3(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"title","hash":{},"data":data}) : helper)))
    + "\n\nsleeeeeeeeeeep\n\n"
    + alias3(this.lambda(depth0, depth0))
    + "\n\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.results : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"useData":true};
this["Handlebars"]["templates"]["b"] = {"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "How are you, "
    + this.escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"title","hash":{},"data":data}) : helper)))
    + "\n\n";
},"useData":true};
this["Handlebars"]["templates"]["DateInput"] = {"1":function(depth0,helpers,partials,data) {
    return "errorField";
},"3":function(depth0,helpers,partials,data) {
    var helper;

  return "        <p class=\"error\"><span class=\"icon-alert-blue\"></span>"
    + this.escapeExpression(((helper = (helper = helpers.errorMessage || (depth0 != null ? depth0.errorMessage : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"errorMessage","hash":{},"data":data}) : helper)))
    + "</p>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<!-- DateInput.html -->\n\n<input type=\"date\" class=\"dateselect "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.hasErrors : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\">\n\n\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.errorMessage : depth0),{"name":"if","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"useData":true};