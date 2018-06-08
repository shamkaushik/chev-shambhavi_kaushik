//The build will inline common dependencies into this file.

//For any third party dependencies, like jQuery, place them in the lib folder.

//Configure loading modules from the lib directory,
//except for 'app' ones, which are in a sibling
//directory.
requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        app: '../app',
        "bootstrap-select": "dropdown/bootstrap-select",
        "bootstrap-dialog": "modal/bootstrap-dialog",
        "bootstrap-table": "../app/components/table/bootstrap-table",
        "jqueryHoverIntent": "jqueryHoverIntent",
        "calendar": "../app/components/calendar/calendar"
    },
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
            exports: "bootstrapSelect"
        },
        "bootstrap-table": {
            deps: ["jquery", "bootstrap"],
            exports: "bootstrapTable"
        },
        "jqueryHoverIntent": {
            deps: ["jquery"],
            exports: "hoverIntent"
        }
    }
});
