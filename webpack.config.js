const path = require('path');

module.exports = {
    resolve: {
        alias: {
            // Vendor libraries paths
            "modernizr": path.resolve(__dirname, './src/assets/js/modernizr'),
            "jquery": path.resolve(__dirname, './src/assets/js/jquery'),
            "bootstrap": path.resolve(__dirname, './src/assets/js/bootstrap'),
            "handlebars": path.resolve(__dirname, './src/assets/js/handlebars'),

            "jquery-ui": path.resolve(__dirname, './src/assets/js/jquery-ui.min'),
            "text": path.resolve(__dirname, './src/assets/js/text'),
            "moment": path.resolve(__dirname, './src/assets/js/moment'),
            "parsley": path.resolve(__dirname, './src/assets/js/parsley'),
            "enquire": path.resolve(__dirname, './src/assets/js/enquire.min'),
            "hoverIntent": path.resolve(__dirname, './src/assets/js/jqueryHoverIntent'),

            // Components JS file paths
            "bootstrap-table": path.resolve(__dirname, './src/app/components/table/bootstrap-table'),
            "bootstrap-select": path.resolve(__dirname, './src/app/components/dropdown/bootstrap-select'),

            /*
            "comp_header": path.resolve(__dirname, './src/app/components/header/header.min'),
            "comp_footer": path.resolve(__dirname, './src/app/components/footer/footer.min'),
            "calendar": path.resolve(__dirname, './src/app/components/calendar/calendar.min'),
            "textArea": path.resolve(__dirname, './src/app/components/textArea/textArea.min'),
            "toggleSwitch": path.resolve(__dirname, './src/app/components/toggleSwitch/toggleSwitch.min'),
            "customValidate": path.resolve(__dirname, './src/app/components/customValidation/customValidation.min'),
            "bootstrap-dialog": path.resolve(__dirname, './src/app/components/modal/bootstrap-dialog.min'),
            "timePicker": path.resolve(__dirname, './src/app/components/timePicker/timePicker.min'),
            */
        }
    },
    entry: './src/app/page/report-1099/report-1099',
    output: {
        path: path.resolve(__dirname, 'build/dist'),
        filename: 'bundle.js'
    }
};