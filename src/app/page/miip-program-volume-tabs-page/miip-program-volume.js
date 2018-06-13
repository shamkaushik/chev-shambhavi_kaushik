require(["modernizr",
    "jquery",
    "bootstrap",
    "handlebars",
    "moment",
    "bootstrap-select",
    "bootstrap-table",
    "text!app/components/dropdown/_defaultDdn.hbs",
    "text!app/page/miip-program-volume-tabs-page/programViewSummary.hbs",
    "text!app/page/miip-program-volume-tabs-page/programVolumeDetails.hbs",
    "text!app/page/miip-program-volume-tabs-page/programView.hbs",
    "text!app/page/miip-program-volume-tabs-page/volumeView.hbs",
    "text!app/page/miip-program-volume-tabs-page/programVolumeHeading.hbs",
    "text!app/page/miip-program-volume-tabs-page/salesModal.hbs",
    "text!app/page/miip-program-volume-tabs-page/disputeModal.hbs",
    "text!app/page/miip-program-volume-tabs-page/disputedModal.hbs",

], function(modernizr, $, bootstrap, Handlebars, moment, bootstrapSelect, bootstrapTable, _defaultDdnHBS, _programViewSummaryHBS, _programVolumeDetailsHBS, _programViewHBS, _volumeViewHBS, _programVolumeHeadingHBS, _salesModalHBS, _disputeModalHBS, _disputedModalHBS) {

    //Compiling HBS templates
    var compiledDefaultDdn = Handlebars.compile(_defaultDdnHBS);
    var compiledProgramViewSummary = Handlebars.compile(_programViewSummaryHBS);
    var compiledProgramVolumeDetails = Handlebars.compile(_programVolumeDetailsHBS);
    var compiledProgramView = Handlebars.compile(_programViewHBS);
    var compiledVolumeView = Handlebars.compile(_volumeViewHBS);
    var compiledProgramVolumeHeading = Handlebars.compile(_programVolumeHeadingHBS);
    var compiledSalesModal = Handlebars.compile(_salesModalHBS);
    var compiledDisputeModal = Handlebars.compile(_disputeModalHBS);
    var compiledDisputedModal = Handlebars.compile(_disputedModalHBS);

    var miipProgramVolumePage = (function() {

        var volumeRowArray = [];
        var actualVolumeVal = 0;
        var rulValue = 0,
            mulValue = 0,
            pulValue = 0;
        var isCalculatedTotalValValid = false;
        var calculatedTotalValue;
        var volumeDetailFormObj = {};

        var config = {
            headerContainer: ".js-header",
            footerContainer: ".js-footer",
            dropDownCommon: ".selectpicker",
            displaySpinner: ".overlay-wrapper",
            programViewSummaryConatiner: ".js-miip-program-view-summary-detail",
            programVolumeDetailsContainer: ".js-miip-program-volume-details",
            programViewContainer: ".js-program-view",
            volumeViewContainer: ".js-volume-view",
            programVolumeHeadingContainer: ".js-program-volume-heading",
            sortByDdnContainer: ".js-miip-sortbyDdn",
            selectedTabs: '.content-tabs .nav-tabs a[data-toggle="tab"]',
            selectedDisputeLink: 'a[data-target="#disputeModal"]',
            salesModal: ".js-sales-modal",
            disputeModal: ".js-dispute-modal",
            disputedModal: ".js-disputed-modal",
            printBtn: ".js-printBtn",
            saveBtn: ".save-btn",
            disclaimerSection: ".disclaimer-section",
            actualVol: ".actual-vol",
            totalValue: ".total-vol",
            closeBtn: ".clos-btn",
            prevTotal: ".prev-total",
            modal: '.modal',
            jsSaveSuccess: '.js-save-success',
            programAnchor: ".js-volume-anchor",
            soldTo: ".js-soldTo-summary",
            jsSaveError: ".js-save-error",
            saveDisputeBtn: ".js-save-dispute-btn",
            saveDisputedBtn: ".js-save-disputed-btn",
            saveNewSalesMonthBtn: ".js-save-new-sales-month",
            salesMonth: ".sales-month",
            salesYear: ".sales-year",
            quantityInput: ".js-quantity-input",
            totalVolume: ".total-volume",

        };

        var srtByDdn = {
            "options": [{
                key: "status-za",
                value: "Status, A to Z",
                id: 'status'
            }, {
                key: "status-az",
                value: "Status, Z to A",
                id: 'status'
            }],
            label: "Sort by",
            //title: cbp.ohPage.globalVars.docDateAsc,
            labelClass: "xs-mr-5",
            name: "sortByDdn",
            display: "displayInline"
        };

        /* Function to remove the commas from the a string and concatenate it */
        var removeCommaFromString = function(e) {
            var prevTotalVal = '';
            $(e.currentTarget.closest(".modal")).find('.prev-total').text().split(',').map(function(val, index) {
                prevTotalVal += val;
            });
            return prevTotalVal;
        };

        /*Function to check if the difference between total volume entered and existing total vol is greater that 500*/
        var checkTotalVolDiscrepancy = function(prevTotalVal, element) {
            var formIsValid = false;
            if (!calculatedTotalValue || !parseFloat(prevTotalVal) || (calculatedTotalValue - parseFloat(prevTotalVal)) < 500) {
                //highlighting the disclaimer section
                $(config.disclaimerSection).addClass("has-error");
                $(config.totalValue).addClass("has-error");
                //Highlighting the error fields
                element.each(function() {
                    $(this).addClass("has-error");
                    $(config.totalValue).addClass("has-error");
                });
                formIsValid = false;
            } else {
                $(config.disclaimerSection).removeClass("has-error");
                $(config.totalValue).removeClass("has-error");
                element.each(function() {
                    $(this).removeClass("has-error");
                    $(config.totalValue).removeClass("has-error");
                });
                formIsValid = true;
            }
            return formIsValid;
        };

        var triggerValidations = function(e) {
            var rulVal = $(".actual-vol").val();
            var actualVolumeVals = [];
            var actualVolumeVals = [];
            var element = $(e.currentTarget.closest('.modal')).find('input');
            //getting the nos without the commas
            var prevTotalVal = removeCommaFromString(e);
            //Total Vol must exceed 500 and check for required also
            var totalVolDiscrepancy = checkTotalVolDiscrepancy(prevTotalVal, element);
            if (totalVolDiscrepancy) {
                return true;
            } else {
                return false;
            }
        };

        var validateRequiredFields = function(e, inputFields) {
            var isValidFields = [];
            var formIsRequired = true;
            //checking if the the input fields values are empty
            inputFields.each(function() {
                if (!$(this).val()) {
                    $(this).addClass('has-error');
                    isValidFields.push(false);
                } else {
                    $(this).removeClass('has-error');
                    isValidFields.push(true);
                }
            });
            console.log("isValidFields: ", isValidFields);
            //validating if any of the input fields are null then return false immediately
            for (var i = 0; i < isValidFields.length; i++) {
                if (!isValidFields[i]) {
                    formIsRequired = false;
                    break;
                } else {
                    formIsRequired = true;
                }
            }
            return formIsRequired;
        };

        var validateSalesTotalVolume = function(e) {
            var isTotalValueValid = true;
            if (parseInt($(config.totalVolume).text()) <= 0) {
                isTotalValueValid = false;
                $('.total-volume').addClass('has-error');
                $('.total-vol-error').removeClass('hide');

            } else {
                isTotalValueValid = true;
                $('.total-volume').removeClass('has-error');
                $('.total-vol-error').addClass('hide');
            }
            return isTotalValueValid;
        };

        var validateSalesDate = function(e, tableData, userEnteredSalesMonth, userEnteredSalesYear) {
            var currentYear = new Date().getFullYear();
            var currentMonth = new Date().getMonth();
            var tableDataLength = tableData.length;
            var dateGreaterThanCurrentDate = false;
            var dateEqualTableDate = false;
            //checking if user entered date is greater than or equal to the current date
            if (parseInt(userEnteredSalesYear) >= currentYear && parseInt(userEnteredSalesMonth) >= currentMonth + 1) {
                dateGreaterThanCurrentDate = true;
            }
            for (var i = 0; i < tableDataLength; i++) {
                var month = moment().month(tableData[i].salesMonth).format("MM");
                var year = tableData[i].salesMonth.split(" ")[1];
                if (userEnteredSalesYear === year && userEnteredSalesMonth === month) {
                    dateEqualTableDate = true;
                    break;
                }
            }
            console.log("dateGreaterThanCurrentDate", dateGreaterThanCurrentDate);
            console.log("dateEqualTableDate", dateEqualTableDate);
            if (dateGreaterThanCurrentDate && dateEqualTableDate) {
                //highlight the fields and show the error span
                return false;
            } else {
                //remove highlight of fields and hide the error span
                return true;
            }
        };

        var triggerAddSalesMonthValidations = function(e) {
            var inputFields = $(e.currentTarget.closest('.modal')).find('input');
            var tableData = $('#volumeTable').bootstrapTable('getData');
            var userEnteredSalesMonth = $(e.currentTarget).closest(".modal").find(config.salesMonth).val();
            var userEnteredSalesYear = $(e.currentTarget).closest(".modal").find(config.salesYear).val();


            if (validateRequiredFields(e, inputFields)) {
                (validateSalesTotalVolume(e) && validateSalesDate(e, tableData, userEnteredSalesMonth, userEnteredSalesYear)) ? isValidForm = true: isValidForm = false;
            } else {
                isValidForm = false;
            }

            return isValidForm;
        }

        /* Saving the dispute */
        var saveDispute = function(e) {
            $(config.jsSaveSuccess).removeClass('hide').find('span').text(cbp.miipProgramVolumeDetailPage.globalVars.disputeSuccessMsg);
            $('.modal').modal('hide');
        };

        var setSalesMonthPayload = function(e) {
            var salesMonthVolumeObj = {};
            var headersDataObj = {};
            headersDataObj.soldTo = volumeSummaryData.soldTo;
            headersDataObj.siteZone = volumeSummaryData.siteZone;
            headersDataObj.businessConsultant = volumeSummaryData.businessConsultant;
            headersDataObj.site = volumeSummaryData.site;
            headersDataObj.thruput = volumeSummaryData.thruput;
            headersDataObj.brand = volumeSummaryData.brand;
            salesMonthVolumeObj.headerData = headersDataObj;
            salesMonthVolumeObj.month = $(e.target.closest(".modal")).find('.sales-month').val();
            salesMonthVolumeObj.year = $(e.target.closest(".modal")).find('.sales-year').val();
            salesMonthVolumeObj.mul = $(e.target.closest(".modal")).find('.mul-quantity').val();
            salesMonthVolumeObj.rul = $(e.target.closest(".modal")).find('.rul-quantity ').val();
            salesMonthVolumeObj.pul = $(e.target.closest(".modal")).find('.pul-quantity ').val();
            salesMonthVolumeObj.total = $(e.target.closest(".modal")).find('.total-volume').text();
            saveNewSalesMonthVolume(salesMonthVolumeObj);
            console.log(salesMonthVolumeObj);
        };

        var saveNewSalesMonthVolume = function(data) {
            $.when(triggerAjaxRequest(data, cbp.miipProgramVolumeDetailPage.globalUrl.method, cbp.miipProgramVolumeDetailPage.globalUrl.addNewVolumeURL)).then(function(result) {
                $(config.jsSaveSuccess).removeClass('hide').find('span').text(cbp.miipProgramVolumeDetailPage.globalVars.salesVolumeSuccessMsg);
                $(config.displaySpinner).hide();
                populatingTable(result, result.miipSiteColumnMapping);
                loadingDynamicHbsTemplates();
            });
        };

        var triggerAjaxRequest = function(data, type, url) {
            $(config.displaySpinner).show();

            function successCallback(res) {
                return res;
            }

            function errorCallback(err) {
                return err;
            }
            return $.ajax({
                type: type,
                data: data,
                data: JSON.stringify(data),
                //headers: {'CSRFToken':CSRFToken},
                contentType: "application/json",
                dataType: "json",
                url: url,
                success: successCallback,
                error: errorCallback
            });
        };

        var loadingInitialHbsTemplates = function() {
            //Appending handlebar templates to HTML
            loadingDynamicHbsTemplates();
            $(config.displaySpinner).hide();
        };

        var loadingDynamicHbsTemplates = function() {
            $(config.programViewSummaryConatiner).html(compiledProgramViewSummary(cbp.miipProgramVolumeDetailPage));
            $(config.programVolumeDetailsContainer).html(compiledProgramVolumeDetails(cbp.miipProgramVolumeDetailPage.globalVars));
            $(config.programViewContainer).html(compiledProgramView(cbp.miipProgramVolumeDetailPage));
            $(config.volumeViewContainer).html(compiledVolumeView(cbp.miipProgramVolumeDetailPage));
            $(config.programVolumeHeadingContainer).html(compiledProgramVolumeHeading(cbp.miipProgramVolumeDetailPage));
            $(config.sortByDdnContainer).html(compiledDefaultDdn(srtByDdn));
            $(config.salesModal).html(compiledSalesModal());
            $(config.disputeModal).html(compiledDisputeModal());
            $(config.disputedModal).html(compiledDisputedModal());
            $(config.dropDownCommon).selectpicker('refresh');
            enableMobileDefaultDropDown();
        };

        var enableMobileDefaultDropDown = function() {
            //Enable mobile scrolling by calling $('.selectpicker').selectpicker('mobile'). This enables the device's native menu for select menus.
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
                $(config.dropDownCommon).selectpicker('mobile');
            }
        };

        var initalizingTables = function() {
            $('#disputeTable, #disputedTable, #addSalesTable').bootstrapTable({
                classes: 'table table-no-bordered',
                striped: true,
                iconsPrefix: 'fa',
                responsive: true,
                responsiveBreakPoint: 768,
                responsiveClass: "bootstrap-table-cardview",
                undefinedText: ""
            });
        }

        var getProgramCols = function() {
            var colsToShow = [];
            var programColsOrder = ['program', 'paymentStartDate', 'paymentEndDate', 'amortizationEndDate', 'totalPaid', 'estimatedRepaymentAmount', 'status']
            var programColumnList = [{
                    field: 'program',
                    title: 'Program',
                    class: 'text-wrap',
                    formatter: function(row, value) {
                        if (value.status == 'Rollover') {
                            return row;
                        } else {
                            return '<a href="" class="programAnchor">' + row + '</a>';
                        }
                    }
                }, {
                    field: 'paymentStartDate',
                    title: 'Payment Start Date',
                    class: 'text-wrap'
                }, {
                    field: 'paymentEndDate',
                    title: 'Payment End Date',
                    class: 'text-wrap'
                }, {
                    field: 'amortizationEndDate',
                    title: 'Amortization End Date',
                    class: 'text-wrap break-word',
                }, {
                    field: 'totalPaid',
                    title: 'Total Paid (USD)',
                    class: 'text-right text-wrap '
                },
                {
                    field: 'estimatedRepaymentAmount',
                    title: 'Estimated Repayment Amount (USD)',
                    class: 'text-right text-wrap'
                }, {
                    field: 'status',
                    title: 'Status',
                    class: 'text-wrap',
                    sortable: true
                }
            ];

            for (var i = 0; i < programColsOrder.length; i++) {
                for (key in programColumnMapping) {
                    if (programColsOrder[i] == key && programColumnMapping[key]) {
                        colsToShow.push(programColsOrder[i]);
                    }
                }
            }

            var programCols = colsToShow.map(function(value) {
                for (var i = 0; i < programColumnList.length; i++) {
                    if (programColumnList[i].field === value) {
                        return programColumnList[i];
                    }
                }
            });

            return programCols;
        }

        var populateProgramTable = function() {
            $('#programTable').bootstrapTable({
                classes: 'table table-no-bordered',
                striped: true,
                iconsPrefix: 'fa',
                sortName: 'status',
                sortOrder: 'asc',
                sortName: 'status',
                parentContainer: ".js-program-view",
                responsive: true,
                responsiveBreakPoint: 768,
                responsiveClass: "bootstrap-table-cardview",
                undefinedText: "",
                columns: getProgramCols(),
                data: programTableData
            });
        }

        var populateVolumeTable = function() {
            $('#volumeTable').bootstrapTable({
                classes: 'table table-no-bordered',
                striped: true,
                iconsPrefix: 'fa',
                sortName: 'salesMonth',
                sortOrder: 'desc',
                parentContainer: ".js-program-view",
                responsive: true,
                responsiveBreakPoint: 768,
                responsiveClass: "bootstrap-table-cardview",
                undefinedText: "",
                columns: [{
                    field: 'salesMonth',
                    title: 'Sales Month',
                    sortable: true,
                    class: 'numberIcon col-md-6',
                    formatter: function(row, value) {
                        return "<a href='#' class='js-volume-anchor sales-month' data-sales-month='" + row + "'>" + row + "</a>";
                    }
                }, {
                    field: 'rul',
                    title: 'RUL'
                }, {
                    field: 'mul',
                    title: 'MUL'
                }, {
                    field: 'pul',
                    title: 'PUL'
                }, {
                    field: 'total',
                    title: 'Total'
                }, {
                    field: 'disputeVolume',
                    title: 'Dispute Volume',
                    formatter: function(row, value, index) {
                        if ($.inArray(value, volumeRowArray) < 0) {
                            volumeRowArray.splice(index, 0, value);
                        }
                        var rowData = value;
                        if (value.disputeVolume === 'Disputed') {
                            return '<a href="" data-toggle="modal" data-target="#disputedModal" data-index=' + index + '>' + row + '</a>'
                        } else {
                            return '<a href="" data-toggle="modal" data-target="#disputeModal" data-index=' + index + '>' + row + '</a>';
                        }
                    }
                }, {
                    field: 'reason',
                    title: 'Reason'
                }, {
                    field: 'status',
                    title: 'Status',

                    class: 'col-md-6',
                }],
                data: volumeTableData
            });
        }

        var populateTable = function() {
            populateProgramTable();
            populateVolumeTable();
        }

        var bindEvents = function() {
            $(document).on("click", config.printBtn, function(e) {
                var programViewSummary = compiledProgramViewSummary(cbp.miipProgramVolumeDetailPage);
                var win = window.open('', '_blank', 'PopUp' + ',width=1300,height=800');
                win.document.write('\n                <html>\n                    <head>\n                        <meta charset="utf-8">\n                        <meta http-equiv="X-UA-Compatible" content="IE=edge">\n                        <meta name="viewport" content="width=device-width, initial-scale=1">\n                        <link href="/assets/css/custom-bootstrap.css" rel="stylesheet" type="text/css"/>\n                        <link href="/assets/css/app-na.css" rel="stylesheet" type="text/css"/>\n                        <style>\n      .break-word{ word-wrap: break-word; width:16%;}    .summary-heading{display:none;} a{text-decoration:none; color:#383838; cursor: default; pointer-events:none;} a:hover{text-decoration:none; color:#383838; cursor: default;} a:focus{text-decoration:none; color:#383838; cursor: default;}      .summary-print{margin-left:20px; margin-bottom:20px; width:97%;}       .custBody {\n                            background-color: #ffffff;\n                          }\n                 .fixed-table-container{    margin-left: -6px;}       .miip-program-view-headerLabel {\n                            color: #009dd9;\n                            font-weight: bold;\n                                                                                                     font-size: 20px;\n                            margin-left: 22px;\n                                                                                                     padding: 0 0 0px 0;\n                        }\n\t\t\t\t\t\t.table{\n\t\t\t\t\t\t\tmax-width:98%;\n\t\t\t\t\t\t\tmargin-left:20px;\n}\t\n.nav-bottom{\n                                                                                                     border-bottom: none;\n                                                                                      }\n                                                                                      .navbar-brand{\n                                                                                                     \n                                                                                      }\n                                                                                      .fixed-table-body{\n                                                                                                     height:auto !important;\n                                                                                      }\n                        </style>\n                    </head>\n                    <body class="custBody">\n                        <div class="wrapper">\n                            <header class="main-header main-header-md js-header" style="">\n                                <div class="nav-bottom">\n                                    <nav class="main-navigation js-enquire-offcanvas-navigation" role="navigation">\n                                                                                                                                                \n                                        <div class="row">                                            \n                                                <a class="navbar-brand navbar-left" href="/index.html">\n                                                    <img alt="Brand" src="/assets/images/logo.png">\n                                                    <span>business point</span>\n                                                </a>\n                                                                                                                                                                               <a class="navbar-brand navbar-right" href="/index.html">\n                                                    <img alt="Brand" src="/assets/images/fob-color-rgb.png">                                                    \n                                                </a>\n                                            </div>                                                                                                                                                  \n                                        \n                                    </nav>\n                                </div>\n                            </header>\n                            <div class="col-sm-24">\n                                <p class="miip-program-view-headerLabel">MIIP program view</p>\n                            </div>\n                           <div class ="col-xs-24 shipToSummary"></div>\n                                                    \n                            \n                        </div>\n                    </body>\n                </html>\n                ');
                win.document.write(programViewSummary);
                win.document.write($(".tableContainer").html());
            });

            $(document).on('shown.bs.tab', config.selectedTabs, function(e) {
                var target = $(e.target).attr("href");
                if (target === '#programview') {
                    cbp.miipProgramVolumeDetailPage.programView = true;
                } else {
                    cbp.miipProgramVolumeDetailPage.programView = false;
                }
                $(config.programVolumeHeadingContainer).html(compiledProgramVolumeHeading(cbp.miipProgramVolumeDetailPage));
                $(config.programViewSummaryConatiner).html(compiledProgramViewSummary(cbp.miipProgramVolumeDetailPage));
            });

            $(document).on('click', config.selectedDisputeLink, function(e) {
                var targetDataIndex = e.target.dataset.index;
            });
            $(document).on('click', config.saveDisputeBtn, config.saveDisputedBtn, function(e) {
                var isValid = triggerValidations(e);
                if (isValid) {
                    saveDispute(e);
                }
            });

            $(document).on('click', config.saveNewSalesMonthBtn, function(e) {
                var x = triggerAddSalesMonthValidations(e);
                console.log("x is ", x);
                if (x) {
                    $('.modal').modal('hide');
                    setSalesMonthPayload(event);
                }
            });


            //calculating the total volume for dispute and disputed popup
            $(document).on('focusout', config.actualVol, function(event) {
                rulValue = $(this).hasClass("rul-val") ? ($(this).val() ? parseFloat(event.currentTarget.value) : rulValue = 0) : rulValue;
                mulValue = $(this).hasClass("mul-val") ? ($(this).val() ? parseFloat(event.currentTarget.value) : mulValue = 0) : mulValue;
                pulValue = $(this).hasClass("pul-val") ? ($(this).val() ? parseFloat(event.currentTarget.value) : pulValue = 0) : pulValue;
                calculatedTotalValue = rulValue + mulValue + pulValue;
                $(config.totalValue).text(calculatedTotalValue.toString());
            });

            //calculating the total volume for sales popup
            $(document).on("focusout", config.quantityInput, function(e) {
                var sum = 0;
                $(config.quantityInput).each(function() {
                    sum += Number($(this).val());
                });
                $(config.totalVolume).text(sum.toString());
            });

            $(document).on("click", config.programAnchor, function(e) {
                e.preventDefault();
                var saleMonth = $(e.target).attr('data-sales-month');
                var salesMonthArr = saleMonth.split(" ");
                volumeDetailFormObj.soldTo = programSummaryData.soldTo;
                volumeDetailFormObj.siteZone = programSummaryData.siteZone;
                volumeDetailFormObj.businessConsultant = programSummaryData.businessConsultant;
                volumeDetailFormObj.site = programSummaryData.site;
                volumeDetailFormObj.thruput = programSummaryData.thruput;
                volumeDetailFormObj.brand = programSummaryData.brand;
                volumeDetailFormObj.month = moment().month(salesMonthArr[0]).format("MM");
                volumeDetailFormObj.year = salesMonthArr[1];
                volumeDetailFormObj = JSON.stringify(volumeDetailFormObj);
                $('#CBPMIIPVolumeDetailForm #volumeDetailFormData').val(volumeDetailFormObj);
                $('#CBPMIIPVolumeDetailForm').submit();
            });

            $(".modal").on("hidden.bs.modal", function(e) {
                resetModal(e);
            });
        }

        var resetModal = function(e) {
            $(config.modal).find('input').val('').removeClass('has-error')
            $(config.totalValue).text('').removeClass('has-error');
            $(config.disclaimerSection).removeClass('has-error');
            $(config.jsSaveError).hide();
            calculatedTotalValue = 0;
            rulValue = 0, mulValue = 0, pulValue = 0;
            $(e.target.closest(".modal")).find('.js-quantity-input').val(0);
            $(e.target.closest(".modal")).find('.total-volume').text(0);
        }

        var init = function() {
            loadingInitialHbsTemplates();
            initalizingTables();
            populateTable();
            bindEvents();
        };

        return {
            init: init
        };
    })();
    $(document).ready(function() {
        miipProgramVolumePage.init();
    });
});