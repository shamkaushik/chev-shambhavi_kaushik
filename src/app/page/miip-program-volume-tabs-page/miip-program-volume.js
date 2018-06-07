require(["modernizr",
    "jquery",
    "bootstrap",
    "handlebars",
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

], function(modernizr, $, bootstrap, Handlebars, bootstrapSelect, bootstrapTable, _defaultDdnHBS, _programViewSummaryHBS, _programVolumeDetailsHBS, _programViewHBS, _volumeViewHBS, _programVolumeHeadingHBS, _salesModalHBS, _disputeModalHBS, _disputedModalHBS) {

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
        var formIsValid = true;
        var calculatedTotalValue;
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
            closBtn: ".clos-btn",
            prevTotal: ".prev-total",
            modal: '.modal',
            jsSaveSuccess: '.js-save-success'
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

        var fireValidations = function(e) {
            var rulVal = $(".actual-vol").val();
            var actualVolumeVals = [];
            var prevTotalVal = '';
            var actualVolumeVals = [];
            var element = $(e.currentTarget.closest('.modal')).find('input');
            //highlighting input fields
            element.each(function() {
                //var value = $(this).val() ? $(this).val() : null;
                if ($(this).val()) {
                    actualVolumeVals.push($(this).val());
                    //If actual vol should is a whole no
                    if (($(this).val() - Math.floor($(this).val())) !== 0) {
                        $(this).addClass("has-error");
                        $(config.totalValue).addClass("has-error");
                        formIsValid = false;
                    } else {
                        $(this).removeClass("has-error");
                        $(config.totalValue).removeClass("has-error");
                        formIsValid = false;
                    }
                }
            });
            $(e.currentTarget.closest(".modal")).find('.prev-total').text().split(',').map(function(val, index) {
                prevTotalVal += val;
            });
            //Total Vol discrepancy must exceed 500 and check for required also
            if (!calculatedTotalValue || !parseFloat(prevTotalVal) || (calculatedTotalValue - parseFloat(prevTotalVal)) < 500) {
                //highlighting the disclaimer section               
                $(config.disclaimerSection).addClass("has-error");
                $(config.totalValue).addClass("has-error");
                $("input[type='text']").each(function() {
                    $(this).addClass("has-error");
                    $(config.totalValue).addClass("has-error");
                });
                formIsValid = false;
                return formIsValid;
            } else {
                $(config.disclaimerSection).removeClass("has-error");
                $(config.totalValue).removeClass("has-error");
                $("input[type='text']").each(function() {
                    $(this).removeClass("has-error");
                    $(config.totalValue).removeClass("has-error");
                });
                formIsValid = true;
                return formIsValid;
            }
            return formIsValid;
            //saveDispute();
        };

        var saveDispute = function() {
            $(config.jsSaveSuccess).removeClass('hide').find('span').text(cbp.miipProgramVolumeDetailPage.globalVars.successMsg);
            $('.modal').modal('hide');
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
            $(config.programVolumeDetailsContainer).html(compiledProgramVolumeDetails());
            $(config.programViewContainer).html(compiledProgramView());
            $(config.volumeViewContainer).html(compiledVolumeView());
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

        var populateTable = function() {
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
                columns: [{
                        field: 'program',
                        title: 'Program',
                        class: 'text-wrap',
                        formatter: function(row, value) {
                            if (value.status == 'Rollover') {
                                return row;
                            } else {
                                return '<a href="" class="programAnchor">' + row + '</a>';
                            }
                        },
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
                ],
                data: [{
                    program: '6 Brand Retention Program',
                    paymentStartDate: '01/2016',
                    paymentEndDate: '05/2026',
                    amortizationEndDate: '01/2027',
                    totalPaid: '21,783.00',
                    estimatedRepaymentAmount: '21,783.00',
                    status: 'Active'
                }, {
                    program: '6 Brand Retention Program',
                    paymentStartDate: '01/2016',
                    paymentEndDate: '05/2026',
                    amortizationEndDate: '01/2027',
                    totalPaid: '21,783.00',
                    estimatedRepaymentAmount: '21,783.00',
                    status: 'Rollover'
                }]
            });

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
                        return '<a href="">' + row + '</a>';
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
                        console.log(value);
                        if ($.inArray(value, volumeRowArray) < 0) {
                            volumeRowArray.splice(index, 0, value);
                        }

                        if (value.disputeVolume === 'Disputed') {
                            return '<a href="" data-toggle="modal" data-target="#disputedModal" data-index=' + index + '>' + row + '</a>';
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
                data: [{
                    salesMonth: 'Sept 2017',
                    rul: '70,460',
                    mul: '90,123',
                    pul: '69,279',
                    total: '192,105',
                    disputeVolume: 'Dispute',
                    reason: '',
                    status: ''
                }, {
                    salesMonth: 'Sept 2017',
                    rul: '1234567890,1234567890,1234567890,1234567890',
                    mul: '90,123',
                    pul: '69,279',
                    total: '192,105',
                    disputeVolume: 'Dispute',
                    reason: '',
                    status: ''
                }, {
                    salesMonth: 'Oct 2017',
                    rul: '1234567890',
                    mul: '90,123',
                    pul: '69,279',
                    total: '192,105',
                    disputeVolume: 'Disputed',
                    reason: '',
                    status: ''
                }]
            });
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
            $(document).on('click', config.saveBtn, function(e) {
                var isValid = fireValidations(e);
                if (isValid)
                    saveDispute();
            });

            $(document).on('focusout', config.actualVol, function(event) {
                rulValue = $(this).hasClass("rul-val") ? parseFloat(event.currentTarget.value) : rulValue;
                mulValue = $(this).hasClass("mul-val") ? parseFloat(event.currentTarget.value) : mulValue;
                pulValue = $(this).hasClass("pul-val") ? parseFloat(event.currentTarget.value) : pulValue;
                // isCalculatedTotalValValid = (rulValue + mulValue + pulValue) >= 500 ? true : false;
                calculatedTotalValue = rulValue + mulValue + pulValue;
                $(config.totalValue).text(calculatedTotalValue.toString());
            });

            $(".modal").on("hidden.bs.modal", function(e) {
                // put your default event here
                console.log("hidden: ", e.target);
                resetModal(e);
                //$(e.target).html('');
            });
        }
        var resetModal = function(e) {
            $(config.modal).find('input').val('').removeClass('has-error')
            $(config.totalValue).text('').removeClass('has-error');
            $(config.disclaimerSection).removeClass('has-error');
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