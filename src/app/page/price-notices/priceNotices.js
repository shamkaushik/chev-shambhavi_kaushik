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
    "text!app/page/price-notices/priceNoticesBottomDetails.hbs"

], function (modernizr, $, bootstrap, Handlebars, moment, calendar, bootstrapSelect, bootstrapTable, toggleSwitch, _calendarHBS, _defaultDdnHBS, _searchFormHBS,_priceNoticesSummaryHBS,_priceNoticesBottomDetailsHBS) {
     //Compiling HBS templates
     var compiledDefaultDdn = Handlebars.compile(_defaultDdnHBS);
     var compiledsearchDate = Handlebars.compile(_calendarHBS);
     var compiledsearchForm = Handlebars.compile(_searchFormHBS);
     var compliedpricenoticesSummary = Handlebars.compile(_priceNoticesSummaryHBS);
     var compiledpricenoticesBottomDetail = Handlebars.compile(_priceNoticesBottomDetailsHBS);

     var pricenoticespage = (function() {
        var config = {
            headerContainer: ".js-header",
            footerContainer: ".js-footer",
            dropDownCommon: ".selectpicker",
            searchFormContainer: ".js-search-form",
            searchDetailContainer: ".js-bottom-detail",
            displaySpinner: ".overlay-wrapper",
            accountDdnContainer: ".js-account-ddn",
            yearDdnContainer: ".js-year-ddn",
            qtrDdnContainer: ".js-qtr-ddn",
            dnldStatusDdnContainer: ".js-download-status-ddn",
            reportSummaryContainer: ".js-report-summary",
            soldToDdnContainer:".js-soldTo-ddn",
            soldToDdn: "#soldToSelectDdn",
            accountDdn: "#accountSelectDdn",
            yearDdn: "#yearSelectDdn",
            quarterDdn: "#qtrSelectDdn",
            downloadStatusDdn: "#dnldStatusSelectDdn",
            searchBtn: "#searchBtn",
            downloadBtn: "#downloadBtn",
            downloadIcon: ".report-download-icon",
            priceNoticesToggle: "#priceNoticesViewToggle",
            pickDateRangeContainer: ".js-search-pickDateRange",
            priceNoticesSummaryContainer: ".js-price-notices-summary",
            priceNoticesBottomDetailContainer: ".js-price-notices-bottom-detail",
            sortByDdnContainer: ".js-sortbyDdn"
        };
        $(config.displaySpinner).hide();
        var loadingInitialHbsTemplates = function () {
            $(config.searchFormContainer).html(compiledsearchForm(cbp.pricenoticesPage));
            $(config.pickDateRangeContainer).html(compiledsearchDate({
                label: cbp.pricenoticesPage.globalVars.pickDateRange,
                iconClass: cbp.pricenoticesPage.dateRange.iconClass,
                id: cbp.pricenoticesPage.dateRange.id
            }));
            $(config.priceNoticesSummaryContainer).html(compliedpricenoticesSummary(cbp.pricenoticesPage));
            $(config.priceNoticesBottomDetailContainer).html(compiledpricenoticesBottomDetail(cbp.pricenoticesPage));
            $(config.sortByDdnContainer).html(compiledDefaultDdn(srtByDdn));
            $(config.sortByDdnContainer).find(config.dropDownCommon).selectpicker('refresh');
        };
        var init = function() {
            loadingInitialHbsTemplates();
            $(config.priceNoticesToggle).toggleSwitch(toggleSwitchConfig);
        };

        var toggleSwitchConfig = {
            name: "switch",
            cssClass: "toggleForPriceNoticesSearchForm",
            label: "",
            //LabelBlock: true,
            options: [{
                label: cbp.pricenoticesPage.globalVars.priceNoticeType,
                value: "priceNoticeType",
                default: true
            },{
                label: cbp.pricenoticesPage.globalVars.detail,
                value: "detail"
            }]
        };
        return {
            init: init
        };
     })();

    $(document).ready(function() {
        pricenoticespage.init();
        leftPaneExpandCollapse.init();
    });
});
