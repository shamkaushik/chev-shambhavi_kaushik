var goToInvoice = function(invoice){
    console.log(invoice);
}

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
            miipProgSummaryContainer: ".js-miipPrgDetailPage-summary",
            searchDetailContainer: ".js-bottom-detail",
            tabelRow: "#table tbody tr",
            displaySpinner: ".overlay-wrapper",
            backtoProgView: ".progReturnView",
            topSummaryLeftSection: ".topSummaryLeftSection",
            sortByDdnContainer: ".js-sortbyDdn",
            sortByDdn: "#sortByDdn",
            sortByDdnContainer: ".js-sortbyDdn",
        };

        var init = function () {
            loadingInitialHbsTemplates();
            bindEvents();
            populatingTable(cbp.miipPrgDetailPage.miipProgDetailResponse.miipProgramDetailDataList , cbp.miipPrgDetailPage.miipProgDetailResponse.miipProgramDetailColumnMapping);
        };
        var loadingInitialHbsTemplates = function () {
            // Appending handlebar templates to HTML
            loadingDynamicHbsTemplates();
            // Refresh dropdown at initial dispaly after loading templates
            $(config.displaySpinner).hide();
        };

        var loadingDynamicHbsTemplates = function () {
            $(config.miipProgSummaryContainer).html(compiledMiipProgDetailSummary(cbp.miipPrgDetailPage));
            $(config.searchDetailContainer).html(compiledBottomDetail(cbp.miipPrgDetailPage));

            var sortDdnOptions = generatingOptions(miipProgDetailResponse.miipProgramDetailColumnMapping);
            srtByDdn["options"] = sortDdnOptions;
            $(config.sortByDdnContainer).html(compiledDefaultDdn(srtByDdn));
            $(config.sortByDdnContainer).find(config.dropDownCommon).selectpicker('refresh');
            enableMobileDefaultDropDown();
            $(config.dropDownCommon).selectpicker('refresh');
        };

        var enableMobileDefaultDropDown = function() {
            //Enable mobile scrolling by calling $('.selectpicker').selectpicker('mobile'). This enables the device's native menu for select menus.
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
                $('.selectpicker').selectpicker('mobile');
            }
        };

        var generatingOptions = function(data){
            globalSortList = [{
                key: "salesMonth-desc",
                value: cbp.miipPrgDetailPage.globalVars.salesMonthDesc
            },{
                key: "salesMonth-asc",
                value: cbp.miipPrgDetailPage.globalVars.salesMonthAsc
            },
            {
                key: "paymentProcessingDate-desc",
                value: cbp.miipPrgDetailPage.globalVars.paymentProcessingDateDesc
            },
            {
                key: "paymentProcessingDate-asc",
                value: cbp.miipPrgDetailPage.globalVars.paymentProcessingDateAsc
            },];

        var sortListMap = globalSortList.reduce(function (data, globalSortList) {
            data[globalSortList.key] = globalSortList;
            return data;
          }, {});


        var sortKey = Object.keys(sortListMap).filter(function(key) {
            if(sortListMap[key]){
                return sortListMap[key];
            }
        });

        var receivedOrderKey = Object.keys(data).filter(function(key) {
            if(data[key]){
            return data[key];
            }
        });

        var fnCheck = function fnCheck(item) {
          return receivedOrderKey.indexOf(item.replace(/\-(asc|desc)/, "")) != -1;
        };

        var requestedOptions = sortKey.filter(function (s) {
          return fnCheck(s);
        });

        var optionDropdown = [];
        for(i=0;i<requestedOptions.length;i++){
            var k = requestedOptions[i];
            optionDropdown.push(sortListMap[k]);
        }
            return optionDropdown;
        }

        var bindEvents = function () {
            $(document).on('click',config.backtoProgView,function(){
                window.location.href=cbp.miipPrgDetailPage.globalUrl.miipProgViewURL;
            });

        };

        var generatingColumns = function(columnsDataList) {
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
                            field: 'salesMonth',
                            title: cbp.miipPrgDetailPage.globalVars.salesMonth,
                            titleTooltip: cbp.miipPrgDetailPage.globalVars.salesMonth,
                            width: "40%",
                            class: 'text-nowrap numberIcon',
                            sortable: true,
                            width:"20%",
                        },
                        {
                          field: 'paymentProcessingDate',
                          title: cbp.miipPrgDetailPage.globalVars.paymentProcessingDate,
                          titleTooltip: cbp.miipPrgDetailPage.globalVars.paymentProcessingDate,
                          width:"20%",
                          sortable:true,
                          class: 'text-nowrap numberIcon',

                        }, {
                            field: 'amountPaid',
                            title: cbp.miipPrgDetailPage.globalVars.amountPaid + " (" + cbp.miipPrgDetailPage.miipProgDetailResponse.currency+ ")",
                            titleTooltip: cbp.miipPrgDetailPage.globalVars.amountPaid + " (" + cbp.miipPrgDetailPage.miipProgDetailResponse.currency+ ")",
                            align:'right',
                            width:"10%",
                            class: 'amount-paid-column',
                        }, {
                            field: 'jiipInvoiceNumber',
                            title: cbp.miipPrgDetailPage.globalVars.invoice,
                            titleTooltip: cbp.miipPrgDetailPage.globalVars.invoice,
                            class: 'numberIcon text-nowrap',
                            width:"20%",

                        }, {
                            field: 'billingDocument',
                            title: cbp.miipPrgDetailPage.globalVars.billingDoc,
                            titleTooltip: cbp.miipPrgDetailPage.globalVars.billingDoc,
                            class: 'numberIcon text-nowrap col-md-5',
                            width:"10%",
                            formatter: function LinkFormatter(value, row, index) {
                              if(value && value !="null"){
                                  return "<a href='#' class='js-prg-billingDoc' onclick='goToInvoice("+value+")'>" + value + "</a>";
                              }
                            }
                        }];

            var columnsListMap = columnsList.reduce(function (data, columnsList) {
            data[columnsList.field] = columnsList;
            return data;
            }, {});
            var orderKey = [ "salesMonth", "paymentProcessingDate", "amountPaid", "jiipInvoiceNumber", "billingDocument"]

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

        var populatingTable = function (miipProgramDetailDataList,columnsDataList) {
            $(config.sortByDdn).val("referenceDate-desc").selectpicker('refresh');
            $('#table').bootstrapTable({
                classes: 'table table-no-bordered',
                striped: true,
                sortName: 'referenceDate',
                sortOrder: 'asc',
                iconsPrefix: 'fa',
                sortable: true,
                parentContainer: ".js-bottom-detail",
                sortByDropdownId: "#sortByDdn",
                responsive: true,
                responsiveBreakPoint: 768,
                sortName: 'salesMonth',
                responsiveClass: "bootstrap-table-cardview",
                columns: generatingColumns(columnsDataList),
                data: miipProgramDetailDataList
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
                return cbp.miipPrgDetailPage.globalVars.tableLocales.loadingMessage;
            },
            formatRecordsPerPage: function (pageNumber) {
                return cbp.miipPrgDetailPage.globalVars.tableLocales.recordsPerPage.replace('{0}', pageNumber);
            },
            formatShowingRows: function (pageFrom, pageTo, totalRows) {
                return cbp.miipPrgDetailPage.globalVars.tableLocales.showingRows.replace('{0}', pageFrom).replace('{1}', pageTo).replace('{2}', totalRows);
            },
            formatSearch: function () {
                return cbp.miipPrgDetailPage.globalVars.tableLocales.search;
            },
            formatNoMatches: function () {
                return cbp.miipPrgDetailPage.globalVars.tableLocales.noMatches;
            },
            formatPaginationSwitch: function () {
                return cbp.miipPrgDetailPage.globalVars.tableLocales.paginationSwitch;
            },
            formatRefresh: function () {
                return cbp.miipPrgDetailPage.globalVars.tableLocales.refresh;
            },
            formatToggle: function () {
                return cbp.miipPrgDetailPage.globalVars.tableLocales.toggle;
            },
            formatColumns: function () {
                return cbp.miipPrgDetailPage.globalVars.tableLocales.columns;
            },
            formatAllRows: function () {
                return cbp.miipPrgDetailPage.globalVars.tableLocales.allRows;
            }
        };
        $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales);
        cbp.miipPrgDetailPage.miipProgDetailResponse = miipProgDetailResponse;
        if (miipProgDetailResponse.miipProgramDetailDataList === undefined || miipProgDetailResponse.miipProgramDetailDataList === null) {
            cbp.miipPrgDetailPage.miipProgDetailResponse.miipProgramDetailDataList = [];
        }

        if (cbp.miipPrgDetailPage.miipProgDetailResponse.resultCount > 0 && cbp.miipPrgDetailPage.miipProgDetailResponse.resultCount < maxResults) {
            cbp.miipPrgDetailPage.showDebitCredit = true;
        } else {
            cbp.miipPrgDetailPage.showDebitCredit = false;
        }
        miipProgDetailPage.init();
    });
});
