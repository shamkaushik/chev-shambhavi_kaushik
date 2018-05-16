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
    "text!app/page/eft-detail/eftSummary.hbs",
    "text!app/page/eft-detail/bottomDetail.hbs"

], function (modernizr, $, bootstrap, Handlebars, moment, toggleSwitch, calendar, bootstrapSelect, bootstrapTable, _calendarHBS, _defaultDdnHBS, _eftSearchSummaryHBS, _bottomDetailHBS) {

    // Compiling HBS templates
    var compiledDefaultDdn = Handlebars.compile(_defaultDdnHBS);
    var compiledsearchDate = Handlebars.compile(_calendarHBS);
    var compiledeftSearchSummary = Handlebars.compile(_eftSearchSummaryHBS);
    var compiledBottomDetail = Handlebars.compile(_bottomDetailHBS);
    var accountDropdownOptions = [], eftObj = {};
    var eftSearchPage = (function () {
        var startDate, endDate;
        var srtByDdn = {
            "options": [{
                    key: "invoiceNumber-asc",
                    value: cbp.eftDetailPage.globalVars.invoiceNumberAsc
            }, {
                    key: "invoiceNumber-desc",
                    value: cbp.eftDetailPage.globalVars.invoiceNumberDesc
            },{
                    key: "referenceDate-asc",
                    value: cbp.eftDetailPage.globalVars.referenceDateAsc
            }, {
                    key: "referenceDate-desc",
                    value: cbp.eftDetailPage.globalVars.referenceDateDesc
            },{
                    key: "originalDoc-asc",
                    value: cbp.eftDetailPage.globalVars.originalDocAsc
               }, {
                           key: "originalDoc-desc",
                           value: cbp.eftDetailPage.globalVars.originalDocDesc
               },{
                           key: "altReference-asc",
                           value: cbp.eftDetailPage.globalVars.altReferenceAsc
               }, {
                           key: "altReference-desc",
                           value: cbp.eftDetailPage.globalVars.altReferenceDesc
               },{
            	   			key: "description-asc",
                    value: cbp.eftDetailPage.globalVars.descriptionAsc
	            },{
	            			key: "description-desc",
	                    value: cbp.eftDetailPage.globalVars.descriptionDesc
	            },{
	                key: "deliveryAccount-asc",
	                value: cbp.eftDetailPage.globalVars.deliveryAccountAsc
	            }, {
	                key: "deliveryAccount-desc",
	                value: cbp.eftDetailPage.globalVars.deliveryAccountDesc
	            }, {
	                    key: "total-asc",
	                    value: cbp.eftDetailPage.globalVars.totalAsc
	            }, {
	                    key: "total-desc",
	                    value: cbp.eftDetailPage.globalVars.totalDesc
	            }
          ],
            label: cbp.eftDetailPage.globalVars.sortBy,
            labelClass: "xs-mr-5",
            name: "sortByDdn",
            display: "displayInline"
        };

        
        var toggleSwitchConfig = {
            name: "switch",
            cssClass: "toggleForEFTSerachForm",
            label: "",
            // LabelBlock: true,
            options: [{
                label: "EFT Notice #",
                value: "1",
                default: true
            }, {
                label: "Invoice #",
                value: "2"
            }]
        };

        accountDropdown = [];
        accountDropdown.push({"accountNumber" : eftDetailResponse.eftSummaryData.accountNumber,"accountName" : eftDetailResponse.eftSummaryData.accountName});

        if (accountDropdown.length > 1) {
            var obj = {};
            obj["key"] = "all";
            obj["value"] = cbp.eftDetailPage.globalVars.allAccount;
            accountDropdownOptions.push(obj);
        }

        for (var i = 0; i < accountDropdown.length; i++) {
            var obj = {};
            obj["key"] = accountDropdown[i].accountNumber;
            obj["value"] = accountDropdown[i].accountName;
            accountDropdownOptions.push(obj);
        }

        cbp.eftDetailPage.accountDropdown["options"] = accountDropdownOptions;
        cbp.eftDetailPage.accountDropdown.searchable = true;

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
            searchInputEft: ".js-eftSearchPage-searchEft",
            backToEFTSearch: ".backToEFTSearch"
        };

        var init = function () {
            loadingInitialHbsTemplates();

            if (cbp.eftDetailPage.accountDropdown["options"].length > 1) {
                $(config.accountDdn).val('all');
            }
            $(config.accountDdn).selectpicker('refresh');

            if (allEftFlow === "true") {
                $(config.downloadStatusDdn).val('notDownloaded').selectpicker('refresh');
                $(config.printStatusDdn).val('notPrinted').selectpicker('refresh');
            }

            populatingTable(cbp.eftDetailPage.eftDetailResponse.eftDetailDataList);
            populatingCalendarComponent();
            bindEvents();
        };

        var loadingInitialHbsTemplates = function () {
            // Appending handlebar templates to HTML
            $(config.accountDdnContainer).html(compiledDefaultDdn(cbp.eftDetailPage.accountDropdown));
            $(config.downloadStatusContainer).html(compiledDefaultDdn(cbp.eftDetailPage.downloadStatusDropdown));
            $(config.printStatusContainer).html(compiledDefaultDdn(cbp.eftDetailPage.printStatusDropdown));
            $(config.dateRangeContainer).html(compiledsearchDate({
                label: cbp.eftDetailPage.globalVars.dateRange,
                iconClass: cbp.eftDetailPage.dateRange.iconClass,
                id: cbp.eftDetailPage.dateRange.id
            }));

            loadingDynamicHbsTemplates();

            // Refresh dropdown at initial dispaly after loading templates
            $(config.dropDownCommon).selectpicker('refresh');
            enableMobileDefaultDropDown();
            $(config.eftSearchToggle).toggleSwitch(toggleSwitchConfig);
            $(config.displaySpinner).hide();
        };

        var loadingDynamicHbsTemplates = function () {
           $(config.eftSearchSummaryContainer).html(compiledeftSearchSummary(cbp.eftDetailPage));
            $(config.searchDetailContainer).html(compiledBottomDetail(cbp.eftDetailPage));
            $(config.sortByDdnContainer).html(compiledDefaultDdn(srtByDdn));
            $(config.sortByDdnContainer).find(config.dropDownCommon).selectpicker('refresh');
            enableMobileDefaultDropDown();
        };

        var enableMobileDefaultDropDown = function () {
            // Enable mobile scrolling by calling
			// $('.selectpicker').selectpicker('mobile'). This enables the
			// device's native menu for select menus.
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
            var contextPath = $("#contextPath").val() + "/Eft/eftListPDF";
            $("#eftSearchPDFForm").attr('action', contextPath);
            $("#eftSearchPDFForm #selectedEFTs").val(eftNoticeNumberId);
            $("#eftSearchPDFForm").submit();
        }
        
        var calleftSearchPDFLink = function (eftNoticeNumberId) {
            $('#eftSearchPDFForm #eftNoticeNumberId').val(eftNoticeNumberId);
            $('#eftSearchPDFForm #eftPrint').val('false');
            $('#eftSearchPDFForm').submit();
        }
        
        var goToOrderDetails = function (orderId) {
            $('#eftDetailsForm #eftNoticeNumberId').val(orderId);
            $('#eftDetailsForm #hybrisOrder').val(true);
            $('#eftDetailsForm').submit();
        }

        
        function downloadBtnSelected() {
        	var eftNoticeNumberId = eftDetailResponse.eftDetailsData.eftNoticeUid;
            $('#eftForm #selectedEFTs').val(eftNoticeNumberId);
            $("#eftForm").submit(); 
        }
        
        function printPDFSelected() {
               var eftNoticeNumberId = eftDetailResponse.eftDetailsData.eftNoticeUid;
            if (inASMSession !== true)
                $(this).addClass("success-icon");
            $('#eftSearchPDFForm #selectedEFTs').val(eftNoticeNumberId);
            $("#eftSearchPDFForm").submit();
        }
        
        function callInvoicePDF(invoiceId) {
            $('#invoicePDFForm #invoiceId').val(invoiceId);
            $('#invoicePDFForm #invoicePrint').val('false');
            $('#invoicePDFForm').submit();
        }

        var populatingCalendarComponent = function () {
            function cb(start, end) {
                startDate = start.format(cbp.eftDetailPage.dateRange.format);
                endDate = end.format(cbp.eftDetailPage.dateRange.format);
                $(config.ordercalendar).find('span').html(cbp.eftDetailPage.globalVars.fromAndTo.replace("{0}", startDate).replace("{1}", endDate));
            }

            if (allEftFlow === "true") {
                cbp.eftDetailPage.dateRange.startDate = moment().subtract(cbp.eftDetailPage.dateRange.maxMonth, 'month');
            }

            cb(cbp.eftDetailPage.dateRange.startDate, cbp.eftDetailPage.dateRange.endDate);

            var customRanges = {};

            customRanges[cbp.eftDetailPage.dateRange.today] = [moment(), moment()];
            customRanges[cbp.eftDetailPage.dateRange.yesterday] = [moment().subtract(1, 'days'), moment().subtract(1, 'days')];
            customRanges[cbp.eftDetailPage.dateRange.last7Days] = [moment().subtract(6, 'days'), moment()];
            customRanges[cbp.eftDetailPage.dateRange.last30Days] = [moment().subtract(29, 'days'), moment()];
            customRanges[cbp.eftDetailPage.dateRange.thisMonth] = [moment().startOf('month'), moment().endOf('month')];
            customRanges[cbp.eftDetailPage.dateRange.lastMonth] = [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')];

            $(config.ordercalendar).daterangepicker({
                startDate: cbp.eftDetailPage.dateRange.startDate,
                endDate: cbp.eftDetailPage.dateRange.endDate,
                ranges: customRanges,
                "minDate": moment().subtract(cbp.eftDetailPage.dateRange.maxMonth, 'month'),
                "maxDate": moment(),
                'applyClass': 'btn-primary',
                locale: {
                    format: cbp.eftDetailPage.dateRange.format,
                    separator: ' - ',
                    applyLabel: cbp.eftDetailPage.dateRange.apply,
                    cancelLabel: cbp.eftDetailPage.dateRange.cancel,
                    weekLabel: 'W',
                    customRangeLabel: cbp.eftDetailPage.dateRange.customRange,
                    daysOfWeek: moment.weekdaysShort(),
                    monthNames: moment.monthsShort(),
                    firstDay: moment.localeData().firstDayOfWeek()
                }
            }, cb);
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
                callInvoicePDF(e.target.innerText);
              });

            $(document).on('click', config.downloadIcon, function (evnt) {
                var isInternalUser = $("#isInternalUser").val();
                if (isInternalUser != "true" && inASMSession !== "true")
                    $(evnt.target).addClass("success-icon");
                downloadForm($(evnt.target).attr("data-eftNoticeNumberId"));
            });

            $(document).on('click', config.printIcon, function (evnt) {
                var isInternalUser = $("#isInternalUser").val();
                if (isInternalUser != "true" && inASMSession !== "true")
                    $(this).addClass("success-icon");
                calleftSearchPDF($(evnt.target).attr("data-eftNoticeNumberId"));
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
            $(config.searchInputUSerAccount).val('');
                if($(this).val()==1){
                    $(config.searchInputEft).attr('placeholder','EFT Notice #');
                }else if($(this).val()==2){
                    $(config.searchInputEft).attr('placeholder','Invoice #');
                }
            });
            
            $(document).on('click',config.backToEFTSearch,function(){
                window.location.href=cbp.eftDetailPage.globalUrl.eftSearchURL;
            });

            $(document).on("click", config.downloadBtn, function(){
                downloadBtnSelected();
            });
            
            $(document).on("click", config.printBtn, function(){
                printPDFSelected();
            });
        };

        var populatingTable = function (eftDetailDataList) {
            var eftStatusCount = 0;
            if (cbp.eftDetailPage.eftDetailResponse.eftDetailDataList === null) {
                cbp.eftDetailPage.globalVars.tableLocales.noMatches = "";
            } else if (cbp.eftDetailPage.eftDetailResponse.resultCount === 0) {
                cbp.eftDetailPage.globalVars.tableLocales.noMatches = cbp.eftDetailPage.globalVars.noMatches;
            } else if (cbp.eftDetailPage.eftDetailResponse.resultCount > maxResults && allEftFlow != "true") {
                cbp.eftDetailPage.globalVars.tableLocales.noMatches = cbp.eftDetailPage.globalVars.noMatchesMaxResults.replace('{0}', cbp.eftDetailPage.eftDetailResponse.resultCount);
                eftDetailDataList = [];
            }

            if (eftDetailDataList === null || eftDetailDataList === undefined) {
                eftDetailDataList = [];
           }
            $(config.sortByDdn).val("eftNoticeNumber-desc").selectpicker('refresh');

            $('#table').bootstrapTable({
                classes: 'table table-no-bordered',
                striped: true,
                sortName: 'invoiceNumber',
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
                    selectedEFTs.push(row.documentNumber);
                    enablePrintDownloadButtons();
                },
                onCheckAll: function (rows) {
                    // enable button
                    selectedEFTs = [];
                    var len = rows.length;

                    for (var i = 0; i < len; i++) {
                        selectedEFTs.push(rows[i].documentNumber);
                    }

                    if (rows.length) {
                        enablePrintDownloadButtons();
                    }
                },
                onUncheck: function (row, $element) {
                    // write logic..as not sure if all unselected
                    var index = selectedEFTs.indexOf(row.documentNumber);

                    if (index > -1) {
                        selectedEFTs.splice(index, 1);
                    }

                    if (!($(config.tabelRow).hasClass('selected'))) {
                        disablePrintDownloadButtons();
                    }

                },
                onUncheckAll: function (rows) {
                    // disable button
                    selectedEFTs = [];
                    disablePrintDownloadButtons();

                },
                columns: [{
                    field: 'invoiceNumber',
                    title: cbp.eftDetailPage.globalVars.documentNumber,
                    titleTooltip: cbp.eftDetailPage.globalVars.documentNumber,
                    class: 'text-nowrap numberIcon',
                    sortable: true,
                    formatter: function LinkFormatter(value, row, index) {
                        return "<a href='#' class='js-eft-NoticeNumber' data-uid='" + row.eftNoticeNumberId + "'>" + value + "</a>";
                    }
                },{
                    field: 'referenceDate',
                    title: cbp.eftDetailPage.globalVars.referenceDate,
                    titleTooltip: cbp.eftDetailPage.globalVars.referenceDate,
                    class: 'numberIcon text-nowrap',
                    sortable: true
                }, {
                    field: 'originalDoc',
                    title: cbp.eftDetailPage.globalVars.originalDoc,
                    titleTooltip: cbp.eftDetailPage.globalVars.originalDoc,
                    class: 'numberIcon',
                    sortable: true
                }, {
                    field: 'altReference',
                    title: cbp.eftDetailPage.globalVars.referenceNumber,
                    titleTooltip: cbp.eftDetailPage.globalVars.referenceNumber,
                    class: 'numberIcon text-nowrap',
                    sorter: function dateSort(a, b) {
                        a = moment(a, cbp.eftDetailPage.dateRange.format, true).format();
                        b = moment(b, cbp.eftDetailPage.dateRange.format, true).format();

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
                    field: 'description',
                    title: cbp.eftDetailPage.globalVars.descriptionText,
                    titleTooltip: cbp.eftDetailPage.globalVars.descriptionText,
                    class: 'numberIcon text-nowrap col-md-5',
                    sortable: true
                },{
                    field: 'deliveryAccount',
                    title: cbp.eftDetailPage.globalVars.deliveryAccount,
                    titleTooltip: cbp.eftDetailPage.globalVars.deliveryAccount,
                    class: 'numberIcon text-nowrap',
                    sortable: true
                }, {
                    field: 'total',
                    title: cbp.eftDetailPage.globalVars.totalTbSD + " (" + cbp.eftDetailPage.eftDetailResponse.eftDetailsData.currency+ ")",
                    titleTooltip: cbp.eftDetailPage.globalVars.totalTbSD + " (" + cbp.eftDetailPage.eftDetailResponse.eftDetailsData.currency+ ")",
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
                        var total;
                        if (value >= '0') {
                            total = row.displayTotal;
                        } else {
                            total = "<span class='text-danger'>" + row.displayTotal + "</span>";
                        }
                        return total;
                    }
                }],
                data: eftDetailDataList
            });

        };

        return {
            init: init
        };
    })();

    $(document).ready(function () {

        // Localization setup for dropdown & table
        $.fn.selectpicker.defaults = {
            noneSelectedText: cbp.eftDetailPage.globalVars.selectDdn.noneSelectedText,
            noneResultsText: cbp.eftDetailPage.globalVars.selectDdn.noneResultsText,
            countSelectedText: function (numSelected, numTotal) {
                return (numSelected == 1) ? cbp.eftDetailPage.globalVars.selectDdn.itemSelected : cbp.eftDetailPage.globalVars.selectDdn.itemSelected1;
            },
            maxOptionsText: function (numAll, numGroup) {
                return [
                    (numAll == 1) ? cbp.eftDetailPage.globalVars.selectDdn.limitReached : cbp.eftDetailPage.globalVars.selectDdn.limitReached1,
                    (numGroup == 1) ? cbp.eftDetailPage.globalVars.selectDdn.groupLimit : cbp.eftDetailPage.globalVars.selectDdn.groupLimit1
            ];
            },
            selectAllText: cbp.eftDetailPage.globalVars.selectDdn.selectAllText,
            deselectAllText: cbp.eftDetailPage.globalVars.selectDdn.deselectAllText
        };

        $.fn.bootstrapTable.locales = {
            formatLoadingMessage: function () {
                return cbp.eftDetailPage.globalVars.tableLocales.loadingMessage;
            },
            formatRecordsPerPage: function (pageNumber) {
                return cbp.eftDetailPage.globalVars.tableLocales.recordsPerPage.replace('{0}', pageNumber);
            },
            formatShowingRows: function (pageFrom, pageTo, totalRows) {
                return cbp.eftDetailPage.globalVars.tableLocales.showingRows.replace('{0}', pageFrom).replace('{1}', pageTo).replace('{2}', totalRows);
            },
            formatSearch: function () {
                return cbp.eftDetailPage.globalVars.tableLocales.search;
            },
            formatNoMatches: function () {
                return cbp.eftDetailPage.globalVars.tableLocales.noMatches;
            },
            formatPaginationSwitch: function () {
                return cbp.eftDetailPage.globalVars.tableLocales.paginationSwitch;
            },
            formatRefresh: function () {
                return cbp.eftDetailPage.globalVars.tableLocales.refresh;
            },
            formatToggle: function () {
                return cbp.eftDetailPage.globalVars.tableLocales.toggle;
            },
            formatColumns: function () {
                return cbp.eftDetailPage.globalVars.tableLocales.columns;
            },
            formatAllRows: function () {
                return cbp.eftDetailPage.globalVars.tableLocales.allRows;
            }
        };

        $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales);

        leftPaneExpandCollapse.init();

        cbp.eftDetailPage.showSoldTo = true;

        cbp.eftDetailPage.eftDetailResponse = eftDetailResponse;
        
        if (cbp.eftDetailPage.eftDetailResponse.eftDetailDataList.length > 0) {
            cbp.eftDetailPage.globalVars.eftsFoundVar = cbp.eftDetailPage.globalVars.eftsFound.replace("{0}", cbp.eftDetailPage.eftDetailResponse.eftDetailDataList.length);
        } else {
            cbp.eftDetailPage.globalVars.eftsFoundVar = cbp.eftDetailPage.globalVars.eftsFound.replace("{0}", 0);
        }

        if (eftDetailResponse.eftDetailDataList === undefined || eftDetailResponse.eftDetailDataList === null) {
            cbp.eftDetailPage.eftDetailResponse.eftDetailDataList = [];
        }

        if (cbp.eftDetailPage.eftDetailResponse.resultCount > 0 && cbp.eftDetailPage.eftDetailResponse.resultCount < maxResults) {
            cbp.eftDetailPage.showDebitCredit = true;
        } else {
            cbp.eftDetailPage.showDebitCredit = false;
        }

        cbp.eftDetailPage.dateRange.startDate = moment().subtract(15,'days');
        cbp.eftDetailPage.dateRange.endDate = moment();

        if (allEftFlow === "true") {
            cbp.eftDetailPage.dateRange.startDate = moment().subtract(cbp.eftDetailPage.dateRange.maxMonth, 'month');
        }

        cbp.eftDetailPage.globalVars.summaryfromAndToVar = cbp.eftDetailPage.globalVars.summaryfromAndTo.replace("{0}", cbp.eftDetailPage.dateRange.startDate.format(cbp.eftDetailPage.dateRange.format)).replace("{1}", cbp.eftDetailPage.dateRange.endDate.format(cbp.eftDetailPage.dateRange.format));

        eftSearchPage.init();

    });

});