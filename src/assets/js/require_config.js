if(typeof(buildDate) === "undefined"){
    buildDate = (new Date().toISOString().substring(0, 10));
}
requirejs.config({
    baseUrl: cbp.staticBasePath,

    urlArgs: "buildDate=" + buildDate,

    //Since Bootstrap is not an AMD module, shim it
    shim: {
        "bootstrap": {
            deps: ["jquery"],
            exports: "jQuery.fn.popover"
        },
        "moment": {
            deps: ["jquery"],
            exports: "moment"
        },
        "timePicker": {
            deps: ["jquery"],
            exports: "timePicker"
        },
        "parsley": {
            deps: ["jquery"],
            exports: "parsley"
        },
        "calendar": {
            deps: ["jquery", "moment"],
            exports: "calendar"
        },
        "bootstrap-dialog": {
            deps: ["jquery", "bootstrap"],
            exports: "bootstrapDialog"
        },
        "bootstrap-select": {
            deps: ["bootstrap"],
            exports: "bootstrap-select"
        },
        "bootstrap-table": {
            deps: ["jquery", "bootstrap"],
            exports: "bootstrapTable"
        },
        "textArea": {
            deps: ["jquery", "handlebars"],
            exports: "textArea"
        },
        "toggleSwitch": {
            deps: ["jquery", "handlebars"],
            exports: "toggleSwitch"
        },
        "customValidate": {
            deps: ["jquery", "handlebars"],
            exports: "customValidate"
        },
        "hoverIntent": {
            deps: ["jquery"],
            exports: "hoverIntent"
        },
        "jquery-ui": {
            deps: ["jquery"],
            exports: "jqueryUI"
        }
    },
    paths: {

        // Vendor libraries paths
        "jquery-ui": "assets/js/min/jquery-ui.min",
        "modernizr": "assets/js/min/modernizr.min",
        "jquery": "assets/js/min/jquery.min",
        "bootstrap": "assets/js/min/bootstrap.min",
        "handlebars": "assets/js/min/handlebars.min",
        "text": "assets/js/min/text.min",
        "moment": "assets/js/min/moment.min",
        "parsley": "assets/js/min/parsley.min",
        "enquire": "assets/js/enquire.min",
        "hoverIntent": "assets/js/min/jqueryHoverIntent.min",

        // Components JS file paths
        "bootstrap-table": "app/components/table/bootstrap-table.min",
        "bootstrap-select": "app/components/dropdown/bootstrap-select.min",
        "comp_header": "app/components/header/header.min",
        "comp_footer": "app/components/footer/footer.min",
        "calendar": "app/components/calendar/calendar.min",
        "textArea": "app/components/textArea/textArea.min",
        "toggleSwitch": "app/components/toggleSwitch/toggleSwitch.min",
        "customValidate": "app/components/customValidation/customValidation.min",
        "bootstrap-dialog": "app/components/modal/bootstrap-dialog.min",
        "timePicker": "app/components/timePicker/timePicker.min"
    }

});

require(["handlebars"], function (Handlebars) {
    Handlebars.registerHelper('eachFacets', function(facetsArray, code,options) {
        for(var i=0;i<facetsArray.length;i++){
            if(facetsArray[i].code == (code).toLowerCase()){
                return facetsArray[i].values;
            }
        }
        return [];

    });

    Handlebars.registerHelper('text-danger', function(options) {
        if(options.fn(this) >= "0"){
          return options.fn(this);
        }else{
          return new Handlebars.SafeString(
          '<span class="text-danger">'
          + options.fn(this)
          + '</span>');
        }

      });

    Handlebars.registerHelper('text-red', function(options) {
        if(options.fn(this) >= "0"){
          return "";
        }else{
          return 'text-danger';
        }

    });

    Handlebars.registerHelper('withItem', function(object, key, options) {
        return object[key];
    });

    Handlebars.registerHelper('withItemDefault', function(object, key, options) {
        return object[key] || 0;
    });

    Handlebars.registerHelper('if_eq', function(a, b, opts) {
        if(a == b)
            return opts.fn(this);
        else
            return opts.inverse(this);
    });

    Handlebars.registerHelper('if_not_eq', function(a, b, opts) {
        if(a != b)
            return opts.fn(this);
        else
            return opts.inverse(this);
    });

    Handlebars.registerHelper('if_present_code', function(code, breadcrumbArray ,opts) {

       var result = breadcrumbArray.filter(function(item){
           return item.facetCode == code.toLowerCase();
       });

       if(result.length)
           return opts.fn(this);
       else
           return opts.inverse(this);

   });
    
    Handlebars.registerHelper('logical_or', function(variable,b,c,opts) {

         if(variable == b || variable == c)
             return opts.fn(this);
         else
             return opts.inverse(this);

    });
});
