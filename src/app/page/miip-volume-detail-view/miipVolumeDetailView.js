require(["modernizr",
    "jquery",
    "bootstrap",
    "handlebars",
    "moment",
    "bootstrap-select",
    "bootstrap-table",
    "toggleSwitch",
    "text!app/page/miip-volume-detail-view/miipVolumeDetailViewSummary.hbs",
    "text!app/page/miip-volume-detail-view/bottomDetail.hbs"

], function (modernizr, $, bootstrap, Handlebars, moment, toggleSwitch, bootstrapSelect, bootstrapTable, _miipVolumegDetailSummaryHBS, _bottomDetailHBS) {

    // Compiling HBS templates
    var compiledMiipVolumeDetailSummary = Handlebars.compile(_miipVolumegDetailSummaryHBS);
    var compiledBottomDetail = Handlebars.compile(_bottomDetailHBS);

    var miipVolumeDetailPage = (function () {
        var config = {
            miipVolumeSummaryContainer: ".js-miisVolumeDetailPage-summary",
            searchDetailContainer: ".js-bottom-detail",
            tabelRow: "#table tbody tr",
            displaySpinner: ".overlay-wrapper",
            backtoVolumeView: ".volumeReturnView",
            topSummaryLeftSection: ".topSummaryLeftSection",
        };

        var init = function () {
            loadingInitialHbsTemplates();
            bindEvents();
            populatingTable(cbp.miisVolumeDetailPage.miipVolumeDetailResponse.miisVolumeDetailDataList);
        };
        var loadingInitialHbsTemplates = function () {
            // Appending handlebar templates to HTML
            loadingDynamicHbsTemplates();
            // Refresh dropdown at initial dispaly after loading templates
            $(config.displaySpinner).hide();
        };

        var loadingDynamicHbsTemplates = function () {
            $(config.miipVolumeSummaryContainer).html(compiledMiipVolumeDetailSummary(cbp.miisVolumeDetailPage));
            $(config.searchDetailContainer).html(compiledBottomDetail(cbp.miisVolumeDetailPage));
        };

        var bindEvents = function () {
            $(document).on('click',config.backtoVolumeView,function(){
                window.location.href=cbp.miisVolumeDetailPage.globalUrl.miisVolumeViewURL;
            });

        };

        var populatingTable = function (miisVolumeDetailDataList) {
            if (cbp.miisVolumeDetailPage.miipVolumeDetailResponse.miisVolumeDetailDataList === null) {
                cbp.miisVolumeDetailPage.globalVars.tableLocales.noMatches = "";
            } else if (cbp.miisVolumeDetailPage.miipVolumeDetailResponse.resultCount === 0) {
                cbp.miisVolumeDetailPage.globalVars.tableLocales.noMatches = cbp.miisVolumeDetailPage.globalVars.noMatches;
            } else if (cbp.miisVolumeDetailPage.miipVolumeDetailResponse.resultCount > maxResults) {
                cbp.miisVolumeDetailPage.globalVars.tableLocales.noMatches = cbp.miisVolumeDetailPage.globalVars.noMatchesMaxResults.replace('{0}', cbp.miisVolumeDetailPage.miipVolumeDetailResponse.resultCount);
                miisVolumeDetailDataList = [];
            }

            if (miisVolumeDetailDataList === null || miisVolumeDetailDataList === undefined) {
                miisVolumeDetailDataList = [];
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
                    field: 'salesDate',
                    title: cbp.miisVolumeDetailPage.globalVars.salesDate,
                    titleTooltip: cbp.miisVolumeDetailPage.globalVars.salesDate,
                    class: 'text-nowrap numberIcon',
                    sortable: true,

                },{
                    field: 'rul',
                    title: cbp.miisVolumeDetailPage.globalVars.rul,
                    titleTooltip: cbp.miisVolumeDetailPage.globalVars.rul,
                    class: 'numberIcon text-nowrap',
                    sortable: true,

                }, {
                    field: 'mul',
                    title: cbp.miisVolumeDetailPage.globalVars.mul,
                    titleTooltip: cbp.miisVolumeDetailPage.globalVars.mul,
                    class: 'numberIcon',
                    sortable: true,
                    align: 'right',

                }, {
                    field: 'pul',
                    title: cbp.miisVolumeDetailPage.globalVars.pul,
                    titleTooltip: cbp.miisVolumeDetailPage.globalVars.pul,
                    class: 'numberIcon text-nowrap',
                    sortable: true,
                    align: 'right',

                }, {
                    field: 'total',
                    title: cbp.miisVolumeDetailPage.globalVars.total,
                    titleTooltip: cbp.miisVolumeDetailPage.globalVars.total,
                    class: 'numberIcon text-nowrap col-md-5',
                    sortable: true,
                    align: 'right',
                }],
                data: miisVolumeDetailDataList
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
                return cbp.miisVolumeDetailPage.globalVars.tableLocales.loadingMessage;
            },
            formatRecordsPerPage: function (pageNumber) {
                return cbp.miisVolumeDetailPage.globalVars.tableLocales.recordsPerPage.replace('{0}', pageNumber);
            },
            formatShowingRows: function (pageFrom, pageTo, totalRows) {
                return cbp.miisVolumeDetailPage.globalVars.tableLocales.showingRows.replace('{0}', pageFrom).replace('{1}', pageTo).replace('{2}', totalRows);
            },
            formatSearch: function () {
                return cbp.miisVolumeDetailPage.globalVars.tableLocales.search;
            },
            formatNoMatches: function () {
                return cbp.miisVolumeDetailPage.globalVars.tableLocales.noMatches;
            },
            formatPaginationSwitch: function () {
                return cbp.miisVolumeDetailPage.globalVars.tableLocales.paginationSwitch;
            },
            formatRefresh: function () {
                return cbp.miisVolumeDetailPage.globalVars.tableLocales.refresh;
            },
            formatToggle: function () {
                return cbp.miisVolumeDetailPage.globalVars.tableLocales.toggle;
            },
            formatColumns: function () {
                return cbp.miisVolumeDetailPage.globalVars.tableLocales.columns;
            },
            formatAllRows: function () {
                return cbp.miisVolumeDetailPage.globalVars.tableLocales.allRows;
            }
        };
        $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales);
        cbp.miisVolumeDetailPage.miipVolumeDetailResponse = miipVolumeDetailResponse;
        if (miipVolumeDetailResponse.miisVolumeDetailDataList === undefined || miipVolumeDetailResponse.miisVolumeDetailDataList === null) {
            cbp.miisVolumeDetailPage.miipVolumeDetailResponse.miisVolumeDetailDataList = [];
        }

        if (cbp.miisVolumeDetailPage.miipVolumeDetailResponse.resultCount > 0 && cbp.miisVolumeDetailPage.miipVolumeDetailResponse.resultCount < maxResults) {
            cbp.miisVolumeDetailPage.showDebitCredit = true;
        } else {
            cbp.miisVolumeDetailPage.showDebitCredit = false;
        }
        miipVolumeDetailPage.init();
    });
});
