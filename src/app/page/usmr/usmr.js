require(["modernizr",
    "jquery",
    "bootstrap",
    "handlebars",
    "moment",
    "calendar",
    "parsley",
    "bootstrap-select",
    "bootstrap-table",
    "toggleSwitch",
    "text!app/components/calendar/_calendar.hbs",
    "text!app/components/dropdown/_defaultDdn.hbs",
    "text!app/page/usmr/searchForm.hbs",
    "text!app/page/usmr/addNewUserForm.hbs",
    "text!app/page/usmr/bottomDetail.hbs",
    "text!app/page/usmr/permissionsSelection.hbs"

], function (modernizr, $, bootstrap, Handlebars, moment, toggleSwitch, calendar, parsley, bootstrapSelect, bootstrapTable, _calendarHBS, _defaultDdnHBS, _searchFormHBS, _addNewUserForm, _bottomDetailHBS, _permissionsSelection) {

    var statusUserDdnOptions = [],userCountryDddnOptions = [],siteDropdownOptions = [],pyDropdownOptions = [], eftObj = {},startDateDT = '',endDateDT = '';

    var selectedPermissions = [],selectedSite = [];

    //Compiling HBS templates
    var compiledDefaultDdn = Handlebars.compile(_defaultDdnHBS);
    var compiledsearchDate = Handlebars.compile(_calendarHBS);
    var compiledsearchForm = Handlebars.compile(_searchFormHBS);
    var compiledUserForm = Handlebars.compile(_addNewUserForm);
    var compiledBottomDetail = Handlebars.compile(_bottomDetailHBS);
    var compiledPermissionsSelection = Handlebars.compile(_permissionsSelection);

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

        var triggerParselyFormValidation = function(el) {
            $(el).parsley().on('field:success', function() {
                triggerAjaxRequest();
            }).on('field:error', function(field) {
                field.$element.context.nextElementSibling.classList.add("error-msg");
            }).validate();
        };

        var config = {
            addNewUserFormContainer: ".js-usmr-userForm",
            statusUserDdnContainer : ".js-userStatus-ddn",
            countryUserDdnContainer: ".js-userCountry-ddn",
            soldToicon : ".soldToicon",
            searchDetailContainer: ".js-bottom-detail",
            shiptoListContainer : ".shiptoListContainer",
            dropDownCommon: ".selectpicker",
            searchButton: "#ccsSearchBtn",
            tabelRow: "#table tbody tr",
            displaySpinner: ".overlay-wrapper",
            dropdownSelect: ".dropdown-menu .toggle-select",
            squareUnchecked: "fa-square-o",
            squareChecked: "fa-check-square-o",
            permissionSelection: ".js-permission-selection",
            formInput: "#addNewUserForm .input-element",
            createNewUserForm: "#createNewUserForm",
            permissionsTableContainer: ".permissionsTableContainer"
        };

        var init = function () {
            populateDropDowns(statusUserDdn,statusUserDdnOptions,"statusUserDdn");
            populateDropDowns(userCountryDddn,userCountryDddnOptions,"userCountryDddn");
            // populateDropDowns(pyDropdown,pyDropdownOptions,"pyDropdown");
            loadingInitialHbsTemplates();
            bindEvents();
            populatingTable(cbp.usmrPageAddNew.usmrUserData.permissionsDataList);
            //triggerAjaxRequest();
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
            $(config.permissionSelection).html(compiledPermissionsSelection(cbp.usmrPageAddNew));
            $(config.statusUserDdnContainer).html(compiledDefaultDdn(cbp.usmrPageAddNew.statusUserDdn));
            $(config.countryUserDdnContainer).html(compiledDefaultDdn(cbp.usmrPageAddNew.userCountryDddn));
            $(config.dropDownCommon).selectpicker('refresh');
            enableMobileDefaultDropDown();
            addingParseLeyValidationToSite();
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

        var triggerAjaxRequest = function () {
            var selectorCalendar = $(config.ordercalendar).find('span'), hiddenInputForToggleSwitch = $("#eftSearchToggle input[type='hidden']");
            $(config.displaySpinner).show();

            leftPaneExpandCollapse.hideSearchBar();

            var postData = {
                "userInfo": {
                    "delegatedAdmin": $(config.userIsDelAdmin).prop('checked')==true ? true : false,
                    "uid": $(config.userID).val(),
                    "active": $(config.statusUserDdn).val(),
                    "firstName": $(config.fName).val(),
                    "lastName": $(config.lName).val(),
                    "email": $(config.email).val(),
                    "contactNumber": $(config.phone).val(),
                    "defaultAddress": {
                        "line1": $(config.addressLineFirst).val(),
                        "line2": $(config.addressLineSecond).val(),
                        "town": $(config.userCity).val(),
                        "freetextregion": $(config.stateProvince).val(),
                        "postalCode": $(config.zipPostalCode).val(),
                        "country": {
                            "isoCode": $(config.userCountryDddn).val()
                        }
                    }
                },
                "b2bUnits": ["1234SH","567721SH","878878SH"],
                "permissions": ["invoice","soa","account_balance"]
            };

            function successCallback(data) {
                $(config.displaySpinner).hide();
                $(config.searchDetailContainer).show();
                $(config.ccsSummaryContainer).show();
                cbp.usmrPageAddNew.usmrUserData = data;
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

        var addingParseLeyValidationToTable = function(){
            $(config.permissionsTableContainer+' #table tr td input[type="checkbox"]').eq(0).attr({
                "data-parsley-multiple" : "s-s-c", 
                "data-parsley-required-message" : cbp.usmrPageAddNew.globalVars.errorMessagesPermissions ,
                "required" : "", 
                "data-parsley-errors-container" : "#permission-errorMsg-holder"
            });

            $('#table tr td checkbox').each(function(index,value){
                $(this).attr("name","s-s-c-"+index);
            });
        };

        var addingParseLeyValidationToSite = function(){
            $(config.searchDetailContainer+' input[type="checkbox"]').eq(0).attr({
                "data-parsley-multiple" : "d-s-c", 
                "data-parsley-required-message" : cbp.usmrPageAddNew.globalVars.errorMessagesSoldToShipTo ,
                "required" : "", 
                "data-parsley-errors-container" : "#message-holder"
            });

            $('#table tr td checkbox').each(function(index,value){
                $(this).attr("name","d-s-c-"+index);
            });
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

            $(document).on('click',config.soldToicon,function(e){
                if($(this).hasClass('down')==true){
                    $(config.soldToicon+".down").addClass('active');
                    $(config.soldToicon+".up").removeClass('active');
                    $(this).removeClass('active').next().addClass('active');
                    $(config.shiptoListContainer).addClass('hide');
                    $('.shiptoContainer-'+$(this).data('index')).removeClass('hide');
                }else{
                    $(config.soldToicon+".down").addClass('active');
                    $(config.soldToicon+".up").removeClass('active');
                    $(this).removeClass('active').prev().addClass('active');
                    $(config.shiptoListContainer).addClass('hide');
                    $('.shiptoContainer-'+$(this).data('index')).addClass('hide');
                }
            });

            $(document).on('focusout', config.formInput, function(event) {
                //triggerParselyFormValidation(event.target);
            });

            $(document).on('focusout', config.createNewUserForm, function(event) {
                event.preventDefault();
                triggerParselyFormValidation();
            });
        };

        var populatingTable = function (dataList) {
           $('#table').bootstrapTable({
                classes: 'table table-no-bordered',
                striped: true,
                iconsPrefix: 'fa',
                sortable: true,
                parentContainer: ".js-permission-selection",
                sortByDropdownId: "#sortByDdn",
                responsive: false,
                responsiveBreakPoint: 768,
                responsiveClass: "bootstrap-table-cardview",
                onCheck: function (row, $element) {
                    // enable button
                    selectedPermissions.push(row.uid);
                    enablePrintDownloadButtons();
                },
                onCheckAll: function (rows) {
                    // enable button
                    selectedPermissions = [];
                    var len = rows.length;

                    for (var i = 0; i < len; i++) {
                        selectedPermissions.push(rows[i].uid);
                    }

                    if (rows.length) {
                        enablePrintDownloadButtons();
                    }
                },
                onUncheck: function (row, $element) {
                    // write logic..as not sure if all unselected
                    var index = selectedPermissions.indexOf(row.uid);

                    if (index > -1) {
                        selectedPermissions.splice(index, 1);
                    }

                    if (!($(config.tabelRow).hasClass('selected'))) {
                        disablePrintDownloadButtons();
                    }

                },
                onUncheckAll: function (rows) {
                    //disable button
                    selectedPermissions = [];
                    disablePrintDownloadButtons();

                },
                columns: [{
                    field: 'checkbox',
                    checkbox: true,
                    class: 'fa',
                }, {
                    field: 'name',
                    title: cbp.usmrPageAddNew.globalVars.permissonCaption,
                    titleTooltip: cbp.usmrPageAddNew.globalVars.permissonCaption,
                    class: 'text-nowrap col-md-4',
                },{
                    field: 'description',
                    title: cbp.usmrPageAddNew.globalVars.descCaption,
                    titleTooltip: cbp.usmrPageAddNew.globalVars.descCaption,
                    class: 'numberIcon col-md-18'
                }],
                data: dataList
            });

            addingParseLeyValidationToTable();
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

        if (usmrUserData.permissionsDataList === undefined || usmrUserData.permissionsDataList === null) {
            cbp.usmrPageAddNew.usmrUserData.permissionsDataList = [];
        }

        usmrPageAddNew.init();

    });

});
