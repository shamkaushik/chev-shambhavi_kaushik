require(["modernizr",
    "jquery",
    "bootstrap",
    "handlebars",
    "moment",
    "calendar",
    "bootstrap-select",
    "bootstrap-table",
    "text!app/components/dropdown/_defaultDdn.hbs",

], function (modernizr, $, bootstrap, Handlebars, moment, calendar, bootstrapSelect, bootstrapTable, _defaultDdnHBS) {


    var siteOperatingPage = (function () {
        var config = {
            displaySpinner: ".overlay-wrapper",
            dateRangeContainer: "#dateRange-container",
            btnDownload: ".btn-download"
        };

        var init = function () {
            bindEvents();
            $(config.displaySpinner).hide();
            //console.log(moment().format(cbp.siteOperatingPage.globalVars.dateRange.format),moment().subtract(7,'d').format(cbp.siteOperatingPage.globalVars.dateRange.format));
            $(config.dateRangeContainer).text(moment().subtract(7,'d').format(cbp.siteOperatingPage.globalVars.dateRange.format)+" - "+moment().format(cbp.siteOperatingPage.globalVars.dateRange.format));
        };

        var downloadForm = function (siteId) {
            console.log("Not yet integrated");
            return;
            var loc = window.location.pathname;
            var formTemplate = "<form id='downloadForm' method='POST' action='" + cbp.siteOperatingPage.globalUrl.siteOperatingDownloadURL + "'><input type='hidden' name='selectedsiteOperating' value='" + siteId + "'/></form>";
            cbp.siteOperatingPage.siteOperatingResponse.siteOperatingDataList[$("tr[data-uniqueid='" + siteId + "']").data("index")].downloaded = true;
            $(formTemplate).appendTo("body").submit().remove();
        };


        var bindEvents = function () {
            $(document).on('click', config.btnDownload, function(event){
                downloadForm();
            });
        };

        return {
            init: init
        };
    })();

    $(document).ready(function () {
        siteOperatingPage.init();
    });


});
