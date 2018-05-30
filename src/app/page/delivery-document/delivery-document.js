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
    "text!app/page/delivery-document/searchForm.hbs",
    "text!app/page/delivery-document/delDocSummary.hbs",
    "text!app/page/delivery-document/bottomDetail.hbs"

], function (modernizr, $, bootstrap, Handlebars, moment, calendar, bootstrapSelect, bootstrapTable, toggleSwitch, _calendarHBS, _defaultDdnHBS, _searchFormHBS, _delDocSummaryHBS, _bottomDetailHBS) {

    //Compiling HBS templates
    var compiledDefaultDdn = Handlebars.compile(_defaultDdnHBS);
    var compiledsearchDate = Handlebars.compile(_calendarHBS);
    var compiledsearchForm = Handlebars.compile(_searchFormHBS);
    var compiledDelDocSummary = Handlebars.compile(_delDocSummaryHBS);
    var compiledBottomDetail = Handlebars.compile(_bottomDetailHBS);

    var delDocPage = (function () {

        var config = {
            locationDdnContainer: ".js-location-ddn",
            accountDdnContainer: ".js-account-ddn",
            delDocSummaryContainer: ".js-delDoc-summary",
            delDocsTypeContainer: ".js-delDocsType-ddn",
            downloadStatusContainer: ".js-downloadStatus-ddn",
            printStatusContainer: ".js-printStatus-ddn",
            pickDateRangeContainer: ".js-search-pickDateRange",
            searchFormContainer: ".js-search-form",
            searchDetailContainer: ".js-bottom-detail",
            sortByDdnContainer: ".js-sortbyDdn",
            dropDownCommon: ".selectpicker",
            ordercalendar: "#calendar",
            searchButton: "#delDocsSearch",
            // checkBtn : ".js-checkBtn",
            tabelRow: "#table tbody tr",
            //checkboxBtn :".bs-checkbox",
            downloadBtn: ".js-downloadBtn",
            printBtn: ".js-printBtn",
            // allCheckBtn: ".js-allCheckBtn",
            locationDdn: "#locationSelectDdn",
            accountDdn: "#accountSelectDdn",
            downloadStatusDdn: "#downloadStatus",
            printStatusDdn: "#printStatus",
            sortByDdn: "#sortByDdn",
            displaySpinner: ".overlay-wrapper",
            dropdownSelect: ".dropdown-menu .toggle-select",
            billOfLading: "#billOfLading",
            squareUnchecked: "fa-square-o",
            squareChecked: "fa-check-square-o",
            downloadIcon: ".iconsPrintDownload",
            printIcon: ".iconsdelDocPrint",
            delDocSearchToggle: "#delDocSearchToggle",
            delDocSearchInput:".js-DelDocPage-search",
            dateRangeSummary:".dateRangeSummary"
        };

        var locationDropDownOptions = [];
        var selectedDelDocs = [];
        var selectedDelDocstatus = [];
        var startDate, endDate;
    
        var init = function () {
            populatingSoldTo();
        	populatingAccount(locationDropDownOptions[0].key, true);
            loadingInitialHbsTemplates();            
            //populatingTable(cbp.delDocPage.delDocResponse, cbp.delDocPage.delDocResponse.delDocColumnMapping );
            bindEvents();
            enableMobileDefaultDropDown();
            $(config.delDocSearchToggle).toggleSwitch(toggleSwitchConfig);
            $(config.pickDateRangeContainer).removeClass('hidden');
            $(config.delDocSearchInput).addClass('hidden');
            $("#delDocSearchToggle input[type='hidden']").val("dateRange");
        };
        
        var callDelDocPDFLink = function(delDocId){
        	$("#delDocPDFListForm #deliveryDocumentIds").val(delDocId);
        	$("#delDocPDFListForm").submit();
        }

        var toggleSwitchConfig = {
                name: "switch",
                cssClass: "toggleForDelDocSearchForm",
                label: "",
                //LabelBlock: true,
                options: [{
                    label: cbp.delDocPage.globalVars.dateRange,
                    value: "dateRange",
                    default: true
                },{
                    label: cbp.delDocPage.globalVars.billOfLading,
                    value: "billOfLading"
                }]
            };

        var enableMobileDefaultDropDown = function() {
            //Enable mobile scrolling by calling $('.selectpicker').selectpicker('mobile'). This enables the device's native menu for select menus.
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
                $('.selectpicker').selectpicker('mobile');
            }
        };

        var callInvoicePDFLink = function(invoiceId) {
            $('#invoicePDFForm #invoiceId').val(invoiceId);
            $('#invoicePDFForm #invoicePrint').val('false');
            //$('#invoicePDFForm').submit();
        }

        var downloadBtnSelected = function() {
            $('#delDocForm #selectedDelDocs').val(selectedDelDocs.toString());
            for (var i = 0; len = selectedDelDocs.length, i < len; i++) {
                if (isASM !== true)
                    $(".iconsPrintDownload[data-delDocid='" + selectedDelDocs[i] + "']").addClass("success-icon");
                //cbp.delDocPage.delDocResponse.delDocList[$("tr[data-uniqueid='" + selectedDelDocs[i] + "']").data("index")].downloaded = true;
                cbp.delDocPage.delDocResponse.delDocList = cbp.delDocPage.delDocResponse.delDocList.filter(function(obj) {
                    if(obj.delDocId === selectedDelDocs[i])
                        obj.downloaded = true;
                    return obj;
                });
            }
            //$("#delDocForm").submit();
        };

        var printPDFSelected = function() {
            var len = selectedDelDocs.length;          
            $('#delDocPDFListForm #deliveryDocumentIds').val(selectedDelDocs.toString());
           /* var contextPath = $("#contextPath").val() + "/delDocs/print-delDocs";
           var currentActionURL = $("#delDocPDFListForm").attr('action');
            $("#delDocPDFListForm").attr('action', contextPath);*/
            $("#delDocPDFListForm").attr('target', '_blank');
            $("#delDocPDFListForm").append('<input type="hidden"');
            for (var i = 0;  i < len; i++) {
                if (isASM !== true)
                    $(".iconsdelDocPrint[data-delDocid='" + selectedDelDocs[i] + "']").addClass("success-icon");
                //cbp.delDocPage.delDocResponse.delDocList[$("tr[data-uniqueid='" + selectedDelDocs[i] + "']").data("index")].printed = true;
                cbp.delDocPage.delDocResponse.delDocList = cbp.delDocPage.delDocResponse.delDocList.filter(function(obj) {
                    if(obj.delDocId === selectedDelDocs[i])
                        obj.printed = true;
                    return obj;
                });
            }
            $("#delDocPDFListForm").submit();
            //$("#delDocPDFListForm").attr('action', currentActionURL);
            $("#delDocPDFListForm").removeAttr('target');
        };


        var loadingInitialHbsTemplates = function () {
            //Appending handlebar templates to HTML
            $(config.searchFormContainer).html(compiledsearchForm(cbp.delDocPage));
            $(config.locationDdnContainer).html(compiledDefaultDdn(cbp.delDocPage.locationDropDown));
            $(config.accountDdnContainer).html(compiledDefaultDdn(cbp.delDocPage.accountDropDown));
            $(config.downloadStatusContainer).html(compiledDefaultDdn(cbp.delDocPage.downloadStatusDropdown));
            $(config.delDocsTypeContainer).html(compiledDefaultDdn(cbp.delDocPage.delDocTypeDropdown));
            $(config.printStatusContainer).html(compiledDefaultDdn(cbp.delDocPage.printStatusDropdown));
            $(config.pickDateRangeContainer).html(compiledsearchDate({
                label: "",
                iconClass: cbp.delDocPage.dateRange.iconClass,
                id: cbp.delDocPage.dateRange.id
            }));
            populatingCalendarComponent();
         
            //Refresh dropdown at initial dispaly after loading templates
            $(config.dropDownCommon).selectpicker('refresh');
            enableMobileDefaultDropDown();
          
            
            $(config.displaySpinner).hide();
        };

        var loadingDynamicHbsTemplates = function () {
            $(config.searchDetailContainer).html(compiledBottomDetail(cbp.delDocPage));
            setSummaryValues();
            $(config.delDocSummaryContainer).html(compiledDelDocSummary(cbp.delDocPage));
            var sortDdnOptions = generatingOptions(cbp.delDocPage.delDocResponse.delDocColumnMapping);
            srtByDdn["options"] = sortDdnOptions;
            $(config.sortByDdnContainer).html(compiledDefaultDdn(srtByDdn));
            $(config.sortByDdnContainer).find(config.dropDownCommon).selectpicker('refresh');
            enableMobileDefaultDropDown();
        };

        var setSummaryValues = function(){
            cbp.delDocPage.summary = {};
            cbp.delDocPage.summary.soldTo = $('.js-location-ddn .btn-group .dropdown-toggle').text();
            cbp.delDocPage.summary.account = $('.js-account-ddn .btn-group .dropdown-toggle').text();
            cbp.delDocPage.summary.dateRange = $('.js-search-pickDateRange').find('span').text();
        };

        var populatingCalendarComponent = function () {
            function cb(start, end) {
                startDate = start.format(cbp.delDocPage.dateRange.format);
                endDate = end.format(cbp.delDocPage.dateRange.format);
                $(config.ordercalendar).find('span').html(cbp.delDocPage.globalVars.fromAndTo.replace("{0}", startDate).replace("{1}", endDate));
            }


            cb(cbp.delDocPage.dateRange.startDate, cbp.delDocPage.dateRange.endDate);

            var customRanges = {};

            customRanges[cbp.delDocPage.dateRange.today] = [moment(), moment()];
            customRanges[cbp.delDocPage.dateRange.yesterday] = [moment().subtract(1, 'days'), moment().subtract(1, 'days')];
            customRanges[cbp.delDocPage.dateRange.last7Days] = [moment().subtract(6, 'days'), moment()];
            customRanges[cbp.delDocPage.dateRange.last30Days] = [moment().subtract(29, 'days'), moment()];
            customRanges[cbp.delDocPage.dateRange.thisMonth] = [moment().startOf('month'), moment().endOf('month')];
            customRanges[cbp.delDocPage.dateRange.lastMonth] = [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')];

            $(config.ordercalendar).daterangepicker({
                startDate: cbp.delDocPage.dateRange.startDate,
                endDate: cbp.delDocPage.dateRange.endDate,
                ranges: customRanges,
                "minDate": moment().subtract(cbp.delDocPage.dateRange.maxMonth, 'month'),
                "maxDate": moment(),
                'applyClass': 'btn-primary',
                locale: {
                    format: cbp.delDocPage.dateRange.format,
                    separator: ' - ',
                    applyLabel: cbp.delDocPage.dateRange.apply,
                    cancelLabel: cbp.delDocPage.dateRange.cancel,
                    weekLabel: 'W',
                    customRangeLabel: cbp.delDocPage.dateRange.customRange,
                    daysOfWeek: moment.weekdaysShort(),
                    monthNames: moment.monthsShort(),
                    firstDay: moment.localeData().firstDayOfWeek()
                }
            }, cb);
        };
              
        
        var downloadForm = function (delDocId) {
            var formTemplate = "<form id='downloadForm' method='POST' action='" + cbp.delDocPage.globalUrl.delDocCSVURL + "'><input type='hidden' name='selectedDelDocs' value='" + delDocId + "'/></form>";
            cbp.delDocPage.delDocResponse.delDocList[$("tr[data-uniqueid='" + delDocId + "']").data("index")].downloaded = true;
          //  $(formTemplate).appendTo("body").submit().remove();
        };

        var enablePrintDownloadButtons = function () {
            $(config.downloadBtn).removeClass("disabled");
            $(config.printBtn).removeClass("disabled");
        };
        var disablePrintDownloadButtons = function () {
            $(config.downloadBtn).addClass("disabled");
            $(config.printBtn).addClass("disabled");
        };

        
        var generatingOptions = function(data){
            var globalSortList = [{
                key: "account-asc",
                value: cbp.delDocPage.globalVars.accountSortAsc
            },{
                key: "account-desc",
                value: cbp.delDocPage.globalVars.accountSortDesc
            },{
                key: "delDocTime-asc",
                value: cbp.delDocPage.globalVars.delDocDateAsc
            },{
                key: "delDocTime-desc",
                value: cbp.delDocPage.globalVars.delDocDateDesc
            },{
                key: "billOfLading-asc",
                value: cbp.delDocPage.globalVars.billOfLadingAsc
            },{
                key: "billOfLading-desc",
                value: cbp.delDocPage.globalVars.billOfLadingDesc
            },{
                key: "delDocId-asc",
                value: cbp.delDocPage.globalVars.delDocAsc
            },{
                key: "delDocId-desc",
                value: cbp.delDocPage.globalVars.delDocDesc
            },{
                key: "invoiceId-asc",
                value: cbp.delDocPage.globalVars.invoiceIdAsc
            },{
                key: "invoiceId-desc",
                value: cbp.delDocPage.globalVars.invoiceIdDesc
            },{
                key: "total-asc",
                value: cbp.delDocPage.globalVars.totaltb + (cbp.delDocPage.delDocResponse.currency === null?'':' ('+cbp.delDocPage.delDocResponse.currency+')') + ', '+ cbp.delDocPage.globalVars.ascLabel
            },{
                key: "total-desc",
                value: cbp.delDocPage.globalVars.totaltb + (cbp.delDocPage.delDocResponse.currency === null?'':' ('+cbp.delDocPage.delDocResponse.currency+')') + ', '+ cbp.delDocPage.globalVars.descLabel
            }];


        var sortListMap = globalSortList.reduce(function (data, globalSortList) {
            data[globalSortList.key] = globalSortList;
            return data;
          }, {});
      

        var sortKey = Object.keys(sortListMap).filter(function(key) {
                if(sortListMap[key]){
                return sortListMap[key];
                }
            });
      

         var receivedOrderKey = Object.keys(data).filter(function(key) {
                if(data[key]){
                return data[key];
                }
        });
            
       var fnCheck = function fnCheck(item) {
            return receivedOrderKey.indexOf(item.replace(/\-(asc|desc)/, "")) != -1;
          };
          
          var requestedOptions = sortKey.filter(function (s) {
            return fnCheck(s);
          });

        var optionDropdown = [];
        for(i=0;i<requestedOptions.length;i++){
            var k = requestedOptions[i];           
            optionDropdown.push(sortListMap[k]);
        }
      
        return optionDropdown;
        }

        var triggerAjaxRequest = function(data,type,url,contentType){   
            $(config.displaySpinner).show();
            function successCallback(res){
                return res;
            }
            function errorCallback(err){
                return err;
            }
            return $.ajax({
                type: type,
                data: data,
				contentType: contentType,
                dataType:"json",
                url: url,
                success: successCallback,
                error: errorCallback
            });
        };

        var searchData = function(){
            $(config.displaySpinner).show();
            $(config.delDocSummaryContainer).hide();
            $(config.searchDetailContainer).hide();

            leftPaneExpandCollapse.hideSearchBar();
            var hiddenInputForToggleSwitch = $("#delDocSearchToggle input[type='hidden']");
            var postData = {};
            
            postData.shipTo= $(config.accountDdn).val();
            postData.soldTo = $(config.locationDdn).val();    
            
            postData.downloadStatus = $(config.downloadStatusDdn).val();
            postData.printStatus = $(config.printStatusDdn).val();
            if(hiddenInputForToggleSwitch.val() === "dateRange"){
                postData.fromDate = startDate;
                postData.toDate = endDate; 
                postData.billOfLading="";
            }
            else{
                postData.billOfLading = $(config.delDocSearchInput).val();
                postData.fromDate = "";
                postData.toDate = "";
            }
            postData = JSON.stringify(postData); 
            $.when(triggerAjaxRequest(postData, cbp.delDocPage.globalUrl.method,  cbp.delDocPage.globalUrl.searchURL, "application/json")).then(function(data){
                $(config.displaySpinner).hide();
                $(config.searchDetailContainer).show();
                $(config.delDocSummaryContainer).show();
                cbp.delDocPage.delDocResponse = data;

                if (cbp.delDocPage.delDocResponse.resultCount > 0) {
                    cbp.delDocPage.globalVars.delDocsFoundVar = cbp.delDocPage.globalVars.delDocsFound.replace("{0}", cbp.delDocPage.delDocResponse.resultCount);
                } else {
                    cbp.delDocPage.globalVars.delDocsFoundVar = cbp.delDocPage.globalVars.delDocsFound.replace("{0}", 0);
                }
                cbp.delDocPage.dateRange.startDate = moment(startDate, cbp.delDocPage.dateRange.format, true);
                cbp.delDocPage.dateRange.endDate = moment(endDate, cbp.delDocPage.dateRange.format, true);

                cbp.delDocPage.globalVars.summaryfromAndToVar = cbp.delDocPage.globalVars.summaryfromAndTo.replace("{0}", cbp.delDocPage.dateRange.startDate.format(cbp.delDocPage.dateRange.format)).replace("{1}", cbp.delDocPage.dateRange.endDate.format(cbp.delDocPage.dateRange.format));
               
                loadingDynamicHbsTemplates();
                if(hiddenInputForToggleSwitch.val() === "dateRange")
                    $(config.dateRangeSummary).removeClass('hidden');
                else
                    $(config.dateRangeSummary).addClass('hidden');                                
                populatingTable(data, data.delDocColumnMapping );
                leftPaneExpandCollapse.resetSearchFormHeight();
            })                  
        }

        var populatingSoldTo = function(){
            locationDropDownOptions = locationDropDown.map(function(val,index){
                return {
                    key : val.uid,
                    value : val.displayName
                };
            });
            
            if(locationDropDownOptions.length>1)
            {
                locationDropDownOptions.unshift({key:"all",value:cbp.delDocPage.globalVars.allTb});
            }
            cbp.delDocPage.locationDropDown["options"] = locationDropDownOptions;
            cbp.delDocPage.locationDropDown.searchable = true;
        };

        var populatingAccount = function(soldToId, pageLoadCheck) {
            var postData = {};
            postData.soldToNumber = soldToId;
            $(config.displaySpinner).show();
            $.when(triggerAjaxRequest(postData, cbp.delDocPage.globalUrl.method, cbp.delDocPage.globalUrl.accountURL, "application/x-www-form-urlencoded")).then(function(data){             
                var accountOptions = [];
                var obj = {};                
                var account = data;               
                accountOptions = account.map(function(val,index){
                    return {
                        key : val['uid'],
                        value : val['displayName']
                    };
                });                
                if(account.length == 1){
                    cbp.delDocPage.accountDropDown.singleOption = true;
                }else if(account.length >= 1){
                    obj["key"] = "all";
                    obj["value"] = cbp.delDocPage.globalVars.allTb;
                    accountOptions.unshift(obj);
                }               
                cbp.delDocPage.accountDropDown["options"] = accountOptions;
                cbp.delDocPage.accountDropDown.searchable = true;                
                $(config.accountDdnContainer).html(compiledDefaultDdn(cbp.delDocPage.accountDropDown));
                $(config.accountDdn).selectpicker('refresh');                
                if(cbp.delDocPage.accountDropDown["options"].length > 1){
                    $(config.accountDdn).val("all").selectpicker('refresh');
                }
                if(pageLoadCheck === true){
                    setSummaryValues();
                    $(config.delDocSummaryContainer).html(compiledDelDocSummary(cbp.delDocPage));
                    searchData();
                }
                enableMobileDefaultDropDown();
                $(config.displaySpinner).hide();
            })
        };

        var bindEvents = function () {
                               
            $(document).on('click',config.delDocSearchToggle+' button',function(){
                $(config.delDocSearchInput).val('');
                if($(this).val()==="billOfLading"){
                    $(config.pickDateRangeContainer).addClass('hidden');
                    $(config.delDocSearchInput).removeClass('hidden').attr('placeholder', cbp.delDocPage.globalVars.billOfLading);
                }else{
                    $(config.pickDateRangeContainer).removeClass('hidden');
                    $(config.delDocSearchInput).addClass('hidden');
                    cbp.delDocPage.dateRange.startDate = moment().subtract(pastSelectableDate,'days');
                    cbp.delDocPage.dateRange.endDate = moment();            
                    populatingCalendarComponent();
                }
            });

            $(document).on("click", config.downloadBtn, function(){
                downloadBtnSelected(); 
            });

            $(document).on("click", config.printBtn, function(){
                printPDFSelected(); 
            });
            
            $(config.locationDdn).on('change', function (e) {
                if ($(config.locationDdn).val() !== "") {
                    $(config.searchButton).removeAttr("disabled");
                } else {
                    $(config.searchButton).attr("disabled", "disabled");
                }
                populatingAccount($(config.locationDdn).val(), false);
          });

            $(document).on('change', config.accountDdn, function(e) {
                 if ($(this).val() !== "") {
                     $(config.searchButton).removeAttr("disabled");
                 } else {
                     $(config.searchButton).attr("disabled", "disabled");
                 }
            });

            $(document).on('click', config.downloadIcon, function (evnt) {
                if (isASM !== true)
                    $(evnt.target).addClass("success-icon");
                downloadForm($(evnt.target).attr("data-delDocId"));
            });

            $(document).on('click', config.printIcon, function (evnt) {
            	var tempArray =[];
            	if (isASM !== true)
            		$(this).addClass("success-icon");
                var delDocId = $(evnt.target).attr("data-delDocId");
                tempArray = selectedDelDocs;
                selectedDelDocs = [delDocId];
                printPDFSelected();
                selectedDelDocs = tempArray;
            });
            //Search button functionality
            $(config.searchButton).on("click", function (e) {
                selectedDelDocs = []
                selectedDelDocstatus = [];
                searchData();
            });

            var valueOnSubmit = '.js-search-form input' + "," + config.printStatusContainer + "," +
                config.locationDdnContainer + "," +
                config.downloadStatusContainer + "," + config.pickDateRangeContainer + "";


            $(document).on('keypress', valueOnSubmit, function (e) {
                if (e.which == 13) {
                    e.preventDefault();
                    $("#delDocsSearch").trigger("click");
                }
            });


            var validateFields = config.orderNumber + "," + config.billOfLading;

            $(document).on('keypress', validateFields, function (e) {
            	var regex = /^[0-9a-zA-Z]+$/;
                var str = String.fromCharCode(e.which);
                if (str.match(regex)) {
                    return true;
                }
                e.preventDefault();
                return false;
            });
           
        };
        
        var generatingColumns = function(columnsDataList){
            
          
        	var receivedOrderKey = Object.keys(columnsDataList).filter(function(key){
        		if(columnsDataList[key]){
        			return columnsDataList[key];
        		}
        	});
        
            var columnsList = [{
                            field: 'checkbox',
                            checkbox: true,
                            class: 'fa'                            
                        }, {
                            field: 'status',
                            title: cbp.delDocPage.globalVars.statustb,
                            titleTooltip: cbp.delDocPage.globalVars.statustb,
                            class: 'text-nowrap',
                            formatter: function LinkFormatter(value, row, index) {
                                var downloadReport, printReport;
        
                                var downloaded = "",
                                    printed = "";
                                if (row.downloaded) {
                                    downloaded = "success-icon";
                                }
                                if (row.printed) {
                                    printed = "success-icon";
                                }
                                downloadReport = "<span class='fa fa-download iconsPrintDownload xs-pr-10 " + downloaded + "' data-delDocId='" + row.delDocId + "'>" + "</span>";
                                printReport = "<span class='fa fa-print iconsdelDocPrint " + printed + "' data-delDocId='" + row.delDocId + "'>" + "</span>";
                                return downloadReport + printReport;
                            }
                        }, {
                            field: 'account',
                            title: cbp.delDocPage.globalVars.account,
                            titleTooltip: cbp.delDocPage.globalVars.account,
                            width: "40%",
                            sortable: true
                        }, {
                            field: 'delDocTime',
                            title: cbp.delDocPage.globalVars.delDocDate,
                            titleTooltip: cbp.delDocPage.globalVars.delDocDate,
                            class: 'numberIcon text-nowrap',                            
                            formatter: function(value, row, index){
                            	var dateTime = row.delDocDate;
                                var date =dateTime.substr(0,dateTime.indexOf(' '))
                                var time = dateTime.substr(dateTime.indexOf(' ')+1);
                                return '<strong>'+date+'</strong><br>'+time;  
                            },
                            sortable: true
                        }, {
                            field: 'billOfLading',
                            title: cbp.delDocPage.globalVars.billOfLading,
                            titleTooltip: cbp.delDocPage.globalVars.billOfLading,
                            class: 'numberIcon text-nowrap',
                            sortable: true,
                        }, {
                            field: 'delDocId',
                            title: cbp.delDocPage.globalVars.delDoctb,
                            titleTooltip: cbp.delDocPage.globalVars.delDoctb,
                            class: 'numberIcon text-nowrap',
                            sortable: true,
                            formatter: function LinkFormatter(value, row, index) {
                                var delDocNoVar;
                               
                                delDocNoVar = '<a href="javascript:void(0);" onclick="callDelDocPDFLink(\'' + [row.delDocId] + '\')">' + row.delDocId + '</a>';
                                              
                                return delDocNoVar;
                            }
                        }, {
                            field: 'invoiceId',
                            title: cbp.delDocPage.globalVars.invoiceId,
                            titleTooltip: cbp.delDocPage.globalVars.invoiceId,
                            class: 'numberIcon text-nowrap',
                            sortable: true,
                            formatter: function LinkFormatter(value, row, index) {
                                var delDocNoVar;
                
                                if(value === null || value === "")  
                                	delDocNoVar = "-";
                                else
                                   delDocNoVar = '<a href="javascript:void(0);" onclick="callInvoicePDFLink(\'' + row.invoiceId + '\')">' + row.invoiceId + '</a>';
                                   
                                return delDocNoVar;
                            } 
                        },{
                            field: 'total',
                            title: cbp.delDocPage.globalVars.totaltb + (cbp.delDocPage.delDocResponse.currency === null?'':' ('+cbp.delDocPage.delDocResponse.currency+')'),
                            titleTooltip: cbp.delDocPage.globalVars.totaltb + (cbp.delDocPage.delDocResponse.currency === null?'':' ('+cbp.delDocPage.delDocResponse.currency+')'),
                            class: 'numberIcon text-nowrap',
                            sortable: true,
                            align: 'right',
                            formatter: function LinkFormatter(value, row, index) {
                                var total;
                                if (value >= '0') {
                                    total = row.displayTotal;
                                } else {
                                    total = "<span class='text-danger'>" + row.displayTotal + "</span>";
                                }
            
                                return total;
                            }
                        }
                        ];
            var columnsListMap = columnsList.reduce(function (data, columnsList) {
            data[columnsList.field] = columnsList;
            return data;
            }, {});
            var orderKey = ["checkbox", "status","account", "delDocTime","billOfLading", "delDocId","invoiceId","total"]
          
            var requestedCol = [];
            for(var i = 0; i< orderKey.length; i++){
                for(var j = 0; j<receivedOrderKey.length; j++){
                    if(orderKey[i]==receivedOrderKey[j])
                    {
                        var k = orderKey[i];
                        requestedCol.push(columnsListMap[k]);
                    }
                }
               
            }
            return requestedCol;

        }

        var populatingTable = function (delDocsData, columnsDataList) {
            var delDocStatusCount = 0;
            if (delDocsData.resultCount > maxResults && delDocsData.delDocList === null) {
                cbp.delDocPage.globalVars.tableLocales.noMatches = cbp.delDocPage.globalVars.noMatchesMaxResults.replace('{0}', delDocsData.resultCount);
                delDocsData.delDocList = [];
            } else if (delDocsData.resultCount === 0) {
                cbp.delDocPage.globalVars.tableLocales.noMatches = cbp.delDocPage.globalVars.noMatches;
            } else if (delDocsData.resultCount > maxResults) {
                cbp.delDocPage.globalVars.tableLocales.noMatches = cbp.delDocPage.globalVars.noMatchesMaxResults.replace('{0}', delDocsData.resultCount);
                delDocsData.delDocList = [];
            }

            if (delDocsData.delDocList === null || delDocsData.delDocList === undefined) {
                delDocsData.delDocList = [];
            }
            $(config.sortByDdn).val("delDocTime-desc").selectpicker('refresh');


            $('#table').bootstrapTable({
                classes: 'table table-no-bordered',
                striped: true,
                sortName: 'delDocTime',
                uniqueId: 'delDocId',
                sortOrder: 'desc',
                iconsPrefix: 'fa',
                sortable: true,
                parentContainer: ".js-bottom-detail",
                sortByDropdownId: "#sortByDdn",
                responsive: true,
                responsiveBreakPoint: 768,
                responsiveClass: "bootstrap-table-cardview",
                onCheck: function (row, $element) {

                    // enable button
                  
                    selectedDelDocs.push(row.delDocId);
                    enablePrintDownloadButtons();
                },
                onCheckAll: function (rows) {
                    // enable button
                    selectedDelDocs = [];
                    selectedDelDocstatus = [];
                    var len = rows.length;
                    for (var i = 0; i < len; i++) {
                        selectedDelDocs.push(rows[i].delDocId);
                    }
                    if (rows.length) {
                        enablePrintDownloadButtons();
                    }
                },
                onUncheck: function (row, $element) {
                    // write logic..as not sure if all unselected
                    var index = selectedDelDocs.indexOf(row.delDocId);
                    if (index > -1) {
                        selectedDelDocs.splice(index, 1);
                    }
                    if (!($(config.tabelRow).hasClass('selected'))) {
                        disablePrintDownloadButtons();
                    }
                },
                onUncheckAll: function (rows) {
                    //disable button
                    selectedDelDocs = [];
                    disablePrintDownloadButtons();
                    $("#table tbody").find("tr").removeClass("bg-danger");
                },
                columns: generatingColumns(columnsDataList),
                data: delDocsData.delDocList
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
                    'CSRFToken':cbp.delDocPage.globalVars.csrfToken
                }
            }
        });
    	
        //Localization setup for dropdown & table
        $.fn.selectpicker.defaults = {
            noneSelectedText: cbp.delDocPage.globalVars.selectDdn.noneSelectedText,
            noneResultsText: cbp.delDocPage.globalVars.selectDdn.noneResultsText,
            countSelectedText: function (numSelected, numTotal) {
                return (numSelected == 1) ? cbp.delDocPage.globalVars.selectDdn.itemSelected : cbp.delDocPage.globalVars.selectDdn.itemSelected1;
            },
            maxOptionsText: function (numAll, numGroup) {
                return [
                    (numAll == 1) ? cbp.delDocPage.globalVars.selectDdn.limitReached : cbp.delDocPage.globalVars.selectDdn.limitReached1,
                    (numGroup == 1) ? cbp.delDocPage.globalVars.selectDdn.groupLimit : cbp.delDocPage.globalVars.selectDdn.groupLimit1
            ];
            },
            selectAllText: cbp.delDocPage.globalVars.selectDdn.selectAllText,
            deselectAllText: cbp.delDocPage.globalVars.selectDdn.deselectAllText
        };

        $.fn.bootstrapTable.locales = {
            formatLoadingMessage: function () {
                return cbp.delDocPage.globalVars.tableLocales.loadingMessage;
            },
            formatRecordsPerPage: function (pageNumber) {
                return cbp.delDocPage.globalVars.tableLocales.recordsPerPage.replace('{0}', pageNumber);
            },
            formatShowingRows: function (pageFrom, pageTo, totalRows) {
                return cbp.delDocPage.globalVars.tableLocales.showingRows.replace('{0}', pageFrom).replace('{1}', pageTo).replace('{2}', totalRows);
            },
            formatSearch: function () {
                return cbp.delDocPage.globalVars.tableLocales.search;
            },
            formatNoMatches: function () {
                return cbp.delDocPage.globalVars.tableLocales.noMatches;
            },
            formatPaginationSwitch: function () {
                return cbp.delDocPage.globalVars.tableLocales.paginationSwitch;
            },
            formatRefresh: function () {
                return cbp.delDocPage.globalVars.tableLocales.refresh;
            },
            formatToggle: function () {
                return cbp.delDocPage.globalVars.tableLocales.toggle;
            },
            formatColumns: function () {
                return cbp.delDocPage.globalVars.tableLocales.columns;
            },
            formatAllRows: function () {
                return cbp.delDocPage.globalVars.tableLocales.allRows;
            }
        };

        $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales);
        
        leftPaneExpandCollapse.init();

//        cbp.delDocPage.delDocResponse = delDocResponse;
//        if (delDocResponse.resultCount === undefined || delDocResponse.resultCount === null) {
//            cbp.delDocPage.delDocResponse.resultCount = 0;
//            cbp.delDocPage.globalVars.delDocsFoundVar = cbp.delDocPage.globalVars.delDocsFound.replace("{0}", 0);
//        } else {
//            cbp.delDocPage.globalVars.delDocsFoundVar = cbp.delDocPage.globalVars.delDocsFound.replace("{0}", delDocResponse.resultCount);
//        }
//
//        if (delDocResponse.delDocList === undefined || delDocResponse.delDocList === null) {
//            cbp.delDocPage.delDocResponse.delDocList = [];
//        }

        cbp.delDocPage.dateRange.startDate = moment().subtract(pastSelectableDate,'days');
        cbp.delDocPage.dateRange.endDate = moment();

        cbp.delDocPage.globalVars.summaryfromAndToVar = cbp.delDocPage.globalVars.summaryfromAndTo.replace("{0}", cbp.delDocPage.dateRange.startDate.format(cbp.delDocPage.dateRange.format)).replace("{1}", cbp.delDocPage.dateRange.endDate.format(cbp.delDocPage.dateRange.format));

        delDocPage.init();

    });

    
});