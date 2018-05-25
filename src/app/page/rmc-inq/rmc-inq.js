require(["modernizr",
    "jquery",
    "bootstrap",
    "handlebars",
    "moment",
    "calendar",
    "bootstrap-select",
    "bootstrap-table",
    "parsley",
    "text!app/components/dropdown/_defaultDdn.hbs",
    "text!app/components/calendar/_calendar.hbs",
    "text!app/page/rmc-inq/userInfoForm.hbs",
    "text!app/page/rmc-inq/eftInquiryForm.hbs",
    "text!app/page/rmc-inq/fuelInvoiceInquiryForm.hbs",
    "text!app/page/rmc-inq/uclForm.hbs",
    "text!app/page/rmc-inq/popForm.hbs",
    "text!app/page/rmc-inq/chargebackInquiryForm.hbs"

], function(modernizr, $, bootstrap, Handlebars, moment, calendar, bootstrapSelect, bootstrapTable, parsley, _defaultDdnHBS, _calenderHBS, _userInfo, _eftInquiryForm, _fuelInvoiceInquiryForm,
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
            userinfoFormContainer: '.js-user-info-form',
            inquiryForm: '.inquiry-form',
            formDropdownContainer: '.js-form-dropdown',
            formContainer: '.js-form-container',
            inquiryTypeDdn: '#inquiryTypeDdn',
            pickDeliveryDateContainer: '.js-search-pickDateRange',
            calendar: "#calendar"
        };

        var init = function() {
            loadingInitialHbsTemplates();
            bindEvents();
            $(config.displaySpinner).hide();
        };


        //Parsely Validation
        $('#inquiryForm').parsley({
            successClass: 'no-error',
            errorClass: 'has-error',
            validationThreshold: 0,
            classHandler: function(el) {
                return el.$element.closest("div");
            },
            errorsWrapper: '<span class=\"help-block\"><span class=\"fa\"><span class=\"fa-warning\"></span></span></span>',
            errorTemplate: '<span></span>'
        }).on('field:success', function() {
            if ($('#inquiryForm').parsley().isValid()) {
                $('#inquiryForm #submitBtn').removeClass('disabled').removeAttr('disabled');
            }
        }).on('field:error', function() {
            $('#inquiryForm #submitBtn').addClass('disabled').attr('disabled');
        });

        //to configure the calendar component
        var populatingCalendarComponent = function() {
            function cb(startDate) {
                //startDate = start.format(cbp.delDocPage.dateRange.format);
                // endDate = end.format(cbp.delDocPage.dateRange.format);
                $(config.calendar).find('span').html(startDate);
            }
            //cb(start);

            $(config.pickDeliveryDateContainer).daterangepicker({
                    'applyClass': 'btn-primary',
                    locale: {
                        format: cbp.rmcInqPage.globalVars.deliveryDate.format,
                        separator: ' / ' //,
                            /*applyLabel: cbp.rmcInqPage.globalVars.deliveryDate.applyLabel,
                            cancelLabel: cbp.rmcInqPage.globalVars.deliveryDate.cancelLabel,
                            weekLabel: 'W',
                            daysOfWeek: moment.weekdaysShort(),
                            monthNames: moment.monthsShort(),
                            firstDay: moment.localeData().firstDayOfWeek(),*/
                    },
                    "singleDatePicker": true
                }, cb)
                .on('apply.daterangepicker', function(ev, picker) {
                    cb(picker.startDate.format('MM-DD-YYYY'));
                    /* console.log(picker.startDate.format('MM-DD-YYYY'));
                     console.log(picker.endDate.format('MM-DD-YYYY'));*/
                    //$("#")
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
                        id: cbp.rmcInqPage.globalVars.deliveryDate.id,
                        placeholder: "MM/DD/YYYY"
                            // value: cbp.rmcInqPage.globalVars.deliveryDate.deliveryDateVal
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
                    $(config.pickDeliveryDateContainer).html(compileCalenderHBS({
                        label: cbp.rmcInqPage.globalVars.chargebackInquiry.chargebackDateLabel,
                        iconClass: cbp.rmcInqPage.globalVars.deliveryDate.iconClass,
                        id: cbp.rmcInqPage.globalVars.deliveryDate.id,
                        placeholder: "MM/DD/YYYY"
                            // value: cbp.rmcInqPage.globalVars.deliveryDate.deliveryDateVal
                    }));
                    populatingCalendarComponent();
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