var locationDropDownOptions = [];
var startDate, endDate;
var invoiceObj = {};
var invoiceTotalSum = 0;

locationDropDownOptions = locationDropDown.map(function(val,index){
    return {
        key : val.uid,
        value : val.displayName
    };
});
if(locationDropDownOptions.length>1)
{
	locationDropDownOptions.unshift({key:"all",value:cbp.invoicesPage.globalVars.allTb});
}
cbp.invoicesPage.locationDropDown["options"] = locationDropDownOptions;
cbp.invoicesPage.locationDropDown.searchable = true;

function enableMobileDefaultDropDown() {
    //Enable mobile scrolling by calling $('.selectpicker').selectpicker('mobile'). This enables the device's native menu for select menus.
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
        $('.selectpicker').selectpicker('mobile');
    }
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

function goToOrderDetails(orderId) {
    $('#orderDetailsForm #orderId').val(orderId);
    $('#orderDetailsForm #hybrisOrder').val(false);
    $('#orderDetailsForm').submit();
}

function goToEftDetails(eftId) {
	    $('#eftForm #selectedEFTs').val(eftId);
	    $('#eftForm').submit();
}

var selectedInvoices = [],
    selectedProduct = [],
    selectedInvoiceStatus = [];
    
var enableInvoiceError = false;
var enableTotalError = false;
invoicesResponse.summaryResponse = invoicesResponse.summary.soldTo;

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
    "text!app/page/invoices/searchForm.hbs",
    "text!app/page/invoices/invoicesSummary.hbs",
    "text!app/page/invoices/bottomDetail.hbs"

], function (modernizr, $, bootstrap, Handlebars, moment, calendar, bootstrapSelect, bootstrapTable, _calendarHBS, _defaultDdnHBS, _searchFormHBS, _invoicesSummaryHBS, _bottomDetailHBS) {

    //Compiling HBS templates
    var compiledDefaultDdn = Handlebars.compile(_defaultDdnHBS);
    var compiledsearchDate = Handlebars.compile(_calendarHBS);
    var compiledsearchForm = Handlebars.compile(_searchFormHBS);
    var compiledinvoicesSummary = Handlebars.compile(_invoicesSummaryHBS);
    var compiledBottomDetail = Handlebars.compile(_bottomDetailHBS);

    var invoicesPage = (function () {

        var config = {
            locationDdnContainer: ".js-location-ddn",
            shipToDdnContainer: ".js-shipTo-ddn",
            invoicesSummaryContainer: ".js-invoices-summary",
            invoicesTypeContainer: ".js-invoicesType-ddn",
            downloadStatusContainer: ".js-downloadStatus-ddn",
            printStatusContainer: ".js-printStatus-ddn",
            pickDateRangeContainer: ".js-search-pickDateRange",
            searchFormContainer: ".js-search-form",
            searchDetailContainer: ".js-bottom-detail",
            sortByDdnContainer: ".js-sortbyDdn",
            dropDownCommon: ".selectpicker",
            ordercalendar: "#calendar",
            searchButton: "#invoicesSearch",
            // checkBtn : ".js-checkBtn",
            tabelRow: "#table tbody tr",
            //checkboxBtn :".bs-checkbox",
            downloadBtn: ".js-downloadBtn",
            printBtn: ".js-printBtn",
            // allCheckBtn: ".js-allCheckBtn",
            invoiceTypeDdn: "#invoiceTypeDdn",
            locationDdn: "#locationSelectDdn",
            shipToDdn: "#shipToSelectDdn",
            downloadStatusDdn: "#downloadStatus",
            printStatusDdn: "#printStatus",
            sortByDdn: "#sortByDdn",
            displaySpinner: ".overlay-wrapper",
            dropdownSelect: ".dropdown-menu .toggle-select",
            invoiceNumber: "#invoiceNumber",
            orderNumber: "#orderNumber",
            poNumber: "#poNumber",
            squareUnchecked: "fa-square-o",
            squareChecked: "fa-check-square-o",
            downloadIcon: ".iconsPrintDownload",
            printIcon: ".iconsInvoicePrint"
        };

        var init = function () {
        	populatingShipToOnLoad(shiptoListOnLoad);
        	
            loadingInitialHbsTemplates();

            if(cbp.invoicesPage.locationDropDown["options"].length == 1){
                populatingShipTo($(config.locationDdn).val(), "all");
                $(config.searchButton).removeAttr("disabled");
            }

            $(config.locationDdn).selectpicker('refresh');
            
          
           
            if (allInvoiceFlow === "true") {
                $(config.downloadStatusDdn).val('notDownloaded').selectpicker('refresh');
                $(config.printStatusDdn).val('notPrinted').selectpicker('refresh');
            }

            if (localStorage.getItem("invoiceObj") === undefined || localStorage.getItem("invoiceObj") === null ){
            	populatingTable(cbp.invoicesPage.invoicesResponse, cbp.invoicesPage.invoicesResponse.invoiceColumnMapping );
            } else {
                var invoiceObj = JSON.parse(localStorage.getItem("invoiceObj"));
                startDate = invoiceObj.startDate;
                endDate = invoiceObj.endDate;
                cbp.invoicesPage.dateRange.startDate = moment(startDate, cbp.invoicesPage.dateRange.format, true);
                cbp.invoicesPage.dateRange.endDate = moment(endDate, cbp.invoicesPage.dateRange.format, true);
                
                $(config.invoiceNumber).val(invoiceObj.invoiceNumber);
                $(config.orderNumber).val(invoiceObj.salesOrderNumber);
                $(config.poNumber).val(invoiceObj.poNumber);
                $(config.invoiceTypeDdn).val(invoiceObj.invoiceTypes).selectpicker('refresh');
                $(config.downloadStatusDdn).val(invoiceObj.downloadStatus).selectpicker('refresh');
                $(config.printStatusDdn).val(invoiceObj.printStatus).selectpicker('refresh');
                $(config.locationDdn).val(invoiceObj.soldTo).selectpicker('refresh');
                
                $.when(populatingShipTo(invoiceObj.soldTo, invoiceObj.shipTo)).then(function(data){
                    triggerAjaxRequest();
                });
                enableMobileDefaultDropDown();
                localStorage.removeItem("invoiceObj");
                $(config.searchButton).removeAttr("disabled");
            }


            populatingCalendarComponent();
            bindEvents();

        };
        
        var downloadBtnSelected = function() {
            $('#invoiceForm #selectedInvoices').val(selectedInvoices.toString());
            for (var i = 0; len = selectedInvoices.length, i < len; i++) {
            	if(isASM !== true)
                	$(".iconsPrintDownload[data-invoiceid='" + selectedInvoices[i] + "']").addClass("success-icon");
                cbp.invoicesPage.invoicesResponse.invoiceList[$("tr[data-uniqueid='" + selectedInvoices[i] + "']").data("index")].downloaded = true;
            }
            $("#invoiceForm").submit();
           // selectedInvoices.length=0;
        };

        var printPDFSelected = function() {
            var len = selectedInvoices.length;          
            $('#invoicePDFListForm #selectedInvoices').val(selectedInvoices.toString());
            var contextPath = $("#contextPath").val() + "/invoices/print-invoices";
           var currentActionURL = $("#invoicePDFListForm").attr('action');
            $("#invoicePDFListForm").attr('action', contextPath);
            $("#invoicePDFListForm").attr('target', '_blank');
            
            $("#invoicePDFListForm").append('<input type="hidden" name="CSRFToken" value="'+CSRFToken+'"');
            for (var i = 0;  i < len; i++) {
            	if(isASM !== true)
                	$(".iconsInvoicePrint[data-invoiceid='" + selectedInvoices[i] + "']").addClass("success-icon");
                cbp.invoicesPage.invoicesResponse.invoiceList[$("tr[data-uniqueid='" + selectedInvoices[i] + "']").data("index")].printed = true;
            }
            $("#invoicePDFListForm").submit();
            $("#invoicePDFListForm").attr('action', currentActionURL);
            $("#invoicePDFListForm").removeAttr('target');
            //selectedInvoices.length=0;
        };


        var loadingInitialHbsTemplates = function () {
            //Appending handlebar templates to HTML
            $(config.searchFormContainer).html(compiledsearchForm(cbp.invoicesPage));
            $(config.locationDdnContainer).html(compiledDefaultDdn(cbp.invoicesPage.locationDropDown));
            $(config.shipToDdnContainer).html(compiledDefaultDdn(cbp.invoicesPage.shipToDropDown));
            $(config.downloadStatusContainer).html(compiledDefaultDdn(cbp.invoicesPage.downloadStatusDropdown));
            $(config.invoicesTypeContainer).html(compiledDefaultDdn(cbp.invoicesPage.invoiceTypeDropdown));
            $(config.printStatusContainer).html(compiledDefaultDdn(cbp.invoicesPage.printStatusDropdown));
            $(config.pickDateRangeContainer).html(compiledsearchDate({
                label: cbp.invoicesPage.globalVars.pickDateRange,
                iconClass: cbp.invoicesPage.dateRange.iconClass,
                id: cbp.invoicesPage.dateRange.id
            }));

            if(shiptoListOnLoad.length<2){
                cbp.invoicesPage.showSoldTo = false;
                invoicesResponse.summaryResponse = invoicesResponse.summary.shipTo;
            } else{
                cbp.invoicesPage.showSoldTo = true;
                invoicesResponse.summaryResponse = invoicesResponse.summary.soldTo;
            }

            loadingDynamicHbsTemplates();

            //Refresh dropdown at initial dispaly after loading templates
            $(config.dropDownCommon).selectpicker('refresh');
            enableMobileDefaultDropDown();
            $(config.displaySpinner).hide();
        };
        function summarySoldTo(){
        var res = invoicesResponse.summaryResponse;
      
        	if(res.length>10){
        		res = res.split(",");        
        		var boldShipTo = res[0];
        		var normalShipTo = res.splice(1);
        		invoicesResponse.soldShipToBlock = boldShipTo+',';
        		invoicesResponse.soldShipToNormal = normalShipTo; 
        	}
        else{
            invoicesResponse.soldShipToBlock = res; 
            invoicesResponse.soldShipToNormal="";
        	}
        }

        var loadingDynamicHbsTemplates = function () {
        	
        	if(invoicesResponse.summaryResponse.toLowerCase() == "all"){
                invoicesResponse.summaryResponse = cbp.invoicesPage.globalVars.allTb; 
            }
        	summarySoldTo();
        	cbp.invoicesPage.invoicesResponse['soldShipToBlock'] = invoicesResponse.soldShipToBlock;
        	cbp.invoicesPage.invoicesResponse['soldShipToNormal'] = invoicesResponse.soldShipToNormal;
            $(config.invoicesSummaryContainer).html(compiledinvoicesSummary(cbp.invoicesPage));
            $(config.searchDetailContainer).html(compiledBottomDetail(cbp.invoicesPage));
            var sortDdnOptions = generatingOptions(cbp.invoicesPage.invoicesResponse.invoiceColumnMapping);
            srtByDdn["options"] = sortDdnOptions;
            $(config.sortByDdnContainer).html(compiledDefaultDdn(srtByDdn));
            $(config.sortByDdnContainer).find(config.dropDownCommon).selectpicker('refresh');
            enableMobileDefaultDropDown();
        };


        var populatingCalendarComponent = function () {
        	moment.updateLocale('en',{weekdaysShort:cbp.invoicesPage.weekdaysShort});
        	moment.updateLocale('en',{monthsShort:cbp.invoicesPage.monthsShort});
        	
            function cb(start, end) {
                startDate = start.format(cbp.invoicesPage.dateRange.format);
                endDate = end.format(cbp.invoicesPage.dateRange.format);
                $(config.ordercalendar).find('span').html(cbp.invoicesPage.globalVars.fromAndTo.replace("{0}", startDate).replace("{1}", endDate));
            }

            if (allInvoiceFlow === "true") {
                cbp.invoicesPage.dateRange.startDate = moment().subtract(cbp.invoicesPage.dateRange.maxMonth, 'month');
            }

            cb(cbp.invoicesPage.dateRange.startDate, cbp.invoicesPage.dateRange.endDate);

            var customRanges = {};

            customRanges[cbp.invoicesPage.dateRange.today] = [moment(), moment()];
            customRanges[cbp.invoicesPage.dateRange.yesterday] = [moment().subtract(1, 'days'), moment().subtract(1, 'days')];
            customRanges[cbp.invoicesPage.dateRange.last7Days] = [moment().subtract(6, 'days'), moment()];
            customRanges[cbp.invoicesPage.dateRange.last30Days] = [moment().subtract(29, 'days'), moment()];
            customRanges[cbp.invoicesPage.dateRange.thisMonth] = [moment().startOf('month'), moment().endOf('month')];
            customRanges[cbp.invoicesPage.dateRange.lastMonth] = [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')];

            $(config.ordercalendar).daterangepicker({
                startDate: cbp.invoicesPage.dateRange.startDate,
                endDate: cbp.invoicesPage.dateRange.endDate,
                ranges: customRanges,
                "minDate": moment().subtract(cbp.invoicesPage.dateRange.maxMonth, 'month'),
                "maxDate": moment(),
                'applyClass': 'btn-primary',
                locale: {
                    format: cbp.invoicesPage.dateRange.format,
                    separator: ' - ',
                    applyLabel: cbp.invoicesPage.dateRange.apply,
                    cancelLabel: cbp.invoicesPage.dateRange.cancel,
                    weekLabel: 'W',
                    customRangeLabel: cbp.invoicesPage.dateRange.customRange,
                    daysOfWeek: moment.weekdaysShort(),
                    monthNames: moment.monthsShort(),
                    firstDay: moment.localeData().firstDayOfWeek()
                }
            }, cb);
        };

        var triggerAjaxRequest = function () {
            $(config.displaySpinner).show();
            $(config.invoicesSummaryContainer).hide();
            $(config.searchDetailContainer).hide();

            leftPaneExpandCollapse.hideSearchBar();

            var allInvoiceType = [];

            $(config.invoiceTypeDdn).find("option").each(function () {
                allInvoiceType.push($(this).val());
            });
            
            var postData = {};
            
            postData.shipTo= $(config.shipToDdn).val();
            postData.soldTo = $(config.locationDdn).val();
            
             
            
            if($(config.invoiceNumber).val()!= "")
            {
                postData.invoiceNumber = $(config.invoiceNumber).val().trim();
                postData.invoiceNumber = parseInt(postData.invoiceNumber,10);
                $(config.invoiceNumber).val(postData.invoiceNumber);
            }
            if(!isNARegion){
            	if($(config.orderNumber).val()!= "")
                {    
                    postData.salesOrderNumber = $(config.orderNumber).val().trim();
                    $(config.orderNumber).val(postData.salesOrderNumber);
                }
                
                if($(config.poNumber).val()!= "")
                {
                    postData.poNumber = $(config.poNumber).val().trim();
                    $(config.poNumber).val(postData.poNumber);
                }
            }
            

            /* end DSLEC-8*/
            postData.invoiceTypes = $(config.invoiceTypeDdn).val() ? $(config.invoiceTypeDdn).val() : allInvoiceType;
            postData.downloadStatus = $(config.downloadStatusDdn).val();
            postData.printed = $(config.printStatusDdn).val();
                        
            /* start DSLEC-120*/
          /*  if($(config.invoiceNumber).val() != "" || 
               $(config.orderNumber).val()   != "" || 
               $(config.poNumber).val()      != "" ) 
            {
               	var backDate = moment().subtract(cbp.invoicesPage.dateRange.backDatedRange, 'month');
            	    backDate = backDate.format(cbp.invoicesPage.dateRange.format);
            	var curDate  = moment();
            	    curDate  = curDate.format(cbp.invoicesPage.dateRange.format);
            	    postData.fromDate = backDate;
                    postData.toDate   = curDate;
            }
            else 
            {*/
            	 postData.fromDate = startDate;
                 postData.toDate = endDate;
            //}
            /* end DSLEC-120*/
            

            function successCallback(data) {
                $(config.displaySpinner).hide();
                $(config.searchDetailContainer).show();
                $(config.invoicesSummaryContainer).show();
                cbp.invoicesPage.invoicesResponse = data;

                if (cbp.invoicesPage.invoicesResponse.resultCount > 0) {
                    cbp.invoicesPage.globalVars.invoicesFoundVar = cbp.invoicesPage.globalVars.invoicesFound.replace("{0}", cbp.invoicesPage.invoicesResponse.resultCount);
                } else {
                    cbp.invoicesPage.globalVars.invoicesFoundVar = cbp.invoicesPage.globalVars.invoicesFound.replace("{0}", 0);
                }
                cbp.invoicesPage.dateRange.startDate = moment(startDate, cbp.invoicesPage.dateRange.format, true);
                cbp.invoicesPage.dateRange.endDate = moment(endDate, cbp.invoicesPage.dateRange.format, true);

                cbp.invoicesPage.globalVars.summaryfromAndToVar = cbp.invoicesPage.globalVars.summaryfromAndTo.replace("{0}", cbp.invoicesPage.dateRange.startDate.format(cbp.invoicesPage.dateRange.format)).replace("{1}", cbp.invoicesPage.dateRange.endDate.format(cbp.invoicesPage.dateRange.format));

                if (allInvoiceFlow === "true" ||  (cbp.invoicesPage.invoicesResponse.resultCount > 0 && cbp.invoicesPage.invoicesResponse.resultCount < maxResults) ) {
                    cbp.invoicesPage.showDebitCredit = true;
                } else {
                    cbp.invoicesPage.showDebitCredit = false;
                }
                
                if ($(config.shipToDdn).val() != 'all') {
                    cbp.invoicesPage.showSoldTo = false;
                    invoicesResponse.summaryResponse = data.summary.shipTo;
                } else {
                    cbp.invoicesPage.showSoldTo = true;
                    invoicesResponse.summaryResponse = data.summary.soldTo;
                }
               
                loadingDynamicHbsTemplates();
                                
                populatingTable(cbp.invoicesPage.invoicesResponse, cbp.invoicesPage.invoicesResponse.invoiceColumnMapping );
                leftPaneExpandCollapse.resetSearchFormHeight();
            }

            function errorCallback() {
                $(config.displaySpinner).hide();
                $(config.searchDetailContainer).show();
                $(config.invoicesSummaryContainer).show();
                console.log("error");
            }

            $.ajax({
                type: "get",
                data: JSON.stringify(postData),
                contentType: "application/json",
                dataType:"json",
                url: cbp.invoicesPage.globalUrl.invoicePostURL,
                success: successCallback,
                error: errorCallback
            });

        };
               
        
        var setLabels = function(){
            // set appropriate labels for US/ non-US
                $(config.orderNumber).siblings("label").text(cbp.invoicesPage.globalVars.orderNumberNew);
                $(config.poNumber).siblings("label").text(cbp.invoicesPage.globalVars.poNumberNew);
                
                cbp.invoicesPage.globalVars.orderNumbertb = cbp.invoicesPage.globalVars.orderNumbertbNew;
                cbp.invoicesPage.globalVars.customerPOtb = cbp.invoicesPage.globalVars.customerPOtbNew;
        };


        var downloadForm = function (invoiceId) {
            var formTemplate = "<form id='downloadForm' method='POST' action='" + cbp.invoicesPage.globalUrl.invoiceCSVURL + "'><input type='hidden' name='selectedInvoices' value='" + invoiceId + "'/><input name='CSRFToken' id='CSRFToken' type='hidden' value='" + CSRFToken + "'/></form>";
            cbp.invoicesPage.invoicesResponse.invoiceList[$("tr[data-uniqueid='" + invoiceId + "']").data("index")].downloaded = true;
            $(formTemplate).appendTo("body").submit().remove();
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
            globalSortList = [{
                key: "invoiceDate-desc",
                value: cbp.invoicesPage.globalVars.invoiceDateAsc
        }, {
                key: "invoiceDate-asc",
                value: cbp.invoicesPage.globalVars.invoiceDateDesc
        }, { 
	        	key: "location-asc",
	            value: cbp.invoicesPage.isNARegion?cbp.invoicesPage.globalVars.accountNumAsc:cbp.invoicesPage.globalVars.locationSortAsc
        }, {
	        	key: "location-desc",
	            value: cbp.invoicesPage.isNARegion?cbp.invoicesPage.globalVars.accountNumDesc:cbp.invoicesPage.globalVars.locationSortDesc
        }, {
                key: "orderId-asc",
                value: cbp.invoicesPage.globalVars.orderNumberAsc
        }, {
                key: "orderId-desc",
                value: cbp.invoicesPage.globalVars.orderNumberDesc
        }, {
                key: "invoiceId-asc",
                value: cbp.invoicesPage.globalVars.invoiceNumberAsc
        }, {
                key: "invoiceId-desc",
                value: cbp.invoicesPage.globalVars.invoiceNumberDesc
        }, {
                key: "type-asc",
                value: cbp.invoicesPage.globalVars.invoiceTypeAsc
        }, {
                key: "type-desc",
                value: cbp.invoicesPage.globalVars.invoiceTypeDesc
        }, {
                key: "total-asc",
                value: cbp.invoicesPage.globalVars.totalAscNew
        }, {
                key: "total-desc",
                value: cbp.invoicesPage.globalVars.totalDescNew
        }, {
	            key: "eftNumber-asc",
	            value: cbp.invoicesPage.globalVars.eftNumberAsc
	    }, {
	            key: "eftNumber-desc",
	            value: cbp.invoicesPage.globalVars.eftNumberDesc
	    }, {
	            key: "altReferenceNumber-asc",
	            value: cbp.invoicesPage.globalVars.altReferenceNumberAsc
	    }, {
	            key: "altReferenceNumber-desc",
	            value: cbp.invoicesPage.globalVars.altReferenceNumberDesc
	    },{
	            key: "deliveryDate-desc",
	            value: cbp.invoicesPage.globalVars.deliveryDateAsc
	    }, {
	            key: "deliveryDate-asc",
	            value: cbp.invoicesPage.globalVars.deliveryDateDesc
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

        var updateOptions =function(selector,shipToOptions){
            var str = '';
            selector.find('option').each(function(index,value){
                str+='<option value="'+shipToOptions[index].key+'">'+shipToOptions[index].value+'</option>';
            });
            return str;
        }

        
        var populatingShipToOnLoad = function(shipToList){
            var shipToOptions = [];
            if(shipToList.length == 1){
                cbp.invoicesPage.shipToDropDown.singleOption = true;
                $(config.searchButton).removeAttr("disabled");
            }else if(shipToList.length>1){
            	var obj = {};
            	obj["key"] = "all";
            	obj["value"] = cbp.invoicesPage.globalVars.allTb;
            	shipToOptions.push(obj);
            }
                                    
            for (var i = 0; i < shipToList.length; i++) {
                var  obj = {};
                obj["key"] = shipToList[i].uid;
                obj["value"] = shipToList[i].displayName;
                shipToOptions.push(obj);
            }
            cbp.invoicesPage.shipToDropDown["options"] = shipToOptions;
            cbp.invoicesPage.shipToDropDown.searchable = true;
            $(config.shipToDdnContainer).html(compiledDefaultDdn(cbp.invoicesPage.shipToDropDown));
            
            var optionsReqd = updateOptions($(config.shipToDdn),shipToOptions);
            
            $(config.shipToDdn).html(optionsReqd);

        };

        var populatingShipTo = function(soldToId, shipToId) {
            $(config.displaySpinner).show();
            
            function successCallback(data) {
                $(config.displaySpinner).hide();
                
                var shipToOptions = [];
                var obj = {};
                
                var shipTo = data.ShipToData;
               
                shipToOptions = shipTo.map(function(val,index){
                    return {
                        key : val['uid'],
                        value : val['displayName']
                    };
                });
                
                if(shipTo.length == 1){
                    cbp.invoicesPage.shipToDropDown.singleOption = true;
                }else if(shipTo.length >= 1){
                    obj["key"] = "all";
                    obj["value"] = cbp.invoicesPage.globalVars.allTb;
                    shipToOptions.unshift(obj);
                }

               
                cbp.invoicesPage.shipToDropDown["options"] = shipToOptions;
                cbp.invoicesPage.shipToDropDown.searchable = true;
                
                $(config.shipToDdnContainer).html(compiledDefaultDdn(cbp.invoicesPage.shipToDropDown));

                $(config.shipToDdn).selectpicker('refresh');
                
                if(cbp.invoicesPage.shipToDropDown["options"].length > 1){
                    $(config.shipToDdn).val(shipToId).selectpicker('refresh');
                }
                
                var invoiceType = [];
                if(data.invoiceTypeList){
                    for(var i=0; i < data.invoiceTypeList.length;i++){
                        var invoiceObj = {};
                        invoiceObj.key = data.invoiceTypeList[i].code;
                        invoiceObj.value = data.invoiceTypeList[i].description;
                        invoiceType.push(invoiceObj);
                    }
                }


                cbp.invoicesPage.invoiceTypeDropdown.options = invoiceType;
                $(config.invoicesTypeContainer).html(compiledDefaultDdn(cbp.invoicesPage.invoiceTypeDropdown));
                
                $(config.invoiceTypeDdn).selectpicker('refresh');
                enableMobileDefaultDropDown();
            }

            function errorCallback() {
                $(config.displaySpinner).hide();
                console.log("error");
            }
            return $.ajax({
                type: "get",
                data: {
                    'soldToNumber' : soldToId
                },
                dataType:"json",
                url: cbp.invoicesPage.globalUrl.shipToURL,
                success: successCallback,
                error: errorCallback
            });

        };

        var bindEvents = function () {
            
            $(document).on("reset-view.bs.table, toggle.bs.table", "#table", function(event) {
                event.stopPropagation();

                for(var i=0;i<selectedInvoices.length; i++){
                    //trigger click for each selected invoice
                    $("#table tbody tr[data-uniqueid="+selectedInvoices[i]+"]").find("input[type=checkbox]").attr("checked","checked");
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

                setLabels();
                populatingShipTo($(config.locationDdn).val(), "all");
          });

            $(document).on('change', config.shipToDdn, function(e) {
                 if ($(this).val() !== "") {
                     $(config.searchButton).removeAttr("disabled");
                 } else {
                     $(config.searchButton).attr("disabled", "disabled");
                 }
            });

            $(document).on('click', config.downloadIcon, function (evnt) {
                if (isASM !== true)
                    $(evnt.target).addClass("success-icon");
                downloadForm($(evnt.target).attr("data-invoiceId"));
            });

            $(document).on('click', config.printIcon, function (evnt) {
            	var tempArray =[];
            	if (isASM !== true)
            		$(this).addClass("success-icon");
            	var invoiceId = $(evnt.target).attr("data-invoiceId");
            	tempArray = selectedInvoices;
            	selectedInvoices = [invoiceId];
            	printPDFSelected();
            	selectedInvoices = tempArray;
            	});
            //Search button functionality
            $(config.searchButton).on("click", function (e) {
                selectedInvoices = [];
                selectedProduct = [];
                selectedInvoiceStatus = [];
                invoiceObj.shipTo = $("#shipToSelectDdn").val();
                invoiceObj.soldTo = $("#locationSelectDdn").val();
                invoiceObj.invoiceNumber = $("#invoiceNumber").val();
                invoiceObj.salesOrderNumber = $("#orderNumber").val();
                invoiceObj.poNumber = $("#poNumber").val();
                invoiceObj.invoiceTypes = $("#invoiceTypeDdn").val();
                invoiceObj.downloadStatus = $("#downloadStatus").val();
                invoiceObj.printStatus = $("#printStatus").val();
                invoiceObj.startDate = startDate;
                invoiceObj.endDate = endDate;
                $(".alert-danger").addClass("hide");
                triggerAjaxRequest();
            });

            $(function () {
                $('#orderNumber, #invoiceNumber').bind('paste input', removeAlphaChars);
            })
            
            function removeAlphaChars(e) {
                var self = $(this);
                setTimeout(function () {
                    var initVal = self.val(),
                    outputVal = initVal.replace(/\W/g, '');
                    if (initVal != outputVal) self.val(outputVal);
                });
            }

            var valueOnSubmit = '.js-search-form input' + "," + config.printStatusContainer + "," +
                config.locationDdnContainer + "," +
                config.downloadStatusContainer + "," + config.pickDateRangeContainer + "";


            $(document).on('keypress', valueOnSubmit, function (e) {
                if (e.which == 13) {
                    e.preventDefault();
                    $("#invoicesSearch").trigger("click");
                }
            });


            var validateFields = config.orderNumber + "," + config.invoiceNumber;
            
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
                            class: 'fa',
                            formatter:function LinkFormatter(value, row, index){
                                return '<input type="hidden" name="type" value="'+ row.type + "@" + row.cbpInvoiceStatus +'">';
                            }
                        }, {
                            field: 'status',
                            title: cbp.invoicesPage.globalVars.statustb,
                            titleTooltip: cbp.invoicesPage.globalVars.statustb,
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
                                downloadReport = "<span class='fa fa-download iconsPrintDownload xs-pr-10 " + downloaded + "' data-invoiceId='" + row.invoiceId + "'>" + "</span>";
                                printReport = "<span class='fa fa-print iconsInvoicePrint " + printed + "' data-invoiceId='" + row.invoiceId + "'>" + "</span>";
                                return downloadReport + printReport;
                            }
                        }, {
                            field: 'location',
                            title: cbp.invoicesPage.isNARegion?cbp.invoicesPage.globalVars.accountNum:cbp.invoicesPage.globalVars.locationtb,
                            titleTooltip: cbp.invoicesPage.isNARegion?cbp.invoicesPage.globalVars.accountNum:cbp.invoicesPage.globalVars.locationtb,
                            width: "40%",
                            sortable: true
                        }, {
                            field: 'invoiceDate',
                            title:cbp.invoicesPage.isNARegion?cbp.invoicesPage.globalVars.invoiceDate: cbp.invoicesPage.globalVars.pickDatetb,
                            titleTooltip: cbp.invoicesPage.isNARegion?cbp.invoicesPage.globalVars.invoiceDate: cbp.invoicesPage.globalVars.pickDatetb,
                            class: 'numberIcon text-nowrap',
                            sorter: function dateSort(a, b) {
                                a = moment(a, cbp.invoicesPage.dateRange.format, true).format();
                                b = moment(b, cbp.invoicesPage.dateRange.format, true).format();
        
                                if (a < b) {
                                    return -1;
                                }
                                if (a > b) {
                                    return 1;
                                }
                                return 0;
                            },
                            sortable: true
                        }, {
                            field: 'orderId',
                            title: cbp.invoicesPage.globalVars.orderNumbertbNew + '<br> <i>' + cbp.invoicesPage.globalVars.customerPOtbNew + '</i>',
                            titleTooltip: cbp.invoicesPage.globalVars.orderNumbertbNew,
                            class: 'numberIcon text-nowrap',
                            sortable: true,
                            formatter: function LinkFormatter(value, row, index) {
                                var orderNoVar, customerPOVar;
                                if (row.showOrderLink == true && orderAvailable === true ) {
                                    orderNoVar = '<a href="javascript:void(0);" onclick="goToOrderDetails(\'' + '0'+ row.orderId + '\')">' + row.orderId + '</a>';
                               } else {
                                    orderNoVar = row.orderId;
                                }
                                if (row.purchaseOrderNumber === undefined || row.purchaseOrderNumber === null) {
                                    customerPOVar = "";
                                } else {
                                    customerPOVar = "<br> <i>" + row.purchaseOrderNumber + '</i>';
                                }
                               return orderNoVar + customerPOVar;
                            }
                        }, {
                            field: 'invoiceId',
                            title: cbp.invoicesPage.globalVars.invoicetb + (showLegal ? '<br> <i>' + cbp.invoicesPage.globalVars.legalInvoicetb + '</i>' : ''),
                            titleTooltip: cbp.invoicesPage.globalVars.invoicetb,
                            class: 'numberIcon text-nowrap',
                            sortable: true,
                            formatter: function LinkFormatter(value, row, index) {
                                var invoiceNoVar, legalNumberVar;
                
                                invoiceNoVar = '<a href="javascript:void(0);" onclick="callInvoicePDFLink(\'' + row.invoiceId + '\')">' + row.invoiceId + '</a>';
                                   
                                if (row.legalDocumentNumber === undefined || row.legalDocumentNumber === null) {
                                    legalNumberVar = "";
                                } else {
                                    legalNumberVar = (showLegal ? "<br> <i>" + row.legalDocumentNumber + '</i>' : '');
                                }
                                return invoiceNoVar + legalNumberVar;
                            }
                        }, {
                            field: 'type',
                            title: cbp.invoicesPage.isNARegion?cbp.invoicesPage.globalVars.NAtype:cbp.invoicesPage.globalVars.docTypetb,
                            titleTooltip: cbp.invoicesPage.isNARegion?cbp.invoicesPage.globalVars.NAtype:cbp.invoicesPage.globalVars.docTypetb,
                            class: (cbp.invoicesPage.isNARegion)?'':'text-nowrap',
                            sortable: true,
                            sorter: function typeSort(a, b) { 
                                if (a !== null && b !== null) {
                                    a = invoiceTypeMapper[a];
                                    b = invoiceTypeMapper[b];
                                }
                                if (a < b) {
                                    return -1;
                                }
                                if (a > b) {
                                    return 1;
                                }
                                return 0;
                            },
                            formatter: function LinkFormatter(value, row, index) {
                                return invoiceTypeMapper[value];
                            }
                        }, {
                            field: 'total',
                            title: cbp.invoicesPage.globalVars.totaltbNew + ((cbp.invoicesPage.invoicesResponse.summary.currency === "" || cbp.invoicesPage.invoicesResponse.summary.currency == null) ? '' : ' (' + cbp.invoicesPage.invoicesResponse.summary.currency + ')'),
                            titleTooltip: cbp.invoicesPage.globalVars.totaltbNew + ((cbp.invoicesPage.invoicesResponse.summary.currency === "" || cbp.invoicesPage.invoicesResponse.summary.currency == null) ? '' : ' (' + cbp.invoicesPage.invoicesResponse.summary.currency + ')'),
                            class: 'numberIcon text-nowrap',
                            sortable: true,
                            align: 'right',
                            sorter: function priceSort(a, b) {
                                if (a !== null && b !== null) {
                                   a = parseFloat(a.replace(/[,.]+/g,""));
                                    b = parseFloat(b.replace(/[,.]+/g,""));
                                }
        
                                if (a < b) {
                                    return -1;
                                }
                                if (a > b) {
                                    return 1;
                                }
                                return 0;
                            },
                            formatter: function LinkFormatter(value, row, index) {
                                var total, invoiceStatus;
                                if (value >= '0') {
                                    total = row.total;
                                } else {
                                    total = "<span class='text-danger'>" + row.total + "</span>";
                                }
                                if (row.cbpInvoiceStatus === undefined || row.cbpInvoiceStatus === null || row.cbpInvoiceStatus === "00") {
                                    invoiceStatus = "";
                                } else {
                                    invoiceStatus = "<br> <i>" + "<span class='text-danger'>" + invoiceStatusMapper[row.cbpInvoiceStatus] + "</span>" + '</i>';
                                }
        
                                return total + invoiceStatus;
                            }
                        },
                        {
                            field: 'eftNumber',
                            title: cbp.invoicesPage.globalVars.eftNumber,
                            titleTooltip: cbp.invoicesPage.globalVars.eftNumber,
                            class: 'text-nowrap',
                            sortable: true,
                            formatter: function LinkFormatter(value, row, index) {
                                    return '<a href="javascript:void(0);" onclick="goToEftDetails(\'' + value+ '\')">' + value + '</a>';
                            }
                        },
                        {
                            field: 'deliveryDate',
                            title: cbp.invoicesPage.globalVars.deliveryDate,
                            titleTooltip: cbp.invoicesPage.globalVars.deliveryDate,
                            class: 'text-nowrap',
                            sortable: true                    
                        },{
                            field: 'altReferenceNumber',
                            title: cbp.invoicesPage.globalVars.altReferenceNumber + '<br> <i>' + cbp.invoicesPage.globalVars.originalDocumentNumber + '</i>',
                            titleTooltip: cbp.invoicesPage.globalVars.altReferenceNumber,
                            class: 'numberIcon text-nowrap',
                            sortable: true,
                            formatter: function LinkFormatter(value, row, index) {
                                var originalDocumentNumber = '<br><i>'+row.originalDocumentNumber+'</i>'; 
                                return row.altReferenceNumber + originalDocumentNumber;
                            }
                        }
                        ];
            var columnsListMap = columnsList.reduce(function (data, columnsList) {
            data[columnsList.field] = columnsList;
            return data;
            }, {});
            if(!cbp.invoicesPage.isNARegion)
                var orderKey = ["checkbox", "status","location", "invoiceDate", "invoiceId","type","orderId","total"];
            else
                var orderKey = ["checkbox", "status","location", "invoiceDate", "invoiceId", "type", "deliveryDate", "total", "altReferenceNumber", "eftNumber"]
          
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

        var populatingTable = function (invoicesData, columnsDataList) {
            var invoiceStatusCount = 0;
            if (invoicesData.resultCount > maxResults && invoicesData.invoiceList === null) {
                cbp.invoicesPage.globalVars.tableLocales.noMatches = cbp.invoicesPage.globalVars.noMatchesMaxResults.replace('{0}', invoicesData.resultCount);
                invoicesData.invoiceList = [];
            } else if (invoicesData.resultCount === 0) {
                cbp.invoicesPage.globalVars.tableLocales.noMatches = cbp.invoicesPage.globalVars.noMatches;
            } else if (invoicesData.resultCount > maxResults && allInvoiceFlow != "true") {
                cbp.invoicesPage.globalVars.tableLocales.noMatches = cbp.invoicesPage.globalVars.noMatchesMaxResults.replace('{0}', invoicesData.resultCount);
                invoicesData.invoiceList = [];
            }

            if (invoicesData.invoiceList === null || invoicesData.invoiceList === undefined) {
                invoicesData.invoiceList = [];
            }
            $(config.sortByDdn).val("invoiceDate-desc").selectpicker('refresh');


            $('#table').bootstrapTable({
                classes: 'table table-no-bordered',
                striped: true,
                uniqueId: 'invoiceId',
                iconsPrefix: 'fa',
                sortable: true,
                parentContainer: ".js-bottom-detail",
                sortByDropdownId: "#sortByDdn",
                responsive: true,
                responsiveBreakPoint: 768,
                responsiveClass: "bootstrap-table-cardview",
                onCheck: function (row, $element) {

                    // enable button
                  
                    selectedInvoices.push(row.invoiceId);
                    selectedProduct.push(row.type);
                    selectedInvoiceStatus.push(row.cbpInvoiceStatus);
                    invoiceTotalSum = invoiceTotalSum + row.total;
                    if (invoiceStatusCodes.indexOf(row.cbpInvoiceStatus) > -1) {
                        invoiceStatusCount = invoiceStatusCount + 1;
                    }
                    if (invoiceStatusCount > 0) {
                        enableInvoiceError = true;
                    }
                    if(invoiceTotalSum <= 0){
                        enableTotalError = true;
                    }else{
                        enableTotalError = false;
                    }
                    enablePrintDownloadButtons();
                },
                onCheckAll: function (rows) {
                    // enable button
                    selectedInvoices = [];
                    selectedProduct = [];
                    selectedInvoiceStatus = [];
                    var len = rows.length;
                    for (var i = 0; i < len; i++) {
                        selectedInvoices.push(rows[i].invoiceId);
                        selectedProduct.push(rows[i].type);
                        selectedInvoiceStatus.push(rows[i].cbpInvoiceStatus);
                        invoiceTotalSum = invoiceTotalSum + rows[i].total;
                        if (invoiceStatusCodes.indexOf(rows[i].cbpInvoiceStatus) > -1) {
                            invoiceStatusCount = invoiceStatusCount + 1;
                        }

                        if (invoiceStatusCount > 0) {
                            enableInvoiceError = true;
                        }

                    }
                    if(invoiceTotalSum <= 0){
                        enableTotalError = true;
                    }
                    if (rows.length) {
                        enablePrintDownloadButtons();
                    }
                },
                onUncheck: function (row, $element) {
                    // write logic..as not sure if all unselected
                    var index = selectedInvoices.indexOf(row.invoiceId);
                    // var index1 = selectedProduct.indexOf(row.type);
                    invoiceTotalSum = invoiceTotalSum - row.total;
                    if (index > -1) {
                        selectedInvoices.splice(index, 1);
                        selectedProduct.splice(index, 1);
                        selectedInvoiceStatus.splice(index, 1);
                    }
                    if (!($(config.tabelRow).hasClass('selected'))) {
                        disablePrintDownloadButtons();
                    }

                    if (invoiceStatusCodes.indexOf(row.cbpInvoiceStatus) > -1) {
                        invoiceStatusCount = invoiceStatusCount - 1;
                    }

                    if (invoiceStatusCount <= 0) {
                        enableInvoiceError = false;
                        $(".js-selected-invoice-error").addClass('hide');
                    }
                    if(invoiceTotalSum >= 0){
                        enableTotalError = false;
                        $(".js-total-amount-error").addClass('hide');
                    }else{
                        enableTotalError = true;
                    }

                    $element.parents("tr").removeClass("bg-danger");
                },
                onUncheckAll: function (rows) {
                    //disable button
                    selectedInvoices = [];
                    selectedProduct = [];
                    selectedInvoiceStatus = [];
                    invoiceStatusCount = 0;
                    invoiceTotalSum = 0;
                    enableInvoiceError = false;
                    enableTotalError = false;
                    $(".js-selected-invoice-error").addClass('hide');
                    $(".js-total-amount-error").addClass('hide');
                    disablePrintDownloadButtons();

                    $("#table tbody").find("tr").removeClass("bg-danger");
                },
                columns: generatingColumns(columnsDataList),
                data: invoicesData.invoiceList
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
    	
        //Localization setup for dropdown & table
        $.fn.selectpicker.defaults = {
            noneSelectedText: cbp.invoicesPage.globalVars.selectDdn.noneSelectedText,
            noneResultsText: cbp.invoicesPage.globalVars.selectDdn.noneResultsText,
            countSelectedText: function (numSelected, numTotal) {
                return (numSelected == 1) ? cbp.invoicesPage.globalVars.selectDdn.itemSelected : cbp.invoicesPage.globalVars.selectDdn.itemSelected1;
            },
            maxOptionsText: function (numAll, numGroup) {
                return [
                    (numAll == 1) ? cbp.invoicesPage.globalVars.selectDdn.limitReached : cbp.invoicesPage.globalVars.selectDdn.limitReached1,
                    (numGroup == 1) ? cbp.invoicesPage.globalVars.selectDdn.groupLimit : cbp.invoicesPage.globalVars.selectDdn.groupLimit1
            ];
            },
            selectAllText: cbp.invoicesPage.globalVars.selectDdn.selectAllText,
            deselectAllText: cbp.invoicesPage.globalVars.selectDdn.deselectAllText
        };

        $.fn.bootstrapTable.locales = {
            formatLoadingMessage: function () {
                return cbp.invoicesPage.globalVars.tableLocales.loadingMessage;
            },
            formatRecordsPerPage: function (pageNumber) {
                return cbp.invoicesPage.globalVars.tableLocales.recordsPerPage.replace('{0}', pageNumber);
            },
            formatShowingRows: function (pageFrom, pageTo, totalRows) {
                return cbp.invoicesPage.globalVars.tableLocales.showingRows.replace('{0}', pageFrom).replace('{1}', pageTo).replace('{2}', totalRows);
            },
            formatSearch: function () {
                return cbp.invoicesPage.globalVars.tableLocales.search;
            },
            formatNoMatches: function () {
                return cbp.invoicesPage.globalVars.tableLocales.noMatches;
            },
            formatPaginationSwitch: function () {
                return cbp.invoicesPage.globalVars.tableLocales.paginationSwitch;
            },
            formatRefresh: function () {
                return cbp.invoicesPage.globalVars.tableLocales.refresh;
            },
            formatToggle: function () {
                return cbp.invoicesPage.globalVars.tableLocales.toggle;
            },
            formatColumns: function () {
                return cbp.invoicesPage.globalVars.tableLocales.columns;
            },
            formatAllRows: function () {
                return cbp.invoicesPage.globalVars.tableLocales.allRows;
            }
        };

        $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales);
        
        leftPaneExpandCollapse.init();
        cbp.invoicesPage.showSoldTo = true;
        cbp.invoicesPage.invoicesResponse = invoicesResponse;
        if (invoicesResponse.resultCount === undefined || invoicesResponse.resultCount === null) {
            cbp.invoicesPage.invoicesResponse.resultCount = 0;
            cbp.invoicesPage.globalVars.invoicesFoundVar = cbp.invoicesPage.globalVars.invoicesFound.replace("{0}", 0);
        } else {
            cbp.invoicesPage.globalVars.invoicesFoundVar = cbp.invoicesPage.globalVars.invoicesFound.replace("{0}", invoicesResponse.resultCount);
        }

        if (invoicesResponse.invoiceList === undefined || invoicesResponse.invoiceList === null) {
            cbp.invoicesPage.invoicesResponse.invoiceList = [];
        }

        if (allInvoiceFlow === "true" ||  (cbp.invoicesPage.invoicesResponse.resultCount > 0 && cbp.invoicesPage.invoicesResponse.resultCount < maxResults) ) {
            cbp.invoicesPage.showDebitCredit = true;
        } else {
            cbp.invoicesPage.showDebitCredit = false;
        }

        cbp.invoicesPage.dateRange.startDate = moment().subtract(pastSelectableDate,'days');
        cbp.invoicesPage.dateRange.endDate = moment();

        if (allInvoiceFlow === "true") {
            cbp.invoicesPage.dateRange.startDate = moment().subtract(cbp.invoicesPage.dateRange.maxMonth, 'month');
        }

        cbp.invoicesPage.globalVars.summaryfromAndToVar = cbp.invoicesPage.globalVars.summaryfromAndTo.replace("{0}", cbp.invoicesPage.dateRange.startDate.format(cbp.invoicesPage.dateRange.format)).replace("{1}", cbp.invoicesPage.dateRange.endDate.format(cbp.invoicesPage.dateRange.format));

        cbp.invoicesPage.isNARegion = isNARegion;        
        
        invoicesPage.init();
        enableMobileDefaultDropDown();

    });

    
});