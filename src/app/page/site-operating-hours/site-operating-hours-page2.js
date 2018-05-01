
var selectedSiteOperating = [];

require(["modernizr",
    "jquery",
    "bootstrap",
    "handlebars",
    "moment",
    "bootstrap-select",
    "bootstrap-table",
    "text!app/components/dropdown/_defaultDdn.hbs",
    "text!app/page/site-operating-hours/searchFormPage2.hbs",
    "text!app/page/site-operating-hours/topSummaryPage2.hbs",
    "text!app/page/site-operating-hours/bottomDetailPage2.hbs"

], function (modernizr, $, bootstrap, Handlebars, moment, bootstrapSelect, bootstrapTable, _defaultDdnHBS, _searchDetailFormHBS, _siteOperatingSummaryHBS, _bottomDetailHBS) {

    //Compiling HBS templates
    var compiledDefaultDdn = Handlebars.compile(_defaultDdnHBS);
    var compiledsearchForm = Handlebars.compile(_searchDetailFormHBS);
    var compiledSiteOperatingSummary = Handlebars.compile(_siteOperatingSummaryHBS);
    var compiledBottomDetail = Handlebars.compile(_bottomDetailHBS);

    var siteOperatingPage = (function () {
        var config = {
            siteOperatingSummaryContainer: ".js-siteoperating-summary",
            searchDetailFormContainer: ".js-search-form",
            bottomDetailContainer: ".js-bottom-detail",
            dropDownCommon: ".selectpicker",
            sortByDdnContainer: ".js-sortbyDdn",
            searchButton: "#siteOperatingSearch",
            downloadBtn: ".js-downloadBtn",
            printBtn: ".js-printBtn",
            backBtn: ".js-backBtn",
            locationDdn: "#locationSelectDdn",
            siteDdn: "#siteSelectDdn",
            downloadStatusDdn: "#downloadStatus",
            printStatusDdn: "#printStatus",
            sortByDdn: "#sortByDdn",
            displaySpinner: ".overlay-wrapper",
            summaryAvgDailyHours: "#summaryAvgDailyHours"
        };

        var init = function () {
            //var summarysite = siteOperatingDetailResponse.summary.site;

            loadingInitialHbsTemplates();

            populatingTable(cbp.siteOperatingPage.siteOperatingDetailResponse.siteOperatingDataList, cbp.siteOperatingPage.siteOperatingDetailResponse.siteOperatingSearchList);
            bindEvents();
        };

        var downloadBtnSelected = function () {
            $('#siteOperatingForm #selectedsiteOperating').val(selectedsiteOperating.toString());
            for (var i = 0; len = selectedsiteOperating.length, i < len; i++) {
                cbp.siteOperatingPage.siteOperatingDetailResponse.siteOperatingDataList[$("tr[data-uniqueid='" + selectedsiteOperating[i] + "']").data("index")].downloaded = true;
            }
            $("#siteOperatingForm").submit();
        };

        var loadingInitialHbsTemplates = function () {
            //Appending handlebar templates to HTML
            $(config.searchDetailFormContainer).html(compiledsearchForm(cbp.siteOperatingPage));
            $(config.siteOperatingSummaryContainer).html(compiledSiteOperatingSummary(cbp.siteOperatingPage));
            $(config.bottomDetailContainer).html(compiledBottomDetail(cbp.siteOperatingPage));
            $(config.sortByDdnContainer).html(compiledDefaultDdn(srtByDdn));
            $(config.sortByDdnContainer).find(config.dropDownCommon).selectpicker('refresh');
            $(config.displaySpinner).hide();
        };

        var downloadForm = function (siteId) {
            var loc = window.location.pathname;
            var formTemplate = "<form id='downloadForm' method='POST' action='" + cbp.siteOperatingPage.globalUrl.siteOperatingDownloadURL + "'><input type='hidden' name='selectedsiteOperating' value='" + siteId + "'/></form>";
            cbp.siteOperatingPage.siteOperatingDetailResponse.siteOperatingDataList[$("tr[data-uniqueid='" + siteId + "']").data("index")].downloaded = true;
            $(formTemplate).appendTo("body").submit().remove();
        };

        var generatingOptions = function (data) {
            if (data == null) {
                return;
            }
            globalSortList = [{
                key: "workingHours-asc",
                value: cbp.siteOperatingPage.globalVars.workingHoursSortAsc
            }, {
                key: "workingHours-desc",
                value: cbp.siteOperatingPage.globalVars.workingHoursSortDesc
            },
            {
                key: "firstTransaction-asc",
                value: cbp.siteOperatingPage.globalVars.firstTransactionSortAsc
            }, {
                key: "firstTransaction-desc",
                value: cbp.siteOperatingPage.globalVars.firstTransactionSortDesc
            },{
                key: "lastTransaction-asc",
                value: cbp.siteOperatingPage.globalVars.lastTransactionSortAsc
            }, {
                key: "lastTransaction-desc",
                value: cbp.siteOperatingPage.globalVars.lastTransactionSortDesc
            },{
                key: "date-asc",
                value: cbp.siteOperatingPage.globalVars.dateSortAsc
            }, {
                key: "date-desc",
                value: cbp.siteOperatingPage.globalVars.dateSortDesc
            }]

            var sortListMap = globalSortList.reduce(function (data, globalSortList) {
                data[globalSortList.key] = globalSortList;
                return data;
            }, {});
            console.log(sortListMap);

            var sortKey = Object.keys(sortListMap).filter(function (key) {
                if (sortListMap[key]) {
                    return sortListMap[key];
                }
            });
            console.log(sortKey);

            var receivedOrderKey = Object.keys(data).filter(function (key) {
                if (data[key]) {
                    return data[key];
                }
            });


            console.log(receivedOrderKey);
            var fnCheck = function fnCheck(item) {
                return receivedOrderKey.indexOf(item.replace(/\-(asc|desc)/, "")) != -1;
            };

            var requestedOptions = sortKey.filter(function (s) {
                return fnCheck(s);
            });
            console.log("fgsdyfgkf", requestedOptions);

            var optionDropdown = [];
            for (i = 0; i < requestedOptions.length; i++) {
                var k = requestedOptions[i];
                console.log(k);
                optionDropdown.push(sortListMap[k]);
            }
            console.log("req res", optionDropdown);
            return optionDropdown;
        }

        var srtByDdn = {
            "options": generatingOptions(siteOperatingDetailResponse.siteOperatingSearchList),
            label: cbp.siteOperatingPage.globalVars.sortBy,
            labelClass: "xs-mr-5",
            name: "sortByDdn",
            display: "displayInline"
        };


        var bindEvents = function () {

            $(document).on("reset-view.bs.table, toggle.bs.table", "#table", function (event) {
                event.stopPropagation();
            });

            $(document).on("click", config.downloadBtn, function () {
                downloadBtnSelected();
            });

            $(document).on("click", config.printBtn, function (e) {
                var win = window.open('', '_blank', 'PopUp' + ',width=1300,height=800');
                win.document.write('\n                <html>\n                    <head>\n                        <meta charset="utf-8">\n                        <meta http-equiv="X-UA-Compatible" content="IE=edge">\n                        <meta name="viewport" content="width=device-width, initial-scale=1">\n                        <link href="/assets/css/custom-bootstrap.css" rel="stylesheet" type="text/css"/>\n                        <link href="/assets/css/app.css" rel="stylesheet" type="text/css"/>\n                        <style>\n   .fixed-table-container {padding-bottom:20px !important;}      .heading-top {display:none;}     .fa{display:none !important;}           .custBody {\n                            background-color: #ffffff;\n                          }\n                        .site-operating-view-headerLabel {\n                            color: #009dd9;\n                            font-weight: bold;\n                                                                                                     font-size: 20px;\n                            margin-left: 22px;\n                                                                                                     padding: 0 0 0px 0;\n                        }\n\t\t\t\t\t\t.table{\n\t\t\t\t\t\t\tmax-width:98%;\n\t\t\t\t\t\t\tmargin-left:20px;\n}\t\n.nav-bottom{\n                                                                                                     border-bottom: none;\n                                                                                      }\n                                                                                      .navbar-brand{\n                                                                                                     \n                                                                                      }\n                                                                                      .fixed-table-body{\n                                                                                                     height:auto !important;\n                                                                                      }\n                        </style>\n                    </head>\n                    <body class="custBody siteoperatinghours-page">\n                        <div class="wrapper">\n                            <header class="main-header main-header-md js-header" style="">\n                                <div class="nav-bottom">\n                                    <nav class="main-navigation js-enquire-offcanvas-navigation" role="navigation">\n                                                                                                                                                \n                                        <div class="row">                                            \n                                                <a class="navbar-brand navbar-left" href="/index.html">\n                                                    <img alt="Brand" src="/assets/images/logo.png">\n                                                    <span>business point</span>\n                                                </a>\n                                                                                                                                                                               <a class="navbar-brand navbar-right" href="/index.html">\n                                                    <img alt="Brand" src="/assets/images/fob-color-rgb.png">                                                    \n                                                </a>\n                                            </div>                                                                                                                                                  \n                                        \n                                    </nav>\n                                </div>\n                            </header>\n                            <div class="col-sm-24">\n                                <p class="page-title site-operating-view-headerLabel">site operating hours</p>\n                            </div>\n                           <div class ="col-xs-24 js-siteoperating-summary" ></div>\n                                                    \n                            \n                        </div>\n                    </body>\n                </html>\n                ');
                var topSummary = $(".top-summary").html()
                win.document.write('<div class="print-summary">'+ topSummary+'</div>');
                win.document.write($(".tableContainer").html());
                var noteData = $(".note-data").html();
                win.document.write('<div class="note-data-val">'+ noteData+'</div>');
            });

            $(document).on("click", config.backBtn, function (e) {
                var url = "/app/page/site-operating-hours/site-operating-hours.html";
                location.href = url;
            });

        };

        var generatingColumns = function (columnsDataList) {
            if (columnsDataList == null) {
                return;
            }
            var receivedOrderKey = Object.keys(columnsDataList).filter(function (key) {
                if (columnsDataList[key]) {
                    return columnsDataList[key];
                }
            });
            console.log("columns to be seen", receivedOrderKey);
            var columnsList = [
                {
                    field: 'date',
                    title: cbp.siteOperatingPage.globalVars.datetb,
                    titleTooltip: cbp.siteOperatingPage.globalVars.datetb,
                    sortable: true,
                    class: "text-wrap",
                }, {
                    field: 'workingHours',
                    title: cbp.siteOperatingPage.globalVars.workingHourstb,
                    titleTooltip: cbp.siteOperatingPage.globalVars.workingHourstb,
                    class: 'numberIcon text-nowrap',
                    sortable: true,
                    align: 'right'
                }, {
                    field: 'firstTransaction',
                    title: cbp.siteOperatingPage.globalVars.firstTransactiontb,
                    titleTooltip: cbp.siteOperatingPage.globalVars.firstTransactiontb,
                    class: 'numberIcon text-nowrap',
                    align: 'right',
                    sortable: true,
                },
                {
                    field: 'lastTransaction',
                    title: cbp.siteOperatingPage.globalVars.lastTransactiontb,
                    titleTooltip: cbp.siteOperatingPage.globalVars.lastTransactiontb,
                    class: "text-nowrap",
                    align: 'right',
                    sortable: true,
                }
            ];
            var columnsListMap = columnsList.reduce(function (data, columnsList) {
                data[columnsList.field] = columnsList;
                return data;
            }, {});

            orderKey = ["date", "workingHours", "firstTransaction", "lastTransaction"]
            console.log("Required order", orderKey);
            var requestedCol = [];
            for (var i = 0; i < orderKey.length; i++) {
                for (var j = 0; j < receivedOrderKey.length; j++) {
                    if (orderKey[i] == receivedOrderKey[j]) {
                        var k = orderKey[i];
                        requestedCol.push(columnsListMap[k]);
                    }
                }

            }
            return requestedCol;
            console.log("Final column order", requestedCol);
        }

        var populatingTable = function (siteOperatingDataList, columnsDataList) {
            if (cbp.siteOperatingPage.siteOperatingDetailResponse.resultCount === 0) {
                cbp.siteOperatingPage.globalVars.tableLocales.noMatches = cbp.siteOperatingPage.globalVars.noMatches;
            } else if (cbp.siteOperatingPage.siteOperatingDetailResponse.resultCount > maxResults) {
                cbp.siteOperatingPage.globalVars.tableLocales.noMatches = cbp.siteOperatingPage.globalVars.noMatchesMaxResults.replace('{0}', cbp.siteOperatingPage.siteOperatingDetailResponse.resultCount);
                siteOperatingDataList = [];
            }

            if (siteOperatingDataList === null || siteOperatingDataList === undefined) {
                siteOperatingDataList = [];
            }
            $(config.sortByDdn).val("date-desc").selectpicker('refresh');


            $('#table').bootstrapTable({
                classes: 'table table-no-bordered',
                striped: true,
                sortName: 'date',
                uniqueId: 'siteId',
                sortOrder: 'desc',
                iconsPrefix: 'fa',
                sortable: true,
                parentContainer: ".js-bottom-detail",
                sortByDropdownId: "#sortByDdn",
                responsive: true,
                responsiveBreakPoint: 768,
                responsiveClass: "bootstrap-table-cardview",
                columns: generatingColumns(columnsDataList),
                data: siteOperatingDataList
            });

        };

        return {
            init: init
        };
    })();

    $(document).ready(function () {
        $.fn.bootstrapTable.locales = {
            formatLoadingMessage: function () {
                return cbp.siteOperatingPage.globalVars.tableLocales.loadingMessage;
            },
            formatRecordsPerPage: function (pageNumber) {
                return cbp.siteOperatingPage.globalVars.tableLocales.recordsPerPage.replace('{0}', pageNumber);
            },
            formatShowingRows: function (pageFrom, pageTo, totalRows) {
                return cbp.siteOperatingPage.globalVars.tableLocales.showingRows.replace('{0}', pageFrom).replace('{1}', pageTo).replace('{2}', totalRows);
            },
            formatSearch: function () {
                return cbp.siteOperatingPage.globalVars.tableLocales.search;
            },
            formatNoMatches: function () {
                return cbp.siteOperatingPage.globalVars.tableLocales.noMatches;
            },
            formatPaginationSwitch: function () {
                return cbp.siteOperatingPage.globalVars.tableLocales.paginationSwitch;
            },
            formatRefresh: function () {
                return cbp.siteOperatingPage.globalVars.tableLocales.refresh;
            },
            formatToggle: function () {
                return cbp.siteOperatingPage.globalVars.tableLocales.toggle;
            },
            formatColumns: function () {
                return cbp.siteOperatingPage.globalVars.tableLocales.columns;
            },
            formatAllRows: function () {
                return cbp.siteOperatingPage.globalVars.tableLocales.allRows;
            }
        };

        $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales);

        leftPaneExpandCollapse.init();
        cbp.siteOperatingPage.showSoldTo = true;
        cbp.siteOperatingPage.siteOperatingDetailResponse = siteOperatingDetailResponse;
        siteOperatingPage.init();


    });


});
