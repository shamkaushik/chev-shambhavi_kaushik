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
    "text!app/page/price-notices/searchForm.hbs",
    "text!app/page/price-notices/priceNoticesSummary.hbs",
    "text!app/page/price-notices/bottomDetail.hbs",
    "text!app/page/price-notices/searchAndViewTab.hbs"

], function(modernizr, $, bootstrap, Handlebars, moment, toggleSwitch, calendar, bootstrapSelect, bootstrapTable, _calendarHBS, _defaultDdnHBS, _searchFormHBS, _priceNoticesSummaryHBS, _bottomDetailHBS, _searchAndViewHBS) {

    var accountDropdownOptions = [],
        soldToDropdownOptions = [],
        eftObj = {},
        startDateDT = '',
        endDateDT = '';

    var selectedEFTs = [],
        selectedProduct = [],
        selectedEftStatus = [];

    //Compiling HBS templates
    var compiledDefaultDdn = Handlebars.compile(_defaultDdnHBS);
    var compiledsearchDate = Handlebars.compile(_calendarHBS);
    var compiledsearchForm = Handlebars.compile(_searchFormHBS);
    var compiledeftSearchSummary = Handlebars.compile(_priceNoticesSummaryHBS);
    var compiledBottomDetail = Handlebars.compile(_bottomDetailHBS);
    var compiledSearchAndView = Handlebars.compile(_searchAndViewHBS);


    var priceNoticePage = (function() {
        var startDate, endDate;

        var srtByDdn = {
            "options": [{
                key: "publishDate-desc",
                value: cbp.priceNoticesPage.globalVars.publishedDateDesc
            }, {
                key: "publishDate-asc",
                value: cbp.priceNoticesPage.globalVars.publishedDateAsc
            }, {
                key: "effectiveDate-desc",
                value: cbp.priceNoticesPage.globalVars.effectiveDateDesc
            }, {
                key: "effectiveDate-asc",
                value: cbp.priceNoticesPage.globalVars.effectiveDateAsc
            }, {
                key: "priceNoticeType-desc",
                value: cbp.priceNoticesPage.globalVars.priceNoticeTypeDesc
            }, {
                key: "priceNoticeType-asc",
                value: cbp.priceNoticesPage.globalVars.priceNoticeTypeAsc
            }],
            label: cbp.priceNoticesPage.globalVars.sortBy,
            labelClass: "xs-mr-5",
            name: "sortByDdn",
            display: "displayInline"
        };

        var toggleSwitchConfig = {
            name: "switch",
            cssClass: "toggleForEFTSerachForm col-xs-24",
            label: "",
            //LabelBlock: true,
            options: [{
                label: "Price Notice Type",
                value: "1",
                default: true,
                cssClass: "col-xs-12"
            }, {
                label: "Detail",
                value: "2",
                cssClass: "col-xs-12"
            }]
        };

        var populateDropDowns = function(dropDownList, dropDownListOptions, dropDownName) {
            if (dropDownList.length > 1) {
                var obj = {};
                obj["key"] = "all";
                obj["value"] = cbp.priceNoticesPage.globalVars.allAccount;
                dropDownListOptions.push(obj);
            }

            for (var i = 0; i < dropDownList.length; i++) {
                var obj = {};
                obj["key"] = dropDownList[i].uid;
                obj["value"] = dropDownList[i].displayName;
                obj["isInGracePeriod"] = dropDownList[i].isInGracePeriod;
                dropDownListOptions.push(obj);
            }
            cbp.priceNoticesPage[dropDownName].options = dropDownListOptions;
            cbp.priceNoticesPage[dropDownName].searchable = true;
        };

        populateDropDowns(accountDropdown, accountDropdownOptions, "accountDropdown");
        populateDropDowns(soldToDropdown, soldToDropdownOptions, "soldToDropdown");

        var config = {
            accountDdnContainer: ".js-account-ddn",
            priceNoticesSummaryContainer: ".js-price-notices-summary",
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
            priceNoticeToggle: "#priceNoticeToggle",
            searchInputEft: ".js-eftSearchPage-searchEft",
            soldToDdn: ".js-soldTo-ddn",
            daterangepickerContainer: '.daterangepicker',
            soldToDropdown: "#soldToDropdown",
            advancedInputsContainer: ".js-advancedInputs-error",
            searchAndViewContainer: ".js-search-and-view",
            typeView: ".type-view",
            detailView: ".detail-view",
            "detailSearchDateRange": ".js-search-detail-date-range"
        };

        var init = function() {
            loadingInitialHbsTemplates();

            if (cbp.priceNoticesPage.accountDropdown["options"].length > 1) {
                $(config.accountDdn).val('all');
            }
            $(config.accountDdn).selectpicker('refresh');

            if (allEftFlow === "true") {
                $(config.downloadStatusDdn).val('notDownloaded').selectpicker('refresh');
                $(config.printStatusDdn).val('notPrinted').selectpicker('refresh');
            }

            bindEvents();

            triggerAjaxRequest();
            populatingCalendarComponent();
            $(config.dateRangeContainer).removeClass('hidden');
            $(config.searchInputEft).addClass('hidden');
            $("#priceNoticeToggle input[type='hidden']").val("1");
            setItalicsToThedefaultSelection();
            $(config.priceNoticeToggle + ' button').addClass('col-xs-12');
        };

        var setItalicsToThedefaultSelection = function() {
            var selectorDopdown = $('.search-content').find('button span.filter-option'),
                selectorCalendar = $(config.ordercalendar).find('span');
            selectorDopdown.each(function() {
                $.trim($(this).text()).toLowerCase() == cbp.priceNoticesPage.globalVars.allAccount.toLowerCase() ? $(this).addClass('italics') : $(this).removeClass('italics');
            });
        };

        var loadingInitialHbsTemplates = function() {
            //Appending handlebar templates to HTML
            $(config.searchAndViewContainer).html(compiledSearchAndView(cbp.priceNoticesPage));
            $(config.searchFormContainer).html(compiledsearchForm(cbp.priceNoticesPage));
            $(config.soldToDdn).html(compiledDefaultDdn(cbp.priceNoticesPage.soldToDropdown));
            $(config.accountDdnContainer).html(compiledDefaultDdn(cbp.priceNoticesPage.accountDropdown));
            $(config.downloadStatusContainer).html(compiledDefaultDdn(cbp.priceNoticesPage.downloadStatusDropdown));
            $(config.printStatusContainer).html(compiledDefaultDdn(cbp.priceNoticesPage.printStatusDropdown));
            $(config.dateRangeContainer).html(compiledsearchDate({
                label: "",
                iconClass: cbp.priceNoticesPage.dateRange.iconClass,
                id: cbp.priceNoticesPage.dateRange.id
            }));
            $(config.detailSearchDateRange).html(compiledsearchDate({
                label: "",
                iconClass: cbp.priceNoticesPage.dateRange.iconClass,
                id: cbp.priceNoticesPage.dateRange.id
            }));

            loadingDynamicHbsTemplates();
            //Refresh dropdown at initial dispaly after loading templates
            $(config.dropDownCommon).selectpicker('refresh');
            enableMobileDefaultDropDown();
            $(config.priceNoticeToggle).toggleSwitch(toggleSwitchConfig);
            $(config.displaySpinner).hide();
        };

        var loadingDynamicHbsTemplates = function() {
            $(config.priceNoticesSummaryContainer).html(compiledeftSearchSummary(cbp.priceNoticesPage));
            $(config.searchDetailContainer).html(compiledBottomDetail(cbp.priceNoticesPage));
            $(config.sortByDdnContainer).html(compiledDefaultDdn(srtByDdn));
            $(config.sortByDdnContainer).find(config.dropDownCommon).selectpicker('refresh');
            enableMobileDefaultDropDown();
        };

        var enableMobileDefaultDropDown = function() {
            //Enable mobile scrolling by calling $('.selectpicker').selectpicker('mobile'). This enables the device's native menu for select menus.
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
                $(config.dropDownCommon).selectpicker('mobile');
            }

            $(config.searchFormContainer).find('select.selectpicker').on('changed.bs.select change', function(e) {
                setItalicsToThedefaultSelection();
            });

            $(config.searchFormContainer).find('select.selectpicker').on('changed.bs.select change', function(e) {
                setItalicsToThedefaultSelection();
            });
        };


        var calleftSearchPDF = function(eftNoticeNumberId) {
            $("#eftSearchPDFForm").attr('target', '_blank');
            $('#eftSearchPDFForm #selectedEFTs').val(eftNoticeNumberId);
            $("#eftSearchPDFForm").submit();
        };

        var calleftSearchPDFLink = function(eftNoticeNumberId) {
            $('#eftSearchPDFForm #eftNoticeNumberId').val(eftNoticeNumberId);
            $('#eftSearchPDFForm #eftPrint').val('false');
            $('#eftSearchPDFForm').submit();
        };

        var goToOrderDetails = function(orderId) {
            $('#eftDetailsForm #eftNoticeNumberId').val(orderId);
            $('#eftDetailsForm #hybrisOrder').val(true);
            $('#eftDetailsForm').submit();
        };

        var downloadBtnSelected = function() {
            $('#eftForm #selectedEFTs').val(selectedEFTs.toString());
            for (var i = 0; len = selectedEFTs.length, i < len; i++) {
                $(".iconsPrintDownload[data-eftNoticeNumberId='" + selectedEFTs[i] + "']").addClass("success-icon");
            }
            $("#eftForm").submit();
        };

        var printPDFSelected = function() {
            $('#eftSearchPDFForm #selectedEFTs').val(selectedEFTs.toString());
            $("#eftSearchPDFForm").attr('target', '_blank');
            if (inASMSession != true) {
                for (var i = 0; len = selectedEFTs.length, i < len; i++) {
                    $(".iconsEftPrint[data-eftNoticeNumberId='" + selectedEFTs[i] + "']").addClass("success-icon");
                }
            }
            $("#eftSearchPDFForm").submit();
        };

        var populatingCalendarComponent = function() {
            function cb(start, end) {
                startDate = start.format(cbp.priceNoticesPage.dateRange.format);
                endDate = end.format(cbp.priceNoticesPage.dateRange.format);
                $(config.ordercalendar).find('span').html(cbp.priceNoticesPage.globalVars.fromAndTo.replace("{0}", startDate).replace("{1}", endDate));
            }

            function cb2(start, end) {
                $(config.ordercalendar).find('span').html(cbp.priceNoticesPage.globalVars.fromAndTo.replace("{0}", startDate).replace("{1}", endDate));
            }

            if (allEftFlow === "true") {
                cbp.priceNoticesPage.dateRange.startDate = moment().subtract(cbp.priceNoticesPage.dateRange.maxMonth, 'month');
            }

            cb(cbp.priceNoticesPage.dateRange.startDate, cbp.priceNoticesPage.dateRange.endDate);

            var customRanges = {};

            customRanges[cbp.priceNoticesPage.dateRange.today] = [moment(), moment()];
            customRanges[cbp.priceNoticesPage.dateRange.yesterday] = [moment().subtract(1, 'days'), moment().subtract(1, 'days')];
            customRanges[cbp.priceNoticesPage.dateRange.last7Days] = [moment().subtract(6, 'days'), moment()];
            customRanges[cbp.priceNoticesPage.dateRange.last30Days] = [moment().subtract(29, 'days'), moment()];
            customRanges[cbp.priceNoticesPage.dateRange.thisMonth] = [moment().startOf('month'), moment().endOf('month')];
            customRanges[cbp.priceNoticesPage.dateRange.lastMonth] = [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')];

            $(config.ordercalendar).daterangepicker({
                startDate: cbp.priceNoticesPage.dateRange.startDate,
                endDate: cbp.priceNoticesPage.dateRange.endDate,
                ranges: customRanges,
                "minDate": moment().subtract(cbp.priceNoticesPage.dateRange.maxMonth, 'month'),
                "maxDate": moment(),
                'applyClass': 'btn-primary',
                locale: {
                    format: cbp.priceNoticesPage.dateRange.format,
                    separator: ' - ',
                    applyLabel: cbp.priceNoticesPage.dateRange.apply,
                    cancelLabel: cbp.priceNoticesPage.dateRange.cancel,
                    weekLabel: 'W',
                    customRangeLabel: cbp.priceNoticesPage.dateRange.customRange,
                    daysOfWeek: moment.weekdaysShort(),
                    monthNames: moment.monthsShort(),
                    firstDay: moment.localeData().firstDayOfWeek()
                }
            }, cb);
        };

        var triggerAjaxRequest = function() {

            var postData = {};

            function successCallback(data) {
                console.log("Success Callback");
                populatingTable(cbp.priceNoticesPage.priceNoticesTableResponse.priceNoticeTypeDataList, cbp.priceNoticesPage.priceNoticesTableResponse.priceNoticeTypeDataListMapping);
            }

            function errorCallback() {
                console.log("error");
            }

            $.ajax({
                type: cbp.priceNoticesPage.globalUrl.method,
                headers: { 'CSRFToken': CSRFToken },
                data: JSON.stringify(postData),
                contentType: "application/json",
                dataType: "json",
                url: cbp.priceNoticesPage.globalUrl.priceNoticesTypePostURL,
                success: successCallback,
                error: errorCallback
            });

        };

        var downloadForm = function(eftNoticeNumberId) {
            var loc = $("#contextPath").val();
            var formTemplate = "<form id='downloadForm' method='POST' action='" + loc + "/eft/eftCSV'><input type='hidden' name='selectedEFTs' value='" + eftNoticeNumberId + "'/><input name='CSRFToken' id='CSRFToken' type='hidden' value='" + CSRFToken + "'/></form>";
            $(formTemplate).appendTo("body").submit().remove();
        };

        var enablePrintDownloadButtons = function() {
            $(config.downloadBtn).removeClass("disabled");
            $(config.printBtn).removeClass("disabled");
        };
        var disablePrintDownloadButtons = function() {
            $(config.downloadBtn).addClass("disabled");
            $(config.printBtn).addClass("disabled");
        };

        var bindEvents = function() {
            $(document).on("click", "input[type='checkbox']", function(event) {
                if ($(config.tabelRow).hasClass('selected')) {
                    $(config.downloadBtn).removeClass("disabled");
                    $(config.printBtn).removeClass("disabled");
                } else {
                    $(config.downloadBtn).addClass("disabled");
                    $(config.printBtn).addClass("disabled");
                }
            });

            $(document).on("click", config.eftNoticeLink, function(e) {
                e.preventDefault();
                console.log("In Link CLick >>>");
                var eftNoticeUid = $(e.target).attr('data-uid');
                eftObj.account = $("#accountSelectDdn").val();
                if ($.trim($(config.searchInputEft).val()).length != 0) {
                    $("#priceNoticeToggle input[type='hidden']").val() == 2 ?
                        eftObj.eftNoticeNumber = $(config.searchInputEft).val() :
                        eftObj.invoiceNumber = $(config.searchInputEft).val();
                } else {
                    eftObj.downloadStatus = $("#downloadStatus").val();
                    eftObj.printStatus = $("#printStatus").val();
                }
                eftObj.startDate = cbp.priceNoticesPage.dateRange.startDate.format(cbp.priceNoticesPage.dateRange.format);
                eftObj.endDate = cbp.priceNoticesPage.dateRange.endDate.format(cbp.priceNoticesPage.dateRange.format);
                console.log("eft Object >>>", eftObj);
                localStorage.setItem("eftObj", JSON.stringify(eftObj));
                $('#eftDetailsForm #eftNoticeid').val(eftNoticeUid);
                $('#eftDetailsForm').submit();
            });

            $(document).on('click', config.downloadIcon, function(evnt) {
                var isInternalUser = $("#isInternalUser").val();
                if (isInternalUser != "true" && inASMSession !== "true")
                    $(evnt.target).addClass("success-icon");
                downloadForm($(evnt.target).attr("data-eftNoticeNumberId"));
            });

            $(document).on('click', config.printIcon, function(evnt) {
                if (inASMSession !== true) {
                    $(this).addClass("success-icon");
                }

                calleftSearchPDF($(evnt.target).attr("data-eftNoticeNumberId"));
            });

            //Search button functionality
            $(config.searchButton).on("click", function(e) {
                selectedEFTs = [];
                if ($("#priceNoticeToggle input[type='hidden']").val() == 2) {
                    if ($.trim($(config.searchInputEft).val()).length <= 0) {
                        $(config.advancedInputsContainer).removeClass('hide');
                        $(config.advancedInputsContainer).find('span.alert-message').text(cbp.priceNoticesPage.globalVars.eftNumberVoidError);
                        $(config.searchInputEft).addClass('redDanger');
                        return;
                    }
                } else if ($("#priceNoticeToggle input[type='hidden']").val() == 3) {
                    if ($.trim($(config.searchInputEft).val()).length <= 0) {
                        $(config.advancedInputsContainer).removeClass('hide');
                        $(config.advancedInputsContainer).find('span.alert-message').text(cbp.priceNoticesPage.globalVars.invoiceVoidError);
                        $(config.searchInputEft).addClass('redDanger');
                        return;
                    }
                }
                $(config.advancedInputsContainer).addClass('hide');
                $(config.searchInputEft).removeClass('redDanger');
                // triggerAjaxRequest();
            });

            var valueOnSubmit = '.js-search-form input' + "," + config.printStatusContainer + "," +
                config.accountDdnContainer + "," +
                config.downloadStatusContainer + "," + config.dateRangeContainer + "";


            $(document).on('keypress', valueOnSubmit, function(e) {
                if (e.which == 13) {
                    e.preventDefault();
                    $("#eftSearchBtn").trigger("click");
                }
            });



            var validatefields = config.eftNoticeNumber + "," + config.invoiceNumber + "";

            $(document).on('keypress', validatefields, function(e) {
                var regex = /^[0-9]+$/;
                var str = String.fromCharCode(e.which);
                if (str.match(regex)) {
                    return true;
                }
                e.preventDefault();
                return false;
            });

            $(document).on("click", ".search-form .toggleSwitch#priceNoticeToggle button.btn-primary", function() {
                $(".search-form").addClass("show");
            });

            $(document).on('click', config.priceNoticeToggle + ' button', function() {
                console.log('value: ', $(this).val());
                $(config.searchInputEft).val('');
                if ($(this).val() == 2) {
                    $(config.typeView).addClass('hidden');
                    $(config.detailView).removeClass('hidden');
                } else {
                    $(config.typeView).removeClass('hidden');
                    $(config.searchInputEft).attr('placeholder', 'EFT Notice #');
                    $(config.detailView).addClass('hidden');
                }
            });



            $(document).on('click', config.daterangepickerContainer + ' .ranges ul li', function() {
                setItalicsToThedefaultSelection();
            });



            $(document).on('keyup', config.searchInputEft, function(e) {
                $(".alert-danger").addClass("hide");
                $(e.target).removeClass('redDanger');
            });
        };


        var generatingColumns = function(columnsDataList) {
            console.log("columnsDataList >>>", columnsDataList);
            var receivedOrderKey = Object.keys(columnsDataList).filter(function(key) {
                if (columnsDataList[key]) {
                    return columnsDataList[key];
                }
            });
            console.log("receivedOrderKey:", receivedOrderKey);
            var columnsList = [{
                    field: 'publishedDate',
                    title: columnsDataList.publishedDate,
                    titleTooltip: columnsDataList.publishedDate,
                    class: 'numberIcon col-md-6',
                    sorter: function dateSort(a, b) {
                        a = moment(a, cbp.priceNoticesPage.dateRange.format, true).format();
                        b = moment(b, cbp.priceNoticesPage.dateRange.format, true).format();

                        if (a > b) {
                            return -1;
                        }
                        if (a < b) {
                            return 1;
                        }
                        return 0;
                    },
                    sortable: true
                },
                {
                    field: 'effectiveDate',
                    title: columnsDataList.effectiveDate,
                    titleTooltip: columnsDataList.effectiveDate,
                    class: 'numberIcon col-md-6',
                    sorter: function dateSort(a, b) {
                        a = moment(a, cbp.priceNoticesPage.dateRange.format, true).format();
                        b = moment(b, cbp.priceNoticesPage.dateRange.format, true).format();

                        if (a > b) {
                            return -1;
                        }
                        if (a < b) {
                            return 1;
                        }
                        return 0;
                    },
                    sortable: true
                }, {
                    field: 'priceNoticeType',
                    title: columnsDataList.priceNoticeType,
                    titleTooltip: columnsDataList.priceNoticeType,
                    class: 'numberIcon col-md-6',
                    sortable: true
                }
            ];

            var columnsListMap = columnsList.reduce(function(data, columnsList) {
                data[columnsList.field] = columnsList;
                return data;
            }, {});

            var orderKey = ['publishedDate', 'effectiveDate', 'priceNoticeType'];

            var requestedCol = [];
            for (var i = 0; i < orderKey.length; i++) {
                for (var j = 0; j < receivedOrderKey.length; j++) {
                    if (orderKey[i] == receivedOrderKey[j]) {
                        var k = orderKey[i];
                        requestedCol.push(columnsListMap[k]);
                    }
                }

            }
            console.log("requestedCol >>>", requestedCol);
            return requestedCol;
        };

        var populatingTable = function(priceNoticeTypeDataList, columnsDataList) {

            $('#priceNoticeType').bootstrapTable({
                classes: 'table table-no-bordered',
                striped: true,
                sortName: 'publishedDate',
                sortOrder: 'desc',
                iconsPrefix: 'fa',
                sortable: true,
                parentContainer: ".js-bottom-detail",
                sortByDropdownId: "#sortByDdn",
                responsive: true,
                responsiveBreakPoint: 768,
                responsiveClass: "bootstrap-table-cardview",
                columns: generatingColumns(columnsDataList),
                data: priceNoticeTypeDataList
            });
        };
        return {
            init: init
        };
    })();

    $(document).ready(function() {

        //Localization setup for dropdown & table
        $.fn.selectpicker.defaults = {
            noneSelectedText: cbp.priceNoticesPage.globalVars.selectDdn.noneSelectedText,
            noneResultsText: cbp.priceNoticesPage.globalVars.selectDdn.noneResultsText,
            countSelectedText: function(numSelected, numTotal) {
                return (numSelected == 1) ? cbp.priceNoticesPage.globalVars.selectDdn.itemSelected : cbp.priceNoticesPage.globalVars.selectDdn.itemSelected1;
            },
            maxOptionsText: function(numAll, numGroup) {
                return [
                    (numAll == 1) ? cbp.priceNoticesPage.globalVars.selectDdn.limitReached : cbp.priceNoticesPage.globalVars.selectDdn.limitReached1,
                    (numGroup == 1) ? cbp.priceNoticesPage.globalVars.selectDdn.groupLimit : cbp.priceNoticesPage.globalVars.selectDdn.groupLimit1
                ];
            },
            selectAllText: cbp.priceNoticesPage.globalVars.selectDdn.selectAllText,
            deselectAllText: cbp.priceNoticesPage.globalVars.selectDdn.deselectAllText
        };
        leftPaneExpandCollapse.init();
        cbp.priceNoticesPage.priceNoticesTableResponse = priceNoticesTableResponse;
        cbp.priceNoticesPage.dateRange.startDate = moment().subtract(7, 'days');
        cbp.priceNoticesPage.dateRange.endDate = moment();
        priceNoticePage.init();

    });

});