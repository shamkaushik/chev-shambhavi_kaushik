require(["modernizr",
    "jquery",
    "bootstrap",
    "handlebars",
    "parsley",
    "bootstrap-select",
    "bootstrap-table",
    "text!app/components/dropdown/_defaultDdn.hbs",
    "text!app/page/usmr/addNewUserForm.hbs",
    "text!app/page/usmr/bottomDetail.hbs",
    "text!app/page/usmr/permissionsSelection.hbs"

], function (modernizr, $, bootstrap, Handlebars, parsley, bootstrapSelect, bootstrapTable, _defaultDdnHBS, _addNewUserForm, _bottomDetailHBS, _permissionsSelection) {

    var statusUserDdnOptions = [],userCountryDddnOptions = [],siteDropdownOptions = [],pyDropdownOptions = [];

    var selectedPermissions = [],selectedSites = [];

    //Compiling HBS templates
    var compiledDefaultDdn = Handlebars.compile(_defaultDdnHBS);
    var compiledUserForm = Handlebars.compile(_addNewUserForm);
    var compiledBottomDetail = Handlebars.compile(_bottomDetailHBS);
    var compiledPermissionsSelection = Handlebars.compile(_permissionsSelection);

    var usmrPageAddNew = (function () {
        var startDate, endDate;
        var populateDropDowns = function(dropDownList,dropDownListOptions,dropDownName){
            for (var i = 0; i < dropDownList.length; i++) {
                var obj = {};
                obj["key"]  = dropDownName === "statusUserDdn" ? dropDownList[i].uid : dropDownList[i].isocode;
                obj["value"]  = dropDownName === "statusUserDdn" ? dropDownList[i].displayName : dropDownList[i].name;
                obj["isInGracePeriod"] = dropDownList[i].isInGracePeriod;
                dropDownListOptions.push(obj);
            }
            cbp.usmrPageAddNew[dropDownName].options = dropDownListOptions;
            cbp.usmrPageAddNew[dropDownName].searchable = true;
        };

        var triggerParselyFormValidation = function(el) {
            if(el){
                $(el).parsley().on('field:success', function() {
                }).on('field:error', function(field) {
                    field.$element.context.nextElementSibling.classList.add("error-msg");
                }).validate();
            }else{
                $(config.addNewUserForm).parsley().on('form:success', function() {
                }).on('field:error', function(field) {
                }).validate();
            }
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
            permissionsTableContainer: ".permissionsTableContainer",
            userIsDelAdmin : "#userIsDelAdmin",
            userID : "#userID",
            statusUserDdn : "#statusUserDdn",
            fName : "#fName",
            lName : "#lName",
            email : "#email",
            phone : "#phone",
            addressLineFirst : "#addressLineFirst",
            addressLineSecond : "#addressLineSecond",
            userCity : "#userCity",
            stateProvince : "#stateProvince",
            zipPostalCode : "#zipPostalCode",
            userCountryDddn : "#userCountryDddn",
            addNewUserForm : "#addNewUserForm",
            siteSelection : ".siteSelection"
        };

        var init = function () {
            populateDropDowns(statusUserDdn,statusUserDdnOptions,"statusUserDdn");
            populateDropDowns(userCountryDddn,userCountryDddnOptions,"userCountryDddn");
            loadingInitialHbsTemplates();
            bindEvents();
            populatingTable(cbp.usmrPageAddNew.usmrUserData.permissions);
        };

        var loadingInitialHbsTemplates = function () {
            //Appending handlebar templates to HTML
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
        };

        var generateSelectedSites = function(){
            selectedSites = [];
            $(config.siteSelection).find("input[type='checkbox']").each(function(){
                if($(this).prop('checked')==true){
                    selectedSites.push($(this).data('siteid'));
                }
            });
            return selectedSites;
        };

        var triggerAjaxRequest = function () {
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
                "b2bUnits": generateSelectedSites(),
                "permissions": selectedPermissions
            };

            function successCallback(data) {
                $(config.displaySpinner).hide();
                cbp.usmrPageAddNew.usmrUserData = data;
            }

            function errorCallback() {
                $(config.displaySpinner).hide();
                console.log("error");
            }

            $.ajax({
                type: cbp.usmrPageAddNew.globalUrl.method,
                headers: {'CSRFToken':CSRFToken},
                data: JSON.stringify(postData),
                contentType:"application/json",
                dataType:"json",
                url: cbp.usmrPageAddNew.globalUrl.ccsFetchSiteURL,
                success: successCallback,
                error: errorCallback
            });

        };

        var addingParseLeyValidationToTable = function(){
            $(config.permissionsTableContainer+' #table tr input[type="checkbox"]').eq(0).attr({
                "data-parsley-multiple" : "s-s-c",
                "data-parsley-required-message" : cbp.usmrPageAddNew.globalVars.errorMessagesPermissions ,
                "required" : "",
                "data-parsley-errors-container" : "#permission-errorMsg-holder"
            });

            $(config.permissionsTableContainer+' #table tr input[type="checkbox"]').each(function(){
                $(this).attr({
                    "data-parsley-multiple" : "s-s-c",
                    "required" : ""
                });
            });

            $(config.permissionsTableContainer+' #table tr input[type="checkbox"]').each(function(index,value){
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

            $(config.searchDetailContainer+' input[type="checkbox"]').each(function(){
                $(this).attr({
                    "data-parsley-multiple" : "d-s-c",
                    "required" : ""
                });
            });

            $(config.permissionsTableContainer +' #table tr td input[type="checkbox"]').each(function(index,value){
                $(this).attr("name","d-s-c-"+index);
            });
        };

        var bindEvents = function () {
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
                triggerParselyFormValidation(event.target);
            });

            $(document).on('click', config.createNewUserForm, function(event) {
                event.preventDefault();
                triggerParselyFormValidation();
                if ($(config.addNewUserForm).parsley().isValid()) {
                    triggerAjaxRequest();
                }
            });

            $(document).on('click', config.userIsDelAdmin, function(event) {
                $(event.target).prop('checked')==true ?
                ($(config.siteSelection).find("input[type='checkbox']").attr('disabled',true),
                $(config.siteSelection).find("input[type='checkbox']").prop('checked',true),
                $(config.soldToicon).addClass('disabled'),
                populatePermissions())
                :($(config.siteSelection).find("input[type='checkbox']").prop('checked',false),
                $(config.siteSelection).find("input[type='checkbox']").attr('disabled',false),
                $(config.soldToicon).removeClass('disabled'))
            });

            $(document).on('click', config.shiptoListContainer+" input[type='checkbox']", function(event) {
                console.log("soldToSelectorCheckbox >>>",$(event.target).closest('.soldToSelectorCheckbox').hide());
            });
        };

        var populatePermissions = function(){
            $(config.displaySpinner).show();
            $(config.permissionsTableContainer+' #table').bootstrapTable('destroy');
            var postData = {};
            function successCallback(data) {
                $(config.displaySpinner).hide();
                cbp.usmrPageAddNew.usmrUserData.permissions = data.permissions;
                populatingTable(cbp.usmrPageAddNew.usmrUserData.permissions);
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
                url: cbp.usmrPageAddNew.globalUrl.loadPermissions,
                success: successCallback,
                error: errorCallback
            });
        };

        var populatingTable = function (dataList) {
           $(config.permissionsTableContainer+' #table').bootstrapTable({
                classes: 'table table-no-bordered',
                striped: true,
                iconsPrefix: 'fa',
                sortable: true,
                parentContainer: ".js-permission-selection",
                responsive: false,
                responsiveBreakPoint: 768,
                responsiveClass: "bootstrap-table-cardview",
                onCheck: function (row, $element) {
                    // enable button
                    selectedPermissions.push(row.uid);
                },
                onCheckAll: function (rows) {
                    selectedPermissions = [];
                    var len = rows.length;

                    for (var i = 0; i < len; i++) {
                        selectedPermissions.push(rows[i].uid);
                    }
                },
                onUncheck: function (row, $element) {
                    // write logic..as not sure if all unselected
                    var index = selectedPermissions.indexOf(row.uid);

                    if (index > -1) {
                        selectedPermissions.splice(index, 1);
                    }
                },
                onUncheckAll: function (rows) {
                    selectedPermissions = [];
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
            dataList.map(function(val,index){
                if(val.checked==true){
                    $(config.permissionsTableContainer+" #table .bs-checkbox").find('[data-index="'+index+'"]').trigger('click');
                    $(config.permissionsTableContainer+" #table").bootstrapTable("check", index);
                }
            });
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

        cbp.usmrPageAddNew.usmrUserData = usmrUserData;

        if (usmrUserData.permissionsDataList === undefined || usmrUserData.permissionsDataList === null) {
            cbp.usmrPageAddNew.usmrUserData.permissionsDataList = [];
        }

        usmrPageAddNew.init();

    });

});
