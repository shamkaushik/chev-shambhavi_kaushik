/*
const $ = require("jquery");
const bootstrap = require("bootstrap");
const Handlebars= require("handlebars");

$(document).on('click', function(){
    alert('Clicked');
});
*/

const modernizr = require("modernizr");
const $ = require("jquery");
const bootstrap = require("bootstrap");
const Handlebars= require("handlebars");
const bootstrapTable = require("bootstrap-table");
const bootstrapSelect = require("bootstrap-select");

/*
const _defaultDdnHBS = require("./app/components/dropdown/_defaultDdn.hbs");
const _searchFormHBSs= require("./app/page/report-1099/searchForm.hbs");
const _bottomDetailHBS = require("./app/page/report-1099/bottomDetail.hbs");
const _reportSummaryHBS = require("./app/page/report-1099/reportSummary.hbs");
*/

    //Compiling HBS templates
    var compiledDefaultDdn = Handlebars.compile(_defaultDdnHBS);
    var compiledsearchForm = Handlebars.compile(_searchFormHBS);
    var compiledBottomDetail = Handlebars.compile(_bottomDetailHBS);
    var compiledReportSummary = Handlebars.compile(_reportSummaryHBS);

    var report1099page = (function() {

        var selectedRow = [];
        var downloadedReportList = [];
        
        var config = {
            headerContainer: ".js-header",
            footerContainer: ".js-footer",
            dropDownCommon: ".selectpicker",
            searchFormContainer: ".js-search-form",
            searchDetailContainer: ".js-bottom-detail",
            displaySpinner: ".overlay-wrapper",
            accountDdnContainer: ".js-account-ddn",
            yearDdnContainer: ".js-year-ddn",
            qtrDdnContainer: ".js-qtr-ddn",
            dnldStatusDdnContainer: ".js-download-status-ddn",
            reportSummaryContainer: ".js-report-summary",
            soldToDdnContainer:".js-soldTo-ddn",
            soldToDdn: "#soldToSelectDdn",
            accountDdn: "#accountSelectDdn",
            yearDdn: "#yearSelectDdn",
            quarterDdn: "#qtrSelectDdn",
            downloadStatusDdn: "#dnldStatusSelectDdn",
            searchBtn: "#searchBtn",
            downloadBtn: "#downloadBtn",
            downloadIcon: ".report-download-icon"
        };

        var enableDownloadButton = function () {
            $(config.downloadBtn).removeAttr('disabled', 'disabled');
        };

        var disableDownloadButton = function () {
            $(config.downloadBtn).attr('disabled', 'disabled');
        };

        var replaceZeroDash = function(checkValue){
            if(checkValue === "0" || checkValue === "0.00" || checkValue === "")
                return '-';
            else
                return checkValue;
        };


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

        var populateSoldToDropdown = function(){
            var options = [];
            options = soldToDropdown.map(function(val, index){
                return {
                    key: val.uid,
                    value: val.displayName
                }
            });
            if(options.length>1)
            {
                options.unshift({key:"all",value:cbp.report1099Page.globalVars.allTb});
            }
            cbp.report1099Page.soldToDropDown["options"] = options;
        }

        var populateAccountDropdown = function(soldTo, pageLoadCheck){
        	var postData = {};
            if(pageLoadCheck && soldToDropdown.length>1)
            {
            	postData.soldToNumber = "all";
            }
            else
        	{
            	postData.soldToNumber = soldTo;
        	}
            $.when(triggerAjaxRequest(postData, cbp.report1099Page.globalUrl.method, cbp.report1099Page.globalUrl.accountDdnURL, "application/x-www-form-urlencoded")).then(function(response){
                var options = [];
                options = response.map(function(val, index){
                    return {
                        key: val.uid,
                        value: val.displayName,
                        isInGracePeriod : val.inGracePeriod ? val.inGracePeriod : false
                    }
                });
                if(options.length>1)
                {
                    options.unshift({key:"all",value:cbp.report1099Page.globalVars.allTb});
                }
            cbp.report1099Page.accountDropDown["options"] = options;
                $(config.accountDdnContainer).html(compiledDefaultDdn(cbp.report1099Page.accountDropDown));
                $(config.accountDdn).selectpicker('refresh');
                if(pageLoadCheck)
                	{
                		search();
        }
                $(config.displaySpinner).hide();
            });

        }


        var populateYearDropDown = function(){
            var options = [];
            options = yearDropdown.map(function(val, index){
                return {
                    key: val,
                    value: val
                }
            });
            cbp.report1099Page.yearDropDown["options"] = options;
        }

        var populateQuarterDropDown = function(quarterDdn, selectedQuarter){
            var options = [];
            options = quarterDdn.map(function(val, index){
                return {
                    key: val,
                    value: val
                }
            });
            cbp.report1099Page.qtrDropDown["options"] = options;
            cbp.report1099Page.qtrDropDown.title = selectedQuarter;
        }


        var populatedownloadDropDown = function(){
            var options = [];
            options = quarterDropdown.map(function(val, index){
                return {
                    key: val,
                    value: val
                }
            });
            cbp.report1099Page.qtrDropDown["options"] = options;
        }

        var loadingInitialHbsTemplates = function() {
            //Appending handlebar templates to HTML
            $(config.searchFormContainer).html(compiledsearchForm(cbp.report1099Page));
            loadingDynamicHbsTemplates();
            $(config.displaySpinner).hide();
        };

        var loadingDynamicHbsTemplates = function() {
            $(config.searchDetailContainer).html(compiledBottomDetail(cbp.report1099Page));
            $(config.reportSummaryContainer).html(compiledReportSummary(cbp.report1099Page));
            $(config.soldToDdnContainer).html(compiledDefaultDdn(cbp.report1099Page.soldToDropDown));
            $(config.accountDdnContainer).html(compiledDefaultDdn(cbp.report1099Page.accountDropDown));
            $(config.yearDdnContainer).html(compiledDefaultDdn(cbp.report1099Page.yearDropDown));
            $(config.qtrDdnContainer).html(compiledDefaultDdn(cbp.report1099Page.qtrDropDown));
            $(config.dnldStatusDdnContainer).html(compiledDefaultDdn(cbp.report1099Page.downloadStatusDropDown));
            $(config.dropDownCommon).selectpicker('refresh');
            enableMobileDefaultDropDown();
        };

        var enableMobileDefaultDropDown = function() {
            //Enable mobile scrolling by calling $('.selectpicker').selectpicker('mobile'). This enables the device's native menu for select menus.
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
                $(config.dropDownCommon).selectpicker('mobile');
            }
        };

        var getMonthsToShow = function(){
            var monthsToShow = [];
             for(key in cbp.report1099Page.searchResponse.netAmountForSites){
            	 if(cbp.report1099Page.searchResponse.netAmountForSites[key])
                    monthsToShow.push(key);
                }
            return monthsToShow;
        }

        var getTableData = function(){
            var tableData = [];
            cbp.report1099Page.searchResponse.items.map(function(val, index){
                var dataRow =  {
                    site: val.site,
                    yearToDate: val.yearToDate,
                    status: val.status,
                    downloadStatus: val.downloadStatus,
                    siteId: val.siteId
                }
                for (var key in val.amountForSite) {
                    dataRow[key] = val.amountForSite[key];
                }
                tableData.push(dataRow);
            });
            return tableData;
        };

        var getTableColumns = function(){

        	var columnsOrder = ["checkbox", "status", "site", "amountForSite", "yearToDate"];
            var columnsToShow = [];
            var monthsToShow = getMonthsToShow();
            var currency = " (" + ten99SearchCurrency + ")";
            
            //declaring table columns
            var reportTableColumns = [{
                    field: 'checkbox',
                    checkbox: true,
                    class: ''
                },{
                    field: 'status',
                    title: cbp.report1099Page.globalVars.status,
                    titleTooltip: cbp.report1099Page.globalVars.status,
                    class: 'text-nowrap text-center site-status',
                    formatter: function(value, row, index) {
                        var downloadReport;
                        if(row.downloadStatus){
                            downloadReport = "<span class='fa fa-download text-success report-download-icon' data-siteid='"+row.siteId+"'></span>";
                        } else{
                            downloadReport = "<span class='fa fa-download report-download-icon' data-siteid='"+row.siteId+"'></span>";
                        }
                        //return downloadReport;
                        return "<span class='fa fa-download report-download-icon' data-siteid='"+ row.siteId +"'></span>";
                    }
                },
                    {
                    field: 'site',
                    title: cbp.report1099Page.globalVars.site,
                    titleTooltip: cbp.report1099Page.globalVars.site,
                    sortable: true,
                    class: 'site-name',
                    footerFormatter: function(){
                        return "<span><strong>"+cbp.report1099Page.globalVars.total+"</strong></span>";
                    }
                }, {
                    field: monthsToShow[0],
                    title: cbp.report1099Page.globalVars[monthsToShow[0]] +currency,
                    class: 'text-right',
                    formatter: function(value, row, index){
                        return replaceZeroDash(value);
                    },
                    footerFormatter: function(){
                        return "<span><strong>"+replaceZeroDash(cbp.report1099Page.searchResponse.netAmountForSites[monthsToShow[0]])+"</strong></span>";
                    }
                },{
                    field: monthsToShow[1],
                    title: cbp.report1099Page.globalVars[monthsToShow[1]] +currency,
                    class: 'text-right',
                    formatter: function(value, row, index){
                        return replaceZeroDash(value);
                    },
                    footerFormatter: function(){
                        return "<span><strong>"+replaceZeroDash(cbp.report1099Page.searchResponse.netAmountForSites[monthsToShow[1]])+"</strong></span>";
                    }
                },{
                    field: monthsToShow[2],
                    title: cbp.report1099Page.globalVars[monthsToShow[2]] +currency,
                    class: 'text-right',
                    formatter: function(value, row, index){
                        return replaceZeroDash(value);
                    },
                    footerFormatter: function(){
                        return "<span><strong>"+replaceZeroDash(cbp.report1099Page.searchResponse.netAmountForSites[monthsToShow[2]])+"</strong></span>";
                    }
                }, {
                    field: 'yearToDate',
                    title: cbp.report1099Page.globalVars.yearToDate +currency,
                    class: 'text-right',
                    footerFormatter: function(){
                        return "<span><strong>"+cbp.report1099Page.searchResponse.yearToDate+"</strong></span>";
                    }
                }];

            
            for(var i=0;i<columnsOrder.length;i++){
                for(key in cbp.report1099Page.searchResponse.reportSearchDataListMapping){
                    if(columnsOrder[i] == key && cbp.report1099Page.searchResponse.reportSearchDataListMapping[key]){
                        columnsToShow.push(columnsOrder[i]);
                    }
                }
            }


            //replacing the value months with actual months in columns to show
            var indexOfMonth = columnsToShow.indexOf('amountForSite');
            columnsToShow.splice.apply(columnsToShow, [indexOfMonth, 0].concat(monthsToShow));

            //mapping declared table columns to columsToShow and filtering out falsy values if any
            var tableColumns = columnsToShow.map(function(value){
                for(var i=0;i<reportTableColumns.length;i++){
                    if(reportTableColumns[i].field === value){
                        return reportTableColumns[i];
                    }
                }
            }).filter(function(value){
                return value;
            });

            return tableColumns;
        };

        var getMobileFooterTableData = function(){
            var mobileTableFooterData = [];
            var dataObj = {
                yearToDate: cbp.report1099Page.searchResponse.yearToDate
            };
            dataObj = Object.assign(dataObj,cbp.report1099Page.searchResponse.netAmountForSites);
            mobileTableFooterData.push(dataObj);
            return mobileTableFooterData;
        }

        var getMobileFooterTableColumns = function(){
            var mobileMonthsToShow = getMonthsToShow()
            var currency = " (" + ten99SearchCurrency + ")";

            var mobileFooterTableColumns =  [{
                field: 'site',
                title: cbp.report1099Page.globalVars.total,
                class: 'site-total',
            }, {
                field: mobileMonthsToShow[0],
                title: cbp.report1099Page.globalVars[mobileMonthsToShow[0]] +currency,
                class: 'text-right',
            },{
                field: mobileMonthsToShow[1],
                title: cbp.report1099Page.globalVars[mobileMonthsToShow[1]] +currency,
                class: 'text-right',
            },{
                field: mobileMonthsToShow[2],
                title: cbp.report1099Page.globalVars[mobileMonthsToShow[2]] +currency,
                class: 'text-right',
            }, {
                field: 'yearToDate',
                title: cbp.report1099Page.globalVars.yearToDate +currency,
                class: 'text-right',
            }];

            return mobileFooterTableColumns;
        }

        var populatingTable = function(tablecol, tabledata){
            $('#table').bootstrapTable({
                classes: 'table table-no-bordered',
                striped: true,
                iconsPrefix: 'fa',
                uniqueId: 'siteId',
                sortName: 'site',
                sortOrder: 'asc',
                parentContainer: ".js-bottom-detail",
                responsive: true,
                responsiveBreakPoint: 768,
                responsiveClass: "bootstrap-table-cardview",
                undefinedText: "",
                showFooter: true,
                columns: getTableColumns(),
                data: getTableData(),
                onCheck: function(row,$element){
                    selectedRow.push(row.siteId);
                    enableDownloadButton();
                },
                onCheckAll: function(row){
                    selectedRow = [];
                    for(var i=0;i<row.length;i++){
                        selectedRow.push(row[i].siteId);
                    }
                    if (row.length) {
                        enableDownloadButton();
                    }

                },
                onUncheck: function(row,$element){
                    var siteIndex = selectedRow.indexOf(row.siteId);
                    if (siteIndex !== -1) selectedRow.splice(siteIndex, 1);
                    disableDownloadButton();
                },
                onUncheckAll: function(row){
                    for(var i=0;i<row.length;i++){
                        var siteIndex = selectedRow.indexOf(row[i].siteId);
                        if (siteIndex !== -1) selectedRow.splice(siteIndex, 1);
                    }
                    if (!($(config.tabelRow).hasClass('selected'))) {
                        disableDownloadButton();
                    }
                },
                onResetView: function(){
                    //maintain/persist checked in checkbox during reset view
                    for(var i=0;i<selectedRow.length; i++){
                        $("input[value="+ selectedRow[i] +"]").attr("checked","checked");
                    } 
                    //maintain/persist checked in select all checkbox during reset view
                    if(selectedRow.length == getTableData().length){
                        $('input[name="btSelectAll"]').attr("checked","checked");
                    }
                    //maintain/persist green color for downloaded reports
                    for(var i=0;i<downloadedReportList.length;i++){
                        var downloadedElement = $('.report-download-icon').find("[data-siteid="+downloadedReportList[i]+"]");
                        console.log(downloadedReportList);
                        console.log(downloadedElement);
                    }
                }
            });
        }
        
        var populatingMobileTableFooter = function(){
            $('#tableFooter').bootstrapTable({
                classes: 'table table-no-bordered',
                striped: true,
                iconsPrefix: 'fa',
                responsive: true,
                responsiveBreakPoint: 768,
                parentContainer: ".js-bottom-detail",
                responsiveClass: "bootstrap-table-cardview",
                undefinedText: "",
                cardView: true,
                columns: getMobileFooterTableColumns(),
                data: getMobileFooterTableData()
            });
        }

        var search = function(){
            var postData = {};
            
            if($(config.soldToDdn).val()){
                postData.soldTo = $(config.soldToDdn).val();
            }
            
            if($(config.accountDdn).val()){
                postData.account = $(config.accountDdn).val();
            }
            if($(config.yearDdn).val()){
                postData.year = $(config.yearDdn).val();
            }
            $(config.quarterDdn).val() ? postData.quarter = $(config.quarterDdn).val() : postData.quarter = selectedQuarter; 
            if($(config.downloadStatusDdn).val()){
                postData.downloadStatus = $(config.downloadStatusDdn).val();
            }
            postData = JSON.stringify(postData); 
            $.when(triggerAjaxRequest(postData, cbp.report1099Page.globalUrl.method, cbp.report1099Page.globalUrl.searchReportsURL, "application/json")).then(function(response){
                $(config.displaySpinner).hide();
                cbp.report1099Page.searchResponse = response;
                $(config.searchDetailContainer).html(compiledBottomDetail(cbp.report1099Page));
                $(config.reportSummaryContainer).html(compiledReportSummary(cbp.report1099Page));
                populatingTable();
                populatingMobileTableFooter();
                if(cbp.report1099Page.searchResponse.items.length<1){
                    $('.fixed-table-footer').hide();
                    $('#tableFooter').hide();
                }
                disableDownloadButton();
            });
        }

        var downloadReport = function(report){
            if($(config.accountDdn).val()){
                var downloadAccount = $(config.accountDdn).val();
            }
            if($(config.yearDdn).val()){
                var downloadYear = $(config.yearDdn).val();
            }
            
            for (var i = 0; len = report.length, i < len; i++) {
                if (isASM !== true)
                    $(".report-download-icon[data-siteid='" + report[i] + "']").addClass("text-success");
                    cbp.report1099Page.searchResponse.items = cbp.report1099Page.searchResponse.items.filter(function(obj) {
                    if(obj.siteId === report[i])
                        obj.downloadStatus = true;
                    return obj;
                });
            }

            $('#downloadReportForm #account').val(downloadAccount);
            $('#downloadReportForm #year').val(downloadYear);
            $('#downloadReportForm #sites').val(report);
            $('#downloadReportForm').submit();
        }

        var bindEvents = function(){

            $(document).on('click', config.searchBtn, function(e){
                search();
            });

            $(document).on('click', config.downloadBtn, function(e){
                downloadReport(selectedRow);
            });

            $(document).on("reset-view.bs.table,toggle.bs.table","#table",function(event) {
                event.stopPropagation();
                $('#table').bootstrapTable("load", getTableData());
            });

            
            
            $(document).on('click', config.downloadIcon ,function(e){
                var selectedReportId = e.target.getAttribute('data-siteid');
                downloadReport([selectedReportId]);
                if(isASM !== true)
                	$(this).addClass("text-success"); 
            });

            $(document).on('change', config.soldToDdn, function (e) {
                if ($(config.soldToDdn).val() !== "") {
                	$(config.displaySpinner).show();
                    populateAccountDropdown($(config.soldToDdn).val(), false);
                }
            });

            $(document).on('change', config.yearDdn, function(event){
                if($(config.yearDdn).val() === yearDropdown[0])
                    populateQuarterDropDown(quarterDropdown, "Q1");
                else
                    populateQuarterDropDown(quarterDdnAll, "Q1");
                $(config.qtrDdnContainer).html(compiledDefaultDdn(cbp.report1099Page.qtrDropDown));
                $(config.quarterDdn).selectpicker('refresh');
            });

            
        }

        var init = function() {
        	populateSoldToDropdown();
            populateAccountDropdown(soldToDropdown[0].uid, true);
            populateYearDropDown();
            populateQuarterDropDown(quarterDropdown, selectedQuarter);
            loadingInitialHbsTemplates();
            bindEvents();
            disableDownloadButton();
        };

        return {
            init: init
        };
    })();

    $(document).ready(function() {
        report1099page.init();
        leftPaneExpandCollapse.init();
    });