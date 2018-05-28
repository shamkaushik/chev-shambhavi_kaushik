require(["modernizr",
    "jquery",
    "bootstrap",
    "handlebars",
    "moment",
    "bootstrap-select",
    "bootstrap-table",
    "toggleSwitch",
    "text!app/page/miip-prog-detail-view/miipProgramDetailViewSummary.hbs",
    "text!app/page/miip-prog-detail-view/bottomDetail.hbs"

], function (modernizr, $, bootstrap, Handlebars, moment, toggleSwitch, bootstrapSelect, bootstrapTable, _eftSearchSummaryHBS, _bottomDetailHBS) {

    // Compiling HBS templates
    var compiledeftSearchSummary = Handlebars.compile(_eftSearchSummaryHBS);
    var compiledBottomDetail = Handlebars.compile(_bottomDetailHBS);
    var accountDropdownOptions = [], eftObj = {};
    var eftSearchPage = (function () {
        var config = {
            accountDdnContainer: ".js-account-ddn",
            eftSearchSummaryContainer: ".js-eftSearch-summary",
            searchFormContainer: ".js-search-form",
            searchDetailContainer: ".js-bottom-detail",
            searchButton: "#eftSearchBtn",
            tabelRow: "#table tbody tr",
            displaySpinner: ".overlay-wrapper",
            eftNoticeNumber: "#eftNoticeNumber",
            invoiceNumber: "#invoiceNumber",
            poNumber: "#poNumber",
            eftNoticeLink: ".js-eft-NoticeNumber",
            eftNoticeForm: "#eftNoticeForm",
            eftNoticeidInp: "#eftNoticeid",
            eftSearchToggle: "#eftSearchToggle",
            searchInputEft: ".js-eftSearchPage-searchEft",
            backToEFTSearch: ".backToEFTSearch",
            topSummaryLeftSection: ".topSummaryLeftSection",
        };

        var init = function () {
            loadingInitialHbsTemplates();
            bindEvents();
            populatingTable(cbp.miisPrgDetailPage.eftDetailResponse.eftDetailDataList);
        };
        var loadingInitialHbsTemplates = function () {
            // Appending handlebar templates to HTML
            loadingDynamicHbsTemplates();
            // Refresh dropdown at initial dispaly after loading templates
            $(config.displaySpinner).hide();
        };

        var loadingDynamicHbsTemplates = function () {
           $(config.eftSearchSummaryContainer).html(compiledeftSearchSummary(cbp.miisPrgDetailPage));
            $(config.searchDetailContainer).html(compiledBottomDetail(cbp.miisPrgDetailPage));
        };

        var bindEvents = function () {
            $(document).on('click',config.backToEFTSearch,function(){
                window.location.href=cbp.miisPrgDetailPage.globalUrl.eftSearchURL;
            });

        };

        var populatingTable = function (eftDetailDataList) {
            var eftStatusCount = 0;
            if (cbp.miisPrgDetailPage.eftDetailResponse.eftDetailDataList === null) {
                cbp.miisPrgDetailPage.globalVars.tableLocales.noMatches = "";
            } else if (cbp.miisPrgDetailPage.eftDetailResponse.resultCount === 0) {
                cbp.miisPrgDetailPage.globalVars.tableLocales.noMatches = cbp.miisPrgDetailPage.globalVars.noMatches;
            } else if (cbp.miisPrgDetailPage.eftDetailResponse.resultCount > maxResults && allEftFlow != "true") {
                cbp.miisPrgDetailPage.globalVars.tableLocales.noMatches = cbp.miisPrgDetailPage.globalVars.noMatchesMaxResults.replace('{0}', cbp.miisPrgDetailPage.eftDetailResponse.resultCount);
                eftDetailDataList = [];
            }

            if (eftDetailDataList === null || eftDetailDataList === undefined) {
                eftDetailDataList = [];
           }
            $(config.sortByDdn).val("referenceDate-desc").selectpicker('refresh');

            $('#table').bootstrapTable({
                classes: 'table table-no-bordered',
                striped: true,
                sortName: 'referenceDate',
                sortOrder: 'desc',
                iconsPrefix: 'fa',
                sortable: true,
                parentContainer: ".js-bottom-detail",
                sortByDropdownId: "#sortByDdn",
                responsive: true,
                responsiveBreakPoint: 768,
                responsiveClass: "bootstrap-table-cardview",
                columns: [{
                    field: 'invoiceNumber',
                    title: cbp.miisPrgDetailPage.globalVars.documentNumber,
                    titleTooltip: cbp.miisPrgDetailPage.globalVars.documentNumber,
                    class: 'text-nowrap numberIcon',
                    sortable: true,
                    formatter: function LinkFormatter(value, row, index) {
                        return "<a href='#' class='js-eft-NoticeNumber' data-uid='" + row.eftNoticeNumberId + "'>" + value + "</a>";
                    }
                },{
                    field: 'referenceDate',
                    title: cbp.miisPrgDetailPage.globalVars.referenceDate,
                    titleTooltip: cbp.miisPrgDetailPage.globalVars.referenceDate,
                    class: 'numberIcon text-nowrap',
                    sortable: true
                }, {
                    field: 'originalDoc',
                    title: cbp.miisPrgDetailPage.globalVars.originalDoc,
                    titleTooltip: cbp.miisPrgDetailPage.globalVars.originalDoc,
                    class: 'numberIcon',
                    sortable: true
                }, {
                    field: 'altReference',
                    title: cbp.miisPrgDetailPage.globalVars.referenceNumber,
                    titleTooltip: cbp.miisPrgDetailPage.globalVars.referenceNumber,
                    class: 'numberIcon text-nowrap',
                    sorter: function dateSort(a, b) {
                        a = moment(a, cbp.miisPrgDetailPage.dateRange.format, true).format();
                        b = moment(b, cbp.miisPrgDetailPage.dateRange.format, true).format();

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
                    field: 'description',
                    title: cbp.miisPrgDetailPage.globalVars.descriptionText,
                    titleTooltip: cbp.miisPrgDetailPage.globalVars.descriptionText,
                    class: 'numberIcon text-nowrap col-md-5',
                    sortable: true
                },{
                    field: 'deliveryAccount',
                    title: cbp.miisPrgDetailPage.globalVars.deliveryAccount,
                    titleTooltip: cbp.miisPrgDetailPage.globalVars.deliveryAccount,
                    class: 'numberIcon text-nowrap',
                    sortable: true
                }, {
                    field: 'total',
                    title: cbp.miisPrgDetailPage.globalVars.totalTbSD + " (" + cbp.miisPrgDetailPage.eftDetailResponse.eftDetailsData.currency+ ")",
                    titleTooltip: cbp.miisPrgDetailPage.globalVars.totalTbSD + " (" + cbp.miisPrgDetailPage.eftDetailResponse.eftDetailsData.currency+ ")",
                    class: 'numberIcon text-nowrap',
                    sortable: true,
                    align: 'right',
                    sorter: function priceSort(a, b) {
                        if (a !== null && b !== null) {
                            a = parseFloat(a);
                            b = parseFloat(b);
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
						return row.displayTotal;
                    }
                }],
                data: eftDetailDataList
            });
        };
        return {
            init: init
        };
    })();

    $(document).ready(function () {
        // Localization setup for dropdown & table
        $.fn.selectpicker.defaults = {
            noneSelectedText: cbp.miisPrgDetailPage.globalVars.selectDdn.noneSelectedText,
            noneResultsText: cbp.miisPrgDetailPage.globalVars.selectDdn.noneResultsText,
            countSelectedText: function (numSelected, numTotal) {
                return (numSelected == 1) ? cbp.miisPrgDetailPage.globalVars.selectDdn.itemSelected : cbp.miisPrgDetailPage.globalVars.selectDdn.itemSelected1;
            },
            maxOptionsText: function (numAll, numGroup) {
                return [
                    (numAll == 1) ? cbp.miisPrgDetailPage.globalVars.selectDdn.limitReached : cbp.miisPrgDetailPage.globalVars.selectDdn.limitReached1,
                    (numGroup == 1) ? cbp.miisPrgDetailPage.globalVars.selectDdn.groupLimit : cbp.miisPrgDetailPage.globalVars.selectDdn.groupLimit1
            ];
            },
            selectAllText: cbp.miisPrgDetailPage.globalVars.selectDdn.selectAllText,
            deselectAllText: cbp.miisPrgDetailPage.globalVars.selectDdn.deselectAllText
        };

        $.fn.bootstrapTable.locales = {
            formatLoadingMessage: function () {
                return cbp.miisPrgDetailPage.globalVars.tableLocales.loadingMessage;
            },
            formatRecordsPerPage: function (pageNumber) {
                return cbp.miisPrgDetailPage.globalVars.tableLocales.recordsPerPage.replace('{0}', pageNumber);
            },
            formatShowingRows: function (pageFrom, pageTo, totalRows) {
                return cbp.miisPrgDetailPage.globalVars.tableLocales.showingRows.replace('{0}', pageFrom).replace('{1}', pageTo).replace('{2}', totalRows);
            },
            formatSearch: function () {
                return cbp.miisPrgDetailPage.globalVars.tableLocales.search;
            },
            formatNoMatches: function () {
                return cbp.miisPrgDetailPage.globalVars.tableLocales.noMatches;
            },
            formatPaginationSwitch: function () {
                return cbp.miisPrgDetailPage.globalVars.tableLocales.paginationSwitch;
            },
            formatRefresh: function () {
                return cbp.miisPrgDetailPage.globalVars.tableLocales.refresh;
            },
            formatToggle: function () {
                return cbp.miisPrgDetailPage.globalVars.tableLocales.toggle;
            },
            formatColumns: function () {
                return cbp.miisPrgDetailPage.globalVars.tableLocales.columns;
            },
            formatAllRows: function () {
                return cbp.miisPrgDetailPage.globalVars.tableLocales.allRows;
            }
        };
        $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales);
        leftPaneExpandCollapse.init();
        cbp.miisPrgDetailPage.showSoldTo = true;
        cbp.miisPrgDetailPage.eftDetailResponse = eftDetailResponse;
        if (eftDetailResponse.eftDetailDataList === undefined || eftDetailResponse.eftDetailDataList === null) {
            cbp.miisPrgDetailPage.eftDetailResponse.eftDetailDataList = [];
        }

        if (cbp.miisPrgDetailPage.eftDetailResponse.resultCount > 0 && cbp.miisPrgDetailPage.eftDetailResponse.resultCount < maxResults) {
            cbp.miisPrgDetailPage.showDebitCredit = true;
        } else {
            cbp.miisPrgDetailPage.showDebitCredit = false;
        }
        eftSearchPage.init();
    });
});
