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
            sortByDdnContainer: ".js-sortbyDdn",
            selectedTabs: '.content-tabs .nav-tabs a[data-toggle="tab"]',
            selectedDisputeLink: 'a[data-target="#disputeModal"]',
            salesModal: ".js-sales-modal",
            disputeModal: ".js-dispute-modal",
            disputedModal: ".js-disputed-modal"
        };

        var srtByDdn = {
            "options": [{
                key: "status-za",
                value: "Status, A to Z",
                id: 'status'
            },{
                key: "status-az",
                value: "Status, Z to A",
                id: 'status'
            }],
            label: "Sort By",
            //title: cbp.ohPage.globalVars.docDateAsc,
            labelClass: "xs-mr-5",
            name: "sortByDdn",
            display: "displayInline"
        };

        var triggerAjaxRequest = function(data,type,url){   
            $(config.displaySpinner).show();
            function successCallback(res){
                return res;
            }
            function errorCallback(err){
                return err;
            }
            return $.ajax({
                type: type,
                data: data,
                data: JSON.stringify(data),
                //headers: {'CSRFToken':CSRFToken},
                contentType: "application/json",
                dataType:"json",
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

        var initalizingTables = function(){
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

        var populateTable = function(){
            $('#programTable').bootstrapTable({
                classes: 'table table-no-bordered',
                striped: true,
                iconsPrefix: 'fa',
                sortName: 'status',
                sortOrder: 'asc',
                parentContainer: ".js-program-view",
                responsive: true,
                responsiveBreakPoint: 768,
                responsiveClass: "bootstrap-table-cardview",
                undefinedText: "",
                columns: [{
                    field: 'program',
                    title: 'Program',
                    formatter: function(row, value){
                        if(value.status == 'Rollover'){
                            return row;
                        } else {
                            return '<a href="">'+row+'</a>';
                        }
                    },
                }, {
                    field: 'paymentStartDate',
                    title: 'Payment Start Date'
                }, {
                    field: 'paymentEndDate',
                    title: 'Payment End Date'
                }, {
                    field: 'amortizationEndDate',
                    title: 'Amortization End Date'
                }, {
                    field: 'totalPaid',
                    title: 'Total Paid (USD)',
                    class: 'text-right'
                },
                {
                    field: 'estimatedRepaymentAmount',
                    title: 'Estimated Repayment Amount',
                    class: 'text-right'
                },{
                    field: 'status',
                    title: 'Status'
                }],
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
                sortName: 'status',
                sortOrder: 'asc',
                parentContainer: ".js-program-view",
                responsive: true,
                responsiveBreakPoint: 768,
                responsiveClass: "bootstrap-table-cardview",
                undefinedText: "",
                columns: [{
                    field: 'salesMonth',
                    title: 'Sales Month',
                    formatter: function(row, value){
                        return '<a href="">'+row+'</a>';
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
                    formatter: function(row, value, index){
                        console.log(value);
                        if($.inArray( value, volumeRowArray) < 0){
                            volumeRowArray.splice(index, 0, value);
                        }

                        if(value.disputeVolume === 'Disputed'){
                            return '<a href="" data-toggle="modal" data-target="#disputedModal" data-index='+index+'>'+row+'</a>';
                        } else{
                            return '<a href="" data-toggle="modal" data-target="#disputeModal" data-index='+index+'>'+row+'</a>';
                        }
                    }
                }, {
                    field: 'reason',
                    title: 'Reason'
                }, {
                    field: 'status',
                    title: 'Status',
                    sortable: true
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

        var bindEvents = function(){
            $(document).on('shown.bs.tab',config.selectedTabs, function (e) {
                var target = $(e.target).attr("href");
                if(target === '#programview'){
                    cbp.miipProgramVolumeDetailPage.programView = true;
                }else{
                    cbp.miipProgramVolumeDetailPage.programView = false;
                }
                $(config.programVolumeHeadingContainer).html(compiledProgramVolumeHeading(cbp.miipProgramVolumeDetailPage));
                $(config.programViewSummaryConatiner).html(compiledProgramViewSummary(cbp.miipProgramVolumeDetailPage));
            });

            $(document).on('click',config.selectedDisputeLink, function(e){
                var targetDataIndex = e.target.dataset.index;
            });
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