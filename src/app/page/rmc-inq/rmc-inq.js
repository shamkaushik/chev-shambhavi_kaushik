require(["modernizr",
    "jquery",
    "bootstrap",
    "handlebars",
    "moment",
    "calendar",
    "bootstrap-select",
    "bootstrap-table",
    "text!app/components/dropdown/_defaultDdn.hbs",
    "text!app/page/rmc-inq/userInfoForm.hbs",

], function (modernizr, $, bootstrap, Handlebars, moment, calendar, bootstrapSelect, bootstrapTable, _defaultDdnHBS, _userInfo) {

    //Compiling HBS templates
    var compiledUserInfo = Handlebars.compile(_userInfo);

    var rmcInqPage = (function () {
        var config = {
            displaySpinner: ".overlay-wrapper",
            dateRangeContainer: "#dateRange-container",
            btnDownload: ".btn-download",
            dropDownCommon: ".selectpicker",
            userinfoFormContainer: '.userinfoFormContainer'
        };

        var init = function () {
            loadingInitialHbsTemplates();
            bindEvents();
            $(config.displaySpinner).hide();
        };

        var loadingInitialHbsTemplates = function () {
            //Appending handlebar templates to HTML
            $(config.userinfoFormContainer).html(compiledUserInfo(cbp.rmcInqPage));

            loadingDynamicHbsTemplates();

            //Refresh dropdown at initial dispaly after loading templates
            $(config.dropDownCommon).selectpicker('refresh');
            enableMobileDefaultDropDown();
            $(config.displaySpinner).hide();
        };

        var loadingDynamicHbsTemplates = function () {
            enableMobileDefaultDropDown();
        };

        var enableMobileDefaultDropDown = function () {
            //Enable mobile scrolling by calling $('.selectpicker').selectpicker('mobile'). This enables the device's native menu for select menus.
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
                $(config.dropDownCommon).selectpicker('mobile');
            }
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
        rmcInqPage.init();
    });


});
