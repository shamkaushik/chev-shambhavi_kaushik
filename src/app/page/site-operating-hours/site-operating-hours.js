var locationDropDownOptions = [];
var siteOperatingObj = {};

locationDropDownOptions = locationDropDown.map(function (val, index) {
    return {
        key: val.uid,
        value: val.displayName
    };
});
if (locationDropDownOptions.length > 1) {
    locationDropDownOptions.unshift({ key: "all", value: "All" });
}
cbp.siteOperatingPage.locationDropDown["options"] = locationDropDownOptions;
cbp.siteOperatingPage.locationDropDown.searchable = true;

var selectedSiteOperating = [];

require(["modernizr",
    "jquery",
    "bootstrap",
    "handlebars",
    "moment",
    "calendar",
    "bootstrap-select",
    "bootstrap-table",
    "text!app/components/dropdown/_defaultDdn.hbs",
    "text!app/page/site-operating-hours/searchForms.hbs",
    "text!app/page/site-operating-hours/topSummary.hbs",
    "text!app/page/site-operating-hours/bottomDetails.hbs"

], function (modernizr, $, bootstrap, Handlebars, moment, calendar, bootstrapSelect, bootstrapTable, _defaultDdnHBS, _searchFormHBS, _siteOperatingSummaryHBS, _sohBottomDetailHBS) {

    //Compiling HBS templates
    var compiledDefaultDdn = Handlebars.compile(_defaultDdnHBS);
    var compiledsearchForm = Handlebars.compile(_searchFormHBS);
    var compiledSiteOperatingSummary = Handlebars.compile(_siteOperatingSummaryHBS);
    var compiledsohBottomDetail = Handlebars.compile(_sohBottomDetailHBS);

    var siteOperatingPage = (function () {
        var config = {
            locationDdnContainer: ".js-location-ddn",
            siteDdnContainer: ".js-site-ddn",
            siteOperatingSummaryContainer: ".js-siteoperating-summary",
            searchFormContainer: ".js-search-form",
            searchDetailContainer: ".js-bottom-detail",
            sortByDdnContainer: ".js-sortbyDdn",
            dropDownCommon: ".selectpicker",
            searchButton: "#siteOperatingSearch",
            downloadBtn: ".js-downloadBtn",
            printBtn: ".js-printBtn",
            locationDdn: "#locationSelectDdn",
            siteDdn: "#siteSelectDdn",
            downloadStatusDdn: "#downloadStatus",
            printStatusDdn: "#printStatus",
            sortByDdn: "#sortByDdn",
            displaySpinner: ".overlay-wrapper",
            summarySoldTo: "#summarySoldTo",
            summarySite: "#summarySite",
            summaryaverage: "#summaryaverage",
            summaryDateRange: "#summaryDateRange",
            summaryAvgDailyHours: "#summaryAvgDailyHours"
        };
        // function to set summary sections value on pafge load
        var setSummaryDetails = function () {
            //soldTo label
            if (cbp.siteOperatingPage.locationDropDown["options"].length == 1) {
                var summarySoldToVal = $('.js-location-ddn .show-as-label').text();
                $(config.summarySoldTo).html(summarySoldToVal);
            } else {
                var summarySoldToVal = $('.js-location-ddn button .pull-left').text();
                $(config.summarySoldTo).html(summarySoldToVal);
            }
            if (accountDropDown.length == 1) {
                var summarySiteVal = $('.js-site-ddn .show-as-label').text();
                $(config.summarySite).html(summarySiteVal);
            } else {
                var summarySiteVal = $('.js-site-ddn button .pull-left').text();
                $(config.summarySite).html(summarySiteVal);
            }
        };

        var init = function () {
            console.log("session soldTo val------",sessionStorage.getItem("soldTo"));
            console.log("session ste---->",sessionStorage.getItem("site"));
            loadingInitialHbsTemplates();
            populatingSiteOnLoad(accountDropDown);
            if(sessionStorage.getItem("soldTo") && sessionStorage.getItem("site")){
                $(config.locationDdn).val(sessionStorage.getItem("soldTo")).selectpicker('refresh');
                $(config.siteDdn).val(sessionStorage.getItem("site")).selectpicker('refresh');
                $(config.searchButton).trigger("click");
                sessionStorage.clear();
            }
            

            if (cbp.siteOperatingPage.locationDropDown["options"].length == 1) {
                var summarySoldToVal = $('.js-location-ddn .show-as-label').text();
                $(config.summarySoldTo).html(summarySoldToVal);
                $(config.searchButton).removeAttr("disabled");
            } else {
                var summarySoldToVal = $('.js-location-ddn button .pull-left').text();
                $(config.summarySoldTo).html(summarySoldToVal);
            }

            //$(config.locationDdn).selectpicker('refresh');

            if (accountDropDown.length == 1) {
                var summarySiteVal = $('.js-site-ddn .show-as-label').text();
                $(config.summarySite).html(summarySiteVal);
            } else {
                var summarySiteVal = $('.js-site-ddn button .pull-left').text();
                $(config.summarySite).html(summarySiteVal);
            }

            populatingTable(cbp.siteOperatingPage.siteOperatingResponse.siteOperatingDataList, cbp.siteOperatingPage.siteOperatingResponse.siteOperatingSearchList);
            bindEvents();

        };

        var downloadBtnSelected = function () {
            $('#siteOperatingForm #selectedsiteOperating').val(selectedsiteOperating.toString());
            for (var i = 0; len = selectedsiteOperating.length, i < len; i++) {
                cbp.siteOperatingPage.siteOperatingResponse.siteOperatingDataList[$("tr[data-uniqueid='" + selectedsiteOperating[i] + "']").data("index")].downloaded = true;
            }
            $("#siteOperatingForm").submit();
        };

        var loadingInitialHbsTemplates = function () {
            //Appending handlebar templates to HTML
            $(config.searchFormContainer).html(compiledsearchForm(cbp.siteOperatingPage));
            $(config.locationDdnContainer).html(compiledDefaultDdn(cbp.siteOperatingPage.locationDropDown));
            $(config.siteDdnContainer).html(compiledDefaultDdn(cbp.siteOperatingPage.siteDropDown));
            if (accountDropDown.length < 2) {
                cbp.siteOperatingPage.showSoldTo = false;
                siteOperatingResponse.summaryResponse = siteOperatingResponse.summary.site;
            } else {
                cbp.siteOperatingPage.showSoldTo = true;
                if (siteOperatingResponse.summary && siteOperatingResponse.summary.soldTo) {
                    siteOperatingResponse.summaryResponse = siteOperatingResponse.summary.soldTo;
                } else {
                    setSummaryDetails();
                }
            }
            loadingDynamicHbsTemplates();

            //Refresh dropdown at initial dispaly after loading templates
            $(config.dropDownCommon).selectpicker('refresh');
            enableMobileDefaultDropDown();
            $(config.displaySpinner).hide();
        };

        function summarySoldTo() {
            var res = siteOperatingResponse.summaryResponse;
            if (res && res.length > 5) {
                res = res.split(",");
                var boldsite = res[0];
                //boldsite=boldsite.join();
                var normalsite = res.splice(1);
                siteOperatingResponse.soldsiteBlock = boldsite + ',';
                siteOperatingResponse.soldsiteNormal = normalsite;
            }
            else {
                siteOperatingResponse.soldsiteBlock = res;
                siteOperatingResponse.soldsiteNormal = "";
            }
        }

        var loadingDynamicHbsTemplates = function () {
            //siteOperatingResponse.soldsite = "475637846-ehfuirfuie, fuehfueof";
            // summarySoldTo();
            $(config.siteOperatingSummaryContainer).html(compiledSiteOperatingSummary(cbp.siteOperatingPage));
            $(config.searchDetailContainer).html(compiledsohBottomDetail(cbp.siteOperatingPage));
            $(config.sortByDdnContainer).html(compiledDefaultDdn(srtByDdn));
            $(config.sortByDdnContainer).find(config.dropDownCommon).selectpicker('refresh');
            enableMobileDefaultDropDown();
        };

        var enableMobileDefaultDropDown = function () {
            //Enable mobile scrolling by calling $('.selectpicker').selectpicker('mobile'). This enables the device's native menu for select menus.
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
                $(config.dropDownCommon).selectpicker('mobile');
            }
        };

        var triggerAjaxRequest = function () {
            console.log('on triggerAjaxRequest');
            function successCallback(data) {
                console.log("Data >>>", data);
                $(config.displaySpinner).hide();
                $(config.searchDetailContainer).show();
                $(config.siteOperatingSummaryContainer).show();

                loadingDynamicHbsTemplates();
                $(config.summarySoldTo).html(data.soldTo);
                $(config.summarySite).html(data.sitetb);
                $(config.summaryDateRange).html(data.dateRangeVal);
                $(config.summaryAvgDailyHours).html(data.avgDailyHoursVal);
                populatingTable(data.siteOperatingDataList, cbp.siteOperatingPage.siteOperatingResponse.siteOperatingSearchList);
                setSummaryDetails();
                leftPaneExpandCollapse.resetSearchFormHeight();
            }

            var setSummaryDetails = function () {
                //soldTo label
                if (cbp.siteOperatingPage.locationDropDown["options"].length == 1) {
                    var summarySoldToVal = $('.js-location-ddn .show-as-label').text();
                    $(config.summarySoldTo).html(summarySoldToVal);
                } else {
                    var summarySoldToVal = $('.js-location-ddn button .pull-left').text();
                    $(config.summarySoldTo).html(summarySoldToVal);
                }
                if (accountDropDown.length == 1) {
                    var summarySiteVal = $('.js-site-ddn .show-as-label').text();
                    $(config.summarySite).html(summarySiteVal);
                } else {
                    var summarySiteVal = $('.js-site-ddn button .pull-left').text();
                    $(config.summarySite).html(summarySiteVal);
                }
            };

            function errorCallback() {
                $(config.displaySpinner).hide();
                $(config.searchDetailContainer).show();
                $(config.siteOperatingSummaryContainer).show();
                console.log("error Ajax");
            }


            $.ajax({
                type: "GET",
                //   data: {'soldTo':soldTo},
                //  contentType: "application/json",
                //  dataType:"json",
                url: cbp.siteOperatingPage.globalUrl.siteOperatingSummaryURL,
                success: successCallback,
                error: errorCallback
            });
        };
        var downloadForm = function (siteId) {
            var loc = window.location.pathname;
            var formTemplate = "<form id='downloadForm' method='POST' action='" + cbp.siteOperatingPage.globalUrl.siteOperatingDownloadURL + "'><input type='hidden' name='selectedsiteOperating' value='" + siteId + "'/></form>";
            cbp.siteOperatingPage.siteOperatingResponse.siteOperatingDataList[$("tr[data-uniqueid='" + siteId + "']").data("index")].downloaded = true;
            $(formTemplate).appendTo("body").submit().remove();
        };

        // var enablePrintDownloadButtons = function () {
        //     $(config.downloadBtn).removeClass("disabled");
        //     $(config.printBtn).removeClass("disabled");
        // };
        // var disablePrintDownloadButtons = function () {
        //     $(config.downloadBtn).addClass("disabled");
        //     $(config.printBtn).addClass("disabled");
        // };

        var generatingOptions = function (data) {
            if (data == null) {
                return;
            }
            globalSortList = [{
                key: "average-asc",
                value: cbp.siteOperatingPage.globalVars.averageSortAsc
            }, {
                key: "average-desc",
                value: cbp.siteOperatingPage.globalVars.averageSortDesc
            }, {
                key: "site-asc",
                value: cbp.siteOperatingPage.globalVars.siteSortAsc
            }, {
                key: "site-desc",
                value: cbp.siteOperatingPage.globalVars.siteSortDesc
            }
        ]

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
            "options": generatingOptions(siteOperatingResponse.siteOperatingSearchList),
            label: cbp.siteOperatingPage.globalVars.sortBy,
            labelClass: "xs-mr-5",
            name: "sortByDdn",
            display: "displayInline"
        };

        var populatingSiteOnLoad = function (siteList) {
            console.log("Calling in method >>>>>");
            var siteOptions = [];
            if (siteList.length == 1) {
                cbp.siteOperatingPage.siteDropDown.singleOption = true;
                $(config.searchButton).removeAttr("disabled");
            } else if (siteList.length > 1) {
                var obj = {};
                obj["key"] = "all";
                obj["value"] = cbp.siteOperatingPage.globalVars.allTb;
                siteOptions.push(obj);
            }

            for (var i = 0; i < siteList.length; i++) {
                var obj = {};
                obj["key"] = siteList[i].uid;
                obj["value"] = siteList[i].displayName;
                siteOptions.push(obj);
            }
            cbp.siteOperatingPage.siteDropDown["options"] = siteOptions;
            cbp.siteOperatingPage.siteDropDown.searchable = true;
            $(config.siteDdnContainer).html(compiledDefaultDdn(cbp.siteOperatingPage.siteDropDown));

            $(config.siteDdn).selectpicker('refresh');
        };


        var bindEvents = function () {

            $(document).on("reset-view.bs.table, toggle.bs.table", "#table", function (event) {
                event.stopPropagation();
            });

            $(document).on("click", config.downloadBtn, function () {
                downloadBtnSelected();
            });

            $(document).on("click", '.table > tbody > tr', function () {
                var url = "/app/page/site-operating-hours/site-operating-hours-page2.html";
                location.href = url;
                siteOperatingObj.site = $("#siteSelectDdn").val();
                siteOperatingObj.soldTo = $("#locationSelectDdn").val();
                sessionStorage.setItem("soldTo",siteOperatingObj.soldTo);
                sessionStorage.setItem("site",siteOperatingObj.site);
            });

            $(document).on("click", config.printBtn, function (e) {
                var win = window.open('', '_blank', 'PopUp' + ',width=1300,height=800');
                win.document.write('\n                <html>\n                    <head>\n                        <meta charset="utf-8">\n                        <meta http-equiv="X-UA-Compatible" content="IE=edge">\n                        <meta name="viewport" content="width=device-width, initial-scale=1">\n                        <link href="/assets/css/custom-bootstrap.css" rel="stylesheet" type="text/css"/>\n                        <link href="/assets/css/app.css" rel="stylesheet" type="text/css"/>\n                        <style>\n   .fixed-table-container {padding-bottom:20px !important;}      .heading-top {display:none;}     .fa{display:none !important;}           .custBody {\n                            background-color: #ffffff;\n                          }\n                        .site-operating-view-headerLabel {\n                            color: #009dd9;\n                            font-weight: bold;\n                                                                                                     font-size: 20px;\n                            margin-left: 22px;\n                                                                                                     padding: 0 0 0px 0;\n                        }\n\t\t\t\t\t\t.table{\n\t\t\t\t\t\t\tmax-width:98%;\n\t\t\t\t\t\t\tmargin-left:20px;\n}\t\n.nav-bottom{\n                                                                                                     border-bottom: none;\n                                                                                      }\n                                                                                      .navbar-brand{\n                                                                                                     \n                                                                                      }\n                                                                                      .fixed-table-body{\n                                                                                                     height:auto !important;\n                                                                                      }\n                        </style>\n                    </head>\n                    <body class="custBody siteoperatinghours-page">\n                        <div class="wrapper">\n                            <header class="main-header main-header-md js-header" style="">\n                                <div class="nav-bottom">\n                                    <nav class="main-navigation js-enquire-offcanvas-navigation" role="navigation">\n                                                                                                                                                \n                                        <div class="row">                                            \n                                                <a class="navbar-brand navbar-left" href="/index.html">\n                                                    <img alt="Brand" src="/assets/images/logo.png">\n                                                    <span>business point</span>\n                                                </a>\n                                                                                                                                                                               <a class="navbar-brand navbar-right" href="/index.html">\n                                                    <img alt="Brand" src="/assets/images/fob-color-rgb.png">                                                    \n                                                </a>\n                                            </div>                                                                                                                                                  \n                                        \n                                    </nav>\n                                </div>\n                            </header>\n                            <div class="col-sm-24">\n                                <p class="page-title site-operating-view-headerLabel">site operating hours</p>\n                            </div>\n                           <div class ="col-xs-24 js-siteoperating-summary" ></div>\n                                                    \n                            \n                        </div>\n                    </body>\n                </html>\n                ');
                var topSummary = $(".top-summary").html();
                win.document.write('<div class="col-xs-24"><div class="print-summary">'+ topSummary+'</div></div>');
                var tableContainer = $(".tableContainer").html();
                win.document.write('<div class="col-xs-24">'+ tableContainer+'</div>');
                var noteData = $(".note-data").html();
                win.document.write('<div class="note-data-val">'+ noteData+'</div>');
            });


            $(document).on('change', config.locationDdn, function (e) {
                if ($(config.locationDdn).val() !== "") {
                    $(config.searchButton).removeAttr("disabled");
                } else {
                    $(config.searchButton).attr("disabled", "disabled");
                }
            });

            $(document).on('change', config.siteDdn, function (e) {
                if ($(this).val() !== "") {
                    $(config.searchButton).removeAttr("disabled");
                } else {
                    $(config.searchButton).attr("disabled", "disabled");
                }
            });

            //Search button functionality
            $(config.searchButton).on("click", function (e) {
                console.log("on click");
                selectedsiteOperating = [];
                siteOperatingObj.site = $("#siteSelectDdn").val();
                siteOperatingObj.soldTo = $("#locationSelectDdn").val();
                triggerAjaxRequest();
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
                    field: 'site',
                    title: cbp.siteOperatingPage.globalVars.sitetb,
                    titleTooltip: cbp.siteOperatingPage.globalVars.sitetb,
                    sortable: true,
                    class: "text-wrap",
                    width: "20%",
                    sortable: true,
                }, {
                    field: 'average',
                    title: cbp.siteOperatingPage.globalVars.averagetb,
                    titleTooltip: cbp.siteOperatingPage.globalVars.averagetb,
                    class: 'numberIcon text-nowrap',
                    sortable: true,
                    align: 'right',
                }, {
                    field: 'day1',
                    title: cbp.siteOperatingPage.globalVars.day1tb,
                    titleTooltip: cbp.siteOperatingPage.globalVars.day1tb,
                    class: 'text-nowrap',
                    align: 'right',
                    sortable: true,
                },
                {
                    field: 'day2',
                    title: cbp.siteOperatingPage.globalVars.day2tb,
                    titleTooltip: cbp.siteOperatingPage.globalVars.day2tb,
                    class: "text-nowrap",
                    align: 'right',
                    sortable: true,
                }, {
                    field: 'day3',
                    title: cbp.siteOperatingPage.globalVars.day3tb,
                    titleTooltip: cbp.siteOperatingPage.globalVars.day3tb,
                    class: "text-wrap",
                    align: "right",
                    sortable: true,

                }, {

                    field: 'day4',
                    title: cbp.siteOperatingPage.globalVars.day4tb,
                    titleTooltip: cbp.siteOperatingPage.globalVars.day4tb,
                    class: 'text-nowrap',
                    align: 'right',
                    sortable: true,

                }, {
                    field: 'day5',
                    title: cbp.siteOperatingPage.globalVars.day5tb,
                    titleTooltip: cbp.siteOperatingPage.globalVars.day5tb,
                    class: 'text-nowrap',
                    align: 'right',
                    sortable: true,
                },
                {
                    field: 'day6',
                    title: cbp.siteOperatingPage.globalVars.day6tb,
                    titleTooltip: cbp.siteOperatingPage.globalVars.day6tb,
                    class: 'text-nowrap',
                    align: 'right',
                    sortable: true,
                },
                {
                    field: 'day7',
                    title: cbp.siteOperatingPage.globalVars.day7db,
                    titleTooltip: cbp.siteOperatingPage.globalVars.day7db,
                    class: 'text-nowrap',
                    align: 'right',
                    sortable: true,
                }
            ];
            var columnsListMap = columnsList.reduce(function (data, columnsList) {
                data[columnsList.field] = columnsList;
                return data;
            }, {});

            orderKey = ["site", "day1", "day2", "day3", "day4", "day5", "day6", "day7", "average"]
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
            if (cbp.siteOperatingPage.siteOperatingResponse.resultCount === 0) {
                cbp.siteOperatingPage.globalVars.tableLocales.noMatches = cbp.siteOperatingPage.globalVars.noMatches;
            } else if (cbp.siteOperatingPage.siteOperatingResponse.resultCount > maxResults) {
                cbp.siteOperatingPage.globalVars.tableLocales.noMatches = cbp.siteOperatingPage.globalVars.noMatchesMaxResults.replace('{0}', cbp.siteOperatingPage.siteOperatingResponse.resultCount);
                siteOperatingDataList = [];
            }

            if (siteOperatingDataList === null || siteOperatingDataList === undefined) {
                siteOperatingDataList = [];
            }
            $(config.sortByDdn).val("site-desc").selectpicker('refresh');


            $('#table').bootstrapTable({
                classes: 'table table-no-bordered',
                striped: true,
                sortName: 'site',
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
        cbp.siteOperatingPage.siteOperatingResponse = siteOperatingResponse;
        siteOperatingPage.init();


    });


});
