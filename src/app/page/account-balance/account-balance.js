require(["modernizr",
    "jquery",
    "bootstrap",
    "handlebars",
    "bootstrap-table",
    "bootstrap-dialog",
    "text!app/page/account-balance/productSummary.hbs",
    // "text!app/page/account-balance/summaryButtons.hbs",
    "text!app/page/account-balance/topSummary.hbs"
], function(modernizr, $, bootstrap, Handlebars, bootstrapTable, bootstrapDialog, _productSummaryHBS, _topSummaryHBS) {
    
    var compiledproductSummary = Handlebars.compile(_productSummaryHBS);
    // var compiledsummaryButtons = Handlebars.compile(_summaryButtonsHBS);
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
            bindEvents();
        }

        var loadingInitialHbsTemplates = function() {
            loadingDynamicHbsTemplates();
            $(config.displaySpinner).hide();
        };

        var loadingDynamicHbsTemplates = function(){
            
            $(config.topSummary).html(compiledtopSummary(cbp.accountBalancePage));
            $(config.productSummary).html(compiledproductSummary(cbp.accountBalancePage));
           
        }
        
    
        
        var showWarningMessage = function(message){ 
            $('.alert-warning').removeClass("hide");                  
            $('.alert-warning').append('<span class="alert-message">'+message+'</span>');        
        }
        
        var showInfoMessage = function(message){ 
            $('.alert-info').removeClass("hide");                      
            $('.alert-info').append('<span class="alert-message">'+message+'</span>');
        }
        
        var showErrorMessage = function(message){
        	$('.alert-danger').removeClass("hide"); 
        	$('.alert-danger').append('<span class="alert-message">'+message+'</span>'); 
        }

        
        
        var bindEvents = function(){
        	$('#submitOnSummaryBtn').on('click', function(){
        		$(config.displaySpinner).show()
            	console.log(cbp.accountBalancePage.CBPOrderForm);
            	// Use raw value for sending to backend as commas cause issues with the JSON marshalling
            	if(cbp.accountBalancePage.CBPOrderForm.isComma){
            		 cbp.accountBalancePage.rawTotal = cbp.accountBalancePage.CBPOrderForm.totalPrice.replace(/,/g,"");
            	}
            	else{
            		cbp.accountBalancePage.rawTotal = cbp.accountBalancePage.CBPOrderForm.totalPrice.split('.').join('');
            	}
            	cbp.accountBalancePage.CBPOrderForm.totalPrice = cbp.accountBalancePage.rawTotal;
            	
            	var fmdata = JSON.stringify(cbp.accountBalancePage.CBPOrderForm);
            	console.log('FmData', fmdata);
            	$("#CBPOrderForm").attr('action', cbp.accountBalancePage.globalUrl.submitOrderURL);
                $('#CBPOrderForm #orderFormData').val(fmdata);
                $('#CBPOrderForm').submit();
            });

        	$(document).on("reset-view.bs.table, toggle.bs.table", "#table", function(event) {
                event.stopPropagation();
            });        	
        	
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
        cbp.accountBalancePage.isASM = isASM;
        accountBalancePage.init();
    });

});