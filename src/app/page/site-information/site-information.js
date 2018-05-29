require(["modernizr",
    "jquery",
    "bootstrap",
    "handlebars",
    "moment",
    "calendar",
    "bootstrap-select",
    "bootstrap-table",
    "text!app/components/calendar/_calendar.hbs",
    "text!app/components/dropdown/_defaultDdn.hbs",
    "text!app/page/site-information/searchForm.hbs",
    "text!app/page/site-information/siteInfoSummary.hbs",
    "text!app/page/site-information/bottomDetail.hbs"

], function (modernizr, $, bootstrap, Handlebars, moment, calendar, bootstrapSelect, bootstrapTable, _calendarHBS, _defaultDdnHBS, _searchFormHBS, _siteInfoSummaryHBS, _bottomDetailHBS) {

    //Compiling HBS templates
    var compiledDefaultDdn = Handlebars.compile(_defaultDdnHBS);
    var compiledsearchDate = Handlebars.compile(_calendarHBS);
    var compiledsearchForm = Handlebars.compile(_searchFormHBS);
    var compiledsiteInfoSummary = Handlebars.compile(_siteInfoSummaryHBS);
    var compiledBottomDetail = Handlebars.compile(_bottomDetailHBS);

    var siteInfoPage = (function () {

        var config = {
            accountDdnContainer: ".js-account-ddn",
            siteDdnContainer: ".js-site-ddn",
            siteInfoSummaryContainer: ".js-siteInfo-summary",
            searchFormContainer: ".js-search-form",
            searchDetailContainer: ".js-bottom-detail",
            dropDownCommon: ".selectpicker",
            ordercalendar: "#calendar",
            searchButton: "#siteInfoSearch",
            accountDdn: "#accountSelectDdn",
            siteDdn: "#siteSelectDdn",
            displaySpinner: ".overlay-wrapper",
            dropdownSelect: ".dropdown-menu .toggle-select",
            carrierPreferenceDdnContainer:".js-carrierPreference-ddn",
            phyAttention:"#phyAttention",
            phyDdn:"#phyDdn",
            altAttention:"#altAttention",
            altDdn:"#altDdn",
            saveBtn:".saveBtn",
            phyCarrierPref:"#phyDdn #carrPref",
            altCarrierPref:"#altDdn #carrPref"
        };

        var accountDdnOptions = [];

        var init = function () {
            populatingAccount();
        	populatingSite(cbp.siteInfoPage.siteInfoResponse.accountDisplay.uid, true);
            loadingInitialHbsTemplates();
            if(cbp.siteInfoPage.accountDropDown["options"].length > 1){
                $(config.accountDdn).val(cbp.siteInfoPage.siteInfoResponse.accountDisplay.uid).selectpicker('refresh');
            }
            loadingDynamicHbsTemplates();          
            bindEvents();
            enableMobileDefaultDropDown();
        };

        var loadingInitialHbsTemplates = function(){
            //Appending handlebar templates to HTML
            $(config.searchFormContainer).html(compiledsearchForm(cbp.siteInfoPage));
            $(config.accountDdnContainer).html(compiledDefaultDdn(cbp.siteInfoPage.accountDropDown));
            $(config.siteDdnContainer).html(compiledDefaultDdn(cbp.siteInfoPage.siteDropDown));
            $(config.dropDownCommon).selectpicker('refresh');
        };

        var enableMobileDefaultDropDown = function() {
            //Enable mobile scrolling by calling $('.selectpicker').selectpicker('mobile'). This enables the device's native menu for select menus.
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
                $('.selectpicker').selectpicker('mobile');
            }
        };

        var loadingDynamicHbsTemplates = function(){
            $(config.searchDetailContainer).html(compiledBottomDetail(cbp.siteInfoPage));
            setSummaryValues();
            $(config.siteInfoSummaryContainer).html(compiledsiteInfoSummary(cbp.siteInfoPage));
            $(config.carrierPreferenceDdnContainer).html(compiledDefaultDdn(cbp.siteInfoPage.carrierPrefDropdown));
            $(config.phyCarrierPref).val(cbp.siteInfoPage.siteInfoResponse.phyCarrierPref.key).selectpicker('refresh');
            $(config.altCarrierPref).val(cbp.siteInfoPage.siteInfoResponse.altCarrierPref.key).selectpicker('refresh');
        };

        var triggerAjaxRequest = function(data,type,url){   
            function successCallback(res){
                return res;
            }
            function errorCallback(err){
                return err;
            }
            return $.ajax({
                type: type,
                data: data,
                url: url,
                success: successCallback,
                error: errorCallback
            });
        };

        var populatingAccount = function(){
            accountDdnOptions = accountDropDown.map(function(val,index){
                return {
                    key : val.uid,
                    value : val.displayName
                };
            });
            
            cbp.siteInfoPage.accountDropDown["options"] = accountDdnOptions;
            cbp.siteInfoPage.accountDropDown.searchable = true;
        };

        var populatingSite = function(accountId, pageLoadCheck){
            $(config.displaySpinner).show();

            var  data = {
                'accountNumber' : accountId                   
            };

            $.when(triggerAjaxRequest(data, "GET", cbp.siteInfoPage.globalUrl.siteURL)).then(function(result){
                $(config.displaySpinner).hide();
                
                var siteOptions = [];
                var obj = {};
                
                var site = result;
               
                siteOptions = site.map(function(val,index){
                    return {
                        key : val['uid'],
                        value : val['displayName']
                    };
                });
                
                if(site.length == 1){
                    cbp.siteInfoPage.siteDropDown.singleOption = true;
                }
               
                cbp.siteInfoPage.siteDropDown["options"] = siteOptions;
                cbp.siteInfoPage.siteDropDown.searchable = true;

                $(config.siteDdnContainer).html(compiledDefaultDdn(cbp.siteInfoPage.siteDropDown));

                $(config.siteDdn).selectpicker('refresh');
                
                if(pageLoadCheck === true){
                    if(cbp.siteInfoPage.siteDropDown["options"].length > 1){
                        $(config.siteDdn).val(cbp.siteInfoPage.siteInfoResponse.siteDisplay.uid).selectpicker('refresh');
                    }
                    setSummaryValues();
                    $(config.siteInfoSummaryContainer).html(compiledsiteInfoSummary(cbp.siteInfoPage));
                }
                enableMobileDefaultDropDown();
            });
           
        };

        var setSummaryValues = function(){
            cbp.siteInfoPage.summary = {};
            cbp.siteInfoPage.summary.account = $('.js-account-ddn .btn-group .dropdown-toggle').text();
            cbp.siteInfoPage.summary.site = $('.js-site-ddn .btn-group .dropdown-toggle').text();
        };

        var getSiteDetails = function(){
            var data = {};
            data.account = $(config.accountDdn).val();
            data.site = $(config.siteDdn).val();

            $.when(triggerAjaxRequest(data, "GET", cbp.siteInfoPage.globalUrl.searchURL)).then(function(result){
                cbp.siteInfoPage.siteInfoResponse = result;
                loadingDynamicHbsTemplates();
            });
        }

        var saveSiteDetails = function(){
            var data = {}
            data.account = $(config.accountDdn).val();
            data.site = $(config.siteDdn).val();
            data.phyAttention = $(config.phyAttention).val();
            data.phyDdn = $(config.phyCarrierPref).val();
            data.altAttention = $(config.altAttention).val();
            data.altDdn = $(config.altCarrierPref).val();

            $.when(triggerAjaxRequest(data, "GET", cbp.siteInfoPage.globalUrl.saveURL)).then(function(result){
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

        var enableSaveButton = function(){
            var checkChanges = $(config.phyAttention).val() !== cbp.siteInfoPage.siteInfoResponse.mailPreferences.phyAddressAttention || $(config.altAttention).val() !== cbp.siteInfoPage.siteInfoResponse.mailPreferences.altAddressAttention ||$(config.phyCarrierPref).val()!==cbp.siteInfoPage.siteInfoResponse.phyCarrierPref.key || $(config.altCarrierPref).val()!==cbp.siteInfoPage.siteInfoResponse.altCarrierPref.key;
            if(checkChanges)
                $(config.saveBtn).removeAttr('disabled');
            else
                $(config.saveBtn).attr('disabled', 'disabled'); 
        }


        var bindEvents = function(){

            var checkDdnChange =  config.phyDdn + "," + config.altDdn;

            $(document).on('change', checkDdnChange, function(event){
                enableSaveButton()
            });

            var checkInputChange = config.phyAttention + "," + config.altAttention;

            $(document).on('input', checkInputChange, function(event){
                enableSaveButton();
            });

            $(document).on('click', config.searchButton, function(event){
                getSiteDetails();
            });

            $(document).on('click', config.saveBtn, function(){
                saveSiteDetails();
            });

            $(document).on('click', function(){
                if($('.alertMessages').children().hasClass('alert'))
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
            noneSelectedText: cbp.siteInfoPage.globalVars.selectDdn.noneSelectedText,
            noneResultsText: cbp.siteInfoPage.globalVars.selectDdn.noneResultsText,
            countSelectedText: function (numSelected, numTotal) {
                return (numSelected == 1) ? cbp.siteInfoPage.globalVars.selectDdn.itemSelected : cbp.siteInfoPage.globalVars.selectDdn.itemSelected1;
            },
            maxOptionsText: function (numAll, numGroup) {
                return [
                    (numAll == 1) ? cbp.siteInfoPage.globalVars.selectDdn.limitReached : cbp.siteInfoPage.globalVars.selectDdn.limitReached1,
                    (numGroup == 1) ? cbp.siteInfoPage.globalVars.selectDdn.groupLimit : cbp.siteInfoPage.globalVars.selectDdn.groupLimit1
            ];
            },
            selectAllText: cbp.siteInfoPage.globalVars.selectDdn.selectAllText,
            deselectAllText: cbp.siteInfoPage.globalVars.selectDdn.deselectAllText
        };

        
        leftPaneExpandCollapse.init();

        cbp.siteInfoPage.siteInfoResponse = siteInfoResponse;

        siteInfoPage.init();
        
    });

    
});