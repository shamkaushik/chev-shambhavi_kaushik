var toggleSwitchConfig = {
    name: "switch",
    cssClass: "toggleForAsmSerachForm",
    label: "",
    //LabelBlock: true,
    options: [{
        label: "User Details",
        value: "1",
        default: true
    }, {
        label: "Account Details",
        value: "2"
    }]
};

function callInvoicePDF(invoiceId) {
    $("#invoicePDFForm #invoiceId").val(invoiceId);
    $("#invoicePDFForm").submit();
}

function callInvoicePDFLink(invoiceId) {
    $('#invoicePDFForm #invoiceId').val(invoiceId);
    $('#invoicePDFForm #invoicePrint').val('false');
    $('#invoicePDFForm').submit();
}


require(["modernizr",
    "jquery",
    "bootstrap",
    "handlebars",
    "moment",
    "calendar",
    "bootstrap-select",
    "bootstrap-table",
    "toggleSwitch",
    "text!app/components/calendar/_calendar.hbs",
    "text!app/components/dropdown/_defaultDdn.hbs",
    "text!app/page/asm/searchForm.hbs", //assisted-services
    "text!app/page/asm/resultsCount.hbs",
    "text!app/page/asm/bottomDetail.hbs"

], function (modernizr, $, bootstrap, Handlebars, moment, calendar, bootstrapSelect, bootstrapTable,toggleSwitch, _calendarHBS, _defaultDdnHBS, _searchFormHBS, _resultsCount, _bottomDetailHBS) {

    //Compiling HBS templates
    var compiledDefaultDdn = Handlebars.compile(_defaultDdnHBS);
    var compiledsearchForm = Handlebars.compile(_searchFormHBS);
    var compiledresultsCountSummary = Handlebars.compile(_resultsCount);
    var compiledBottomDetail = Handlebars.compile(_bottomDetailHBS);

    var asmPage = (function () {
        var config = {
            resultsCounter: ".js-resultsCount-summary",
            searchFormContainer: ".js-search-form",
            asmSearchToggle : "#asmSearchToggle",
            searchDetailContainer: ".js-bottom-detail",
            sortByDdnContainer: ".js-sortbyDdn",
            searchInputUSerAccount: '.js-asmPage-searchUserAccount',
            businessRegionDropDown : '.js-businessRegion-dropdown',
            businessTypeDropDown : ".js-businessType-dropdown",
            businessUnitDropDown : ".js-businessUinit-dropdown",
            permissionsDropDown : ".js-permissions-dropdown",
            viewRecentlyUsed : ".js-view-recentlyUsed",
            dropDownCommon: ".selectpicker",
            ordercalendar: "#calendar",
            searchButton: "#asmSearch",
            recenlyUsedCaption: ".recenlyUsedCaption",
            tabelRow: "#table tbody tr",
            downloadBtn: ".js-downloadBtn",
            printBtn: ".js-printBtn",
            sortByDdn: "#sortByDdn",
            displaySpinner: ".overlay-wrapper",
            dropdownSelect: ".dropdown-menu .toggle-select",
            invoiceNumber: "#invoiceNumber",
            squareUnchecked: "fa-square-o",
            squareChecked: "fa-check-square-o",
            downloadIcon: ".iconsPrintDownload",
            printIcon: ".iconsInvoicePrint",
            asmPersonifyForm : "#asmPersonifyForm",
            customerIdASM : '#customerIdASM',
            customerNameASM : '#customerNameASM',
            exitASMInLandingPage : "#exitASMInLandingPage",
            asmLogoutForm : "#asmLogoutForm"
        };

        var init = function () {
            $(config.recenlyUsedCaption).hide();
            loadingInitialHbsTemplates();
            bindEvents();
            var businessRegionOptions = cbp.asmPage.businessRegionDropdown.options.filter(function(val,index){
            	return val.value!="All";
            });
            
            if(businessRegionOptions.length<=1){
                $(config.businessRegionDropDown).parent().hide();
                $(config.businessRegionDropDown).parent().parent().hide();
            }else{
            	$(config.businessRegionDropDown).parent().show();
                $(config.businessRegionDropDown).parent().parent().show();
            }
            
            $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
                if (options.type.toLowerCase() === "post") {
                    options.headers = {
                        'CSRFToken': cbp.asmPage.globalVars.csrfToken
                    }
                }
            });

            $('#_asm').hide();
            $(config.viewRecentlyUsed).hide();
            $(config.recenlyUsedCaption).show();
        };
        

        var putBackgroundInASMTable = function(){
            $('.tableAsmDetails tbody > tr:not(.detail-view)').each(function(index,val){
                if((index+1)%2!=0){
                    $(this).css('background-color','#FFFFFF');
                    $(this).next('tr').css('background-color','#FFFFFF');
                }else{
                    $(this).css('background-color','#F2F2F2');
                    $(this).next('tr').css('background-color','#F2F2F2');
                }
            });
        };

        var loadingInitialHbsTemplates = function () {
            //Appending handlebar templates to HTML
            $(config.searchFormContainer).html(compiledsearchForm(cbp.asmPage));
            addingFirstOptionAll(cbp.asmPage.businessTypeDropdown.options,cbp.asmPage.businessUnitDropdown.options,cbp.asmPage.permissionsDropdown.options,cbp.asmPage.businessRegionDropdown.options);
            $(config.businessTypeDropDown).html(compiledDefaultDdn(cbp.asmPage.businessTypeDropdown));
            $(config.businessUnitDropDown).html(compiledDefaultDdn(cbp.asmPage.businessUnitDropdown));
            $(config.permissionsDropDown).html(compiledDefaultDdn(cbp.asmPage.permissionsDropdown));
            $(config.businessRegionDropDown).html(compiledDefaultDdn(cbp.asmPage.businessRegionDropdown));
            loadingDynamicHbsTemplates();

            //Refresh dropdown at initial dispaly after loading templates
            $(config.dropDownCommon).selectpicker('refresh');
            enableMobileDefaultDropDown();
            $(config.asmSearchToggle).toggleSwitch(toggleSwitchConfig);
            //cbp.asmPage.asmDataResponse.asmDataList.customers
            cbp.asmPage.asmDataResponse.asmDataList.customers.length > 0 ? 
            ($(config.recenlyUsedCaption).show()) : '';
            populatingTable(cbp.asmPage.asmDataResponse.asmDataList.customers);
            $(config.displaySpinner).hide();
        };

        var loadingDynamicHbsTemplates = function () {
            $(config.resultsCounter).html(compiledresultsCountSummary(cbp.asmPage));
            $(config.searchDetailContainer).html(compiledBottomDetail(cbp.asmPage));
            $(config.sortByDdnContainer).find(config.dropDownCommon).selectpicker('refresh');
            enableMobileDefaultDropDown();
        };

        var enableMobileDefaultDropDown = function () {
            //Enable mobile scrolling by calling $('.selectpicker').selectpicker('mobile'). This enables the device's native menu for select menus.
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
                $(config.dropDownCommon).selectpicker('mobile');
            }
        };

        var triggerAjaxRequest = function (ajaxRequest,searchtype) {
            $(config.displaySpinner).show();
            $(config.resultsCounter).hide();
            $(config.searchDetailContainer).hide();

            leftPaneExpandCollapse.hideSearchBar();

            function successCallback(data) {
                var dataList = data.customers ? data.customers : data;
                cbp.asmPage.asmDataResponse.asmDataList = dataList;
                loadingDynamicHbsTemplates();
                leftPaneExpandCollapse.resetSearchFormHeight();
                $(config.displaySpinner).hide();
                $(config.searchDetailContainer).show();
                $(config.resultsCounter).show();
                populatingTable(cbp.asmPage.asmDataResponse.asmDataList,searchtype);
                if(searchtype && searchtype=='recent'){
                    $(config.viewRecentlyUsed).hide();
                }
            }

            function errorCallback() {
                $(config.displaySpinner).hide();
                $(config.searchDetailContainer).show();
                $(config.resultsCounter).show();
                console.log("error");
            }
            
            ajaxRequest['success'] = successCallback;
            ajaxRequest['error'] = errorCallback;

            $.ajax(ajaxRequest);

        };

        var bindEvents = function () {
            
            $(document).on("reset-view.bs.table, toggle.bs.table", "#table", function(event) {
                event.stopPropagation();
            });

            //Search button functionality
            $(config.searchButton).on("click", function (e) {
                $('#table').bootstrapTable('destroy');
                var postURL = cbp.asmPage.globalUrl.asmSearchURL;
                //var postURL = cbp.asmPage.globalUrl.searchasmList
                var postData = {};
                
                ($("#asmSearchToggle input[type='hidden']").val() == 1 || $("#asmSearchToggle input[type='hidden']").val()=="default") ? 
        		postData['userDetails'] = $(config.searchInputUSerAccount).val() 
        		: postData['accountDetails'] = $(config.searchInputUSerAccount).val();
        		
        		var businessRegionOptions = cbp.asmPage.businessRegionDropdown.options.filter(function(val,index){
                	return val.value!="All";
                });
        		
        		var businessRegionSelectedValue = '';
        		
        		if(businessRegionOptions.length<=1){
        			businessRegionSelectedValue = businessRegionOptions[0].value;
        		}else{
        			businessRegionSelectedValue = $(config.businessRegionDropDown).find('.selectpicker').find('option:selected').val();
        		}

        		postData['buisinessRegion'] = businessRegionSelectedValue;
        		postData['businessType'] = $(config.businessTypeDropDown).find('.selectpicker').find('option:selected').val();
        		postData['businessUnit'] = $(config.businessUnitDropDown).find('.selectpicker').find('option:selected').val();
                postData['permissions'] = $(config.permissionsDropDown).find('.selectpicker').find('option:selected').val();
                
                var userAccountText = $.trim($(config.searchInputUSerAccount).val());
                console.log("$.trim(userAccountText).length >>>",$.trim(userAccountText).length);
                if(postData['buisinessRegion'].length==0 && postData['businessType'].length==0 && postData['businessUnit'].length==0 && postData['permissions'].length==0
                		&& userAccountText.length<=0){
                    fetchViewRecentlyUsed();
                    return;
                }
                var ajaxRequest = {
                        type: "POST",
                        //type: "GET",
                		data: JSON.stringify(postData),
                		contentType: "application/json",
                        dataType:"json",
                		url: postURL,
        		};
                triggerAjaxRequest(ajaxRequest,"search");
                $(config.viewRecentlyUsed).show();
            });

            var valueOnSubmit = '.js-search-form input' + "," + config.printStatusContainer + "," +
                config.locationDdnContainer + "," +
                config.downloadStatusContainer + "," + config.pickDateRangeContainer + "";


            $(document).on('keypress', valueOnSubmit, function (e) {
                if (e.which == 13) {
                    e.preventDefault();
                    $("#asmSearch").trigger("click");
                }
            });


            var validatefields = config.invoiceNumber + "," + config.orderNumber + "";

            $(document).on('keypress', validatefields, function (e) {
                var regex = /^[0-9]+$/;
                var str = String.fromCharCode(e.which);
                if (str.match(regex)) {
                    return true;
                }
                e.preventDefault();
                return false;
            });

            $(document).on('click',config.asmSearchToggle+' button',function(){
            	$(config.searchInputUSerAccount).val('');
                if($(this).val()==1){
                    $(config.searchInputUSerAccount).attr('placeholder','User ID, First & Last Name or E-mail');
                }else if($(this).val()==2){
                    $(config.searchInputUSerAccount).attr('placeholder','Sold To, Ship To, Bus. Loc or Co. Name');
                }
            });

            $(document).on('click',config.viewRecentlyUsed,function(){
                fetchViewRecentlyUsed();
            });

            $(document).on("click", ".search-form .toggleSwitch button.btn-primary", function(){
                $(".search-form").addClass("show");
                $(config.toggleSearchMobile).find(".fa-chevron-down").addClass("close-icon");
            });
            
            $(document).on("click", config.exitASMInLandingPage, function(){
                $(config.asmLogoutForm).submit();
            });

           
        };

        var showErrorMessages = function(){

        };
        
        var addingFirstOptionAll = function(){
        	for(var i=0; i<arguments.length; i++){
        		arguments[i].unshift({
            		"key" : null,
            		"value" : "All"
            	});
        	}
        }

        var hideExpanCollapseForDetailView = function(dataList){
            dataList.length>0 ? 
            (
                $('.tableAsmDetails thead > tr > th.detail').remove(),
                $('.tableAsmDetails tbody > tr:not(.detail-view) > td:first-of-type').remove()
            ) : '';
        };
        
        var formatCommaSepratedVals = function(value, row, index, field){
        	var arr = [],str='';
        	arr = value.split(':');
        	arr.map(function(val,index){
        		str=str+val+"<br/>";
        	});
        	return str;
        };

        var fetchViewRecentlyUsed = function(){
            $('#table').bootstrapTable('destroy');
            $(config.recenlyUsedCaption).show();
            var getURL = cbp.asmPage.globalUrl.recentlyUsedList;
            //var getURL = cbp.asmPage.globalUrl.recentlyUsedListAsm;
            var postData = {};
            var ajaxRequest = {
                    type: "GET",
                    contentType: "application/json",
                    dataType:"json",
                    url: getURL,
            };
            triggerAjaxRequest(ajaxRequest,"recent");
        };

        var populatingTable = function (dataList,searchtype) {
            var asmDataTable = $('#table').bootstrapTable({
                classes: 'table table-no-bordered',
                striped: true,
                sortName: 'invoiceDate',
                uniqueId: 'userId',
                sortOrder: 'desc',
                iconsPrefix: 'fa',
                detailView: true,
                icons: {
                    detailOpen: 'fa-plus-square-o',
                    detailClose: 'fa-minus-square-o'
                },
                detailFormatter : function(index, row, elemen){
                    return "<span style='color:#999999; font-size:12px;'>"+"<strong><i>Permissions: &nbsp;</i></strong><span style='font-weight: 500;'><i>"+row.groups+"</i></span></span>";
                },
                sortable: false,
                parentContainer: ".js-bottom-detail",
                sortByDropdownId: "#sortByDdn",
                responsive: true,
                cardView: true,
                responsiveBreakPoint: 768,
                responsiveClass: "bootstrap-table-cardview",
                onToggle : function(cardView){
                    cardView ? 
                    $('.detailsForCardView').css('display',"block") :
                    $('.detailsForCardView').css('display',"none");
                    if(asmDataTable && !cardView){
                        asmDataTable.bootstrapTable('expandAllRows', false);
                    }

                    if(asmDataTable){
                        hideExpanCollapseForDetailView(dataList);
                        putBackgroundInASMTable();
                    }
                },
                onClickRow : function(row, $element, field){
                	//$(config.customerIdASM).val(row.customerId);
                    //$(config.customerNameASM).val(row.fullName);
                	//$(config.asmPersonifyForm).submit();
                    window.location.href= cbp.asmPage.globalUrl.emulateURL + 'customerId='+row.customerId;
                },
                columns: [
                {
                    field: 'customerId',
                    title: cbp.asmPage.globalVars.userId,
                    titleTooltip: cbp.asmPage.globalVars.userId,
                    class: 'text-nowrap',
                    align : 'left',
                    cellStyle : function (value, row, index, field) {
                        return {
                          classes: 'text-nowrap text-uppercase'
                        };
                      }
                }, 
                {
                    field: 'fullName',
                    title: cbp.asmPage.globalVars.fullName,
                    titleTooltip: cbp.asmPage.globalVars.fullName,
                    sortable: true,
                    align : 'left'
                }, {
                    field: 'companyName',
                    title: cbp.asmPage.globalVars.companyName,
                    titleTooltip: cbp.asmPage.globalVars.companyName,
                    class: 'numberIcon text-nowrap',
                    align: 'left',
                    formatter : formatCommaSepratedVals
                }, {
                    field: 'accountNumber',
                    title: cbp.asmPage.globalVars.accountNumber,
                    titleTooltip: cbp.asmPage.globalVars.accountNumber,
                    class: 'numberIcon text-nowrap',
                    sortable: true,
                    align : 'left',
                    formatter : formatCommaSepratedVals
                }, {
                    field: 'siteName',
                    title: cbp.asmPage.globalVars.siteName,
                    titleTooltip: cbp.asmPage.globalVars.siteName,
                    class: 'numberIcon text-nowrap',
                    sortable: true,
                    align : 'left'
                }, {
                    field: 'businessType',
                    title: cbp.asmPage.globalVars.businessType,
                    titleTooltip: cbp.asmPage.globalVars.businessType,
                    class: 'text-nowrap',
                    sortable: true,
                    align : 'left',
                    formatter : formatCommaSepratedVals
                }, {
                    field: 'businessUnit',
                    title: cbp.asmPage.globalVars.businessUnit,
                    titleTooltip: cbp.asmPage.globalVars.businessUnit,
                    class: 'numberIcon text-nowrap',
                    sortable: true,
                    align : 'left',
                    formatter : formatCommaSepratedVals
                },{
                    field: '',
                    title: cbp.asmPage.globalVars.permissions,
                    titleTooltip: cbp.asmPage.globalVars.permissions,
                    class: 'text-nowrap detailsForCardView',
                    formatter : function(value, row, index, field){
                        return '<span class="detailsForCardView" style="display:none">'+"<div>"+row.permissions+"</div>"+'</span>';
                    }
                }],
                data: dataList
            });
            asmDataTable.bootstrapTable('expandAllRows', false);
            cbp.asmPage.globalVars['resultsCountTemp'] = cbp.asmPage.globalVars.resultsCount;
            cbp.asmPage.globalVars['resultsCountTemp'] = cbp.asmPage.globalVars['resultsCountTemp'].replace("{0}", dataList.length>0 ? dataList.length : 0);
            $(config.resultsCounter).html(compiledresultsCountSummary(cbp.asmPage));
            if($('.tableAsmDetails thead > tr > th.detail').length>0){
                hideExpanCollapseForDetailView(dataList);
            }
            putBackgroundInASMTable();
            searchtype != 'recent' ? $(config.recenlyUsedCaption).hide() : '';
        };
        return {
            init: init
        };
    })();


    $(document).ready(function () {
        
        /*if($("#isPaymentFlow").val() === "true"){
            return false;
        }*/
        
        //Localization setup for dropdown & table
        $.fn.selectpicker.defaults = {
            noneSelectedText: cbp.asmPage.globalVars.selectDdn.noneSelectedText,
            noneResultsText: cbp.asmPage.globalVars.selectDdn.noneResultsText,
            countSelectedText: function (numSelected, numTotal) {
                return (numSelected == 1) ? cbp.asmPage.globalVars.selectDdn.itemSelected : cbp.asmPage.globalVars.selectDdn.itemSelected1;
            },
            maxOptionsText: function (numAll, numGroup) {
                return [
                    (numAll == 1) ? cbp.asmPage.globalVars.selectDdn.limitReached : cbp.asmPage.globalVars.selectDdn.limitReached1,
                    (numGroup == 1) ? cbp.asmPage.globalVars.selectDdn.groupLimit : cbp.asmPage.globalVars.selectDdn.groupLimit1
            ];
            },
            selectAllText: cbp.asmPage.globalVars.selectDdn.selectAllText,
            deselectAllText: cbp.asmPage.globalVars.selectDdn.deselectAllText
        };

        $.fn.bootstrapTable.locales = {
            formatLoadingMessage: function () {
                return cbp.asmPage.globalVars.tableLocales.loadingMessage;
            },
            formatRecordsPerPage: function (pageNumber) {
                return cbp.asmPage.globalVars.tableLocales.recordsPerPage.replace('{0}', pageNumber);
            },
            formatShowingRows: function (pageFrom, pageTo, totalRows) {
                return cbp.asmPage.globalVars.tableLocales.showingRows.replace('{0}', pageFrom).replace('{1}', pageTo).replace('{2}', totalRows);
            },
            formatSearch: function () {
                return cbp.asmPage.globalVars.tableLocales.search;
            },
            formatNoMatches: function () {
                return cbp.asmPage.globalVars.tableLocales.noMatches;
            },
            formatPaginationSwitch: function () {
                return cbp.asmPage.globalVars.tableLocales.paginationSwitch;
            },
            formatRefresh: function () {
                return cbp.asmPage.globalVars.tableLocales.refresh;
            },
            formatToggle: function () {
                return cbp.asmPage.globalVars.tableLocales.toggle;
            },
            formatColumns: function () {
                return cbp.asmPage.globalVars.tableLocales.columns;
            },
            formatAllRows: function () {
                return cbp.asmPage.globalVars.tableLocales.allRows;
            }
        };
        leftPaneExpandCollapse.init();
        $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales);
        cbp.asmPage.asmDataResponse = asmDataResponse;
        asmPage.init();
    });

    
});