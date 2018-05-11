require(["modernizr",
    "jquery",
    "bootstrap",
    "handlebars",
    "bootstrap-select",
    "bootstrap-table",
    "text!app/components/dropdown/_defaultDdn.hbs",
    "text!app/page/report-1099/searchForm.hbs",
    "text!app/page/report-1099/bottomDetail.hbs",
    "text!app/page/report-1099/reportSummary.hbs",

], function(modernizr, $, bootstrap, Handlebars, bootstrapSelect, bootstrapTable, _defaultDdnHBS, _searchFormHBS, _bottomDetailHBS, _reportSummaryHBS) {

    //Compiling HBS templates
    var compiledDefaultDdn = Handlebars.compile(_defaultDdnHBS);
    var compiledsearchForm = Handlebars.compile(_searchFormHBS);
    var compiledBottomDetail = Handlebars.compile(_bottomDetailHBS);
    var compiledReportSummary = Handlebars.compile(_reportSummaryHBS);

    var report1099page = (function() {
        
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
            accountDdn: "#accountSelectDdn",
            yearDdn: "#yearSelectDdn",
            quarterDdn: "#qtrSelectDdn",
            downloadStatusDdn: "#dnldStatusSelectDdn",
            searchBtn: "#searchBtn"
        };

        var triggerAjaxRequest = function(data,type,url){   
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
                contentType: "application/json",
                dataType:"json",
                url: url,
                success: successCallback,
                error: errorCallback
            });
        };

        var populateAccountDropdown = function(){
            var options = [];
            options = accountDropdown.map(function(val, index){
                return {
                    key: val.uid,
                    value: val.displayName
                }
            });
            cbp.report1099Page.accountDropDown["options"] = options;
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

        var populateQuarterDropDown = function(){
            var options = [];
            options = quarterDropdown.map(function(val, index){
                return {
                    key: val,
                    value: val
                }
            });
            cbp.report1099Page.qtrDropDown["options"] = options;
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

        var getCurrency = function(){
            var currency = "";
            if(cbp.report1099Page.searchResponse.currency){
                currency = " ("+cbp.report1099Page.searchResponse.currency+")";
            }
            return currency;
        }

        var getMonthsToShow = function(){
            var monthsToShow = [];
             for(key in cbp.report1099Page.searchResponse.netAmountForSites){
                monthsToShow.push(key);
            }
            return monthsToShow;
        }

        var getTableData = function(){
            var tableData = [];
            cbp.report1099Page.searchResponse.items.map(function(val, index){
                var dataRow =  {
                    site: val.site,
                    yeartodate: val.yearToDate
                }
                for (var key in val.amountForSite) {
                    dataRow[key] = val.amountForSite[key];
                }
                tableData.push(dataRow);
            });
            return tableData;
        };

        var getTableColumns = function(){
            var columnsToShow = [];
            var monthsToShow = getMonthsToShow();
            var currency = getCurrency();
            
            //declaring table columns
            var reportTableColumns = [{
                    field: 'checkbox',
                    checkbox: true,
                    class: '',
                    formatter:function LinkFormatter(value, row, index){
                        //return '<input type="hidden" name="type" value="'+ row.type + "@" + row.cbpInvoiceStatus +'">';
                        return '<input type="hidden" name="type" value="">';
                    }
                },{
                    field: 'status',
                    title: cbp.report1099Page.globalVars.status,
                    titleTooltip: cbp.report1099Page.globalVars.status,
                    class: 'text-nowrap text-center site-status',
                    formatter: function LinkFormatter(value, row, index) {
                        var downloadReport;

                        var downloaded = "success-icon",
                        //downloadReport = "<span class='fa fa-download xs-pr-10 " + downloaded + "' data-invoiceId='" + row.invoiceId + "'>" + "</span>";
                        downloadReport = "<span class='fa fa-download'></span>";
                        return downloadReport;
                    }
                },
                    {
                    field: 'site',
                    title: cbp.report1099Page.globalVars.site,
                    titleTooltip: cbp.report1099Page.globalVars.site,
                    class: 'site-name',
                    footerFormatter: function(){
                        return "<span><strong>"+cbp.report1099Page.globalVars.total+"</strong></span>";
                    }
                }, {
                    field: monthsToShow[0],
                    title: cbp.report1099Page.globalVars[monthsToShow[0]] +currency,
                    class: 'text-right',
                    footerFormatter: function(){
                        return "<span><strong>"+cbp.report1099Page.searchResponse.netAmountForSites[monthsToShow[0]]+"</strong></span>";
                    }
                },{
                    field: monthsToShow[1],
                    title: cbp.report1099Page.globalVars[monthsToShow[1]] +currency,
                    class: 'text-right',
                    footerFormatter: function(){
                        return "<span><strong>"+cbp.report1099Page.searchResponse.netAmountForSites[monthsToShow[1]]+ "</strong></span>";
                    }
                },{
                    field: monthsToShow[2],
                    title: cbp.report1099Page.globalVars[monthsToShow[2]] +currency,
                    class: 'text-right',
                    footerFormatter: function(){
                        return "<span><strong>"+cbp.report1099Page.searchResponse.netAmountForSites[monthsToShow[2]]+"</strong></span>";
                    }
                }, {
                    field: 'yeartodate',
                    title: cbp.report1099Page.globalVars.yeartodate +currency,
                    class: 'text-right',
                    footerFormatter: function(){
                        return "<span><strong>"+cbp.report1099Page.searchResponse.yearToDate+"</strong></span>";
                    }
                }];
               
            
            for(key in cbp.report1099Page.searchResponse.reportSearchDataListMapping){
                if(cbp.report1099Page.searchResponse.reportSearchDataListMapping[key] === true){
                    columnsToShow.push(key);
                }
            }

            //replacing the value months with actual months in columns to show
            var indexOfMonth = columnsToShow.indexOf('months');
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
                yeartodate: cbp.report1099Page.searchResponse.yearToDate
            };
            dataObj = Object.assign(dataObj,cbp.report1099Page.searchResponse.netAmountForSites);
            mobileTableFooterData.push(dataObj);
            return mobileTableFooterData;
        }

        var getMobileFooterTableColumns = function(){
            var mobileMonthsToShow = getMonthsToShow()
            var currency = getCurrency();

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
                field: 'yeartodate',
                title: cbp.report1099Page.globalVars.yeartodate +currency,
                class: 'text-right',
            }];

            return mobileFooterTableColumns;
        }

        var populatingTable = function(tablecol, tabledata){
            $('#table').bootstrapTable({
                classes: 'table table-no-bordered',
                striped: true,
                iconsPrefix: 'fa',
                parentContainer: ".js-bottom-detail",
                responsive: true,
                responsiveBreakPoint: 768,
                responsiveClass: "bootstrap-table-cardview",
                undefinedText: "",
                showFooter: true,
                columns: getTableColumns(),
                data: getTableData()
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
            
            if($(config.accountDdn).val()){
                postData.account = $(config.accountDdn).val();
            }
            if($(config.yearDdn).val()){
                postData.fiscalYear = $(config.yearDdn).val();
            }
            if($(config.quarterDdn).val()){
                postData.quarter = $(config.quarterDdn).val();
            }
            if($(config.downloadStatusDdn).val()){
                postData.downloadStatus = $(config.downloadStatusDdn).val();
            }

            $.when(triggerAjaxRequest(postData, "GET", cbp.report1099Page.globalUrl.searchReportsURL)).then(function(response){
                $(config.displaySpinner).hide();
                cbp.report1099Page.searchResponse = response;
                $(config.reportSummaryContainer).html(compiledReportSummary(cbp.report1099Page));
                populatingTable();
                populatingMobileTableFooter();
            });
        }

        var bindEvents = function(){
            $(document).on('click', config.searchBtn, function(e){
                search();
            });
        }

        var init = function() {
            populateAccountDropdown();
            populateYearDropDown();
            populateQuarterDropDown();
            loadingInitialHbsTemplates();
            search();
            bindEvents();
        };

        return {
            init: init
        };
    })();

    $(document).ready(function() {
        report1099page.init();
        leftPaneExpandCollapse.init();
    });
});