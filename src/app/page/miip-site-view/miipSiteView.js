require(["modernizr",
    "jquery",
    "bootstrap",
    "handlebars",
    "moment",
    "calendar",
    "bootstrap-select",
    "bootstrap-table",
    "text!app/components/calendar/_calendar.hbs",
    "text!app/components/dropdown/_defaultDdn.hbs",
    "text!app/page/miip-site-view/searchForm.hbs",
    "text!app/page/miip-site-view/miipSiteViewSummary.hbs",
    "text!app/page/miip-site-view/bottomDetail.hbs"

], function (modernizr, $, bootstrap, Handlebars, moment, calendar, bootstrapSelect, bootstrapTable, _calendarHBS, _defaultDdnHBS, _searchFormHBS, _delDocSummaryHBS, _bottomDetailHBS) {

    //Compiling HBS templates
    var compiledDefaultDdn = Handlebars.compile(_defaultDdnHBS);
    var compiledsearchDate = Handlebars.compile(_calendarHBS);
    var compiledsearchForm = Handlebars.compile(_searchFormHBS);
    var compiledDelDocSummary = Handlebars.compile(_delDocSummaryHBS);
    var compiledBottomDetail = Handlebars.compile(_bottomDetailHBS);

    var miipSite = (function () {

        var config = {
            locationDdnContainer: ".js-location-ddn",
            siteDdnContainer: ".js-site-ddn",
            delDocSummaryContainer: ".js-delDoc-summary",
            delDocsTypeContainer: ".js-delDocsType-ddn",
            downloadStatusContainer: ".js-downloadStatus-ddn",
            printStatusContainer: ".js-printStatus-ddn",
            pickDateRangeContainer: ".js-search-pickDateRange",
            searchFormContainer: ".js-search-form",
            searchDetailContainer: ".js-bottom-detail",
            sortByDdnContainer: ".js-sortbyDdn",
            dropDownCommon: ".selectpicker",
            ordercalendar: "#calendar",
            searchButton: "#delDocsSearch",
            tabelRow: "#table tbody tr",
            locationDdn: "#locationSelectDdn",
            accountDdn: "#accountSelectDdn",
            sortByDdn: "#sortByDdn",
            displaySpinner: ".overlay-wrapper",
            dropdownSelect: ".dropdown-menu .toggle-select",
            billOfLading: "#billOfLading",
            squareUnchecked: "fa-square-o",
            squareChecked: "fa-check-square-o",
        };

        var locationDropDownOptions = [];
        var selectedDelDocs = [];
        var selectedDelDocstatus = [];
        var startDate, endDate;
    
        var init = function () {
            populatingSoldTo();
        	populatingAccount(locationDropDownOptions[0].key, "all", true);
            loadingInitialHbsTemplates();
            populatingTable(cbp.miipSite.miipSiteResponse, cbp.miipSite.miipSiteResponse.miipSiteColumnMapping );
            bindEvents();
            enableMobileDefaultDropDown();
        };

       
        var enableMobileDefaultDropDown = function() {
            //Enable mobile scrolling by calling $('.selectpicker').selectpicker('mobile'). This enables the device's native menu for select menus.
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
                $('.selectpicker').selectpicker('mobile');
            }
        };

        var loadingInitialHbsTemplates = function () {
            //Appending handlebar templates to HTML
            $(config.searchFormContainer).html(compiledsearchForm(cbp.miipSite));
            $(config.locationDdnContainer).html(compiledDefaultDdn(cbp.miipSite.locationDropDown));
            $(config.siteDdnContainer).html(compiledDefaultDdn(cbp.miipSite.siteDropDown));
            $(config.downloadStatusContainer).html(compiledDefaultDdn(cbp.miipSite.downloadStatusDropdown));
            $(config.delDocsTypeContainer).html(compiledDefaultDdn(cbp.miipSite.delDocTypeDropdown));
            $(config.printStatusContainer).html(compiledDefaultDdn(cbp.miipSite.printStatusDropdown));
            $(config.pickDateRangeContainer).html(compiledsearchDate({
                label: cbp.miipSite.globalVars.dateRange,
                iconClass: cbp.miipSite.dateRange.iconClass,
                id: cbp.miipSite.dateRange.id
            }));
         
            //Refresh dropdown at initial dispaly after loading templates
            $(config.dropDownCommon).selectpicker('refresh');
            enableMobileDefaultDropDown();
            loadingDynamicHbsTemplates();
            $(config.displaySpinner).hide();
        };

        var loadingDynamicHbsTemplates = function () {
            $(config.searchDetailContainer).html(compiledBottomDetail(cbp.miipSite));
            setSummaryValues();
            $(config.delDocSummaryContainer).html(compiledDelDocSummary(cbp.miipSite));
            var sortDdnOptions = generatingOptions(cbp.miipSite.miipSiteResponse.miipSiteColumnMapping);
            srtByDdn["options"] = sortDdnOptions;
            $(config.sortByDdnContainer).html(compiledDefaultDdn(srtByDdn));
            $(config.sortByDdnContainer).find(config.dropDownCommon).selectpicker('refresh');
            enableMobileDefaultDropDown();
        };

        var setSummaryValues = function(){
            cbp.miipSite.summary = {};
            cbp.miipSite.summary.soldTo = $('.js-location-ddn .btn-group .dropdown-toggle').text();
            cbp.miipSite.summary.account = $('.js-account-ddn .btn-group .dropdown-toggle').text();
            cbp.miipSite.summary.dateRange = $('.js-search-pickDateRange').find('span').text();
        };

        var triggerAjaxRequest = function () {
            $(config.displaySpinner).show();
            $(config.delDocSummaryContainer).hide();
            $(config.searchDetailContainer).hide();

            leftPaneExpandCollapse.hideSearchBar();
            
            var postData = {};
            
            postData.account= $(config.accountDdn).val();
            postData.soldTo = $(config.locationDdn).val();            
            
            if($(config.billOfLading).val()!= "")
            {
                postData.billOfLading = $(config.billOfLading).val().trim();
                postData.billOfLading = parseInt(postData.billOfLading,10);
                $(config.billOfLading).val(postData.billOfLading);
            }
        
            postData.downloadStatus = $(config.downloadStatusDdn).val();
            postData.printed = $(config.printStatusDdn).val();
            postData.fromDate = startDate;
            postData.toDate = endDate;    

            function successCallback(data) {
                $(config.displaySpinner).hide();
                $(config.searchDetailContainer).show();
                $(config.delDocSummaryContainer).show();
                cbp.miipSite.miipSiteResponse = data;

                if (cbp.miipSite.miipSiteResponse.resultCount > 0) {
                    cbp.miipSite.globalVars.delDocsFoundVar = cbp.miipSite.globalVars.delDocsFound.replace("{0}", cbp.miipSite.miipSiteResponse.resultCount);
                } else {
                    cbp.miipSite.globalVars.delDocsFoundVar = cbp.miipSite.globalVars.delDocsFound.replace("{0}", 0);
                }
                cbp.miipSite.dateRange.startDate = moment(startDate, cbp.miipSite.dateRange.format, true);
                cbp.miipSite.dateRange.endDate = moment(endDate, cbp.miipSite.dateRange.format, true);

                cbp.miipSite.globalVars.summaryfromAndToVar = cbp.miipSite.globalVars.summaryfromAndTo.replace("{0}", cbp.miipSite.dateRange.startDate.format(cbp.miipSite.dateRange.format)).replace("{1}", cbp.miipSite.dateRange.endDate.format(cbp.miipSite.dateRange.format));
               
                loadingDynamicHbsTemplates();
                                
                populatingTable(data, data.miipSiteColumnMapping );
                leftPaneExpandCollapse.resetSearchFormHeight();
            }

            function errorCallback() {
                $(config.displaySpinner).hide();
                $(config.searchDetailContainer).show();
                $(config.delDocSummaryContainer).show();
                console.log("error");
            }

            $.ajax({
                type: "GET",
                data: JSON.stringify(postData),
                url: cbp.miipSite.globalUrl.searchURL,
                success: successCallback,
                error: errorCallback
            });

        };
        
        var generatingOptions = function(data){
            globalSortList = [{
                key: "delDocDate-desc",
                value: cbp.miipSite.globalVars.delDocDateAsc
        }, {
                key: "delDocDate-asc",
                value: cbp.miipSite.globalVars.delDocDateDesc
        }, { 
                key: "account-asc",
                value: cbp.miipSite.globalVars.accountSortAsc
        }, {
                key: "account-desc",
                value: cbp.miipSite.globalVars.accountSortDesc
        }, {
                key: "invoiceId-asc",
                value: cbp.miipSite.globalVars.invoiceIdAsc
        }, {
                key: "invoiceId-desc",
                value: cbp.miipSite.globalVars.invoiceIdDesc
        }, {
                key: "delDocId-asc",
                value: cbp.miipSite.globalVars.delDocAsc
        }, {
                key: "delDocId-desc",
                value: cbp.miipSite.globalVars.delDocDesc
        }, {
                key: "billOfLading-asc",
                value: cbp.miipSite.globalVars.billOfLadingAsc
        }, {
                key: "billOfLading-desc",
                value: cbp.miipSite.globalVars.billOfLadingDesc
        }, {
                key: "total-asc",
                value: cbp.miipSite.globalVars.totalAsc
        }, {
                key: "total-desc",
                value: cbp.miipSite.globalVars.totalDesc
        }];

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

        var populatingSoldTo = function(){
            locationDropDownOptions = locationDropDown.map(function(val,index){
                return {
                    key : val.uid,
                    value : val.displayName
                };
            });
            
            if(locationDropDownOptions.length>1)
            {
                locationDropDownOptions.unshift({key:"all",value:cbp.miipSite.globalVars.allTb});
            }
            cbp.miipSite.locationDropDown["options"] = locationDropDownOptions;
            cbp.miipSite.locationDropDown.searchable = true;
        };

        var populatingAccount = function(soldToId, accountId, pageLoadCheck) {
            $(config.displaySpinner).show();
            
            function successCallback(data) {
                
                $(config.displaySpinner).hide();
                
                var accountOptions = [];
                var obj = {};
                
                var account = data;
               
                accountOptions = account.map(function(val,index){
                    return {
                        key : val['uid'],
                        value : val['displayName']
                    };
                });
                
                if(account.length == 1){
                    cbp.miipSite.siteDropDown.singleOption = true;
                }else if(account.length >= 1){
                    obj["key"] = "all";
                    obj["value"] = cbp.miipSite.globalVars.allTb;
                    accountOptions.unshift(obj);
                }

               
                cbp.miipSite.siteDropDown["options"] = accountOptions;
                cbp.miipSite.siteDropDown.searchable = true;
                
                $(config.siteDdnContainer).html(compiledDefaultDdn(cbp.miipSite.siteDropDown));

                $(config.accountDdn).selectpicker('refresh');
                
                if(cbp.miipSite.siteDropDown["options"].length > 1){
                    $(config.accountDdn).val(accountId).selectpicker('refresh');
                }
                if(pageLoadCheck === true){
                    setSummaryValues();
                    $(config.delDocSummaryContainer).html(compiledDelDocSummary(cbp.miipSite));
                }
                enableMobileDefaultDropDown();
            }

            function errorCallback() {
                $(config.displaySpinner).hide();
                console.log("error");
            }

            $.ajax({
               // async:false,
                type: "GET",
                data: {
                    'soldToNumber' : soldToId                   
                },
                dataType:"json",
                url: cbp.miipSite.globalUrl.accountURL,
                success: successCallback,
                error: errorCallback
            });
        };

        var bindEvents = function () {
            
            $(document).on("reset-view.bs.table, toggle.bs.table", "#table", function(event) {
                event.stopPropagation();

                for(var i=0;i<selectedDelDocs.length; i++){
                    //trigger click for each selected delDoc
                    $("#table tbody tr[data-uniqueid="+selectedDelDocs[i]+"]").find("input[type=checkbox]").attr("checked","checked");
                }

            });
               
            $(config.locationDdn).on('change', function (e) {
                if ($(config.locationDdn).val() !== "") {
                    $(config.searchButton).removeAttr("disabled");
                } else {
                    $(config.searchButton).attr("disabled", "disabled");
                }
                populatingAccount($(config.locationDdn).val(), "all");
          });

            $(document).on('change', config.accountDdn, function(e) {
                 if ($(this).val() !== "") {
                     $(config.searchButton).removeAttr("disabled");
                 } else {
                     $(config.searchButton).attr("disabled", "disabled");
                 }
            });

            $(document).on('click', config.downloadIcon, function (evnt) {
                if (isASM !== true)
                    $(evnt.target).addClass("success-icon");
                downloadForm($(evnt.target).attr("data-delDocId"));
            });

            $(document).on('click', config.printIcon, function (evnt) {
            	var tempArray =[];
            	if (isASM !== true)
            		$(this).addClass("success-icon");
                var delDocId = $(evnt.target).attr("data-delDocId");
                tempArray = selectedDelDocs;
                selectedDelDocs = [delDocId];
                printPDFSelected();
                selectedDelDocs = tempArray;
            });
            //Search button functionality
            $(config.searchButton).on("click", function (e) {
                selectedDelDocs = []
                selectedDelDocstatus = [];
                triggerAjaxRequest();
            });

            $(function () {
                $('#billOfLading').bind('paste input', removeAlphaChars);
            })
            
            function removeAlphaChars(e) {
                var self = $(this);
                setTimeout(function () {
                    var initVal = self.val(),
                    outputVal = initVal.replace(/\W/g, '');
                    if (initVal != outputVal) self.val(outputVal);
                });
            }

            var valueOnSubmit = '.js-search-form input' + "," + config.printStatusContainer + "," +
                config.locationDdnContainer + "," +
                config.downloadStatusContainer + "," + config.pickDateRangeContainer + "";


            $(document).on('keypress', valueOnSubmit, function (e) {
                if (e.which == 13) {
                    e.preventDefault();
                    $("#delDocsSearch").trigger("click");
                }
            });


            var validateFields = config.orderNumber + "," + config.billOfLading;

            $(document).on('keypress', validateFields, function (e) {
            	var regex = /^[0-9a-zA-Z]+$/;
                var str = String.fromCharCode(e.which);
                if (str.match(regex)) {
                    return true;
                }
                e.preventDefault();
                return false;
            });
           
        };
        
        var generatingColumns = function(columnsDataList){
        	var receivedOrderKey = Object.keys(columnsDataList).filter(function(key){
        		if(columnsDataList[key]){
        			return columnsDataList[key];
        		}
        	});
            var columnsList = [{
                            field: 'checkbox',
                            checkbox: true,
                            class: 'fa',
                            formatter:function LinkFormatter(value, row, index){
                                return '<input type="hidden" name="type" value="'+ row.type + "@" + row.cbpdelDocStatus +'">';
                            }
                        }, {
                            field: 'status',
                            title: cbp.miipSite.globalVars.statustb,
                            titleTooltip: cbp.miipSite.globalVars.statustb,
                            class: 'text-nowrap',
                            formatter: function LinkFormatter(value, row, index) {
                                var downloadReport, printReport;
        
                                var downloaded = "",
                                    printed = "";
                                if (row.downloaded) {
                                    downloaded = "success-icon";
                                }
                                if (row.printed) {
                                    printed = "success-icon";
                                }
                                downloadReport = "<span class='fa fa-download iconsPrintDownload xs-pr-10 " + downloaded + "' data-delDocId='" + row.delDocId + "'>" + "</span>";
                                printReport = "<span class='fa fa-print iconsdelDocPrint " + printed + "' data-delDocId='" + row.delDocId + "'>" + "</span>";
                                return downloadReport + printReport;
                            }
                        }, {
                            field: 'account',
                            title: cbp.miipSite.globalVars.account,
                            titleTooltip: cbp.miipSite.globalVars.account,
                            width: "40%",
                            sortable: true
                        }, {
                            field: 'delDocDate',
                            title: cbp.miipSite.globalVars.delDocDate,
                            titleTooltip: cbp.miipSite.globalVars.delDocDate,
                            class: 'numberIcon text-nowrap',
                            sorter: function dateSort(a, b) {
                                a = moment(a, cbp.miipSite.dateRange.format, true).format();
                                b = moment(b, cbp.miipSite.dateRange.format, true).format();
        
                                if (a < b) {
                                    return -1;
                                }
                                if (a > b) {
                                    return 1;
                                }
                                return 0;
                            },
                            formatter: function(value, row, index){                               
                              return '<strong>'+row.delDocDate+'</strong><br>'+row.delDocTime;  
                            },
                            sortable: true
                        }, {
                            field: 'billOfLading',
                            title: cbp.miipSite.globalVars.billOfLading,
                            titleTooltip: cbp.miipSite.globalVars.billOfLading,
                            class: 'numberIcon text-nowrap',
                            sortable: true,
                        }, {
                            field: 'delDocId',
                            title: cbp.miipSite.globalVars.delDoctb,
                            titleTooltip: cbp.miipSite.globalVars.delDoctb,
                            class: 'numberIcon text-nowrap',
                            sortable: true,
                            formatter: function LinkFormatter(value, row, index) {
                                var delDocNoVar;
                
                                delDocNoVar = '<a href="javascript:void(0);" onclick="callDelDocPDFLink(\'' + row.delDocId + '\')">' + row.delDocId + '</a>';
                                   
                                return delDocNoVar;
                            }
                        }, {
                            field: 'invoiceId',
                            title: cbp.miipSite.globalVars.invoiceId,
                            titleTooltip: cbp.miipSite.globalVars.invoiceId,
                            class: 'numberIcon text-nowrap',
                            sortable: true,
                            formatter: function LinkFormatter(value, row, index) {
                                var delDocNoVar;
                
                                delDocNoVar = '<a href="javascript:void(0);" onclick="callInvoicePDFLink(\'' + row.invoiceId + '\')">' + row.invoiceId + '</a>';
                                   
                                return delDocNoVar;
                            } 
                        },{
                            field: 'total',
                            title: cbp.miipSite.globalVars.totaltb + (cbp.miipSite.miipSiteResponse.currency === null?'':' ('+cbp.miipSite.miipSiteResponse.currency+')'),
                            titleTooltip: cbp.miipSite.globalVars.totaltb + (cbp.miipSite.miipSiteResponse.currency === null?'':' ('+cbp.miipSite.miipSiteResponse.currency+')'),
                            class: 'numberIcon text-nowrap',
                            sortable: true,
                            align: 'right',
                            formatter: function LinkFormatter(value, row, index) {
                                var total;
                                if (value >= '0') {
                                    total = row.displayTotal;
                                } else {
                                    total = "<span class='text-danger'>" + row.displayTotal + "</span>";
                                }
            
                                return total;
                            }
                        }
                        ];
            var columnsListMap = columnsList.reduce(function (data, columnsList) {
            data[columnsList.field] = columnsList;
            return data;
            }, {});
            var orderKey = ["checkbox", "status","account", "delDocDate","billOfLading", "delDocId","invoiceId","total"]
          
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

        }

        var populatingTable = function (delDocsData, columnsDataList) {
            var delDocStatusCount = 0;
            if (delDocsData.resultCount > maxResults && delDocsData.miipSiteList === null) {
                cbp.miipSite.globalVars.tableLocales.noMatches = cbp.miipSite.globalVars.noMatchesMaxResults.replace('{0}', delDocsData.resultCount);
                delDocsData.miipSiteList = [];
            } else if (delDocsData.resultCount === 0) {
                cbp.miipSite.globalVars.tableLocales.noMatches = cbp.miipSite.globalVars.noMatches;
            } else if (delDocsData.resultCount > maxResults) {
                cbp.miipSite.globalVars.tableLocales.noMatches = cbp.miipSite.globalVars.noMatchesMaxResults.replace('{0}', delDocsData.resultCount);
                delDocsData.miipSiteList = [];
            }

            if (delDocsData.miipSiteList === null || delDocsData.miipSiteList === undefined) {
                delDocsData.miipSiteList = [];
            }
            $(config.sortByDdn).val("invoiceId-desc").selectpicker('refresh');


            $('#table').bootstrapTable({
                classes: 'table table-no-bordered',
                striped: true,
                sortName: 'invoiceId',
                uniqueId: 'delDocId',
                sortOrder: 'desc',
                iconsPrefix: 'fa',
                sortable: true,
                parentContainer: ".js-bottom-detail",
                sortByDropdownId: "#sortByDdn",
                responsive: true,
                responsiveBreakPoint: 768,
                responsiveClass: "bootstrap-table-cardview",
                onCheck: function (row, $element) {

                    // enable button
                  
                    selectedDelDocs.push(row.delDocId);
                },
                onCheckAll: function (rows) {
                    // enable button
                    selectedDelDocs = [];
                    selectedDelDocstatus = [];
                    var len = rows.length;
                    for (var i = 0; i < len; i++) {
                        selectedDelDocs.push(rows[i].delDocId);
                    }
                },
                onUncheck: function (row, $element) {
                    // write logic..as not sure if all unselected
                    var index = selectedDelDocs.indexOf(row.delDocId);
                    if (index > -1) {
                        selectedDelDocs.splice(index, 1);
                    }
                },
                onUncheckAll: function (rows) {
                    //disable button
                    selectedDelDocs = [];
                    $("#table tbody").find("tr").removeClass("bg-danger");
                },
                columns: generatingColumns(columnsDataList),
                data: delDocsData.miipSiteList
            });

        };

        return {
            init: init
        };
    })();


    $(document).ready(function () {
    	$.ajaxPrefilter(function (options, originalOptions, jqXHR) {
            if (options.type.toLowerCase() === "post") {
                options.headers = {
                    'CSRFToken': CSRFToken
                }
            }
        });
    	
        //Localization setup for dropdown & table
        $.fn.selectpicker.defaults = {
            noneSelectedText: cbp.miipSite.globalVars.selectDdn.noneSelectedText,
            noneResultsText: cbp.miipSite.globalVars.selectDdn.noneResultsText,
            countSelectedText: function (numSelected, numTotal) {
                return (numSelected == 1) ? cbp.miipSite.globalVars.selectDdn.itemSelected : cbp.miipSite.globalVars.selectDdn.itemSelected1;
            },
            maxOptionsText: function (numAll, numGroup) {
                return [
                    (numAll == 1) ? cbp.miipSite.globalVars.selectDdn.limitReached : cbp.miipSite.globalVars.selectDdn.limitReached1,
                    (numGroup == 1) ? cbp.miipSite.globalVars.selectDdn.groupLimit : cbp.miipSite.globalVars.selectDdn.groupLimit1
            ];
            },
            selectAllText: cbp.miipSite.globalVars.selectDdn.selectAllText,
            deselectAllText: cbp.miipSite.globalVars.selectDdn.deselectAllText
        };

        $.fn.bootstrapTable.locales = {
            formatLoadingMessage: function () {
                return cbp.miipSite.globalVars.tableLocales.loadingMessage;
            },
            formatRecordsPerPage: function (pageNumber) {
                return cbp.miipSite.globalVars.tableLocales.recordsPerPage.replace('{0}', pageNumber);
            },
            formatShowingRows: function (pageFrom, pageTo, totalRows) {
                return cbp.miipSite.globalVars.tableLocales.showingRows.replace('{0}', pageFrom).replace('{1}', pageTo).replace('{2}', totalRows);
            },
            formatSearch: function () {
                return cbp.miipSite.globalVars.tableLocales.search;
            },
            formatNoMatches: function () {
                return cbp.miipSite.globalVars.tableLocales.noMatches;
            },
            formatPaginationSwitch: function () {
                return cbp.miipSite.globalVars.tableLocales.paginationSwitch;
            },
            formatRefresh: function () {
                return cbp.miipSite.globalVars.tableLocales.refresh;
            },
            formatToggle: function () {
                return cbp.miipSite.globalVars.tableLocales.toggle;
            },
            formatColumns: function () {
                return cbp.miipSite.globalVars.tableLocales.columns;
            },
            formatAllRows: function () {
                return cbp.miipSite.globalVars.tableLocales.allRows;
            }
        };

        $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales);
        
        leftPaneExpandCollapse.init();

        cbp.miipSite.miipSiteResponse = miipSiteResponse;
        if (miipSiteResponse.resultCount === undefined || miipSiteResponse.resultCount === null) {
            cbp.miipSite.miipSiteResponse.resultCount = 0;
            cbp.miipSite.globalVars.delDocsFoundVar = cbp.miipSite.globalVars.delDocsFound.replace("{0}", 0);
        } else {
            cbp.miipSite.globalVars.delDocsFoundVar = cbp.miipSite.globalVars.delDocsFound.replace("{0}", miipSiteResponse.resultCount);
        }

        if (miipSiteResponse.miipSiteList === undefined || miipSiteResponse.miipSiteList === null) {
            cbp.miipSite.miipSiteResponse.miipSiteList = [];
        }
        cbp.miipSite.dateRange.startDate = moment().subtract(pastSelectableDate,'days');
        cbp.miipSite.dateRange.endDate = moment();
        cbp.miipSite.globalVars.summaryfromAndToVar = cbp.miipSite.globalVars.summaryfromAndTo.replace("{0}", cbp.miipSite.dateRange.startDate.format(cbp.miipSite.dateRange.format)).replace("{1}", cbp.miipSite.dateRange.endDate.format(cbp.miipSite.dateRange.format));
        miipSite.init();

    });

    
});