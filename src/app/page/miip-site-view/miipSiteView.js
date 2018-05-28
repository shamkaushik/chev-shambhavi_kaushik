require(["modernizr",
    "jquery",
    "bootstrap",
    "handlebars",
    "moment",
    "calendar",
    "bootstrap-select",
    "bootstrap-table",
    "text!app/components/dropdown/_defaultDdn.hbs",
    "text!app/page/miip-site-view/searchForm.hbs",
    "text!app/page/miip-site-view/miipSiteViewSummary.hbs",
    "text!app/page/miip-site-view/bottomDetail.hbs"

], function (modernizr, $, bootstrap, Handlebars, moment, calendar, bootstrapSelect, bootstrapTable, _defaultDdnHBS, _searchFormHBS, _miipSummaryHBS, _bottomDetailHBS) {

    //Compiling HBS templates
    var compiledDefaultDdn = Handlebars.compile(_defaultDdnHBS);
    var compiledSearchForm = Handlebars.compile(_searchFormHBS);
    var compiledMiipSummary = Handlebars.compile(_miipSummaryHBS);
    var compiledBottomDetail = Handlebars.compile(_bottomDetailHBS);

    var miipSite = (function () {

        var config = {
            soldToDdnContainer: ".js-soldTo-ddn",
            siteDdnContainer: ".js-site-ddn",
            volumeDiscrepencyDdnContainer: ".js-volume-descrepency-ddn",
            miipSiteSummaryContainer: ".js-miipSite-summary",
            searchFormContainer: ".js-search-form",
            searchDetailContainer: ".js-bottom-detail",
            sortByDdnContainer: ".js-sortbyDdn",
            searchButton: "#miipSiteSearch",
            tabelRow: "#table tbody tr",
            locationDdn: "#locationSelectDdn",
            siteDdn: "#siteSelectDdn",
            sortByDdn: "#sortByDdn",
            displaySpinner: ".overlay-wrapper",
        };

        var locationDropDownOptions = [];
        var volumeDiscrepencyDropDownOptions = [];

        var init = function () {
          populatingSoldTo(true);
          populatingSite(locationDropDownOptions[0].key, "all", true);
          populatingVolumeDiscrepency();
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
            $(config.searchFormContainer).html(compiledSearchForm(cbp.miipSite));
            $(config.soldToDdnContainer).html(compiledDefaultDdn(cbp.miipSite.locationDropDown));
            $(config.siteDdnContainer).html(compiledDefaultDdn(cbp.miipSite.siteDropDown));
            $(config.volumeDiscrepencyDdnContainer).html(compiledDefaultDdn(cbp.miipSite.volumeDiscrepencyDropDown));

            //Refresh dropdown at initial dispaly after loading templates
            enableMobileDefaultDropDown();
            loadingDynamicHbsTemplates();
            $(config.displaySpinner).hide();
        };

        var loadingDynamicHbsTemplates = function () {
            $(config.searchDetailContainer).html(compiledBottomDetail(cbp.miipSite));
            $(config.miipSiteSummaryContainer).html(compiledMiipSummary(cbp.miipSite));
            var sortDdnOptions = generatingOptions(cbp.miipSite.miipSiteResponse.miipSiteColumnMapping);
                $(config.soldToDdnContainer).html(compiledDefaultDdn(cbp.miipSite.locationDropDown));
            srtByDdn["options"] = sortDdnOptions;
            $(config.sortByDdnContainer).html(compiledDefaultDdn(srtByDdn));
            $(config.sortByDdnContainer).find(config.dropDownCommon).selectpicker('refresh');
            enableMobileDefaultDropDown();
            setSummaryValues();
        };

        var setSummaryValues = function(){
          cbp.miipSite.summary = {};
          cbp.miipSite.summary.soldTo = cbp.miipSite.globalVars.allTb;
          cbp.miipSite.summary.site = $('.js-site-ddn .btn-group .dropdown-toggle').text();
          cbp.miipSite.summary.volumeDiscrepency = cbp.miipSite.globalVars.allTb;
        };

        var triggerAjaxRequest = function () {
            $(config.displaySpinner).show();
            $(config.miipSiteSummaryContainer).hide();
            $(config.searchDetailContainer).hide();
            leftPaneExpandCollapse.hideSearchBar();
            var postData = {};
            postData.site= $(config.siteDdn).val();
            postData.soldTo = $(config.locationDdn).val();
            function successCallback(data) {
                $(config.displaySpinner).hide();
                $(config.searchDetailContainer).show();
                $(config.miipSiteSummaryContainer).show();
                cbp.miipSite.miipSiteResponse = data;

                if (cbp.miipSite.miipSiteResponse.resultCount > 0) {
                    cbp.miipSite.globalVars.miipFoundVar = cbp.miipSite.globalVars.miipResultsFound.replace("{0}", cbp.miipSite.miipSiteResponse.resultCount);
                } else {
                    cbp.miipSite.globalVars.miipFoundVar = cbp.miipSite.globalVars.miipResultsFound.replace("{0}", 0);
                }

                loadingDynamicHbsTemplates();

                populatingTable(data, data.miipSiteColumnMapping );
                leftPaneExpandCollapse.resetSearchFormHeight();
            }

            function errorCallback() {
                $(config.displaySpinner).hide();
                $(config.searchDetailContainer).show();
                $(config.miipSiteSummaryContainer).show();
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
                key: "site-asc",
                value: cbp.miipSite.globalVars.siteSortAsc
        }, {
                key: "site-desc",
                value: cbp.miipSite.globalVars.siteSortDesc
        }, {
                key: "volumeDiscrepency-asc",
                value: cbp.miipSite.globalVars.volumeDesAsc
        }, {
                key: "volumeDiscrepency-desc",
                value: cbp.miipSite.globalVars.volumeDesDesc
        }, {
                key: "thruput-asc",
                value: cbp.miipSite.globalVars.thruputAsc
        }, {
                key: "thruput-desc",
                value: cbp.miipSite.globalVars.thruputDesc
        }, {
                key: "rentFlag-asc",
                value: cbp.miipSite.globalVars.rentFlagAsc
        }, {
                key: "rentFlag-desc",
                value: cbp.miipSite.globalVars.rentFlagDesc
        }, {
                key: "brand-asc",
                value: cbp.miipSite.globalVars.brandAsc
        }, {
                key: "brand-desc",
                value: cbp.miipSite.globalVars.brandDesc
        },
        {
                key: "businessConsultant-asc",
                value: cbp.miipSite.globalVars.businessConsultantAsc
        }, {
                key: "businessConsultant-desc",
                value: cbp.miipSite.globalVars.businessConsultantDesc
        },
        {
                key: "siteZone-asc",
                value: cbp.miipSite.globalVars.siteZoneAsc
        }, {
                key: "siteZone-desc",
                value: cbp.miipSite.globalVars.siteZoneDesc
        }
      ];

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

        var populatingSoldTo = function(pageLoadCheck){
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

        var populatingVolumeDiscrepency = function () {
          volumeDiscrepencyDropDownOptions = volumeDiscrepencyDropDown.map(function(val,index){
              return {
                  key : val.key,
                  value : val.displayName
              };
          });

          if(volumeDiscrepencyDropDownOptions.length>1)
          {
              volumeDiscrepencyDropDownOptions.unshift({key:"all",value:cbp.miipSite.globalVars.allTb});
          }
          cbp.miipSite.volumeDiscrepencyDropDown["options"] = volumeDiscrepencyDropDownOptions;
          cbp.miipSite.volumeDiscrepencyDropDown.searchable = true;
        };

        var populatingSite = function(soldToId, siteId, pageLoadCheck) {
            $(config.displaySpinner).show();
            function successCallback(data) {
                $(config.displaySpinner).hide();
                var siteOptions = [];
                var obj = {};
                var site = data;
                siteOptions = site.map(function(val,index){
                    return {
                        key : val['uid'],
                        value : val['displayName']
                    };
                });
                if(site.length == 1){
                    cbp.miipSite.siteDropDown.singleOption = true;
                }else if(site.length >= 1){
                    obj["key"] = "all";
                    obj["value"] = cbp.miipSite.globalVars.allTb;
                    siteOptions.unshift(obj);
                }
                cbp.miipSite.siteDropDown["options"] = siteOptions;
                cbp.miipSite.siteDropDown.searchable = true;

                $(config.siteDdnContainer).html(compiledDefaultDdn(cbp.miipSite.siteDropDown));

                $(config.siteDdn).selectpicker('refresh');

                if(cbp.miipSite.siteDropDown["options"].length > 1){
                    $(config.siteDdn).val(siteId).selectpicker('refresh');
                }
                if(pageLoadCheck === true){
                  setSummaryValues();
                  $(config.miipSiteSummaryContainer).html(compiledMiipSummary(cbp.miipSite));
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
                url: cbp.miipSite.globalUrl.siteURL,
                success: successCallback,
                error: errorCallback
            });
        };

        var bindEvents = function () {
            $(config.locationDdn).on('change', function (e) {
                if ($(config.locationDdn).val() !== "") {
                    $(config.searchButton).removeAttr("disabled");
                } else {
                    $(config.searchButton).attr("disabled", "disabled");
                }
                populatingSite($(config.locationDdn).val(), "all");
          });

            $(document).on('change', config.siteDdn, function(e) {
                 if ($(this).val() !== "") {
                     $(config.searchButton).removeAttr("disabled");
                 } else {
                     $(config.searchButton).attr("disabled", "disabled");
                 }
            });


            //Search button functionality
            $(config.searchButton).on("click", function (e) {
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

            var valueOnSubmit = '.js-search-form input' + ","  +
                config.soldToDdnContainer + "," ;

            $(document).on('keypress', valueOnSubmit, function (e) {
                if (e.which == 13) {
                    e.preventDefault();
                    $("#miipSiteSearch").trigger("click");
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
                          class: 'fa',
                         
                        },
                        {
                            field: 'siteName',
                            title: cbp.miipSite.globalVars.site,
                            titleTooltip: cbp.miipSite.globalVars.site,
                            width: "40%",
                            sortable: true
                        },
                        {
                            field: 'volumeDiscrepency',
                            title: cbp.miipSite.globalVars.volumeDiscrepency,
                            titleTooltip: cbp.miipSite.globalVars.volumeDiscrepency,
                            width: "20%",
                            sortable: true
                        },
                        {
                            field: 'thruput',
                            title: cbp.miipSite.globalVars.thruput,
                            titleTooltip: cbp.miipSite.globalVars.thruput,
                            width: "20%",
                            sortable: true
                        },
                        {
                            field: 'rentFlag',
                            title: cbp.miipSite.globalVars.rentFlag,
                            titleTooltip: cbp.miipSite.globalVars.rentFlag,
                            width: "20%",
                            sortable: true
                        },
                        {
                          field: 'brand',
                          title: cbp.miipSite.globalVars.brand,
                          titleTooltip: cbp.miipSite.globalVars.brand,
                          width: "20%",
                          sortable: true
                        },
                        {
                          field: 'businessConsultant',
                          title: cbp.miipSite.globalVars.businessConsultant,
                          titleTooltip: cbp.miipSite.globalVars.businessConsultant,
                          width: "40%",
                          sortable: true
                        },
                        {
                          field: 'siteZone',
                          title: cbp.miipSite.globalVars.siteZone,
                          titleTooltip: cbp.miipSite.globalVars.siteZone,
                          width: "20%",
                          sortable: true
                        }];

            var columnsListMap = columnsList.reduce(function (data, columnsList) {
            data[columnsList.field] = columnsList;
            return data;
            }, {});
            var orderKey = [ "siteName", "volumeDiscrepency","thruput", "rentFlag","brand","businessConsultant","siteZone"]

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

        var populatingTable = function (miipViewData, columnsDataList) {
            if (miipViewData.resultCount > maxResults && miipViewData.miipSiteList === null) {
                cbp.miipSite.globalVars.tableLocales.noMatches = cbp.miipSite.globalVars.noMatchesMaxResults.replace('{0}', miipViewData.resultCount);
                miipViewData.miipSiteList = [];
            } else if (miipViewData.resultCount === 0) {
                cbp.miipSite.globalVars.tableLocales.noMatches = cbp.miipSite.globalVars.noMatches;
            } else if (miipViewData.resultCount > maxResults) {
                cbp.miipSite.globalVars.tableLocales.noMatches = cbp.miipSite.globalVars.noMatchesMaxResults.replace('{0}', miipViewData.resultCount);
                miipViewData.miipSiteList = [];
            }

            if (miipViewData.miipSiteList === null || miipViewData.miipSiteList === undefined) {
                miipViewData.miipSiteList = [];
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
                columns: generatingColumns(columnsDataList),
                data: miipViewData.miipSiteList
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
            cbp.miipSite.globalVars.miipFoundVar = cbp.miipSite.globalVars.miipResultsFound.replace("{0}", 0);
        } else {
            cbp.miipSite.globalVars.miipFoundVar = cbp.miipSite.globalVars.miipResultsFound.replace("{0}", miipSiteResponse.resultCount);
        }

        if (miipSiteResponse.miipSiteList === undefined || miipSiteResponse.miipSiteList === null) {
            cbp.miipSite.miipSiteResponse.miipSiteList = [];
        }
        miipSite.init();
    });
});
