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
    "text!app/page/eftsearch/searchForm.hbs",
    "text!app/page/eftsearch/eftSearchSummary.hbs",
    "text!app/page/eftsearch/bottomDetail.hbs"

    // "text!app/page/eft-search/searchForm.hbs",
    // "text!app/page/eft-search/eftSearchSummary.hbs",
    // "text!app/page/eft-search/bottomDetail.hbs"

], function (modernizr, $, bootstrap, Handlebars, moment, toggleSwitch, calendar, bootstrapSelect, bootstrapTable, _calendarHBS, _defaultDdnHBS, _searchFormHBS, _eftSearchSummaryHBS, _bottomDetailHBS) {

    var accountDropdownOptions = [], eftObj = {},startDateDT = '',endDateDT = '';
       
    var selectedEFTs = [],selectedProduct = [],selectedEftStatus = []; 
       
    //Compiling HBS templates
    var compiledDefaultDdn = Handlebars.compile(_defaultDdnHBS);
    var compiledsearchDate = Handlebars.compile(_calendarHBS);
    var compiledsearchForm = Handlebars.compile(_searchFormHBS);
    var compiledeftSearchSummary = Handlebars.compile(_eftSearchSummaryHBS);
    var compiledBottomDetail = Handlebars.compile(_bottomDetailHBS);

    var eftSearchPage = (function () {
        var startDate, endDate;
        var srtByDdn = {
            "options": [{
                    key: "eftNoticeNumber-asc",
                    value: cbp.eftSearchPage.globalVars.eftNoticeNumberAsc
            }, {
                    key: "eftNoticeNumber-desc",
                    value: cbp.eftSearchPage.globalVars.eftNoticeNumberDesc
            },{
                    key: "noticeDate-desc",
                    value: cbp.eftSearchPage.globalVars.noticeDateAsc
            }, {
                    key: "noticeDate-asc",
                    value: cbp.eftSearchPage.globalVars.noticeDateDesc
            }, {
                    key: "accountNumber-asc",
                    value: cbp.eftSearchPage.globalVars.accountNumberAsc
            }, {
                    key: "accountNumber-desc",
                    value: cbp.eftSearchPage.globalVars.accountNumberDesc
            }, {
                    key: "settlementDate-asc",
                    value: cbp.eftSearchPage.globalVars.settlementDateAsc
            }, {
                    key: "settlementDate-desc",
                    value: cbp.eftSearchPage.globalVars.settlementDateDesc
            }, {
                    key: "total-asc",
                    value: cbp.eftSearchPage.globalVars.totaltb  + " (" + eftSearchCurrency + "), " +  cbp.eftSearchPage.globalVars.ascLabel
            }, {
                    key: "total-desc",
                    value: cbp.eftSearchPage.globalVars.totaltb + " (" + eftSearchCurrency + "), " + cbp.eftSearchPage.globalVars.descLabel
            }
          ],
            label: cbp.eftSearchPage.globalVars.sortBy,
            labelClass: "xs-mr-5",
            name: "sortByDdn",
            display: "displayInline"
        };  
            
        var toggleSwitchConfig = {
            name: "switch",
            cssClass: "toggleForEFTSerachForm",
            label: "",
            //LabelBlock: true,
            options: [{
                label: cbp.eftSearchPage.globalVars.eftNumberSwitchLabel,
                value: "1",
                default: true
            }, {
                label: cbp.eftSearchPage.globalVars.invoiceNumberSwitchLabel,
                value: "2"
            }]
        };

        if (accountDropdown.length > 1) {
            var obj = {};
            obj["key"] = "all";
            obj["value"] = cbp.eftSearchPage.globalVars.allAccount;
            accountDropdownOptions.push(obj);
        }

        for (var i = 0; i < accountDropdown.length; i++) {
            var obj = {};
            obj["key"] = accountDropdown[i].uid;
            obj["value"] = accountDropdown[i].displayName;
            accountDropdownOptions.push(obj);
        }

        cbp.eftSearchPage.accountDropdown["options"] = accountDropdownOptions;
        cbp.eftSearchPage.accountDropdown.searchable = true;

        var config = {
            accountDdnContainer: ".js-account-ddn",
            eftSearchSummaryContainer: ".js-eftSearch-summary",
            downloadStatusContainer: ".js-downloadStatus-ddn",
            printStatusContainer: ".js-printStatus-ddn",
            dateRangeContainer: ".js-search-dateRange",
            searchFormContainer: ".js-search-form",
            searchDetailContainer: ".js-bottom-detail",
            sortByDdnContainer: ".js-sortbyDdn",
            dropDownCommon: ".selectpicker",
            ordercalendar: "#calendar",
            searchButton: "#eftSearchBtn",
            tabelRow: "#table tbody tr",
            downloadBtn: ".js-downloadBtn",
            printBtn: ".js-printBtn",
            accountDdn: "#accountSelectDdn",
            downloadStatusDdn: "#downloadStatus",
            printStatusDdn: "#printStatus",
            sortByDdn: "#sortByDdn",
            displaySpinner: ".overlay-wrapper",
            dropdownSelect: ".dropdown-menu .toggle-select",
            eftNoticeNumber: "#eftNoticeNumber",
            invoiceNumber: "#invoiceNumber",
            poNumber: "#poNumber",
            squareUnchecked: "fa-square-o",
            squareChecked: "fa-check-square-o",
            downloadIcon: ".iconsPrintDownload",
            printIcon: ".iconsEftPrint",
            eftNoticeLink: ".js-eft-NoticeNumber",
            eftNoticeForm: "#eftNoticeForm",
            eftNoticeidInp: "#eftNoticeid",
            eftSearchToggle: "#eftSearchToggle",
            searchInputEft: ".js-eftSearchPage-searchEft"
        };

        var init = function () {
            loadingInitialHbsTemplates();

                if (cbp.eftSearchPage.accountDropdown["options"].length > 1) {
                    $(config.accountDdn).val('all');
                }
                $(config.accountDdn).selectpicker('refresh');

            if (allEftFlow === "true") {
                $(config.downloadStatusDdn).val('notDownloaded').selectpicker('refresh');
                $(config.printStatusDdn).val('notPrinted').selectpicker('refresh');
            }

            bindEvents();

            if (localStorage.getItem("eftObj") === undefined || localStorage.getItem("eftObj") === null) {
            startDate = cbp.eftSearchPage.dateRange.startDate.format(cbp.eftSearchPage.dateRange.format);
                endDate = cbp.eftSearchPage.dateRange.endDate.format(cbp.eftSearchPage.dateRange.format);
                console.log("startDate , endDate >>>",startDate,endDate);
                console.log("$(config.eftSearchToggle) >>>",$(config.eftSearchToggle));
                triggerAjaxRequest();
            } else {
                var eftObj = JSON.parse(localStorage.getItem("eftObj"));
                cbp.eftSearchPage.dateRange.startDate = moment(eftObj.startDate, cbp.eftSearchPage.dateRange.format, true);
                cbp.eftSearchPage.dateRange.endDate = moment(eftObj.endDate, cbp.eftSearchPage.dateRange.format, true);
                $(config.accountDdn).val(eftObj.account).selectpicker('refresh');
                
                if(eftObj.eftNoticeNumber || eftObj.invoiceNumber){
                    if(eftObj.eftNoticeNumber){
                        $(config.eftSearchToggle).find('button').eq(0).trigger('click');
                        $(config.searchInputEft).val(eftObj.eftNoticeNumber);
                    }else{
                          $(config.eftSearchToggle).find('button').eq(1).trigger('click');
                        $(config.searchInputEft).val(eftObj.invoiceNumber);
                    }
                }


                $(config.downloadStatusDdn).val(eftObj.downloadStatus).selectpicker('refresh');
                $(config.printStatusDdn).val(eftObj.printStatus).selectpicker('refresh');

                localStorage.removeItem("eftObj");
                $(config.searchButton).removeAttr("disabled");
                triggerAjaxRequest();
            }
            
            populatingCalendarComponent();
        };

        var loadingInitialHbsTemplates = function () {
            //Appending handlebar templates to HTML
            $(config.searchFormContainer).html(compiledsearchForm(cbp.eftSearchPage));
            $(config.accountDdnContainer).html(compiledDefaultDdn(cbp.eftSearchPage.accountDropdown));
            $(config.downloadStatusContainer).html(compiledDefaultDdn(cbp.eftSearchPage.downloadStatusDropdown));
            $(config.printStatusContainer).html(compiledDefaultDdn(cbp.eftSearchPage.printStatusDropdown));
            $(config.dateRangeContainer).html(compiledsearchDate({
                label: cbp.eftSearchPage.globalVars.dateRange,
                iconClass: cbp.eftSearchPage.dateRange.iconClass,
                id: cbp.eftSearchPage.dateRange.id
            }));

            loadingDynamicHbsTemplates();

            //Refresh dropdown at initial dispaly after loading templates
            $(config.dropDownCommon).selectpicker('refresh');
            enableMobileDefaultDropDown();
            $(config.eftSearchToggle).toggleSwitch(toggleSwitchConfig);
            $(config.displaySpinner).hide();
        };

        var loadingDynamicHbsTemplates = function () {
            $(config.eftSearchSummaryContainer).html(compiledeftSearchSummary(cbp.eftSearchPage));
            $(config.searchDetailContainer).html(compiledBottomDetail(cbp.eftSearchPage));
            $(config.sortByDdnContainer).html(compiledDefaultDdn(srtByDdn));
            $(config.sortByDdnContainer).find(config.dropDownCommon).selectpicker('refresh');
            enableMobileDefaultDropDown();
        };

        var enableMobileDefaultDropDown = function () {
            //Enable mobile scrolling by calling $('.selectpicker').selectpicker('mobile'). This enables the device's native menu for select menus.
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
                $(config.dropDownCommon).selectpicker('mobile');
            }

            $(config.accountDdn).on('changed.bs.select change', function (e) {
                if ($(config.accountDdn).val() !== "") {
                    $(config.searchButton).removeAttr("disabled");
                } else {
                    $(config.searchButton).attr("disabled", "disabled");
                }
            });
        };

        
        var calleftSearchPDF = function (eftNoticeNumberId) {
            $("#eftSearchPDFForm").attr('target', '_blank');
            $('#eftSearchPDFForm #selectedEFTs').val(eftNoticeNumberId);
            $("#eftSearchPDFForm").submit();
        };

        var calleftSearchPDFLink = function (eftNoticeNumberId) {
            $('#eftSearchPDFForm #eftNoticeNumberId').val(eftNoticeNumberId);
            $('#eftSearchPDFForm #eftPrint').val('false');
            $('#eftSearchPDFForm').submit();
        };

        var goToOrderDetails = function (orderId) {
            $('#eftDetailsForm #eftNoticeNumberId').val(orderId);
            $('#eftDetailsForm #hybrisOrder').val(true);
            $('#eftDetailsForm').submit();
        };

        var downloadBtnSelected = function () {
            $('#eftForm #selectedEFTs').val(selectedEFTs.toString());
            for (var i = 0; len = selectedEFTs.length, i < len; i++) {
                $(".iconsPrintDownload[data-eftNoticeNumberId='" + selectedEFTs[i] + "']").addClass("success-icon");
            }
            $("#eftForm").submit();
        };

        var printPDFSelected = function () {
            $('#eftSearchPDFForm #selectedEFTs').val(selectedEFTs.toString());
            $("#eftSearchPDFForm").attr('target', '_blank');
            if(inASMSession!=true){
                for (var i = 0; len = selectedEFTs.length, i < len; i++) {
                    $(".iconsEftPrint[data-eftNoticeNumberId='" + selectedEFTs[i] + "']").addClass("success-icon");
                }
            }
            $("#eftSearchPDFForm").submit();
        };

        var populatingCalendarComponent = function () {
            function cb(start, end) {
            console.log("Start &&& END >>>>",start,end);
                startDate = start.format(cbp.eftSearchPage.dateRange.format);
                endDate = end.format(cbp.eftSearchPage.dateRange.format);
                $(config.ordercalendar).find('span').html(cbp.eftSearchPage.globalVars.fromAndTo.replace("{0}", startDate).replace("{1}", endDate));
            }
            
            function cb2(start, end) {
            console.log("Start &&& END >>>>",start,end);
                $(config.ordercalendar).find('span').html(cbp.eftSearchPage.globalVars.fromAndTo.replace("{0}", startDate).replace("{1}", endDate));
            }

            if (allEftFlow === "true") {
                cbp.eftSearchPage.dateRange.startDate = moment().subtract(cbp.eftSearchPage.dateRange.maxMonth, 'month');
            }

            cb(cbp.eftSearchPage.dateRange.startDate, cbp.eftSearchPage.dateRange.endDate);

            var customRanges = {};

            customRanges[cbp.eftSearchPage.dateRange.today] = [moment(), moment()];
            customRanges[cbp.eftSearchPage.dateRange.yesterday] = [moment().subtract(1, 'days'), moment().subtract(1, 'days')];
            customRanges[cbp.eftSearchPage.dateRange.last7Days] = [moment().subtract(6, 'days'), moment()];
            customRanges[cbp.eftSearchPage.dateRange.last30Days] = [moment().subtract(29, 'days'), moment()];
            customRanges[cbp.eftSearchPage.dateRange.thisMonth] = [moment().startOf('month'), moment().endOf('month')];
            customRanges[cbp.eftSearchPage.dateRange.lastMonth] = [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')];

            $(config.ordercalendar).daterangepicker({
                startDate: cbp.eftSearchPage.dateRange.startDate,
                endDate: cbp.eftSearchPage.dateRange.endDate,
                ranges: customRanges,
                "minDate": moment().subtract(cbp.eftSearchPage.dateRange.maxMonth, 'month'),
                "maxDate": moment(),
                'applyClass': 'btn-primary',
                locale: {
                    format: cbp.eftSearchPage.dateRange.format,
                    separator: ' - ',
                    applyLabel: cbp.eftSearchPage.dateRange.apply,
                    cancelLabel: cbp.eftSearchPage.dateRange.cancel,
                    weekLabel: 'W',
                    customRangeLabel: cbp.eftSearchPage.dateRange.customRange,
                    daysOfWeek: moment.weekdaysShort(),
                    monthNames: moment.monthsShort(),
                    firstDay: moment.localeData().firstDayOfWeek()
                }
            }, cb);
        };

        var triggerAjaxRequest = function () {
            $(config.displaySpinner).show();
            $(config.eftSearchSummaryContainer).hide();
            $(config.searchDetailContainer).hide();

            leftPaneExpandCollapse.hideSearchBar();

            var postData = {};
            postData.account = $(config.accountDdn).val();
            /* end DSLEC-8*/
            postData.downloadStatus = $(config.downloadStatusDdn).val();
            postData.printStatus = $(config.printStatusDdn).val();


            console.log("Start Date & End Date >>>",startDate, endDate);
            postData.startDate = startDate ? startDate : cbp.eftSearchPage.dateRange.startDate.format(cbp.eftSearchPage.dateRange.format);
            postData.endDate = endDate ? endDate : cbp.eftSearchPage.dateRange.endDate.format(cbp.eftSearchPage.dateRange.format);

            if($.trim($(config.searchInputEft).val()).length!=0){
                ($("#eftSearchToggle input[type='hidden']").val() == 1 || $("#eftSearchToggle input[type='hidden']").val()=="default") ? 
                    postData['noticeNumber'] = $(config.searchInputEft).val() 
                    : postData['invoiceNumber'] = $(config.searchInputEft).val();   
            }

            /* end DSLEC-120*/
            
            if ($(config.accountDdn).val() != 'all') {
                cbp.eftSearchPage.showSoldTo = false;
            } else {
                cbp.eftSearchPage.showSoldTo = true;
            }

            function successCallback(data) {
                $(config.displaySpinner).hide();
                $(config.searchDetailContainer).show();
                $(config.eftSearchSummaryContainer).show();
                cbp.eftSearchPage.eftSearchResponse = data;
                
                if (cbp.eftSearchPage.eftSearchResponse.resultCount === undefined || cbp.eftSearchPage.eftSearchResponse.resultCount === null) {
                    cbp.eftSearchPage.eftSearchResponse.resultCount = 0;
                }

                if (cbp.eftSearchPage.eftSearchResponse.eftSearchDataList === undefined || cbp.eftSearchPage.eftSearchResponse.eftSearchDataList === null) {
                    cbp.eftSearchPage.eftSearchResponse.eftSearchDataList = [];
                }

               

                if (cbp.eftSearchPage.eftSearchResponse.resultCount > 0) {
                    cbp.eftSearchPage.globalVars.eftsFoundVar = cbp.eftSearchPage.globalVars.eftsFound.replace("{0}", cbp.eftSearchPage.eftSearchResponse.resultCount);
                } else {
                    cbp.eftSearchPage.globalVars.eftsFoundVar = cbp.eftSearchPage.globalVars.eftsFound.replace("{0}", 0);
                }
                cbp.eftSearchPage.dateRange.startDate = moment(startDate, cbp.eftSearchPage.dateRange.format, true);
                cbp.eftSearchPage.dateRange.endDate = moment(endDate, cbp.eftSearchPage.dateRange.format, true);

                cbp.eftSearchPage.globalVars.summaryfromAndToVar = cbp.eftSearchPage.globalVars.summaryfromAndTo.replace("{0}", cbp.eftSearchPage.dateRange.startDate.format(cbp.eftSearchPage.dateRange.format)).replace("{1}", cbp.eftSearchPage.dateRange.endDate.format(cbp.eftSearchPage.dateRange.format));

                if (cbp.eftSearchPage.eftSearchResponse.resultCount > 0 && cbp.eftSearchPage.eftSearchResponse.resultCount < maxResults) {
                    cbp.eftSearchPage.showDebitCredit = true;
                } else {
                    cbp.eftSearchPage.showDebitCredit = false;
                }


                loadingDynamicHbsTemplates();
                console.log("cbp.eftSearchPage.eftSearchResponse >>>",cbp.eftSearchPage.eftSearchResponse);
                populatingTable(cbp.eftSearchPage.eftSearchResponse.eftSearchDataList,cbp.eftSearchPage.eftSearchResponse.eftSearchDataListMapping);
                leftPaneExpandCollapse.resetSearchFormHeight();
            }

            function errorCallback() {
                $(config.displaySpinner).hide();
                $(config.searchDetailContainer).show();
                $(config.eftSearchSummaryContainer).show();
                console.log("error");
            }

            $.ajax({
                type: cbp.eftSearchPage.globalUrl.method,
                headers: {'CSRFToken':CSRFToken},
                data: JSON.stringify(postData),
                contentType:"application/json",
                dataType:"json",
                url: cbp.eftSearchPage.globalUrl.eftSearchPostURL,
                success: successCallback,
                error: errorCallback
            });

        };

        var downloadForm = function (eftNoticeNumberId) {
            var loc = $("#contextPath").val();
            var formTemplate = "<form id='downloadForm' method='POST' action='" + loc + "/Eft/eftCSV'><input type='hidden' name='selectedEFTs' value='" + eftNoticeNumberId + "'/></form>";
            $(formTemplate).appendTo("body").submit().remove();
        };

        var enablePrintDownloadButtons = function () {
            $(config.downloadBtn).removeClass("disabled");
            $(config.printBtn).removeClass("disabled");
        };
        var disablePrintDownloadButtons = function () {
            $(config.downloadBtn).addClass("disabled");
            $(config.printBtn).addClass("disabled");
        };

        var bindEvents = function () {
            $(document).on("click","input[type='checkbox']", function(event){
              if($(config.tabelRow).hasClass('selected')){
                $(config.downloadBtn).removeClass("disabled");
                $(config.printBtn).removeClass("disabled");
              }
              else{
                $(config.downloadBtn).addClass("disabled");
                $(config.printBtn).addClass("disabled");
              }
            });

            $(document).on("click", config.eftNoticeLink, function(e){
                e.preventDefault();
                console.log("In Link CLick >>>");
                var eftNoticeUid = $(e.target).attr('data-uid');
                eftObj.account = $("#accountSelectDdn").val();
                if($.trim($(config.searchInputEft).val()).length!=0){
                    ($("#eftSearchToggle input[type='hidden']").val() == 1 || $("#eftSearchToggle input[type='hidden']").val()=="default") ? 
                           eftObj.eftNoticeNumber = $(config.searchInputEft).val() 
                    : eftObj.invoiceNumber = $(config.searchInputEft).val();   
                }
               eftObj.downloadStatus = $("#downloadStatus").val();
                eftObj.printStatus = $("#printStatus").val();
                eftObj.startDate = cbp.eftSearchPage.dateRange.startDate.format(cbp.eftSearchPage.dateRange.format);
                eftObj.endDate = cbp.eftSearchPage.dateRange.endDate.format(cbp.eftSearchPage.dateRange.format);
                console.log("eft Object >>>",eftObj);
                localStorage.setItem("eftObj", JSON.stringify(eftObj));
                $('#eftDetailsForm #eftNoticeid').val(eftNoticeUid);
                $('#eftDetailsForm').submit();
              });

            $(document).on('click', config.downloadIcon, function (evnt) {
                var isInternalUser = $("#isInternalUser").val();
                if (isInternalUser != "true" && inASMSession !== "true")
                    $(evnt.target).addClass("success-icon");
                downloadForm($(evnt.target).attr("data-eftNoticeNumberId"));
            });

            $(document).on('click', config.printIcon, function (evnt) {
                if (inASMSession !== true){
                    $(this).addClass("success-icon");
                }

                calleftSearchPDF($(evnt.target).attr("data-eftNoticeNumberId"));
            });

            //Search button functionality
            $(config.searchButton).on("click", function (e) {
                selectedEFTs = [];
                triggerAjaxRequest();
            });

            var valueOnSubmit = '.js-search-form input' + "," + config.printStatusContainer + "," +
                config.accountDdnContainer + "," +
                config.downloadStatusContainer + "," + config.dateRangeContainer + "";


            $(document).on('keypress', valueOnSubmit, function (e) {
                if (e.which == 13) {
                    e.preventDefault();
                    $("#eftSearchBtn").trigger("click");
                }
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

            $(document).on("click", ".search-form .toggleSwitch#eftSearchToggle button.btn-primary", function(){
                $(".search-form").addClass("show");
            });

            $(document).on('click',config.eftSearchToggle+' button',function(){
                $(config.searchInputEft).val('');
                if($(this).val()==1){
                    $(config.searchInputEft).attr('placeholder','EFT Notice #');
                }else if($(this).val()==2){
                    $(config.searchInputEft).attr('placeholder','Invoice #');
                }
            });

            $(document).on("click", config.downloadBtn, function(){
                downloadBtnSelected();
            });
            
            $(document).on("click", config.printBtn, function(){
                printPDFSelected();
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
                title: cbp.eftSearchPage.globalVars.statustb,
                titleTooltip: cbp.eftSearchPage.globalVars.statustb,
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
                title: cbp.eftSearchPage.globalVars.accountNumbertb,
                titleTooltip: cbp.eftSearchPage.globalVars.accountNumbertb,
                class: 'numberIcon col-md-6',
                sortable: true
            }, {
                field: 'eftNoticeNumber',
                title: cbp.eftSearchPage.globalVars.eftNoticeNumbertb,
                titleTooltip: cbp.eftSearchPage.globalVars.eftNoticeNumbertb,
                class: 'numberIcon',
                sortable: true,
                formatter: function LinkFormatter(value, row, index) {
                        return "<a href='#' class='js-eft-NoticeNumber' data-uid='" + row.eftNoticeNumberId + "'>" + value + "</a>";
                }
            }, {
                field: 'noticeDate',
                title: cbp.eftSearchPage.globalVars.noticeDatetb,
                titleTooltip: cbp.eftSearchPage.globalVars.noticeDatetb,
                class: 'numberIcon text-nowrap',
                sorter: function dateSort(a, b) {
                    a = moment(a, cbp.eftSearchPage.dateRange.format, true).format();
                    b = moment(b, cbp.eftSearchPage.dateRange.format, true).format();

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
                title: cbp.eftSearchPage.globalVars.settlementDatetb,
                titleTooltip: cbp.eftSearchPage.globalVars.settlementDatetb,
                class: 'numberIcon text-nowrap',
                sortable: true
            }, {
                field: 'total',
                title: cbp.eftSearchPage.globalVars.totaltb + " (" + eftSearchCurrency + ")",
                titleTooltip: cbp.eftSearchPage.globalVars.totaltb + " (" + eftSearchCurrency + ")",
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
            if (cbp.eftSearchPage.eftSearchResponse.eftSearchDataList === null) {
                cbp.eftSearchPage.globalVars.tableLocales.noMatches = "";
            } else if (cbp.eftSearchPage.eftSearchResponse.resultCount === 0) {
//                cbp.eftSearchPage.globalVars.tableLocales.noMatches = cbp.eftSearchPage.globalVars.noMatches;
            } else if (cbp.eftSearchPage.eftSearchResponse.resultCount > maxResults && allEftFlow != "true") {
                cbp.eftSearchPage.globalVars.tableLocales.noMatches = cbp.eftSearchPage.globalVars.noMatchesMaxResults.replace('{0}', cbp.eftSearchPage.eftSearchResponse.resultCount);
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
            noneSelectedText: cbp.eftSearchPage.globalVars.selectDdn.noneSelectedText,
            noneResultsText: cbp.eftSearchPage.globalVars.selectDdn.noneResultsText,
            countSelectedText: function (numSelected, numTotal) {
                return (numSelected == 1) ? cbp.eftSearchPage.globalVars.selectDdn.itemSelected : cbp.eftSearchPage.globalVars.selectDdn.itemSelected1;
            },
            maxOptionsText: function (numAll, numGroup) {
                return [
                    (numAll == 1) ? cbp.eftSearchPage.globalVars.selectDdn.limitReached : cbp.eftSearchPage.globalVars.selectDdn.limitReached1,
                    (numGroup == 1) ? cbp.eftSearchPage.globalVars.selectDdn.groupLimit : cbp.eftSearchPage.globalVars.selectDdn.groupLimit1
            ];
            },
            selectAllText: cbp.eftSearchPage.globalVars.selectDdn.selectAllText,
            deselectAllText: cbp.eftSearchPage.globalVars.selectDdn.deselectAllText
        };

        $.fn.bootstrapTable.locales = {
            formatLoadingMessage: function () {
                return cbp.eftSearchPage.globalVars.tableLocales.loadingMessage;
            },
            formatRecordsPerPage: function (pageNumber) {
                return cbp.eftSearchPage.globalVars.tableLocales.recordsPerPage.replace('{0}', pageNumber);
            },
            formatShowingRows: function (pageFrom, pageTo, totalRows) {
                return cbp.eftSearchPage.globalVars.tableLocales.showingRows.replace('{0}', pageFrom).replace('{1}', pageTo).replace('{2}', totalRows);
            },
            formatSearch: function () {
                return cbp.eftSearchPage.globalVars.tableLocales.search;
            },
            formatNoMatches: function () {
                return cbp.eftSearchPage.globalVars.tableLocales.noMatches;
            },
            formatPaginationSwitch: function () {
                return cbp.eftSearchPage.globalVars.tableLocales.paginationSwitch;
            },
            formatRefresh: function () {
                return cbp.eftSearchPage.globalVars.tableLocales.refresh;
            },
            formatToggle: function () {
                return cbp.eftSearchPage.globalVars.tableLocales.toggle;
            },
            formatColumns: function () {
                return cbp.eftSearchPage.globalVars.tableLocales.columns;
            },
            formatAllRows: function () {
                return cbp.eftSearchPage.globalVars.tableLocales.allRows;
            }
        };

        $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales);

        leftPaneExpandCollapse.init();

        cbp.eftSearchPage.showSoldTo = true;

        cbp.eftSearchPage.eftSearchResponse = eftSearchResponse;
        if (eftSearchResponse.resultCount === undefined || eftSearchResponse.resultCount === null) {
            cbp.eftSearchPage.eftSearchResponse.resultCount = 0;
            cbp.eftSearchPage.globalVars.eftsFoundVar = cbp.eftSearchPage.globalVars.eftsFound.replace("{0}", 0);
        } else {
            cbp.eftSearchPage.globalVars.eftsFoundVar = cbp.eftSearchPage.globalVars.eftsFound.replace("{0}", eftSearchResponse.resultCount);
        }

        if (eftSearchResponse.eftSearchDataList === undefined || eftSearchResponse.eftSearchDataList === null) {
            cbp.eftSearchPage.eftSearchResponse.eftSearchDataList = [];
        }

        if (cbp.eftSearchPage.eftSearchResponse.resultCount > 0 && cbp.eftSearchPage.eftSearchResponse.resultCount < maxResults) {
            cbp.eftSearchPage.showDebitCredit = true;
        } else {
            cbp.eftSearchPage.showDebitCredit = false;
        }

        cbp.eftSearchPage.dateRange.startDate = moment().subtract(7,'days');
        cbp.eftSearchPage.dateRange.endDate = moment();

        if (allEftFlow === "true") {
            cbp.eftSearchPage.dateRange.startDate = moment().subtract(cbp.eftSearchPage.dateRange.maxMonth, 'month');
        }

        cbp.eftSearchPage.globalVars.summaryfromAndToVar = cbp.eftSearchPage.globalVars.summaryfromAndTo.replace("{0}", cbp.eftSearchPage.dateRange.startDate.format(cbp.eftSearchPage.dateRange.format)).replace("{1}", cbp.eftSearchPage.dateRange.endDate.format(cbp.eftSearchPage.dateRange.format));

        eftSearchPage.init();

    });

});
