function enableMobileDefaultDropDown() {
    //Enable mobile scrolling by calling $('.selectpicker').selectpicker('mobile'). This enables the device's native menu for select menus.
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
        $('.selectpicker').selectpicker('mobile');
    }
};
var pastSelectableDate = 6;

require(["modernizr",
    "jquery",
    "bootstrap",
    "handlebars",
    "moment",
    "calendar",
    "common",
    "bootstrap-select",
    "bootstrap-table",
    "text!app/components/calendar/_calendar.hbs",
    "text!app/components/dropdown/_defaultDdn.hbs",
    "text!app/page/company-information/searchForm.hbs",
    "text!app/page/company-information/cmpnyInfoSummary.hbs",
    "text!app/page/company-information/bottomDetail.hbs"

], function (modernizr, $, bootstrap, Handlebars, moment, calendar, common, bootstrapSelect, bootstrapTable, _calendarHBS, _defaultDdnHBS, _searchFormHBS, _cmpnyInfoSummaryHBS, _bottomDetailHBS) {

    //Compiling HBS templates
    var compiledDefaultDdn = Handlebars.compile(_defaultDdnHBS);
    var compiledsearchDate = Handlebars.compile(_calendarHBS);
    var compiledsearchForm = Handlebars.compile(_searchFormHBS);
    var compiledcmpnyInfoSummary = Handlebars.compile(_cmpnyInfoSummaryHBS);
    var compiledBottomDetail = Handlebars.compile(_bottomDetailHBS);

    var cmpnyInfoPage = (function () {

        var config = {
            companyDdnContainer: ".js-company-ddn",
            cmpnyInfoSummaryContainer: ".js-cmpnyInfo-summary",
            searchFormContainer: ".js-search-form",
            searchDetailContainer: ".js-bottom-detail",
            pickDateRangeContainer: ".js-search-dateRange",
            dropDownCommon: ".selectpicker",
            ordercalendar: "#calendar",
            searchButton: "#cmpnyInfoSearch",
            companyDdn: "#companySelectDdn",
            displaySpinner: ".overlay-wrapper",
            dropdownSelect: ".dropdown-menu .toggle-select",
            carrierPreferenceDdnContainer:".js-carrierPreference-ddn",
            phyAttention:"#phy-attention",
            phyDdn:"#phy-ddn",
            altAttention:"#alt-attention",
            altDdn:"#alt-ddn",
            saveBtn:".saveBtn",
            phyCarrierPref:"#phy-ddn #carrPref",
            altCarrierPref:"#alt-ddn #carrPref"
        };

        var init = function () {
            populatingCompany();
            loadingInitialHbsTemplates();
            if(cbp.cmpnyInfoPage.companyDropDown["options"].length > 1){
                $(config.companyDdn).val(cbp.cmpnyInfoPage.cmpnyInfoResponse.companyDisplay.uid).selectpicker('refresh');
            }
            loadingDynamicHbsTemplates(); 
            populatingCalendarComponent();
            $(config.ordercalendar).find('span').html(cbp.cmpnyInfoPage.cmpnyInfoResponse.date);         
            bindEvents();
            enableMobileDefaultDropDown();
            $(config.displaySpinner).hide();
        };

        var loadingInitialHbsTemplates = function(){
            //Appending handlebar templates to HTML
            $(config.searchFormContainer).html(compiledsearchForm(cbp.cmpnyInfoPage));
            $(config.companyDdnContainer).html(compiledDefaultDdn(cbp.cmpnyInfoPage.companyDropDown));
            $(config.dropDownCommon).selectpicker('refresh');
        };

        var loadingDynamicHbsTemplates = function(){
            $(config.searchDetailContainer).html(compiledBottomDetail(cbp.cmpnyInfoPage));
            $(config.pickDateRangeContainer).html(compiledsearchDate({
                label: cbp.cmpnyInfoPage.globalVars.retailServiceDate,
                iconClass: cbp.cmpnyInfoPage.dateRange.iconClass,
                id: cbp.cmpnyInfoPage.dateRange.id
            }));
            setSummaryValues();
            $(config.cmpnyInfoSummaryContainer).html(compiledcmpnyInfoSummary(cbp.cmpnyInfoPage));
            $(config.carrierPreferenceDdnContainer).html(compiledDefaultDdn(cbp.cmpnyInfoPage.carrierPrefDropdown));
            $(config.phyCarrierPref).val(cbp.cmpnyInfoPage.cmpnyInfoResponse.phyCarrierPref.key).selectpicker('refresh');
            $(config.altCarrierPref).val(cbp.cmpnyInfoPage.cmpnyInfoResponse.altCarrierPref.key).selectpicker('refresh');
        };

        var populatingCalendarComponent = function () {
            function cb(date) {
                date = date.format(cbp.cmpnyInfoPage.dateRange.format);
                $(config.ordercalendar).find('span').html(date);
            }

            $(config.ordercalendar).daterangepicker({
                singleDatePicker: true,
                showDropdowns: true,
                "minDate": moment().subtract(cbp.cmpnyInfoPage.dateRange.maxMonth, 'month'),
                "maxDate": moment(),
                'applyClass': 'btn-primary',
                autoUpdateInput: true,
                locale: {
                    format: cbp.cmpnyInfoPage.dateRange.format,
                    separator: ' - ',
                    applyLabel: cbp.cmpnyInfoPage.dateRange.apply,
                    cancelLabel: cbp.cmpnyInfoPage.dateRange.cancel,
                    weekLabel: 'W',
                    //customRangeLabel: cbp.cmpnyInfoPage.dateRange.customRange,
                    daysOfWeek: moment.weekdaysShort(),
                    monthNames: moment.monthsShort(),
                    firstDay: moment.localeData().firstDayOfWeek()
                }
            }, cb);
        };

        // var triggerAjaxRequest = function(data,type,url){   
        //     function successCallback(res){
        //         return res;
        //     }
        //     function errorCallback(err){   //taking this function from common.js
        //         return err;
        //     }
        //     return $.ajax({
        //         type: type,
        //         data: data,
        //         url: url,
        //         success: successCallback,
        //         error: errorCallback
        //     });
        // };

        var populatingCompany = function(){
            var companyDdnOptions = [];

            companyDdnOptions = companyDropDown.map(function(val,index){
                return {
                    key : val.uid,
                    value : val.displayName
                };
            });
            
            cbp.cmpnyInfoPage.companyDropDown["options"] = companyDdnOptions;
            cbp.cmpnyInfoPage.companyDropDown.searchable = true;
        };


        var setSummaryValues = function(){
            cbp.cmpnyInfoPage.summary = {};
            cbp.cmpnyInfoPage.summary.company = $('.js-company-ddn .btn-group .dropdown-toggle').text();
        };

        var getCompanyDetails = function(){
            var data = {};
            data.account = $(config.companyDdn).val();
            data.cmpny = $(config.cmpnyDdn).val();

            $.when(triggerAjaxRequest(data, "GET", cbp.cmpnyInfoPage.globalUrl.searchURL)).then(function(result){
                cbp.cmpnyInfoPage.cmpnyInfoResponse = result;
                loadingDynamicHbsTemplates();
            });
        }

        var saveCompanyDetails = function(){
            var data = {}
            data.account = $(config.companyDdn).val();
            data.cmpny = $(config.cmpnyDdn).val();
            data.phyAttention = $(config.phyAttention).val();
            data.phyDdn = $(config.phyCarrierPref).val();
            data.altAttention = $(config.altAttention).val();
            data.altDdn = $(config.altCarrierPref).val();

            $.when(triggerAjaxRequest(data, "GET", cbp.cmpnyInfoPage.globalUrl.saveURL)).then(function(result){
                if(typeof result === 'undefined' || result === null){
                    return;
                }
                if(result.type.toLowerCase()==="s")
                    showSuccessMessage(result.message);
                else if(result.type.toLowerCase()==="e")
                    showErrorMessage(result.message);
            });
        }

        var showSuccessMessage = function(message){ 
            $('.alertMessages').html('<div class="alert alert-success"><span class="alert-message"></span></div>');        
            $('.alertMessages .alert-message').html(message);
            window.scrollTo(0,0);
        }

        var showErrorMessage = function(message){
            $('.alertMessages').html('<div class="alert alert-danger"><span class="alert-message"></span></div>');        
            $('.alertMessages .alert-message').html(message);
            window.scrollTo(0,0);
        }


        var bindEvents = function(){

            var checkDdnChange =  config.phyDdn + "," + config.altDdn;

            $(document).on('change', checkDdnChange, function(event){
                if($(config.phyCarrierPref).val()!==cbp.cmpnyInfoPage.cmpnyInfoResponse.phyCarrierPref.key || $(config.altCarrierPref).val()!==cbp.cmpnyInfoPage.cmpnyInfoResponse.altCarrierPref.key )
                    $(config.saveBtn).removeAttr('disabled');
                else
                    if($(config.phyAttention).val() === cbp.cmpnyInfoPage.cmpnyInfoResponse.mailPreferences.phyAddressAttention && $(config.altAttention).val()=== cbp.cmpnyInfoPage.cmpnyInfoResponse.mailPreferences.altAddressAttention )
                        $(config.saveBtn).attr('disabled', 'disabled');
            });

            var checkInputChange = config.phyAttention + "," + config.altAttention;

            $(document).on('input', checkInputChange, function(event){
                if($(config.phyAttention).val() !== cbp.cmpnyInfoPage.cmpnyInfoResponse.mailPreferences.phyAddressAttention || $(config.altAttention).val() !== cbp.cmpnyInfoPage.cmpnyInfoResponse.mailPreferences.altAddressAttention )
                    $(config.saveBtn).removeAttr('disabled');
                else
                    if($(config.phyCarrierPref).val() === cbp.cmpnyInfoPage.cmpnyInfoResponse.phyCarrierPref.key && $(config.altCarrierPref).val() === cbp.cmpnyInfoPage.cmpnyInfoResponse.altCarrierPref.key )
                        $(config.saveBtn).attr('disabled', 'disabled');
            });

            $(document).on('click', config.searchButton, function(event){
                getCompanyDetails();
            });

            $(document).on('click', config.saveBtn, function(){
                saveCompanyDetails();
            });

            $(document).on('click', function(){
                if($('.alertMessages').hasClass('alert'))
                    $('.alertMessages').empty();                
            });


        };

        return {
            init: init
        };
    })();

    $(document).ready(function () {
        
    	$.ajaxPrefilter(function (options, originalOptions, jqXHR) {
            if (options.type.toLowerCase() === "post") {
                options.headers = {
                    'CSRFToken': CSRFToken
                }
            }
        });
    	
        //Localization setup for dropdown
        $.fn.selectpicker.defaults = {
            noneSelectedText: cbp.cmpnyInfoPage.globalVars.selectDdn.noneSelectedText,
            noneResultsText: cbp.cmpnyInfoPage.globalVars.selectDdn.noneResultsText,
            countSelectedText: function (numSelected, numTotal) {
                return (numSelected == 1) ? cbp.cmpnyInfoPage.globalVars.selectDdn.itemSelected : cbp.cmpnyInfoPage.globalVars.selectDdn.itemSelected1;
            },
            maxOptionsText: function (numAll, numGroup) {
                return [
                    (numAll == 1) ? cbp.cmpnyInfoPage.globalVars.selectDdn.limitReached : cbp.cmpnyInfoPage.globalVars.selectDdn.limitReached1,
                    (numGroup == 1) ? cbp.cmpnyInfoPage.globalVars.selectDdn.groupLimit : cbp.cmpnyInfoPage.globalVars.selectDdn.groupLimit1
            ];
            },
            selectAllText: cbp.cmpnyInfoPage.globalVars.selectDdn.selectAllText,
            deselectAllText: cbp.cmpnyInfoPage.globalVars.selectDdn.deselectAllText
        };

        
        leftPaneExpandCollapse.init();

        cbp.cmpnyInfoPage.cmpnyInfoResponse = cmpnyInfoResponse;

        cmpnyInfoPage.init();
        
        enableMobileDefaultDropDown();

    });

    
});