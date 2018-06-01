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
            calendar: "#calendar",
            parsleyErrorsList: ".parsley-errors-list",
            formInput: "#inquiryForm .input-element",
            resetBtn: "#resetBtn"
        };




        var init = function() {
            loadingInitialHbsTemplates();
            bindEvents();
        };

        //To trigger parsely from validation

        var triggerParselyFormValidation = function(el) {
            window.ParsleyValidator.addValidator('checkvaliddate',
                    function(value, requirement) {
                        console.log("Custom Validator!!", value);
                        return false;
                    }, 32)
                .addMessage('en', 'checkvaliddate', 'my validator failed');
            $("#inquiryForm").parsley().on('field:success', function() {
                if ($('#inquiryForm').parsley().isValid()) {
                    $('#inquiryForm #submitBtn').removeClass('disabled').removeAttr('disabled');
                }
            }).on('field:error', function(field) {
                field.$element.context.nextElementSibling.classList.add("error-msg");
                $('#inquiryForm #submitBtn').addClass('disabled').attr('disabled');
            }).validate();
        };


        //to configure the calendar component
        var populatingCalendarComponent = function() {
            function cb(startDate) {
                console.log("startDate:", startDate);
                $(config.calendar).find('input').val(startDate);
            }

            $(config.pickDeliveryDateContainer).daterangepicker({
                    'applyClass': 'btn-primary',
                    locale: {
                        format: cbp.rmcInqPage.globalVars.deliveryDate.format,
                        separator: ' / '
                    },
                    "singleDatePicker": true,
                    // "autoUpdateInput": true
                }, cb)
                .on('apply.daterangepicker', function(ev, picker) {
                        cb(picker.startDate.format('MM-DD-YYYY'));
                    },
                    function(start, end, label) {
                        $(config.pickDeliveryDateContainer).parsley().validate();
                    }
                );
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
                        placeholder: "MM/DD/YYYY",
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
                    }));
                    populatingCalendarComponent();
                    break;
                default:
                    break;
            }
            enableMobileDefaultDropDown();
            $('#inquiryForm').parsley()._refreshFields();
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

            $(document).on('changed.bs.select change', config.inquiryTypeDdn, function(e) {
                var inquiryTypeValue = $("#inquiryTypeDdn option:selected").val();
                loadingDynamicHbsTemplates(inquiryTypeValue);
            });

            $(document).on('focusout blur', config.formInput, function(event) {
                triggerParselyFormValidation(event.target);
                event.target.value !== "" ? $('#inquiryForm #resetBtn').removeClass('disabled').removeAttr('disabled') : $('#inquiryForm #resetBtn').addClass('disabled').attr('disabled');
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