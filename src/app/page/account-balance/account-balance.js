require(["modernizr",
    "jquery",
    "bootstrap",
    "handlebars",
    "bootstrap-table",
    "bootstrap-dialog",
    "text!app/page/account-balance/productSummary.hbs",
    "text!app/page/account-balance/topSummary.hbs"
], function(modernizr, $, bootstrap, Handlebars, bootstrapTable, bootstrapDialog, _productSummaryHBS, _topSummaryHBS) {
    
    var compiledproductSummary = Handlebars.compile(_productSummaryHBS);
    var compiledtopSummary = Handlebars.compile(_topSummaryHBS);
    
    var accountBalancePage = (function(){
        var config = {
            displaySpinner: ".overlay-wrapper",
            topSummary:'.js-top-summary',
            productSummary:".js-product-summary",
        }
        var init = function(){        	
            loadingInitialHbsTemplates();
            populatingTable(cbp.accountBalancePage.CBPOrderForm);
        }

        var loadingInitialHbsTemplates = function() {
            loadingDynamicHbsTemplates();
            $(config.displaySpinner).hide();
        };

        var loadingDynamicHbsTemplates = function(){
            
            $(config.topSummary).html(compiledtopSummary(cbp.accountBalancePage));
            $(config.productSummary).html(compiledproductSummary(cbp.accountBalancePage));
           
        }
                var populatingTable = function(data){
                    $('#table').bootstrapTable({
                        classes: 'table table-no-bordered',
                        striped: true,
                        sortName: 'productCode',
                        sortOrder: 'asc',
                        iconsPrefix: 'fa',
                        uniqueId: 'productCode',
                        sortable: false,
                        responsive: false,
                       //  responsiveBreakPoint: 767,
                       //  responsiveClass: "bootstrap-table-cardview",
                       //  cardView: true,
                        parentContainer: ".js-bottom-detail",
                        undefinedText: "",
                        showFooter: true,
                         columns: [{
                            field: 'account',
                            title: cbp.accountBalancePage.globalVars.account,
                            titleTooltip: cbp.accountBalancePage.globalVars.account,
                            class: 'text-wrap',
                            width: '40%'
                            
                        }, 
                        {
                            field: 'accountBalance',
                            title: cbp.accountBalancePage.globalVars.accountBalance + ((cbp.accountBalancePage.CBPOrderForm.currency === "" || cbp.accountBalancePage.CBPOrderForm.currency == null) ? '' : ' (' + cbp.accountBalancePage.CBPOrderForm.currency + ')'),
                            titleTooltip: cbp.accountBalancePage.globalVars.accountBalance,
                            class:'text-wrap accountBalance',
                            align: 'right',
                            width:'30%' 
                        },
                        {
                        field: '',
                        class:'hidden-xs',
                        width:'30%'
                        }],
                        data: data.accountBalanceDataList
             });
         };
     return {
            init: init
        };
    })();
    
    $(document).ready(function() {
        $.fn.bootstrapTable.locales = {
            formatLoadingMessage: function() {
                return cbp.accountBalancePage.globalVars.tableLocales.loadingMessage;
            },
            formatRecordsPerPage: function(pageNumber) {
                return cbp.accountBalancePage.globalVars.tableLocales.recordsPerPage.replace('{0}', pageNumber);
            },
            formatShowingRows: function(pageFrom, pageTo, totalRows) {
                return cbp.accountBalancePage.globalVars.tableLocales.showingRows.replace('{0}', pageFrom).replace('{1}', pageTo).replace('{2}', totalRows);
            },
            formatSearch: function() {
                return cbp.accountBalancePage.globalVars.tableLocales.search;
            },
            formatNoMatches: function() {
                return cbp.accountBalancePage.globalVars.tableLocales.noMatches;
            },
            formatPaginationSwitch: function() {
                return cbp.accountBalancePage.globalVars.tableLocales.paginationSwitch;
            },
            formatRefresh: function() {
                return cbp.accountBalancePage.globalVars.tableLocales.refresh;
            },
            formatToggle: function() {
                return cbp.accountBalancePage.globalVars.tableLocales.toggle;
            },
            formatColumns: function() {
                return cbp.accountBalancePage.globalVars.tableLocales.columns;
            },
            formatAllRows: function() {
                return cbp.accountBalancePage.globalVars.tableLocales.allRows;
            }
        };

        $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales);
        
        cbp.accountBalancePage.CBPOrderForm = CBPOrderForm;
        accountBalancePage.init();
    });

});