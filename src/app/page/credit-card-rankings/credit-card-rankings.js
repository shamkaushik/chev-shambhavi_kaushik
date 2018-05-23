

       
        
        require(["modernizr",
            "jquery",
            "bootstrap",
            "handlebars",
            "moment",
            "calendar",
            "bootstrap-select",
            "bootstrap-table",
            //"chartjs",
            "text!app/components/calendar/_calendar.hbs",
            "text!app/components/dropdown/_defaultDdn.hbs",
            "text!app/page/credit-card-rankings/searchForm.hbs",
            "text!app/page/credit-card-rankings/reportSummary.hbs",
            "text!app/page/credit-card-rankings/bottomDetail.hbs",
            "text!app/page/credit-card-rankings/retailerRankings.hbs"
        ], function (modernizr, $, bootstrap, Handlebars, moment, calendar, bootstrapSelect, bootstrapTable,/* Chart,*/ _calendarHBS, _defaultDdnHBS, _searchFormHBS, _reportSummaryHBS, _bottomDetailHBS,_retailerRankingsHBS) {
        
            //Compiling HBS templates
            var compiledDefaultDdn = Handlebars.compile(_defaultDdnHBS);
            var compiledsearchDate = Handlebars.compile(_calendarHBS);
            var compiledsearchForm = Handlebars.compile(_searchFormHBS);
            var compiledreportSummary = Handlebars.compile(_reportSummaryHBS);
            var compiledBottomDetail = Handlebars.compile(_bottomDetailHBS);
            var compiledRetailerRankings = Handlebars.compile(_retailerRankingsHBS);
            
        
            var stationReport = (function () {
                var startDate, endDate;
        
                // var srtByDdn = {
                //     "options": [{
                //         key: "productDescription-asc",
                //         value: cbp.srPage.globalVars.prdctNameAZ
                //     }, {
                //         key: "productDescription-desc",
                //         value: cbp.srPage.globalVars.prdctNameZA
                //     }, {
                //         key: "productCode-asc",
                //         value: cbp.srPage.globalVars.prdctCodeAsc
                //     }, {
                //         key: "productCode-desc",
                //         value: cbp.srPage.globalVars.prdctCodeDesc
                //     }, {
                //         key: "volume-asc",
                //         value: cbp.srPage.globalVars.purchaseVolumeAsc
                //     },
                //     {
                //         key: "volume-desc",
                //         value: cbp.srPage.globalVars.purchaseVolumeDesc
                //     }],
                //     label: cbp.srPage.globalVars.sortBy,
                //     labelClass: "xs-mr-5",
                //     name: "sortByDdn",
                //     display: "displayInline"
                // };
        
                var config = {
                    locationDdnContainer: ".js-location-ddn",
                    shipToDdnContainer: ".js-shipTo-ddn",
                    programYearDdnContainer:".js-programYear-ddn",
                    dateRangeContainer: ".js-search-dateRange",
                    searchFormContainer: ".js-search-form",
                    volSummaryContainer: ".js-volume-summary",
                    searchDetailContainer: ".js-bottom-detail",
                    retailerRankingsContainer:".js-retailer-rankings",
                    sortByDdnContainer: ".js-sortbyDdn",
                    dropDownCommon: ".selectpicker",
                    calendar: "#calendar",
                    searchButton: "#pvSearch",
                    printBtn: "#printBtn",
                    locationDdn: "#locationSelectDdn",
                    shipToDdn: "#shipToSelectDdn",
                    productName: "#productName",
                    sortByDdn: "#sortByDdn",
                    displaySpinner: ".overlay-wrapper",
                    chartBtn: ".js-chartBtn",
                    accountDdnContainer: ".js-account-ddn",
                    accountDdn: "#accountSelectDdn",
                    closeChartBtn: ".js-closeChart"
                };
                
            
                
                var init = function () {
                    loadingInitialHbsTemplates();
                    // populatingCalendarComponent();
                    // if (cbp.srPage.locationDropDown["options"].length == 1) {
                    //     populatingShipTo($(config.locationDdn).val());
                    //     $(config.searchButton).removeAttr("disabled");
                    // } 
                    // else if (cbp.srPage.locationDropDown["options"].length > 1) {
                    //     $(config.shipToDdn).attr("disabled", "disabled").selectpicker('refresh');
                    //     $(config.searchButton).attr("disabled", "disabled");
                    // }
                    //cbp.srPage.shipToDropDown.searchable = false;
                    $(config.locationDdn).selectpicker('refresh');
                    $(config.shipToDdn).selectpicker('refresh');
                   
                    // populatingShipTo($(config.locationDdn).val());
                    populatingTable(cbp.srPage.srSearchResponse.marketerRankingsDataList);
                   
                    bindEvents();
                };
                
                var setSummaryValues = function(){
                    cbp.srPage.summary = {};
                    cbp.srPage.summary.soldTo = $('.js-location-ddn button span').text();
                    cbp.srPage.summary.shipTo = $('.js-shipTo-ddn button span').text();
                    // cbp.srPage.summary.dateRange = $('.js-search-pickDateRange').find('span').text();
                    cbp.srPage.summary.programYear = $('.js-programYear-ddn button span').text();
                };
                
                var optionsLocation = [];
                var optionsYear=[];
                for (var i = 0; i < locationDropDown.length; i++) {
                    var obj = {};
                    obj["key"] = locationDropDown[i].uid;
                    obj["value"] = locationDropDown[i].displayName;
                    optionsLocation.push(obj);
                }
                cbp.srPage.locationDropDown["options"] = optionsLocation;
                cbp.srPage.locationDropDown.searchable = true;
        
                for (var i = 0; i < programYearDropDown.length; i++) {
                    var obj = {};
                    obj["key"] = programYearDropDown[i].uid;
                    obj["value"] = programYearDropDown[i].displayName;
                    optionsYear.push(obj);
                }
                cbp.srPage.programYearDropDown["options"] = optionsYear;
                cbp.srPage.programYearDropDown.searchable = true;
                // if(programYearDropDown.length>1)
                // {
                //     optionsYear.unshift({key:"currentYear",value:cbp.srPage.globalVars.currentYear});
                // }
                
                if(locationDropDown.length>1)
                {
                    optionsLocation.unshift({key:"all",value:cbp.srPage.globalVars.allTb});
                }
               
                var options=[];
                for (var i = 0; i < shipToDropDown.length; i++) {
                    var obj1 = {};
                    obj1["key"] = shipToDropDown[i].uid;
                    obj1["value"] = shipToDropDown[i].displayName;
                    options.push(obj1);
                }
                if(shipToDropDown.length>1)
                {
                    options.unshift({key:"all",value:cbp.srPage.globalVars.allTb});
                }
                cbp.srPage.shipToDropDown["options"] = options;
                cbp.srPage.shipToDropDown.searchable = true;
                
                function enableMobileDefaultDropDown() {
                    //Enable mobile scrolling by calling $('.selectpicker').selectpicker('mobile'). This enables the device's native menu for select menus.
                    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
                        $('.selectpicker').selectpicker('mobile');
                    }
                };
                
                var loadingInitialHbsTemplates = function () {
                    //Appending handlebar templates to HTML
                    $(config.searchFormContainer).html(compiledsearchForm(cbp.srPage));
                    $(config.locationDdnContainer).html(compiledDefaultDdn(cbp.srPage.locationDropDown));
                    $(config.shipToDdnContainer).html(compiledDefaultDdn(cbp.srPage.shipToDropDown));
                    $(config.programYearDdnContainer).html(compiledDefaultDdn(cbp.srPage.programYearDropDown));

                    // $(config.dateRangeContainer).html(compiledsearchDate({
                    //     label: cbp.srPage.globalVars.dateRange,
                    //     iconClass: cbp.srPage.dateRange.iconClass,
                    //     id: cbp.srPage.dateRange.id
                    // }));
                    cbp.srPage.summary = {};
                    cbp.srPage.summary.soldTo = srSearchResponse.soldShipToNormal;
                    cbp.srPage.summary.shipTo = srSearchResponse.site;
                    // cbp.srPage.summary.dateRange = $('.js-search-pickDateRange').find('span').text();
                    cbp.srPage.summary.programYear = srSearchResponse.programYear;
                    
                    loadingDynamicHbsTemplates();
                    
                    //Refresh dropdown at initial dispaly after loading templates
                    $(config.dropDownCommon).selectpicker('refresh');
                    enableMobileDefaultDropDown();
                    $(config.displaySpinner).hide();
                };
        
                var loadingDynamicHbsTemplates = function () {
                    $(config.volSummaryContainer).html(compiledreportSummary(cbp.srPage));
                    $(config.searchDetailContainer).html(compiledBottomDetail(cbp.srPage));
                    $(config.retailerRankingsContainer).html(compiledRetailerRankings(cbp.srPage));
                    // $(config.sortByDdnContainer).html(compiledDefaultDdn(srtByDdn));
                    $(config.sortByDdnContainer).find(config.dropDownCommon).selectpicker('refresh');
                    enableMobileDefaultDropDown();
                };
        
        
                var bindEvents = function () {
                    populatingRetailerTable(cbp.srPage.srSearchResponse.retailerRankingsDataList);
                    //Purchase Volume Search button functionality
                    $(config.searchButton).on("click", function (e) {
                        if (!$(this).attr('disabled')) {
                            triggerAjaxRequest();
                        }
                    });
                    
                    
                    
                    $(document).on("click", config.printBtn, function (e) {
                        var summary =  compiledreportSummary(cbp.srPage);
                        var searchForm=  compiledsearchForm(cbp.srPage);
                        var disclaimerData = $(".disclaimerData").html();
                        var win = window.open('', '_blank', 'PopUp' + new Date().getTime() + ',width=1300,height=800');
                        win.document.write('\n                <html>\n                    <head>\n                        <meta charset="utf-8">\n                        <meta http-equiv="X-UA-Compatible" content="IE=edge">\n                        <meta name="viewport" content="width=device-width, initial-scale=1">\n                        <link href="/assets/css/custom-bootstrap.css" rel="stylesheet" type="text/css"/>\n                        <link href="/assets/css/app-na.css" rel="stylesheet" type="text/css"/>\n                        <style>\n   .js-volume-summary{max-width:98%;margin-top:20px !important; margin-left:20px;} xs-mt-15{margin-top:0px!important;} .disclaimer{margin-left: 20px; font-size: 16px;}.hiddenvolume{display:none;} .bootstrap-table{margin-left:18px; margin-bottom: 15 px; margin-top:15px;} .total-cost-class {font-weight: bold;font-size: 15px;margin-left: 10px;}       .totalCost{text-align : right;padding:5px; 0 0 15px;}             .custBody {\n                            background-color: #ffffff;\n                          }\n                        .station-report-headerLbl {\n                            color: #009dd9;\n                            font-weight: bold;\n                            font-size: 20px;\n                            margin-left: 20px;\n             margin-bottom: -24px;             \tpadding: 0 0 10px 0;\n                        }\n          .bootstrap-table .table.table-no-bordered.table-striped > tbody > tr:nth-of-type(4) {font-weight:bold;  background-color: #dbdcdd;}           .bootstrap-table .table.table-no-bordered.table-striped > tbody > tr:nth-of-type(8) {font-weight:bold;  background-color: #dbdcdd;}   .bootstrap-table .table.table-no-bordered.table-striped > tbody > tr:nth-of-type(9) {font-weight:bold;  background-color: #dbdcdd;}  .bootstrap-table .table.table-no-bordered.table-striped > tbody > tr:nth-of-type(10) {font-weight:bold;  background-color: #dbdcdd;}    .nav-bottom{\n                            border-bottom: none;\n                        }\n                        .navbar-brand{\n                            padding: 30px 0 10px 0;\n                        }\n  .fixed-table-container{padding-bottom:20px !important;}                      .fixed-table-body{\n                            height:auto !important;\n                        }\n                        .fixed-table-body{\n                       \t \theight: auto !important;\n                        }\n                        </style>\n                    </head>\n                    <body class="custBody">\n                        <div class="wrapper">\n                            <header class="main-header main-header-md js-header" style="">\n                                <div class="nav-bottom">\n                                    <nav class="main-navigation js-enquire-offcanvas-navigation" role="navigation">                                                                                                       \n                                        <div class="row">                                           \n                                            <a class="navbar-brand navbar-left" href="/index.html">\n                                                <img alt="Brand" src="/assets/images/logo.png">\n                                                <span>business point</span>\n                                            </a>\n                                            <a class="navbar-brand navbar-right" href="/index.html">                                                                                                                          <a class="navbar-brand navbar-right" href="/index.html">\n                                                <img alt="Brand" src="/assets/images/fob-color-rgb.png">                                                   \n                                             </a>\n                                        </div>                                                                                                                                                 \n                                \n                                    </nav>\n                                </div>\n                            </header>\n                            <div class="col-sm-24">\n                                <h2 class="page-title station-report-headerLbl">station report card</h2>\n                            </div>\n                                                                           \n                            <br>\n                        </div>\n                    </body>\n                </html>\n                ');
                        win.document.write(summary);
                        win.document.write($(".tableContainer").html());
                        win.document.write('<div class="disclaimerData">'+ disclaimerData +'</div>');
                    });
        
                    var valueOnSubmit = '.js-search-form input' + ","  +
                        config.locationDdnContainer + "," + config.shipToDdnContainer + "";
        
                    $(document).on('keypress', valueOnSubmit, function (e) {
                        if (e.which == 13) {
                            e.preventDefault();
                            $(config.searchButton).trigger("click");
                        }
                    });
        
                    //Sold to dropdown change to populate ship to
                    $(config.locationDdn).on('change', function (e) {
                        if ($(config.locationDdn).val() !== "") {
                            $(config.searchButton).removeAttr("disabled");
                        } else {
                            $(config.searchButton).attr("disabled", "disabled");
                        }
                        // populatingShipTo($(config.locationDdn).val());
                    });

                   
        
                    
                    // $(document).on('click', config.retailerRankingsContainer, function (e) {
                    //     $('.bottom-detail').empty();
                    // });
                    $(document).on('change', config.shipToDdn, function (e) {
                        // if ($(this).val() !== "") {
                        //     $(config.searchButton).removeAttr("disabled");
                        // } else {
                        //     $(config.searchButton).attr("disabled", "disabled");
                        // }
                    });
                };
        
                // var populatingShipTo = function () {
                // //     $(config.displaySpinner).show();
        
                //     // function successCallback(data) {
                        
                //     //     $(config.displaySpinner).hide();
        
                //         var shipToOptions = [];
                //         var obj = {};
        
                //         if (data.length == 1) {
                //             cbp.srPage.shipToDropDown.singleOption = true;
                //             // $(config.searchButton).removeAttr("disabled");
                //         }
                //         else if (data.length > 1) {
                //             obj["key"] = "all";
                //             obj["value"] = cbp.srPage.globalVars.allLocation;
        
                //             shipToOptions.push(obj);
                //         }
        
                //         for (var i = 0; i < data.length; i++) {
                //             obj = {};
                //             obj["key"] = data[i].uid;
                //             obj["value"] = data[i].displayName;
                //             shipToOptions.push(obj);
                //         }
        
                //         cbp.srPage.shipToDropDown["options"] = shipToOptions;
                //         cbp.srPage.shipToDropDown.searchable = true;
        
                //         $(config.shipToDdnContainer).html(compiledDefaultDdn(cbp.srPage.shipToDropDown));
        
                //         $(config.shipToDdn).selectpicker('refresh');
        
                //         if (cbp.srPage.shipToDropDown["options"].length > 1) {
                //             $(config.shipToDdn).val('all').selectpicker('refresh');
                //         }
                        //setAccountOptions();
                    //     enableMobileDefaultDropDown();
                    // }
        
                    // function errorCallback() {
                    //     $(config.displaySpinner).hide();
                    //     console.log("error");
                    // }
        
                //     $.ajax({
                //         type: cbp.srPage.globalUrl.method,
                //         data: {
                //             soldToNumber: soldToId,
                //            // CSRFToken:CSRFToken,
                //         },
                //         url: cbp.srPage.globalUrl.shipToURL,
                //         success: successCallback,
                //         error: errorCallback
                //     });
        
                // };

                // var setValueForSoldToShipto = function (soldToShipTo, check) {
                //     if(check){
                //         cbp.srPage.srSearchResponse['soldShipToNormal'] = cbp.srPage.globalVars.allLocation;
                //     }
                //     else{
                //         cbp.srPage.srSearchResponse['soldShipToBlock'] = soldToShipTo.uid;
                //         cbp.srPage.srSearchResponse['soldShipToNormal'] = soldToShipTo.displayName;
                //     }            
                // };
        
                var triggerAjaxRequest = function () {
                    console.log("InsideAjax");
                    loadingDynamicHbsTemplates();
                    $(config.displaySpinner).show();
                    $(config.volSummaryContainer).hide();
                    $(config.searchDetailContainer).hide();
                    $(config.retailerRankingsContainer).hide();

        
                    leftPaneExpandCollapse.hideSearchBar();
                    // var postData = {};
                    // postData.shipTo = $(config.shipToDdn).val() === null ? "null" : $(config.shipToDdn).val().toString();
                    // postData.soldTo = $(config.locationDdn).val() === null ? "null" : $(config.locationDdn).val().toString();
                    // postData.fromDate = startDate;
                    // postData.toDate = endDate;
                    // postData.productName = $(config.productName).val();
                    //postData.CSRFToken = CSRFToken;
        
                    // if ($(config.shipToDdn).val() != 'all') {
                    //     cbp.srPage.showSoldTo = false;
                    // } else {
                    //     cbp.srPage.showSoldTo = true;
                    // }
        
                    function successCallback(data) {
                      
                        $(config.displaySpinner).hide();
                        $(config.volSummaryContainer).show();
                        $(config.searchDetailContainer).show();
                        $(config.retailerRankingsContainer).show();
        
                        cbp.srPage.srSearchResponse = data;
        
        
                        // cbp.srPage.dateRange.startDate = startDate;
                        // cbp.srPage.dateRange.endDate = endDate;
                        // cbp.srPage.srSearchResponse.localizedDateFormat = data.localizedDateFormat.toUpperCase();
                        // if(data.multipleSoldTo){
                        //     setValueForSoldToShipto("all", true);
                        // }
                        // else{
                        //     if (data.shipTo) {
                        //         setValueForSoldToShipto(data.shipTo);
                        //     }
            
                        //     if (data.soldTo) {
                        //         setValueForSoldToShipto(data.soldTo);
                        //     }
                        // }
                        
        
                        // cbp.srPage.globalVars.fromAndToVar = cbp.srPage.globalVars.fromAndTo.replace("{0}", cbp.srPage.dateRange.startDate).replace("{1}", cbp.srPage.dateRange.endDate);
                        
                        //Set the result count before loading dynamic templates
                        if (cbp.srPage.srSearchResponse.resultCount > 0) {
                            cbp.srPage.globalVars.productsFoundVar = cbp.srPage.globalVars.productsFound.replace("{0}", cbp.srPage.srSearchResponse.resultCount);
                        } else {
                            cbp.srPage.globalVars.productsFoundVar = cbp.srPage.globalVars.productsFound.replace("{0}", 0);
                        }
                        setSummaryValues();
                        loadingDynamicHbsTemplates();
                        
                        //Enable buttons after loading dynamic templates
                        if (cbp.srPage.srSearchResponse.resultCount > 0) {
                            $(config.printBtn).removeClass("disabled");
                            $(config.chartBtn).removeClass("disabled");
                        } else {
                            $(config.printBtn).addClass("disabled");
                            $(config.chartBtn).addClass("disabled");
                        }
                      //  setAccountOptions();
                        populatingTable(cbp.srPage.srSearchResponse.marketerRankingsDataList);
                        populatingRetailerTable(cbp.srPage.srSearchResponse.retailerRankingsDataList);
                        leftPaneExpandCollapse.resetSearchFormHeight();
                    }
        
                    function errorCallback() {
                        $(config.displaySpinner).hide();
                        $(config.volSummaryContainer).show();
                        $(config.searchDetailContainer).show();
                        $(config.retailerRankingsContainer).show();
                        console.log("error");
                    }
        
                    $.ajax({
                        type: cbp.srPage.globalUrl.method,
                       // 'CSRFToken':CSRFToken,
                        // data: postData,
                        url: cbp.srPage.globalUrl.pvPostURL,
                        success: successCallback,
                        error: errorCallback
                    });
        
                };
        
                var populatingTable = function (marketerRankingsDataList) {
        
                    if (marketerRankingsDataList === null || marketerRankingsDataList === undefined) {
                        marketerRankingsDataList = [];
                    }
                    $(config.sortByDdn).val("productCode-asc").selectpicker('refresh');
                    // $(config.sortByDdn).selectpicker('refresh');
        
                    $('#table').bootstrapTable({
                        classes: 'table table-no-bordered',
                        striped: true,
                        sortName: 'productCode',
                        sortOrder: 'asc',
                        iconsPrefix: 'fa',
                        sortable: true,
                        parentContainer: ".js-bottom-detail",
                        sortByDropdownId: "#sortByDdn",
                        undefinedText: "",
                        responsive: true,
                        responsiveBreakPoint: 480,
                        responsiveClass: "bootstrap-table-cardview",
                        columns: [{
                            field: 'marketer',
                            title: cbp.srPage.globalVars.marketer ,
                            titleTooltip: cbp.srPage.globalVars.marketer,
                            class: 'numberIcon text-wrap',
                            cellStyle: 'xs-pl-10',
                            
                            width : '30%'
                        }, {
                            field: 'averageSubmittals',
                            title: cbp.srPage.globalVars.averageSubmittals,
                            titleTooltip: cbp.srPage.globalVars.averageSubmittals,
                            align:'right',
                            width : '13%'
                        }, {
                            field: 'nationwideRankings',
                            title: cbp.srPage.globalVars.nationwideRankings,
                            titleTooltip: cbp.srPage.globalVars.nationwideRankings,
                            class: 'numberIcon',
                            align: 'right',
                            width : '13%'
                         },
                    ],
                        data: marketerRankingsDataList
                    });

                    
        
                };
                var populatingRetailerTable = function (retailerRankingsDataList) {
                    $('.bottom-detail').empty();
                    // $('#table').bootstrapTable('destroy');
                    // $('.retailer-rankings').show();
                    if (retailerRankingsDataList === null || retailerRankingsDataList === undefined) {
                        retailerRankingsDataList = [];
                    }
                    $('#retailertable').bootstrapTable({
                        classes: 'table table-no-bordered',
                        striped: true,
                        sortName: 'productCode',
                        sortOrder: 'asc',
                        iconsPrefix: 'fa',
                        sortable: true,
                        parentContainer: ".js-retailer-rankings",
                        sortByDropdownId: "#sortByDdn",
                        undefinedText: "",
                        responsive: true,
                        responsiveBreakPoint: 480,
                        responsiveClass: "bootstrap-table-cardview",
                        columns: [{
                            field: 'retailer',
                            title: cbp.srPage.globalVars.retailer ,
                            titleTooltip: cbp.srPage.globalVars.retailer,
                            class: 'numberIcon text-wrap',
                            cellStyle: 'xs-pl-10',
                            
                            width : '30%'
                        }, {
                            field: 'averageSubmittals',
                            title: cbp.srPage.globalVars.averageSubmittals,
                            titleTooltip: cbp.srPage.globalVars.averageSubmittals,
                            align:'right',
                            width : '13%'
                        }, {
                            field: 'nationwideRankings',
                            title: cbp.srPage.globalVars.nationwideRankings,
                            titleTooltip: cbp.srPage.globalVars.nationwideRankings,
                            class: 'numberIcon',
                            align: 'right',
                            width : '13%'
                         },
                    ],
                        data: retailerRankingsDataList
                    });
                };
        
                return {
                    init: init
                };
            })();
        
            $(document).ready(function () {
        
                //Localization setup for dropdown & table
                $.fn.selectpicker.defaults = {
                    noneSelectedText: cbp.srPage.globalVars.selectDdn.noneSelectedText,
                    noneResultsText: cbp.srPage.globalVars.selectDdn.noneResultsText,
                    countSelectedText: function (numSelected, numTotal) {
                        return (numSelected == 1) ? cbp.srPage.globalVars.selectDdn.itemSelected : cbp.srPage.globalVars.selectDdn.itemSelected1;
                    },
                    maxOptionsText: function (numAll, numGroup) {
                        return [
                            (numAll == 1) ? cbp.srPage.globalVars.selectDdn.limitReached : cbp.srPage.globalVars.selectDdn.limitReached1,
                            (numGroup == 1) ? cbp.srPage.globalVars.selectDdn.groupLimit : cbp.srPage.globalVars.selectDdn.groupLimit1
                        ];
                    },
                    selectAllText: cbp.srPage.globalVars.selectDdn.selectAllText,
                    deselectAllText: cbp.srPage.globalVars.selectDdn.deselectAllText
                };
        
                $.fn.bootstrapTable.locales = {
                    formatLoadingMessage: function () {
                        return cbp.srPage.globalVars.tableLocales.loadingMessage;
                    },
                    formatRecordsPerPage: function (pageNumber) {
                        return cbp.srPage.globalVars.tableLocales.recordsPerPage.replace('{0}', pageNumber);
                    },
                    formatShowingRows: function (pageFrom, pageTo, totalRows) {
                        return cbp.srPage.globalVars.tableLocales.showingRows.replace('{0}', pageFrom).replace('{1}', pageTo).replace('{2}', totalRows);
                    },
                    formatSearch: function () {
                        return cbp.srPage.globalVars.tableLocales.search;
                    },
                    formatNoMatches: function () {
                        return cbp.srPage.globalVars.tableLocales.noMatches;
                    },
                    formatPaginationSwitch: function () {
                        return cbp.srPage.globalVars.tableLocales.paginationSwitch;
                    },
                    formatRefresh: function () {
                        return cbp.srPage.globalVars.tableLocales.refresh;
                    },
                    formatToggle: function () {
                        return cbp.srPage.globalVars.tableLocales.toggle;
                    },
                    formatColumns: function () {
                        return cbp.srPage.globalVars.tableLocales.columns;
                    },
                    formatAllRows: function () {
                        return cbp.srPage.globalVars.tableLocales.allRows;
                    }
                };
        
                $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales);
        
                leftPaneExpandCollapse.init();
        
                //Global Object manipulations
                cbp.srPage.showSoldTo = true;
                cbp.srPage.srSearchResponse = srSearchResponse;
                if (srSearchResponse.resultCount === undefined || srSearchResponse.resultCount === null) {
                    cbp.srPage.globalVars.productsFoundVar = cbp.srPage.globalVars.productsFound.replace("{0}", 0);
                } else {
                    cbp.srPage.globalVars.productsFoundVar = cbp.srPage.globalVars.productsFound.replace("{0}", srSearchResponse.resultCount);
                }
        
                if (srSearchResponse.marketerRankingsDataList === undefined) {
                    cbp.srPage.srSearchResponse.marketerRankingsDataList = [];
                }
                if (srSearchResponse.retailerRankingsDataList === undefined) {
                    cbp.srPage.srSearchResponse.retailerRankingsDataList = [];
                }
        
                // cbp.srPage.dateRange.startDate = moment().subtract(7, 'days');
                // cbp.srPage.dateRange.endDate = moment();
        
                // cbp.srPage.globalVars.fromAndToVar = cbp.srPage.globalVars.fromAndTo.replace("{0}", cbp.srPage.dateRange.startDate.format(cbp.srPage.dateRange.format)).replace("{1}", cbp.srPage.dateRange.endDate.format(cbp.srPage.dateRange.format));
        
                stationReport.init();
                enableMobileDefaultDropDown();
        
            });
        
        });
        