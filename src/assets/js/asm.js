if(typeof(buildDate) === "undefined"){
    buildDate = (new Date().toISOString().substring(0, 10));
}
requirejs.config({
   urlArgs: "buildDate=" + buildDate,

   shim: {
       "jquery-ui": {
           deps: ["jquery"],
           exports: "jqueryUI"
       },
       "autoComplete": {
           deps: ["jquery", "jquery-ui"],
           exports: "autoComplete"
       },
       "assistedServiceStorefront":{
           deps: ["jquery", "jquery-ui"],
           exports: "assistedServiceStorefront"
       }
   },
   paths: {

       "jquery-ui": commonResourcePathResponsive + "/assets/js/min/jquery-ui.min",
       "jquery": commonResourcePathResponsive + "/assets/js/min/jquery.min",
       "autoComplete": commonResourcePath+ "/js/acc.autocomplete",
       "assistedServiceStorefront": addOnJavaScriptPaths
   }

});

require(["autoComplete", "assistedServiceStorefront"], function(autoComplete, assistedServiceStorefront) {
   
});



