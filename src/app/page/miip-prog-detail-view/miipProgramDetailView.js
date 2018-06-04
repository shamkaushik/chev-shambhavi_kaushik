require(["modernizr",
    "jquery",
    "bootstrap",
    "handlebars",
    "moment",
    "bootstrap-select",
    "bootstrap-table",
    "text!app/components/dropdown/_defaultDdn.hbs",
    "text!app/page/miip-prog-detail-view/miipProgramDetailViewSummary.hbs",
    "text!app/page/miip-prog-detail-view/bottomDetail.hbs"

], function (modernizr, $, bootstrap, Handlebars, moment, bootstrapSelect, bootstrapTable, _defaultDdnHBS, _miipProgDetailSummaryHBS, _bottomDetailHBS) {

    // Compiling HBS templates
    var compiledMiipProgDetailSummary = Handlebars.compile(_miipProgDetailSummaryHBS);
    var compiledBottomDetail = Handlebars.compile(_bottomDetailHBS);
    var compiledDefaultDdn = Handlebars.compile(_defaultDdnHBS);

    var miipProgDetailPage = (function () {
        var config = {
            miipProgSummaryContainer: ".js-miisPrgDetailPage-summary",
            searchDetailContainer: ".js-bottom-detail",
            tabelRow: "#table tbody tr",
            displaySpinner: ".overlay-wrapper",
            backtoProgView: ".progReturnView",
            topSummaryLeftSection: ".topSummaryLeftSection",
            sortByDdnContainer: ".js-sortbyDdn",
            sortByDdn: "#sortByDdn",
        };

        var init = function () {
            loadingInitialHbsTemplates();
            bindEvents();
            populatingTable(cbp.miisPrgDetailPage.miipProgDetailResponse.miisProgDetailDataList);
        };
        var loadingInitialHbsTemplates = function () {
            // Appending handlebar templates to HTML
            loadingDynamicHbsTemplates();
            // Refresh dropdown at initial dispaly after loading templates
            $(config.displaySpinner).hide();
        };

        var loadingDynamicHbsTemplates = function () {
            $(config.miipProgSummaryContainer).html(compiledMiipProgDetailSummary(cbp.miisPrgDetailPage));
            $(config.searchDetailContainer).html(compiledBottomDetail(cbp.miisPrgDetailPage));
            $(config.sortByDdnContainer).html(compiledDefaultDdn(srtByDdn));
        };

        var bindEvents = function () {
            $(document).on('click',config.backtoProgView,function(){
                window.location.href=cbp.miisPrgDetailPage.globalUrl.miisProgViewURL;
            });

        };


        var srtByDdn = {
            "options": [{
                key: "sales-Month-az",
                value: "Sales Month, Ascending",
                id: 'status'
            },{
                key: "sales-Month-za",
                value: "Sales Month, Descending",
                id: 'status'
            },
            {
                key: "payment-processing-az",
                value: "Payment Processing, Ascending",
                id: 'status'
            },
            {
                key: "payment-processing-za",
                value: "Payment Processing, Descending",
                id: 'status'
            }],
            label: "Sort By",
            labelClass: "xs-mr-5",
            name: "sortByDdn",
            display: "displayInline"
        };

        var populatingTable = function (miisProgDetailDataList) {
            if (cbp.miisPrgDetailPage.miipProgDetailResponse.miisProgDetailDataList === null) {
                cbp.miisPrgDetailPage.globalVars.tableLocales.noMatches = "";
            } else if (cbp.miisPrgDetailPage.miipProgDetailResponse.resultCount === 0) {
                cbp.miisPrgDetailPage.globalVars.tableLocales.noMatches = cbp.miisPrgDetailPage.globalVars.noMatches;
            } else if (cbp.miisPrgDetailPage.miipProgDetailResponse.resultCount > maxResults) {
                cbp.miisPrgDetailPage.globalVars.tableLocales.noMatches = cbp.miisPrgDetailPage.globalVars.noMatchesMaxResults.replace('{0}', cbp.miisPrgDetailPage.miipProgDetailResponse.resultCount);
                miisProgDetailDataList = [];
            }

            if (miisProgDetailDataList === null || miisProgDetailDataList === undefined) {
                miisProgDetailDataList = [];
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
                    field: 'salesMonth',
                    title: cbp.miisPrgDetailPage.globalVars.salesMonth,
                    titleTooltip: cbp.miisPrgDetailPage.globalVars.salesMonth,
                    class: 'text-nowrap numberIcon',
                    sortable: true,
                    width:"20%",

                },{
                    field: 'paymentProcessingDate',
                    title: cbp.miisPrgDetailPage.globalVars.paymentProcessingDate,
                    titleTooltip: cbp.miisPrgDetailPage.globalVars.paymentProcessingDate,
                    class: 'numberIcon text-nowrap',
                    sortable: true,
                    width:"20%",

                }, {
                    field: 'amountPaid',
                    title: cbp.miisPrgDetailPage.globalVars.amountPaid + " (" + cbp.miisPrgDetailPage.miipProgDetailResponse.miipProgDetailsData.currency+ ")",
                    titleTooltip: cbp.miisPrgDetailPage.globalVars.amountPaid + " (" + cbp.miisPrgDetailPage.miipProgDetailResponse.miipProgDetailsData.currency+ ")",
                    class: 'numberIcon',
                    sortable: true,
                    align: 'right',
                      width:"20%",

                }, {
                    field: 'invoice',
                    title: cbp.miisPrgDetailPage.globalVars.invoice,
                    titleTooltip: cbp.miisPrgDetailPage.globalVars.invoice,
                    class: 'numberIcon text-nowrap',
                    sortable: true,
                    width:"30%",

                }, {
                    field: 'billingDoc',
                    title: cbp.miisPrgDetailPage.globalVars.billingDoc,
                    titleTooltip: cbp.miisPrgDetailPage.globalVars.billingDoc,
                    class: 'numberIcon text-nowrap col-md-5',
                    sortable: true,
                      width:"30%",

                    formatter: function LinkFormatter(value, row, index) {
                        return "<a href='#' class='js-prg-billingDoc'>" + value + "</a>";
                    }
                }],
                data: miisProgDetailDataList
            });
        };
        return {
            init: init
        };
    })();

    $(document).ready(function () {
        // Localization setup for dropdown & table
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
        cbp.miisPrgDetailPage.miipProgDetailResponse = miipProgDetailResponse;
        if (miipProgDetailResponse.miisProgDetailDataList === undefined || miipProgDetailResponse.miisProgDetailDataList === null) {
            cbp.miisPrgDetailPage.miipProgDetailResponse.miisProgDetailDataList = [];
        }

        if (cbp.miisPrgDetailPage.miipProgDetailResponse.resultCount > 0 && cbp.miisPrgDetailPage.miipProgDetailResponse.resultCount < maxResults) {
            cbp.miisPrgDetailPage.showDebitCredit = true;
        } else {
            cbp.miisPrgDetailPage.showDebitCredit = false;
        }
        miipProgDetailPage.init();
    });
});
