require(["modernizr",
    "jquery",
    "bootstrap",
    "handlebars",
    "moment",
    "calendar",
    "bootstrap-select",
    "bootstrap-table",
    "toggleSwitch",
    "text!app/components/calendar/_calendar.hbs",
    "text!app/components/dropdown/_defaultDdn.hbs",
    "text!app/page/usmr/searchForm.hbs",
    "text!app/page/usmr/addNewUserForm.hbs",
    "text!app/page/usmr/bottomDetail.hbs"

], function (modernizr, $, bootstrap, Handlebars, moment, toggleSwitch, calendar, bootstrapSelect, bootstrapTable, _calendarHBS, _defaultDdnHBS, _searchFormHBS, _addNewUserForm, _bottomDetailHBS) {

    var statusUserDdnOptions = [],userCountryDddnOptions = [],siteDropdownOptions = [],pyDropdownOptions = [], eftObj = {},startDateDT = '',endDateDT = '';

    var selectedEFTs = [],selectedProduct = [],selectedEftStatus = [];

    //Compiling HBS templates
    var compiledDefaultDdn = Handlebars.compile(_defaultDdnHBS);
    var compiledsearchDate = Handlebars.compile(_calendarHBS);
    var compiledsearchForm = Handlebars.compile(_searchFormHBS);
    var compiledUserForm = Handlebars.compile(_addNewUserForm);
    var compiledBottomDetail = Handlebars.compile(_bottomDetailHBS);

    var usmrPageAddNew = (function () {
        var startDate, endDate;
        var srtByDdn = {
            "options": [{
                    key: "eftNoticeNumber-asc",
                    value: cbp.usmrPageAddNew.globalVars.eftNoticeNumberAsc
            }, {
                    key: "eftNoticeNumber-desc",
                    value: cbp.usmrPageAddNew.globalVars.eftNoticeNumberDesc
            },{
                    key: "noticeDate-desc",
                    value: cbp.usmrPageAddNew.globalVars.noticeDateAsc
            }, {
                    key: "noticeDate-asc",
                    value: cbp.usmrPageAddNew.globalVars.noticeDateDesc
            }, {
                    key: "accountNumber-asc",
                    value: cbp.usmrPageAddNew.globalVars.accountNumberAsc
            }, {
                    key: "accountNumber-desc",
                    value: cbp.usmrPageAddNew.globalVars.accountNumberDesc
            }, {
                    key: "settlementDate-asc",
                    value: cbp.usmrPageAddNew.globalVars.settlementDateAsc
            }, {
                    key: "settlementDate-desc",
                    value: cbp.usmrPageAddNew.globalVars.settlementDateDesc
            }, {
                    key: "total-asc",
                    value: cbp.usmrPageAddNew.globalVars.totaltb  + " (" + eftSearchCurrency + "), " +  cbp.usmrPageAddNew.globalVars.ascLabel
            }, {
                    key: "total-desc",
                    value: cbp.usmrPageAddNew.globalVars.totaltb + " (" + eftSearchCurrency + "), " + cbp.usmrPageAddNew.globalVars.descLabel
            }
          ],
            label: cbp.usmrPageAddNew.globalVars.sortBy,
            labelClass: "xs-mr-5",
            name: "sortByDdn",
            display: "displayInline"
        };

        var populateDropDowns = function(dropDownList,dropDownListOptions,dropDownName){
            if (dropDownList.length > 1) {
                var obj = {};
                obj["key"] = "all";
                obj["value"] = cbp.usmrPageAddNew.globalVars.allAccount;
                dropDownListOptions.push(obj);
            }

            for (var i = 0; i < dropDownList.length; i++) {
                var obj = {};
                obj["key"] = dropDownList[i].uid;
                obj["value"] = dropDownList[i].displayName;
                obj["isInGracePeriod"] = dropDownList[i].isInGracePeriod;
                dropDownListOptions.push(obj);
            }

            cbp.usmrPageAddNew[dropDownName].options = dropDownListOptions;
            cbp.usmrPageAddNew[dropDownName].searchable = true;
        };

        var config = {
            addNewUserFormContainer: ".js-usmr-userForm",
            statusUserDdnContainer : ".js-userStatus-ddn",
            countryUserDdnContainer: ".js-userCountry-ddn",
            soldToicon : ".soldToicon",
            searchDetailContainer: ".js-bottom-detail",
            sortByDdnContainer: ".js-sortbyDdn",
            dropDownCommon: ".selectpicker",
            searchButton: "#ccsSearchBtn",
            tabelRow: "#table tbody tr",
            downloadBtn: ".js-downloadBtn",
            soldToDropdownSelector: "#soldToDropdownSelector",
            siteDropdownSelector: "#siteDropdownSelector",
            pyDropdownSelector: "#pyDropdownSelector",
            sortByDdn: "#sortByDdn",
            displaySpinner: ".overlay-wrapper",
            dropdownSelect: ".dropdown-menu .toggle-select",
            squareUnchecked: "fa-square-o",
            squareChecked: "fa-check-square-o",
            downloadIcon: ".iconsPrintDownload",
        };

        var init = function () {
            populateDropDowns(statusUserDdn,statusUserDdnOptions,"statusUserDdn");
            populateDropDowns(userCountryDddn,userCountryDddnOptions,"userCountryDddn");
            // populateDropDowns(pyDropdown,pyDropdownOptions,"pyDropdown");
            loadingInitialHbsTemplates();
            bindEvents();
            triggerAjaxRequest();
            setItalicsToThedefaultSelection();
        };

        var setItalicsToThedefaultSelection = function(){
            var selectorDopdown=$('.search-content').find('button span.filter-option'),selectorCalendar = $(config.ordercalendar).find('span');
            selectorDopdown.each(function(){
                $.trim($(this).text()).toLowerCase()==cbp.usmrPageAddNew.globalVars.allAccount.toLowerCase() ? $(this).addClass('italics') : $(this).removeClass('italics');
            });
        };

        var loadingInitialHbsTemplates = function () {
            //Appending handlebar templates to HTML
            $(config.searchFormContainer).html(compiledsearchForm(cbp.usmrPageAddNew));
            $(config.siteDdnContainer).html(compiledDefaultDdn(cbp.usmrPageAddNew.siteDropdown));
            $(config.pyDdnContainer).html(compiledDefaultDdn(cbp.usmrPageAddNew.pyDropdown));
            loadingDynamicHbsTemplates();
            //Refresh dropdown at initial dispaly after loading templates
            $(config.dropDownCommon).selectpicker('refresh');
            enableMobileDefaultDropDown();
            $(config.displaySpinner).hide();
        };

        var loadingDynamicHbsTemplates = function () {
            $(config.addNewUserFormContainer).html(compiledUserForm(cbp.usmrPageAddNew));
            $(config.searchDetailContainer).html(compiledBottomDetail(cbp.usmrPageAddNew));
            $(config.sortByDdnContainer).html(compiledDefaultDdn(srtByDdn));
            $(config.sortByDdnContainer).find(config.dropDownCommon).selectpicker('refresh');
            $(config.statusUserDdnContainer).html(compiledDefaultDdn(cbp.usmrPageAddNew.statusUserDdn));
            $(config.countryUserDdnContainer).html(compiledDefaultDdn(cbp.usmrPageAddNew.userCountryDddn));
            $(config.dropDownCommon).selectpicker('refresh');
            enableMobileDefaultDropDown();
        };

        var enableMobileDefaultDropDown = function () {
            //Enable mobile scrolling by calling $('.selectpicker').selectpicker('mobile'). This enables the device's native menu for select menus.
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
                $(config.dropDownCommon).selectpicker('mobile');
            }

            $(config.searchFormContainer).find('select.selectpicker').on('changed.bs.select change', function (e) {
                setItalicsToThedefaultSelection();
            });

            $(config.searchFormContainer).find('select.selectpicker').on('changed.bs.select change', function (e) {
                setItalicsToThedefaultSelection();
            });
        };

        var downloadBtnSelected = function () {
            $('#eftForm #selectedEFTs').val(selectedEFTs.toString());
            for (var i = 0; len = selectedEFTs.length, i < len; i++) {
                $(".iconsPrintDownload[data-eftNoticeNumberId='" + selectedEFTs[i] + "']").addClass("success-icon");
            }
            $("#eftForm").submit();
        };

        var triggerAjaxRequest = function () {
            var selectorCalendar = $(config.ordercalendar).find('span'), hiddenInputForToggleSwitch = $("#eftSearchToggle input[type='hidden']");
            $(config.displaySpinner).show();
            $(config.ccsSummaryContainer).hide();
            $(config.searchDetailContainer).hide();

            leftPaneExpandCollapse.hideSearchBar();

            var postData = {};
            postData.account = $(config.accountDdn).val();

            postData.soldTo = $(config.soldToDropdown).val();

            /* end DSLEC-120*/

            if ($(config.accountDdn).val() != 'all') {
                cbp.usmrPageAddNew.showSoldTo = false;
            } else {
                cbp.usmrPageAddNew.showSoldTo = true;
            }

            function successCallback(data) {
                $(config.displaySpinner).hide();
                $(config.searchDetailContainer).show();
                $(config.ccsSummaryContainer).show();
                cbp.usmrPageAddNew.usmrUserData = data;

                if (cbp.usmrPageAddNew.usmrUserData.resultCount === undefined || cbp.usmrPageAddNew.usmrUserData.resultCount === null) {
                    cbp.usmrPageAddNew.usmrUserData.resultCount = 0;
                }

                if (cbp.usmrPageAddNew.usmrUserData.eftSearchDataList === undefined || cbp.usmrPageAddNew.usmrUserData.eftSearchDataList === null) {
                    cbp.usmrPageAddNew.usmrUserData.eftSearchDataList = [];
                }

                loadingDynamicHbsTemplates();
                populatingTable(cbp.usmrPageAddNew.usmrUserData.cssSearchDataList,cbp.usmrPageAddNew.usmrUserData.ccsSearchDataListMapping);
                leftPaneExpandCollapse.resetSearchFormHeight();
            }

            function errorCallback() {
                $(config.displaySpinner).hide();
                $(config.searchDetailContainer).show();
                $(config.ccsSummaryContainer).show();
                console.log("error");
            }

            $.ajax({
                type: cbp.usmrPageAddNew.globalUrl.method,
                headers: {'CSRFToken':CSRFToken},
                data: JSON.stringify(postData),
                contentType:"application/json",
                dataType:"json",
                url: cbp.usmrPageAddNew.globalUrl.eftSearchPostURL,
                success: successCallback,
                error: errorCallback
            });

        };

        var downloadForm = function (eftNoticeNumberId) {
            var loc = $("#contextPath").val();
            var formTemplate = "<form id='downloadForm' method='POST' action='" + loc + "/eft/eftCSV'><input type='hidden' name='selectedEFTs' value='" + eftNoticeNumberId + "'/><input name='CSRFToken' id='CSRFToken' type='hidden' value='" + CSRFToken + "'/></form>";
            $(formTemplate).appendTo("body").submit().remove();
        };

        var enablePrintDownloadButtons = function () {
            $(config.downloadBtn).removeClass("disabled");
        };
        var disablePrintDownloadButtons = function () {
            $(config.downloadBtn).addClass("disabled");
        };

        var bindEvents = function () {
            $(document).on("click","input[type='checkbox']", function(event){
              if($(config.tabelRow).hasClass('selected')){
                $(config.downloadBtn).removeClass("disabled");
              }
              else{
                $(config.downloadBtn).addClass("disabled");
              }
            });

            $(document).on("click", config.eftNoticeLink, function(e){
                // e.preventDefault();
                // console.log("In Link CLick >>>");
                // var eftNoticeUid = $(e.target).attr('data-uid');
                // eftObj.account = $("#accountSelectDdn").val();
                // if($.trim($(config.searchInputEft).val()).length!=0){
                //     $("#eftSearchToggle input[type='hidden']").val() == 2 ?
                //            eftObj.eftNoticeNumber = $(config.searchInputEft).val()
                //     : eftObj.invoiceNumber = $(config.searchInputEft).val();
                // }
                // eftObj.downloadStatus = $("#downloadStatus").val();
                // eftObj.printStatus = $("#printStatus").val();
                // eftObj.startDate = cbp.usmrPageAddNew.dateRange.startDate.format(cbp.usmrPageAddNew.dateRange.format);
                // eftObj.endDate = cbp.usmrPageAddNew.dateRange.endDate.format(cbp.usmrPageAddNew.dateRange.format);
                // console.log("eft Object >>>",eftObj);
                // localStorage.setItem("eftObj", JSON.stringify(eftObj));
                // $('#eftDetailsForm #eftNoticeid').val(eftNoticeUid);
                // $('#eftDetailsForm').submit();
              });

            $(document).on('click', config.downloadIcon, function (evnt) {
                var isInternalUser = $("#isInternalUser").val();
                if (isInternalUser != "true" && inASMSession !== "true")
                    $(evnt.target).addClass("success-icon");
                downloadForm($(evnt.target).attr("data-eftNoticeNumberId"));
            });

            //Search button functionality
            $(config.searchButton).on("click", function (e) {
                selectedEFTs = [];
                triggerAjaxRequest();
            });


            var validatefields = config.eftNoticeNumber + "," + config.invoiceNumber + "";

            $(document).on('keypress', validatefields, function (e) {
                var regex = /^[0-9]+$/;
                var str = String.fromCharCode(e.which);
                if (str.match(regex)) {
                    return true;
                }
                e.preventDefault();
                return false;
            });

            $(document).on("click", config.downloadBtn, function(){
                downloadBtnSelected();
            });

            $(document).on('click',config.daterangepickerContainer+' .ranges ul li',function(){
                setItalicsToThedefaultSelection();
            });

            $(document).on('change',config.soldToDropdownSelector,function(){
                populateSite($(config.soldToDropdownSelector).val());
            });

            $(document).on('click',config.soldToicon,function(){
                if($(this).hasClass('down')==true){

                }
            });
        };

        var populateSite = function(soldto){
            siteDropdownOptions = [];
            function successCallback(data) {
                $(config.displaySpinner).hide();
                leftPaneExpandCollapse.resetSearchFormHeight();
                populateDropDowns(data.siteDropdown,siteDropdownOptions,"siteDropdown");
                $(config.siteDdnContainer).html(compiledDefaultDdn(cbp.usmrPageAddNew.siteDropdown));
                //Refresh dropdown at initial dispaly after loading templates
                $(config.dropDownCommon).selectpicker('refresh');
                enableMobileDefaultDropDown();
                setItalicsToThedefaultSelection();
            }

            function errorCallback() {
                $(config.displaySpinner).hide();
                $(config.searchDetailContainer).show();
                $(config.ccsSummaryContainer).show();
                console.log("error");
            }

            $.ajax({
                type: cbp.usmrPageAddNew.globalUrl.method,
                headers: {'CSRFToken':CSRFToken},
               	data: {
                    'soldToNumber' : soldto
                },
                dataType:"json",
                url: cbp.usmrPageAddNew.globalUrl.ccsFetchSiteURL,
                success: successCallback,
                error: errorCallback
            });
        };

        var generatingColumns = function (columnsDataList) {
            console.log("columnsDataList >>>",columnsDataList);
            var receivedOrderKey = Object.keys(columnsDataList).filter(function (key) {
                if (columnsDataList[key]) {
                    return columnsDataList[key];
                }
            });

            var columnsList = [{
                field: 'checkbox',
                checkbox: true,
                class: 'fa'
            }, {
                field: 'status',
                title: cbp.usmrPageAddNew.globalVars.statustb,
                titleTooltip: cbp.usmrPageAddNew.globalVars.statustb,
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
                    downloadReport = "<span class='fa fa-download iconsPrintDownload xs-pr-10 " + downloaded + "' data-eftNoticeNumberId='" + row.eftNoticeNumberId + "'>" + "</span>";
                    printReport = "<span class='fa fa-print iconsEftPrint " + printed + "' data-eftNoticeNumberId='" + row.eftNoticeNumberId + "'>" + "</span>";
                    return downloadReport + printReport;
                }
            },{
                field: 'accountNumber',
                title: cbp.usmrPageAddNew.globalVars.accountNumbertb,
                titleTooltip: cbp.usmrPageAddNew.globalVars.accountNumbertb,
                class: 'numberIcon col-md-6',
                sortable: true
            }, {
                field: 'eftNoticeNumber',
                title: cbp.usmrPageAddNew.globalVars.eftNoticeNumbertb,
                titleTooltip: cbp.usmrPageAddNew.globalVars.eftNoticeNumbertb,
                class: 'numberIcon',
                sortable: true,
                formatter: function LinkFormatter(value, row, index) {
                        return "<a href='#' class='js-eft-NoticeNumber' data-uid='" + row.eftNoticeNumberId + "'>" + value + "</a>";
                }
            }, {
                field: 'noticeDate',
                title: cbp.usmrPageAddNew.globalVars.noticeDatetb,
                titleTooltip: cbp.usmrPageAddNew.globalVars.noticeDatetb,
                class: 'numberIcon text-nowrap',
                sorter: function dateSort(a, b) {
                    a = moment(a, cbp.usmrPageAddNew.dateRange.format, true).format();
                    b = moment(b, cbp.usmrPageAddNew.dateRange.format, true).format();

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
                field: 'settlementDate',
                title: cbp.usmrPageAddNew.globalVars.settlementDatetb,
                titleTooltip: cbp.usmrPageAddNew.globalVars.settlementDatetb,
                class: 'numberIcon text-nowrap',
                sortable: true
            }, {
                field: 'total',
                title: cbp.usmrPageAddNew.globalVars.totaltb + " (" + eftSearchCurrency + ")",
                titleTooltip: cbp.usmrPageAddNew.globalVars.totaltb + " (" + eftSearchCurrency + ")",
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
            }];

            var columnsListMap = columnsList.reduce(function (data, columnsList) {
                data[columnsList.field] = columnsList;
                return data;
            }, {});

            var orderKey = ["checkbox", "status", "accountNumber", "eftNoticeNumber", "noticeDate", "settlementDate", "total"]

            var requestedCol = [];
            for (var i = 0; i < orderKey.length; i++) {
                for (var j = 0; j < receivedOrderKey.length; j++) {
                    if (orderKey[i] == receivedOrderKey[j]) {
                        var k = orderKey[i];
                        requestedCol.push(columnsListMap[k]);
                    }
                }

            }

            console.log("requestedCol >>>",requestedCol);

            return requestedCol;

        };

        var populatingTable = function (eftSearchDataList,columnsDataList) {
            var eftStatusCount = 0;
            if (cbp.usmrPageAddNew.usmrUserData.eftSearchDataList === null) {
                cbp.usmrPageAddNew.globalVars.tableLocales.noMatches = "";
            } else if (cbp.usmrPageAddNew.usmrUserData.resultCount === 0) {
//                cbp.usmrPageAddNew.globalVars.tableLocales.noMatches = cbp.usmrPageAddNew.globalVars.noMatches;
            } else if (cbp.usmrPageAddNew.usmrUserData.resultCount > maxResults && allEftFlow != "true") {
                cbp.usmrPageAddNew.globalVars.tableLocales.noMatches = cbp.usmrPageAddNew.globalVars.noMatchesMaxResults.replace('{0}', cbp.usmrPageAddNew.usmrUserData.resultCount);
                eftSearchDataList = [];
            }

            if (eftSearchDataList === null || eftSearchDataList === undefined) {
                eftSearchDataList = [];
            }

            $(config.sortByDdn).val("eftNoticeNumber-desc").selectpicker('refresh');

           $('#table').bootstrapTable({
                classes: 'table table-no-bordered',
                striped: true,
                sortName: 'eftNoticeNumber',
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
                    selectedEFTs.push(row.eftNoticeNumberId);
                    enablePrintDownloadButtons();
                },
                onCheckAll: function (rows) {
                    // enable button
                    selectedEFTs = [];
                    var len = rows.length;

                    for (var i = 0; i < len; i++) {
                        selectedEFTs.push(rows[i].eftNoticeNumberId);
                    }

                    if (rows.length) {
                        enablePrintDownloadButtons();
                    }
                },
                onUncheck: function (row, $element) {
                    // write logic..as not sure if all unselected
                    var index = selectedEFTs.indexOf(row.eftNoticeNumberId);

                    if (index > -1) {
                        selectedEFTs.splice(index, 1);
                    }

                    if (!($(config.tabelRow).hasClass('selected'))) {
                        disablePrintDownloadButtons();
                    }

                },
                onUncheckAll: function (rows) {
                    //disable button
                    selectedEFTs = [];
                    disablePrintDownloadButtons();

                },
                columns: generatingColumns(columnsDataList),
                data: eftSearchDataList
            });

        };

        return {
            init: init
        };
    })();

    $(document).ready(function () {

        //Localization setup for dropdown & table
        $.fn.selectpicker.defaults = {
            noneSelectedText: cbp.usmrPageAddNew.globalVars.selectDdn.noneSelectedText,
            noneResultsText: cbp.usmrPageAddNew.globalVars.selectDdn.noneResultsText,
            countSelectedText: function (numSelected, numTotal) {
                return (numSelected == 1) ? cbp.usmrPageAddNew.globalVars.selectDdn.itemSelected : cbp.usmrPageAddNew.globalVars.selectDdn.itemSelected1;
            },
            maxOptionsText: function (numAll, numGroup) {
                return [
                    (numAll == 1) ? cbp.usmrPageAddNew.globalVars.selectDdn.limitReached : cbp.usmrPageAddNew.globalVars.selectDdn.limitReached1,
                    (numGroup == 1) ? cbp.usmrPageAddNew.globalVars.selectDdn.groupLimit : cbp.usmrPageAddNew.globalVars.selectDdn.groupLimit1
            ];
            },
            selectAllText: cbp.usmrPageAddNew.globalVars.selectDdn.selectAllText,
            deselectAllText: cbp.usmrPageAddNew.globalVars.selectDdn.deselectAllText
        };

        $.fn.bootstrapTable.locales = {
            formatLoadingMessage: function () {
                return cbp.usmrPageAddNew.globalVars.tableLocales.loadingMessage;
            },
            formatRecordsPerPage: function (pageNumber) {
                return cbp.usmrPageAddNew.globalVars.tableLocales.recordsPerPage.replace('{0}', pageNumber);
            },
            formatShowingRows: function (pageFrom, pageTo, totalRows) {
                return cbp.usmrPageAddNew.globalVars.tableLocales.showingRows.replace('{0}', pageFrom).replace('{1}', pageTo).replace('{2}', totalRows);
            },
            formatSearch: function () {
                return cbp.usmrPageAddNew.globalVars.tableLocales.search;
            },
            formatNoMatches: function () {
                return cbp.usmrPageAddNew.globalVars.tableLocales.noMatches;
            },
            formatPaginationSwitch: function () {
                return cbp.usmrPageAddNew.globalVars.tableLocales.paginationSwitch;
            },
            formatRefresh: function () {
                return cbp.usmrPageAddNew.globalVars.tableLocales.refresh;
            },
            formatToggle: function () {
                return cbp.usmrPageAddNew.globalVars.tableLocales.toggle;
            },
            formatColumns: function () {
                return cbp.usmrPageAddNew.globalVars.tableLocales.columns;
            },
            formatAllRows: function () {
                return cbp.usmrPageAddNew.globalVars.tableLocales.allRows;
            }
        };

        $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales);

        leftPaneExpandCollapse.init();

        cbp.usmrPageAddNew.showSoldTo = true;

        cbp.usmrPageAddNew.usmrUserData = usmrUserData;
        cbp.usmrPageAddNew.soldToOptions = soldToOptions;
        // if (usmrUserData.resultCount === undefined || usmrUserData.resultCount === null) {
        //     cbp.usmrPageAddNew.usmrUserData.resultCount = 0;
        //     cbp.usmrPageAddNew.globalVars.eftsFoundVar = cbp.usmrPageAddNew.globalVars.eftsFound.replace("{0}", 0);
        // } else {
        //     cbp.usmrPageAddNew.globalVars.eftsFoundVar = cbp.usmrPageAddNew.globalVars.eftsFound.replace("{0}", usmrUserData.resultCount);
        // }

        if (usmrUserData.eftSearchDataList === undefined || usmrUserData.eftSearchDataList === null) {
            cbp.usmrPageAddNew.usmrUserData.eftSearchDataList = [];
        }

        if (cbp.usmrPageAddNew.usmrUserData.resultCount > 0 && cbp.usmrPageAddNew.usmrUserData.resultCount < maxResults) {
            cbp.usmrPageAddNew.showDebitCredit = true;
        } else {
            cbp.usmrPageAddNew.showDebitCredit = false;
        }

        usmrPageAddNew.init();

    });

});
