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
            miipVolumeSummaryContainer: ".js-miipVolumeDetailPage-summary",
            searchDetailContainer: ".js-bottom-detail",
            tabelRow: "#table tbody tr",
            displaySpinner: ".overlay-wrapper",
            backtoVolumeView: ".volumeReturnView",
            topSummaryLeftSection: ".topSummaryLeftSection",
        };

        var init = function () {
            loadingInitialHbsTemplates();
            bindEvents();
            populatingTable(cbp.miipVolumeDetailPage.miipVolumeDetailResponse.rows,cbp.miipVolumeDetailPage.miipVolumeDetailResponse.columnMapping);
        };
        var loadingInitialHbsTemplates = function () {
            // Appending handlebar templates to HTML
            loadingDynamicHbsTemplates();
            // Refresh dropdown at initial dispaly after loading templates
            $(config.displaySpinner).hide();
        };

        var loadingDynamicHbsTemplates = function () {
            $(config.miipVolumeSummaryContainer).html(compiledMiipVolumeDetailSummary(cbp.miipVolumeDetailPage));
            $(config.searchDetailContainer).html(compiledBottomDetail(cbp.miipVolumeDetailPage));
        };

        var bindEvents = function () {
            $(document).on('click',config.backtoVolumeView,function(){
                window.location.href=cbp.miipVolumeDetailPage.globalUrl.miipVolumeViewURL;
            });
        };

        var getResultRows = function(){
            return cbp.miipVolumeDetailPage.miipVolumeDetailResponse.rows.length;
        }

        var generatingColumns = function(columnsDataList){
          var receivedOrderKey = Object.keys(columnsDataList).filter(function(key){
            if(columnsDataList[key]){
              return columnsDataList[key];
            }
          });
            var columnsList = [
                {
                  class: 'fa',
                },
                {
                  field: 'salesDate',
                  title: cbp.miipVolumeDetailPage.globalVars.salesDate + " (" + getResultRows() + " " + cbp.miipVolumeDetailPage.globalVars.days + ")",
                  titleTooltip: cbp.miipVolumeDetailPage.globalVars.salesDate + " (" + getResultRows() + " " + cbp.miipVolumeDetailPage.globalVars.days + ")",
                },
                {
                  field: 'rul',
                  title: cbp.miipVolumeDetailPage.globalVars.rul,
                  titleTooltip: cbp.miipVolumeDetailPage.globalVars.rul,
                },
                {
                  field: 'mul',
                  title: cbp.miipVolumeDetailPage.globalVars.mul,
                  titleTooltip: cbp.miipVolumeDetailPage.globalVars.mul,
                  align: 'right',
                },
                {
                  field: 'pul',
                  title: cbp.miipVolumeDetailPage.globalVars.pul,
                  titleTooltip: cbp.miipVolumeDetailPage.globalVars.pul,
                  align: 'right',
                  width: '25%'
                },
                {
                  field: 'total',
                  title: cbp.miipVolumeDetailPage.globalVars.total,
                  titleTooltip: cbp.miipVolumeDetailPage.globalVars.total,
                  class: 'numberIcon text-nowrap col-md-5',
                  align: 'right',
                }];

            var columnsListMap = columnsList.reduce(function (data, columnsList) {
                data[columnsList.field] = columnsList;
                return data;
            }, {});
            var orderKey = [ "salesDate", "rul", "mul", "pul", "total"]
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
        };

        var populatingTable = function (row , columnsDataList) {
            if (cbp.miipVolumeDetailPage.miipVolumeDetailResponse.rows === null) {
                cbp.miipVolumeDetailPage.globalVars.tableLocales.noMatches = "";
            } else if (cbp.miipVolumeDetailPage.miipVolumeDetailResponse.resultCount === 0) {
                cbp.miipVolumeDetailPage.globalVars.tableLocales.noMatches = cbp.miipVolumeDetailPage.globalVars.noMatches;
            } else if (cbp.miipVolumeDetailPage.miipVolumeDetailResponse.resultCount > maxResults) {
                cbp.miipVolumeDetailPage.globalVars.tableLocales.noMatches = cbp.miipVolumeDetailPage.globalVars.noMatchesMaxResults.replace('{0}', cbp.miipVolumeDetailPage.miipVolumeDetailResponse.resultCount);
                row = [];
            }

            if (row === null || row === undefined) {
                row = [];
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
                columns: generatingColumns(columnsDataList),
                data: row
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
                return cbp.miipVolumeDetailPage.globalVars.tableLocales.loadingMessage;
            },
            formatRecordsPerPage: function (pageNumber) {
                return cbp.miipVolumeDetailPage.globalVars.tableLocales.recordsPerPage.replace('{0}', pageNumber);
            },
            formatShowingRows: function (pageFrom, pageTo, totalRows) {
                return cbp.miipVolumeDetailPage.globalVars.tableLocales.showingRows.replace('{0}', pageFrom).replace('{1}', pageTo).replace('{2}', totalRows);
            },
            formatSearch: function () {
                return cbp.miipVolumeDetailPage.globalVars.tableLocales.search;
            },
            formatNoMatches: function () {
                return cbp.miipVolumeDetailPage.globalVars.tableLocales.noMatches;
            },
            formatPaginationSwitch: function () {
                return cbp.miipVolumeDetailPage.globalVars.tableLocales.paginationSwitch;
            },
            formatRefresh: function () {
                return cbp.miipVolumeDetailPage.globalVars.tableLocales.refresh;
            },
            formatToggle: function () {
                return cbp.miipVolumeDetailPage.globalVars.tableLocales.toggle;
            },
            formatColumns: function () {
                return cbp.miipVolumeDetailPage.globalVars.tableLocales.columns;
            },
            formatAllRows: function () {
                return cbp.miipVolumeDetailPage.globalVars.tableLocales.allRows;
            }
        };
        $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales);
        cbp.miipVolumeDetailPage.miipVolumeDetailResponse = miipVolumeDetailResponse;
        if (miipVolumeDetailResponse.rows === undefined || miipVolumeDetailResponse.rows === null) {
            cbp.miipVolumeDetailPage.miipVolumeDetailResponse.rows = [];
        }

        if (cbp.miipVolumeDetailPage.miipVolumeDetailResponse.resultCount > 0 && cbp.miipVolumeDetailPage.miipVolumeDetailResponse.resultCount < maxResults) {
            cbp.miipVolumeDetailPage.showDebitCredit = true;
        } else {
            cbp.miipVolumeDetailPage.showDebitCredit = false;
        }
        miipVolumeDetailPage.init();
    });
});
