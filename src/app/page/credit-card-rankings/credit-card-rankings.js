        require(["modernizr",
            "jquery",
            "bootstrap",
            "handlebars",
            "bootstrap-select",
            "bootstrap-table",
            "text!app/components/dropdown/_defaultDdn.hbs",
            "text!app/page/credit-card-rankings/searchForm.hbs",
            "text!app/page/credit-card-rankings/reportSummary.hbs",
            "text!app/page/credit-card-rankings/bottomDetail.hbs",
            "text!app/page/credit-card-rankings/retailerRankings.hbs"
        ], function (modernizr, $, bootstrap, Handlebars, bootstrapSelect, bootstrapTable, _defaultDdnHBS, _searchFormHBS, _reportSummaryHBS, _bottomDetailHBS,_retailerRankingsHBS) {
        
            //Compiling HBS templates
            var compiledDefaultDdn = Handlebars.compile(_defaultDdnHBS);
            var compiledsearchForm = Handlebars.compile(_searchFormHBS);
            var compiledreportSummary = Handlebars.compile(_reportSummaryHBS);
            var compiledBottomDetail = Handlebars.compile(_bottomDetailHBS);
            var compiledRetailerRankings = Handlebars.compile(_retailerRankingsHBS);

            var creditCardRanking = (function () {
                var config = {
                    locationDdnContainer: ".js-location-ddn",
                    shipToDdnContainer: ".js-shipTo-ddn",
                    programYearDdnContainer:".js-programYear-ddn",
                    searchFormContainer: ".js-search-form",
                    volSummaryContainer: ".js-volume-summary",
                    searchDetailContainer: ".js-bottom-detail",
                    retailerRankingsContainer:".js-retailer-rankings",
                    dropDownCommon: ".selectpicker",
                    searchButton: "#pvSearch",
                    displaySpinner: ".overlay-wrapper",
                };
                
                var enableMobileDefaultDropDown = function() {
                    //Enable mobile scrolling by calling $('.selectpicker').selectpicker('mobile'). This enables the device's native menu for select menus.
                    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
                        $('.selectpicker').selectpicker('mobile');
                    }
                };
              
                var init = function () {
                    loadingInitialHbsTemplates();
                    bindEvents();
                    enableMobileDefaultDropDown();
                };
                 
                var optionsYear=[];
                for (var i = 0; i < programYearDropDown.length; i++) {
                    var obj = {};
                    obj["key"] = programYearDropDown[i].uid;
                    obj["value"] = programYearDropDown[i].displayName;
                    optionsYear.push(obj);
                }
                cbp.ccrPage.programYearDropDown["options"] = optionsYear;
                cbp.ccrPage.programYearDropDown.searchable = true;

                
                var loadingInitialHbsTemplates = function () {
                    //Appending handlebar templates to HTML
                    $(config.searchFormContainer).html(compiledsearchForm(cbp.ccrPage));
                    $(config.programYearDdnContainer).html(compiledDefaultDdn(cbp.ccrPage.programYearDropDown));
                    cbp.ccrPage.summary = {};
                    cbp.ccrPage.summary.programYear = ccrSearchReponse.programYear;
                
                    //Refresh dropdown at initial dispaly after loading templates
                    $(config.dropDownCommon).selectpicker('refresh');
                    enableMobileDefaultDropDown();
                    loadingDynamicHbsTemplates();
                    $(config.displaySpinner).hide();
                };
        
                var loadingDynamicHbsTemplates = function () {
                    $(config.volSummaryContainer).html(compiledreportSummary(cbp.ccrPage));
                    $(config.searchDetailContainer).html(compiledBottomDetail(cbp.ccrPage));
                    $(config.retailerRankingsContainer).html(compiledRetailerRankings(cbp.ccrPage));
                    enableMobileDefaultDropDown();
                };

                var bindEvents = function () {
                    populatingTable(cbp.ccrPage.ccrSearchReponse.marketerRankingsDataList);
                    populatingRetailerTable(cbp.ccrPage.ccrSearchReponse.retailerRankingsDataList);
                    //Search button functionality
                    $(config.searchButton).on("click", function (e) {
                        if (!$(this).attr('disabled')) {
                            triggerAjaxRequest();
                        }
                    });
                    var valueOnSubmit = '.js-search-form input' + ","  + config.programYearDdnContainer + "";
                    
                    $(document).on('keypress', valueOnSubmit, function (e) {
                        if (e.which == 13) {
                            e.preventDefault();
                            $(config.searchButton).trigger("click");
                        }
                    });
                };
        
                var triggerAjaxRequest = function () {
                    console.log("InsideAjax");
                    loadingDynamicHbsTemplates();
                    $(config.displaySpinner).show();
                    $(config.volSummaryContainer).hide();
                    $(config.searchDetailContainer).hide();
                    $(config.retailerRankingsContainer).hide();
                    leftPaneExpandCollapse.hideSearchBar();
                    function successCallback(data) {
                        $(config.displaySpinner).hide();
                        $(config.volSummaryContainer).show();
                        $(config.searchDetailContainer).show();
                        $(config.retailerRankingsContainer).show();
                        cbp.ccrPage.ccrSearchReponse = data;
                        loadingDynamicHbsTemplates();
                        populatingTable(cbp.ccrPage.ccrSearchReponse.marketerRankingsDataList);
                        populatingRetailerTable(cbp.ccrPage.ccrSearchReponse.retailerRankingsDataList);
                        leftPaneExpandCollapse.resetSearchFormHeight();
                        enableMobileDefaultDropDown();
                    }
        
                    function errorCallback() {
                        $(config.displaySpinner).hide();
                        $(config.volSummaryContainer).show();
                        $(config.searchDetailContainer).show();
                        $(config.retailerRankingsContainer).show();
                        console.log("error");
                    }
        
                    $.ajax({
                        type: cbp.ccrPage.globalUrl.method,
                       // 'CSRFToken':CSRFToken,
                        // data: postData,
                        url: cbp.ccrPage.globalUrl.pvPostURL,
                        success: successCallback,
                        error: errorCallback
                    });
        
                };
        
                var populatingTable = function (marketerRankingsDataList) {
                    if (marketerRankingsDataList === null || marketerRankingsDataList === undefined) {
                        marketerRankingsDataList = [];
                    }
                    $('#table').bootstrapTable({
                        classes: 'table table-no-bordered',
                        striped: true,
                        iconsPrefix: 'fa',
                        parentContainer: ".js-bottom-detail",
                        undefinedText: "",
                        responsive: true,
                        responsiveBreakPoint: 480,
                        responsiveClass: "bootstrap-table-cardview",
                        columns: [{
                            field: 'marketer',
                            title: cbp.ccrPage.globalVars.marketer ,
                            titleTooltip: cbp.ccrPage.globalVars.marketer,
                            class: 'numberIcon text-wrap',
                            cellStyle: 'xs-pl-10',
                            width : '30%'
                        }, {
                            field: 'averageSubmittals',
                            title: cbp.ccrPage.globalVars.averageSubmittals,
                            titleTooltip: cbp.ccrPage.globalVars.averageSubmittals,
                            align:'right',
                            width : '13%'
                        }, {
                            field: 'nationwideRankings',
                            title: cbp.ccrPage.globalVars.nationwideRankings,
                            titleTooltip: cbp.ccrPage.globalVars.nationwideRankings,
                            class: 'numberIcon',
                            align: 'right',
                            width : '13%'
                         },
                         {
                            field: '',
                            class:'hidden-xs',
                            width:'10%'
                        }
                    
                    ],
                        data: marketerRankingsDataList
                    });
                    };

                var populatingRetailerTable = function (retailerRankingsDataList) {
                    if (retailerRankingsDataList === null || retailerRankingsDataList === undefined) {
                        retailerRankingsDataList = [];
                    }
                    $('#retailertable').bootstrapTable({
                        classes: 'table table-no-bordered',
                        striped: true,
                        iconsPrefix: 'fa',
                        parentContainer: ".js-retailer-rankings",
                        undefinedText: "",
                        responsive: true,
                        responsiveBreakPoint: 480,
                        responsiveClass: "bootstrap-table-cardview",
                        columns: [{
                            field: 'retailer',
                            title: cbp.ccrPage.globalVars.retailer ,
                            titleTooltip: cbp.ccrPage.globalVars.retailer,
                            class: 'numberIcon text-wrap',
                            cellStyle: 'xs-pl-10',
                            
                            width : '30%'
                        }, {
                            field: 'totalApprovals',
                            title: cbp.ccrPage.globalVars.totalApprovals,
                            titleTooltip: cbp.ccrPage.globalVars.totalApprovals,
                            align:'right',
                            width : '13%'
                        }, {
                            field: 'nationwideRankings',
                            title: cbp.ccrPage.globalVars.nationwideRankings,
                            titleTooltip: cbp.ccrPage.globalVars.nationwideRankings,
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
                    noneSelectedText: cbp.ccrPage.globalVars.selectDdn.noneSelectedText,
                    noneResultsText: cbp.ccrPage.globalVars.selectDdn.noneResultsText,
                    countSelectedText: function (numSelected, numTotal) {
                        return (numSelected == 1) ? cbp.ccrPage.globalVars.selectDdn.itemSelected : cbp.ccrPage.globalVars.selectDdn.itemSelected1;
                    },
                    maxOptionsText: function (numAll, numGroup) {
                        return [
                            (numAll == 1) ? cbp.ccrPage.globalVars.selectDdn.limitReached : cbp.ccrPage.globalVars.selectDdn.limitReached1,
                            (numGroup == 1) ? cbp.ccrPage.globalVars.selectDdn.groupLimit : cbp.ccrPage.globalVars.selectDdn.groupLimit1
                        ];
                    },
                    selectAllText: cbp.ccrPage.globalVars.selectDdn.selectAllText,
                    deselectAllText: cbp.ccrPage.globalVars.selectDdn.deselectAllText
                };
        
                $.fn.bootstrapTable.locales = {
                    formatLoadingMessage: function () {
                        return cbp.ccrPage.globalVars.tableLocales.loadingMessage;
                    },
                    formatRecordsPerPage: function (pageNumber) {
                        return cbp.ccrPage.globalVars.tableLocales.recordsPerPage.replace('{0}', pageNumber);
                    },
                    formatShowingRows: function (pageFrom, pageTo, totalRows) {
                        return cbp.ccrPage.globalVars.tableLocales.showingRows.replace('{0}', pageFrom).replace('{1}', pageTo).replace('{2}', totalRows);
                    },
                    formatSearch: function () {
                        return cbp.ccrPage.globalVars.tableLocales.search;
                    },
                    formatNoMatches: function () {
                        return cbp.ccrPage.globalVars.tableLocales.noMatches;
                    },
                    formatPaginationSwitch: function () {
                        return cbp.ccrPage.globalVars.tableLocales.paginationSwitch;
                    },
                    formatRefresh: function () {
                        return cbp.ccrPage.globalVars.tableLocales.refresh;
                    },
                    formatToggle: function () {
                        return cbp.ccrPage.globalVars.tableLocales.toggle;
                    },
                    formatColumns: function () {
                        return cbp.ccrPage.globalVars.tableLocales.columns;
                    },
                    formatAllRows: function () {
                        return cbp.ccrPage.globalVars.tableLocales.allRows;
                    }
                };
        
                $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales);
        
                leftPaneExpandCollapse.init();
        
                //Global Object manipulations
                cbp.ccrPage.ccrSearchReponse = ccrSearchReponse;
                if (ccrSearchReponse.marketerRankingsDataList === undefined) {
                    cbp.ccrPage.ccrSearchReponse.marketerRankingsDataList = [];
                }
                if (ccrSearchReponse.retailerRankingsDataList === undefined) {
                    cbp.ccrPage.ccrSearchReponse.retailerRankingsDataList = [];
                }
                creditCardRanking.init();
            });
        });
        