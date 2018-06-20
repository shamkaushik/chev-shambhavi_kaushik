require(["modernizr",
    "jquery",
    "bootstrap",
    "handlebars",
    "bootstrap-select",
    "bootstrap-table",
    "text!app/components/dropdown/_defaultDdn.hbs",
    "text!app/page/add-new-mr-company/add-new-mr-company-summary.hbs",
    "text!app/page/add-new-mr-company/bottomDetail.hbs"

], function (modernizr, $, bootstrap, Handlebars, bootstrapSelect, bootstrapTable, _defaultDdnHBS, _addNewMrCompanySummaryHBS, _bottomDetailHBS) {

    var parentSoldToDdnOptions = [],statusDdnOptions = [];
    // Compiling HBS templates
    var compiledAddNewCompanySummary = Handlebars.compile(_addNewMrCompanySummaryHBS);
    var compiledBottomDetail = Handlebars.compile(_bottomDetailHBS);
    var compiledDefaultDdn = Handlebars.compile(_defaultDdnHBS);

    var addNewMrCompanyPage = (function () {
        var config = {
            addNewMrSummaryContainer: ".js-add-new-mr-company-summary",
            addNewMrDetailContainer: ".js-bottom-detail",
            displaySpinner: ".overlay-wrapper",
            backtoCompanyMgt: ".companyMgtReturnView",
            topSummaryLeftSection: ".topSummaryLeftSection",
            sortByDdnContainer: ".js-sortbyDdn",
            sortByDdn: "#sortByDdn",
            sortByDdnContainer: ".js-sortbyDdn",
            parentSoldToDropdownContainer: '.js-parent-sold-to-dropDown',
            statusDropDownContainer: '.js-status-dropDown',
            parentSoldToDdn: '#parentSoldToDdn',
            statusDdn : "#statusDdn",
        };

        var init = function () {
            populateDropDowns(addNewMrCompanyResponse.soldToDropDown,parentSoldToDdnOptions,"parentSoldToDropdown");
            populateDropDowns(addNewMrCompanyResponse.status,statusDdnOptions,"statusDropDown");
            loadingInitialHbsTemplates();
            bindEvents();
            populatingTable(addNewMrCompanyResponse.availableSites);
        };
        var loadingInitialHbsTemplates = function () {
            loadingDynamicHbsTemplates();
            $(config.displaySpinner).hide();
            $(config.parentSoldToDropdownContainer).html(compiledDefaultDdn(cbp.addNewMrComapnyPage.parentSoldToDropdown));
            $(config.statusDropDownContainer).html(compiledDefaultDdn(cbp.addNewMrComapnyPage.statusDropDown));
        };

        var loadingDynamicHbsTemplates = function () {
            $(config.addNewMrSummaryContainer).html(compiledAddNewCompanySummary(cbp.addNewMrComapnyPage));
            $(config.addNewMrDetailContainer).html(compiledBottomDetail(cbp.addNewMrComapnyPage));

            var sortDdnOptions = generatingOptions(addNewMrColumnMapping);
            srtByDdn["options"] = sortDdnOptions;
            $(config.sortByDdnContainer).html(compiledDefaultDdn(srtByDdn));
            $(config.sortByDdnContainer).find(config.dropDownCommon).selectpicker('refresh');
            enableMobileDefaultDropDown();
            $(config.dropDownCommon).selectpicker('refresh');
        };

        var enableMobileDefaultDropDown = function() {
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
                $('.selectpicker').selectpicker('mobile');
            }
        };

        var populateDropDowns = function(dropDownList,dropDownListOptions,dropDownName){
            for (var i = 0; i < dropDownList.length; i++) {
                var obj = {};
                obj["key"] = dropDownList[i].uid;
                obj["value"] = dropDownList[i].displayName;
                dropDownListOptions.push(obj);
            }
            cbp.addNewMrComapnyPage[dropDownName].options = dropDownListOptions;
        };

        var generatingOptions = function(data){
            globalSortList = [{
                key: "site-asc",
                value: cbp.addNewMrComapnyPage.globalVars.siteAsc
            },
            {
                key: "site-desc",
                value: cbp.addNewMrComapnyPage.globalVars.siteDesc
            }];

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
          debugger;
            var k = requestedOptions[i];
            optionDropdown.push(sortListMap[k]);
        }
            return optionDropdown;
        };

        var bindEvents = function () {
            $(document).on('click',config.backtoCompanyMgt,function(){
                window.location.href=cbp.addNewMrComapnyPage.globalUrl.returnToCompanyMgtUrl;
            });
        };

        var populatingTable = function (availableSites) {
            $(config.sortByDdn).val("referenceDate-desc").selectpicker('refresh');
            $('#table').bootstrapTable({
                classes: 'table table-no-bordered',
                striped: true,
                sortOrder: 'asc',
                iconsPrefix: 'fa',
                sortable: true,
                parentContainer: ".js-bottom-detail",
                sortByDropdownId: "#sortByDdn",
                responsive: true,
                responsiveBreakPoint: 768,
                sortName: 'displayName',
                responsiveClass: "bootstrap-table-cardview",
                columns: [
                  {
                    field: 'checkbox',
                    checkbox: true,
                    class: 'fa',
                  },
                  {
                    field: 'displayName',
                    title: 'Site',
                    sortable: true,
                    width:"100%"
                }],
                data: availableSites
            });
        };
        return {
            init: init
        };
    })();

    $(document).ready(function () {
        // Localization setup for dropdown & table
        $.fn.bootstrapTable.locales = {
            formatRecordsPerPage: function (pageNumber) {
                return cbp.addNewMrComapnyPage.globalVars.tableLocales.recordsPerPage.replace('{0}', pageNumber);
            },
            formatShowingRows: function (pageFrom, pageTo, totalRows) {
                return cbp.addNewMrComapnyPage.globalVars.tableLocales.showingRows.replace('{0}', pageFrom).replace('{1}', pageTo).replace('{2}', totalRows);
            },
            formatSearch: function () {
                return cbp.addNewMrComapnyPage.globalVars.tableLocales.search;
            },
            formatPaginationSwitch: function () {
                return cbp.addNewMrComapnyPage.globalVars.tableLocales.paginationSwitch;
            },
            formatRefresh: function () {
                return cbp.addNewMrComapnyPage.globalVars.tableLocales.refresh;
            },
            formatToggle: function () {
                return cbp.addNewMrComapnyPage.globalVars.tableLocales.toggle;
            },
            formatColumns: function () {
                return cbp.addNewMrComapnyPage.globalVars.tableLocales.columns;
            },
            formatAllRows: function () {
                return cbp.addNewMrComapnyPage.globalVars.tableLocales.allRows;
            }
        };
        $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales);
        cbp.addNewMrComapnyPage.addNewMrCompanyResponse = addNewMrCompanyResponse;
        addNewMrCompanyPage.init();
    });
});
