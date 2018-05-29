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

], function(modernizr, $, bootstrap, Handlebars, bootstrapSelect, bootstrapTable, _defaultDdnHBS, _programViewSummaryHBS, _programVolumeDetailsHBS, _programViewHBS, _volumeViewHBS, _programVolumeHeadingHBS) {

    //Compiling HBS templates
    var compiledDefaultDdn = Handlebars.compile(_defaultDdnHBS);
    var compiledProgramViewSummary = Handlebars.compile(_programViewSummaryHBS);
    var compiledProgramVolumeDetails = Handlebars.compile(_programVolumeDetailsHBS);
    var compiledProgramView = Handlebars.compile(_programViewHBS);
    var compiledVolumeView = Handlebars.compile(_volumeViewHBS);
    var compiledProgramVolumeHeading = Handlebars.compile(_programVolumeHeadingHBS);

    var miipProgramVolumePage = (function() {
        
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
            sortByDdnContainer: ".js-sortbyDdn"
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
            $(config.dropDownCommon).selectpicker('refresh');
            enableMobileDefaultDropDown();
        };

        var enableMobileDefaultDropDown = function() {
            //Enable mobile scrolling by calling $('.selectpicker').selectpicker('mobile'). This enables the device's native menu for select menus.
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
                $(config.dropDownCommon).selectpicker('mobile');
            }
        };

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
                    title: 'Total Paid',
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
                columns: [{
                    field: 'id',
                    title: 'VolumeItem ID'
                }, {
                    field: 'name',
                    title: 'VolumeItem Name'
                }, {
                    field: 'price',
                    title: 'VolumeItem Price'
                }],
                data: [{
                    id: 1,
                    name: 'Item 1 Volume',
                    price: '$901'
                }, {
                    id: 2,
                    name: 'Item 2 Volume',
                    price: '$4532'
                }]
            });
        }

        var bindEvents = function(){
            $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
                var target = $(e.target).attr("href");
                if(target === '#programview'){
                    cbp.miipProgramVolumeDetailPage.programView = true;
                }else{
                    cbp.miipProgramVolumeDetailPage.programView = false;
                }
                $(config.programVolumeHeadingContainer).html(compiledProgramVolumeHeading(cbp.miipProgramVolumeDetailPage));
                $(config.programViewSummaryConatiner).html(compiledProgramViewSummary(cbp.miipProgramVolumeDetailPage));
            });
        }

        var init = function() {
            loadingInitialHbsTemplates();
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