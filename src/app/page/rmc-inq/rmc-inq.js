require(["modernizr",
    "jquery",
    "bootstrap",
    "handlebars",
    "moment",
    "calendar",
    "bootstrap-select",
    "bootstrap-table",
    "text!app/components/dropdown/_defaultDdn.hbs",
    "text!app/components/calendar/_calendar.hbs",
    "text!app/page/rmc-inq/userInfoForm.hbs",
    "text!app/page/rmc-inq/eftInquiryForm.hbs",
    "text!app/page/rmc-inq/fuelInvoiceInquiryForm.hbs",
    "text!app/page/rmc-inq/uclForm.hbs",
    "text!app/page/rmc-inq/popForm.hbs",
    "text!app/page/rmc-inq/chargebackInquiryForm.hbs"

], function(modernizr, $, bootstrap, Handlebars, moment, calendar, bootstrapSelect, bootstrapTable, _defaultDdnHBS, _calenderHBS, _userInfo, _eftInquiryForm, _fuelInvoiceInquiryForm,
    _uclForm, _popForm, _chargebackInquiryForm) {

    //Compiling HBS templates
    var compiledUserInfo = Handlebars.compile(_userInfo);
    var compiledDefaultDdn = Handlebars.compile(_defaultDdnHBS);
    var compileEftInquiryForm = Handlebars.compile(_eftInquiryForm);
    var compileFuelInvoiceInquiryForm = Handlebars.compile(_fuelInvoiceInquiryForm);
    var compileUclForm = Handlebars.compile(_uclForm);
    var compilePopForm = Handlebars.compile(_popForm);
    var compileChargebackInquiryForm = Handlebars.compile(_chargebackInquiryForm);
    var compileCalenderHBS = Handlebars.compile(_calenderHBS);


    var rmcInqPage = (function() {
        var config = {
            displaySpinner: ".overlay-wrapper",
            dateRangeContainer: "#dateRange-container",
            btnDownload: ".btn-download",
            dropDownCommon: ".selectpicker",
            userinfoFormContainer: '.userinfoFormContainer',
            inquiryForm: '.inquiry-form',
            formDropdownContainer: '.form-dropdown-container',
            formContainer: '.form-container',
            inquiryTypeDdn: '#inquiryTypeDdn',
            pickDeliveryDateContainer: '.js-search-pickDateRange'
        };

        var init = function() {
            loadingInitialHbsTemplates();
            bindEvents();
            $(config.displaySpinner).hide();
        };

        //to configure the calendar component
        var populatingCalendarComponent = function() {
            $(config.ordercalendar).daterangepicker({
                'applyClass': 'btn-primary',
                locale: {
                    format: cbp.rmcInqPage.globalVars.deliveryDate.format,
                    separator: ' / ',
                    applyLabel: cbp.rmcInqPage.globalVars.deliveryDate.applyLabel,
                    cancelLabel: cbp.rmcInqPage.globalVars.deliveryDate.cancelLabel,
                    weekLabel: 'W',
                    daysOfWeek: moment.weekdaysShort(),
                    monthNames: moment.monthsShort(),
                    firstDay: moment.localeData().firstDayOfWeek()
                }
            });
        };

        var loadingInitialHbsTemplates = function() {
            //Appending handlebar templates to HTML
            $(config.userinfoFormContainer).html(compiledUserInfo(cbp.rmcInqPage));
            $(config.formDropdownContainer).html(compiledDefaultDdn(cbp.rmcInqPage.inquiryTypeDropdown));
            $(config.formContainer).html(compileEftInquiryForm(cbp.rmcInqPage));
            loadingDynamicHbsTemplates();

            //Refresh dropdown at initial dispaly after loading templates
            $(config.dropDownCommon).selectpicker('refresh');
            enableMobileDefaultDropDown();
            $(config.displaySpinner).hide();
        };

        //Dynamically loading HBS templates as per the selection i nthe dropdown
        var loadingDynamicHbsTemplates = function(inquiryTypeValue) {
            console.log('cbp: ', cbp);
            switch (inquiryTypeValue) {
                case 'eftInquiry':
                    $(config.formContainer).html(compileEftInquiryForm(cbp.rmcInqPage));
                    break;
                case 'fuelInvoiceInquiry':
                    $(config.formContainer).html(compileFuelInvoiceInquiryForm(cbp.rmcInqPage));
                    $(config.pickDeliveryDateContainer).html(compileCalenderHBS({
                        label: cbp.rmcInqPage.globalVars.deliveryDate.deliveryDateLabel,
                        iconClass: cbp.rmcInqPage.globalVars.deliveryDate.iconClass,
                        id: cbp.rmcInqPage.globalVars.deliveryDate.id
                    }));
                    populatingCalendarComponent();
                    break;
                case 'ucl':
                    $(config.formContainer).html(compileUclForm(cbp.rmcInqPage));
                    break;
                case 'pop':
                    $(config.formContainer).html(compilePopForm(cbp.rmcInqPage));
                    break;
                case 'chargebackInquiry':
                    $(config.formContainer).html(compileChargebackInquiryForm(cbp.rmcInqPage));
                    break;
                default:
                    break;
            }
            enableMobileDefaultDropDown();
        };

        var enableMobileDefaultDropDown = function() {
            //Enable mobile scrolling by calling $('.selectpicker').selectpicker('mobile'). This enables the device's native menu for select menus.
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
                $(config.dropDownCommon).selectpicker('mobile');
            }
        };


        var downloadForm = function(siteId) {
            console.log("Not yet integrated");
            return;
            var loc = window.location.pathname;
            var formTemplate = "<form id='downloadForm' method='POST' action='" + cbp.siteOperatingPage.globalUrl.siteOperatingDownloadURL + "'><input type='hidden' name='selectedsiteOperating' value='" + siteId + "'/></form>";
            cbp.siteOperatingPage.siteOperatingResponse.siteOperatingDataList[$("tr[data-uniqueid='" + siteId + "']").data("index")].downloaded = true;
            $(formTemplate).appendTo("body").submit().remove();
        };


        var bindEvents = function() {
            $(document).on('click', config.btnDownload, function(event) {
                downloadForm();
            });
            $(config.inquiryTypeDdn).on('changed.bs.select change', function(e) {
                var inquiryTypeValue = $("#inquiryTypeDdn option:selected").val();
                loadingDynamicHbsTemplates(inquiryTypeValue);
            });
        };

        return {
            init: init
        };
    })();

    $(document).ready(function() {
        rmcInqPage.init();
    });


});