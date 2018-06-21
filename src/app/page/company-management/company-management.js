        require(["modernizr",
            "jquery",
            "bootstrap",
            "handlebars",
            "bootstrap-select",
            "bootstrap-table",
            "text!app/components/dropdown/_defaultDdn.hbs",
            "text!app/page/company-management/searchForm.hbs",
            "text!app/page/company-management/marketerRetailerSearchForm.hbs",
            "text!app/page/company-management/mrCompanySummary.hbs",
            "text!app/page/company-management/userSummary.hbs",
            "text!app/page/company-management/bottomDetail.hbs",
            "text!app/page/company-management/marketerRetailerCompanyDetails.hbs"
        ], function (modernizr, $, bootstrap, Handlebars, bootstrapSelect, bootstrapTable, _defaultDdnHBS, _searchFormHBS,_marketerRetailerSearchFormHBS, _mrCompanySummaryHBS, _reportSummaryHBS, _bottomDetailHBS,_retailerRankingsHBS) {
        
            //Compiling HBS templates
            var compiledDefaultDdn = Handlebars.compile(_defaultDdnHBS);
            var compiledsearchForm = Handlebars.compile(_searchFormHBS);
            var compiledMarketerRetailerSearchForm = Handlebars.compile(_marketerRetailerSearchFormHBS);
            var compiledMrCompanySummary = Handlebars.compile(_mrCompanySummaryHBS);
            var compiledreportSummary = Handlebars.compile(_reportSummaryHBS);
            var compiledBottomDetail = Handlebars.compile(_bottomDetailHBS);
            var compiledRetailerRankings = Handlebars.compile(_retailerRankingsHBS);

            var companyManagement = (function () {
                var config = {
                    statusContainer:".js-status-ddn",
                    mrStatusContainer:".js-mrStatus-ddn",
                    parentSoldToDdnContainer: ".js-parentSoldTo-ddn",
                    soldToDdnContainer:".js-soldTo-ddn",
                    permissionsContainer: ".js-permissions-ddn",
                    assignedSitesContainer: ".js-assignedSites-ddn",
                    shipToDdnContainer: ".js-shipTo-ddn",
                    searchFormContainer: ".js-search-form",
                    sortByDdnContainer: ".js-sortbyDdn",
                    sortByDdn: "#sortByDdn",
                    mrSortByDdnContainer:".js-mrSortbyDdn",
                    mrSortByDdn: "#mrSortByDdn",
                    marketerRetailersearchFormContainer: ".js-marketer-retailer-search-form",
                    volSummaryContainer: ".js-volume-summary",
                    mrCompanySummaryContainer:".js-mrCompany-summary",
                    searchDetailContainer: ".js-bottom-detail",
                    retailerRankingsContainer:".js-retailer-rankings",
                    dropDownCommon: ".selectpicker",
                    searchButton: "#pvSearch",
                    mrSearchButton:"#mrSearch",
                    soldToDdn:"#soldToSelectDdn",
                    parentSoldToDdn:"#parentSoldToSelectDdn",
                    statusDdn:"#statusSelectDdn",
                    mrStatusDdn:"#mrStatusSelectDdn",
                    assignedSitesDdn:"#assignedSitesDdn",
                    permissionsDdn:"#permissionsDdn",
                    emailId:"#emailAddress",
                    name:"#name",
                    userId:"#userId",
                    displaySpinner: ".overlay-wrapper",
                };
                
                var srtByDdn = {
                    "options": [{
                            key: "name-asc",
                            value: cbp.cmPage.globalVars.nameAsc
                    }, {
                            key: "name-desc",
                            value: cbp.cmPage.globalVars.nameDesc
                    },
                    {
                            key: "status-asc",
                            value: cbp.cmPage.globalVars.statusAsc
                    }, {
                            key: "status-desc",
                            value: cbp.cmPage.globalVars.statusDesc
                    },
                    {
                            key: "userId-asc",
                            value: cbp.cmPage.globalVars.userIdAsc
                    }, {
                            key: "userId-desc",
                            value: cbp.cmPage.globalVars.userIdDesc
                    },
                    {
                            key:"email-asc",
                            value: cbp.cmPage.globalVars.emailAsc
                    }, {
                            key: "email-desc",
                            value: cbp.cmPage.globalVars.emailDesc
                    },
                    {
                            key:"role-asc",
                            value: cbp.cmPage.globalVars.roleAsc
                    }, {
                            key: "role-desc",
                            value: cbp.cmPage.globalVars.roleDesc
                    },
                    {
                            key:"phone-asc",
                            value: cbp.cmPage.globalVars.phoneAsc
                    }, {
                            key: "phone-desc",
                            value: cbp.cmPage.globalVars.phoneDesc
                    },

            ],
                    label: cbp.cmPage.globalVars.sortBy,
                    labelClass: "xs-mr-5",
                    name: "sortByDdn",
                    display: "displayInline"
                };
                var mrsrtByDdn = {
                    "options": [
                    {
                            key: "status-asc",
                            value: cbp.cmPage.globalVars.statusAsc
                    }, {
                            key: "status-desc",
                            value: cbp.cmPage.globalVars.statusDesc
                    },
                    {
                            key: "companyName-asc",
                            value: cbp.cmPage.globalVars.companyNameAsc
                    }, {
                            key: "companyName-desc",
                            value: cbp.cmPage.globalVars.companyNameDesc
                    },
                    {
                            key: "assignedSites-asc",
                            value: cbp.cmPage.globalVars.assignedSitesAsc
                    }, {
                            key: "assignedSites-desc",
                            value: cbp.cmPage.globalVars.assignedSitesDesc
                    }

            ],
                    label: cbp.cmPage.globalVars.sortBy,
                    labelClass: "xs-mr-5",
                    name: "mrSortByDdn",
                    display: "displayInline"
                };
                var enableMobileDefaultDropDown = function() {
                    //Enable mobile scrolling by calling $('.selectpicker').selectpicker('mobile'). This enables the device's native menu for select menus.
                    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
                        $('.selectpicker').selectpicker('mobile');
                    }
                };
              
                var init = function () {
                    if(cmData.mrCompanySearchViewData.leftSearchPanel.associatedSitesDropDown.length<1){
                    
                        $(".js-assignedSites-ddn").hide();
                    }
                    if(!showMRCompanyTab){
                        $("#mrCompany").hide();
                        $(".companyhide").hide();
                    }
                    populateAssignedSites();
                    populateSoldToDropdown();
                    populateParentSoldToDropdown();
                    populateStatusDropdown();
                    populatemrStatusDropdown();
                    loadingInitialHbsTemplates();
                    bindEvents();
                    enableMobileDefaultDropDown();
                };
                
        
                
                 
                var setSummaryValues = function(){
                    cbp.cmPage.summary = {};
                    cbp.cmPage.summary.soldTo = $('.js-soldTo-ddn button span').text();
                    cbp.cmPage.summary.permissions = $('.js-permissions-ddn button span').text();
                    cbp.cmPage.summary.status = $('.js-status-ddn button span').text();
                };
                var setMrSummaryValues = function(){
                    cbp.cmPage.mrsummary = {};
                    cbp.cmPage.mrsummary.parentSoldTo = $('.js-parentSoldTo-ddn button span').text();
                    cbp.cmPage.mrsummary.assignedSites = $('.js-assignedSites-ddn button span').text();
                    cbp.cmPage.mrsummary.mrstatus = $('.js-mrStatus-ddn button span').text();
                };

                var permissions = [];
                    for(var i=0; i < cmData.userSearchViewData.leftSearchPanel.permissionsDropDown.length;i++){
                        var permissionsObj = {};
                        permissionsObj["key"] = cmData.userSearchViewData.leftSearchPanel.permissionsDropDown[i].uid;
                        permissionsObj["value"] = cmData.userSearchViewData.leftSearchPanel.permissionsDropDown[i].name;
                        permissions.push(permissionsObj);
                    }
                cbp.cmPage.permissionsDropdown["options"] = permissions;
                $(config.permissionsContainer).html(compiledDefaultDdn(cbp.cmPage.permissionsDropdown));


                var populateAssignedSites=function(){
                var assignedSites = [];
                
                
                
                for(var i=0; i < cmData.mrCompanySearchViewData.leftSearchPanel.associatedSitesDropDown.length;i++){
                    var assignedSitesObj = {};
                    assignedSitesObj["key"] = cmData.mrCompanySearchViewData.leftSearchPanel.associatedSitesDropDown[i].uid;
                    assignedSitesObj["value"] = cmData.mrCompanySearchViewData.leftSearchPanel.associatedSitesDropDown[i].displayName;
                    assignedSites.push(assignedSitesObj);
                }
            cbp.cmPage.assignedSitesDropdown["options"] = assignedSites;
            $(config.assignedSitesContainer).html(compiledDefaultDdn(cbp.cmPage.assignedSitesDropdown));
            };
            
                var populateSoldToDropdown = function(){
                    var options = [];
                    options = cmData.userSearchViewData.leftSearchPanel.soldToDropDown.map(function(val, index){
                        return {
                            key: val.uid,
                            value: val.displayName
                        }
                    });
                    if(options.length>1)
                    {
                        options.unshift({key:"all",value:cbp.cmPage.globalVars.allTb});
                    }
                    cbp.cmPage.soldToDropDown["options"] = options;
                }
                var populateParentSoldToDropdown = function(){
                    var options = [];
                    options =  cmData.mrCompanySearchViewData.leftSearchPanel.soldToDropDown.map(function(val, index){
                        return {
                            key: val.uid,
                            value: val.displayName
                        }
                    });
                    if(options.length>1)
                    {
                        options.unshift({key:"all",value:cbp.cmPage.globalVars.allTb});
                    }
                    cbp.cmPage.parentSoldToDropDown["options"] = options;
                }
                var populateStatusDropdown = function(){
                    var options = [];
                    options = cmData.userSearchViewData.leftSearchPanel.statusDropDown.map(function(val, index){
                        return {
                            value: val.displayName
                        }
                    });
                    if(options.length>1)
                    {
                        options.unshift({key:"all",value:cbp.cmPage.globalVars.allTb});
                    }
                    cbp.cmPage.statusDropDown["options"] = options;
                }
                var populatemrStatusDropdown = function(){
                    var options = [];
                    options = cmData.mrCompanySearchViewData.leftSearchPanel.statusDropDown.map(function(val, index){
                        return {
                            value: val.displayName
                        }
                    });
                    if(options.length>1)
                    {
                        options.unshift({"value":cbp.cmPage.globalVars.allTb});
                    }
                    cbp.cmPage.mrstatusDropDown["options"] = options;
                }

                
                var loadingInitialHbsTemplates = function () {
                    //Appending handlebar templates to HTML
                    
                    $(config.searchFormContainer).html(compiledsearchForm(cbp.cmPage));
                    $(config.marketerRetailersearchFormContainer).html(compiledMarketerRetailerSearchForm(cbp.cmPage));
                    $(config.permissionsContainer).html(compiledDefaultDdn(cbp.cmPage.permissionsDropdown));
                    $(config.soldToDdnContainer).html(compiledDefaultDdn(cbp.cmPage.soldToDropDown));
                    $(config.parentSoldToDdnContainer).html(compiledDefaultDdn(cbp.cmPage.parentSoldToDropDown));
                    $(config.assignedSitesContainer).html(compiledDefaultDdn(cbp.cmPage.assignedSitesDropdown));
                    $(config.statusContainer).html(compiledDefaultDdn(cbp.cmPage.statusDropDown));
                    $(config.mrStatusContainer).html(compiledDefaultDdn(cbp.cmPage.mrstatusDropDown));
                    setSummaryValues();
                    setMrSummaryValues();
                
                    //Refresh dropdown at initial dispaly after loading templates
                    $(config.dropDownCommon).selectpicker('refresh');
                    enableMobileDefaultDropDown();
                    loadingDynamicHbsTemplates();
                    $(config.displaySpinner).hide();
                };
        
                var loadingDynamicHbsTemplates = function () {
                    setSummaryValues();
                    setMrSummaryValues();
                    populatingTable(cmData.userSearchViewData.searchResults.usersList);
                    $(config.volSummaryContainer).html(compiledreportSummary(cbp.cmPage));
                    $(config.mrCompanySummaryContainer).html(compiledMrCompanySummary(cbp.cmPage));
                    $(config.searchDetailContainer).html(compiledBottomDetail(cbp.cmPage));
                    $(config.retailerRankingsContainer).html(compiledRetailerRankings(cbp.cmPage));
                    $(config.sortByDdnContainer).html(compiledDefaultDdn(srtByDdn));
                    $(config.sortByDdnContainer).find(config.dropDownCommon).selectpicker('refresh');
                    $(config.mrSortByDdnContainer).html(compiledDefaultDdn(mrsrtByDdn));
                    $(config.mrSortByDdnContainer).find(config.dropDownCommon).selectpicker('refresh');
                    enableMobileDefaultDropDown();
                };

                var bindEvents = function () {
                    populatingTable(cmData.userSearchViewData.searchResults.usersList);
                    populatingmrCompanyTable(cmData.mrCompanySearchViewData.searchResults.companyList);
                    $(".companyhide").on("click",function(e){
                        if(cmData.mrCompanySearchViewData.leftSearchPanel.associatedSitesDropDown.length<1){
                    
                            $(".js-assignedSites-ddn").hide();
                        }
                    });
                    $(config.mrSearchButton).on("click", function (e) {
                        if (!$(this).attr('disabled')) {
                            
                            mrtriggerAjaxRequest();
                            
                        }
                    });
                    $(config.searchButton).on("click", function (e) {
                        if (!$(this).attr('disabled')) {
                            triggerAjaxRequest();
                            
                        }
                    });
                    $(config.mrSearchButton).on("click", function (e) {
                        if (!$(this).attr('disabled')) {

                            mrtriggerAjaxRequest();
                            
                        }
                    });
                     //Sold to dropdown change to populate assigned sites
                $(config.parentSoldToDdn).on('change', function (e) {
                    populatingAssignedSites();
                });

                    // var valueOnSubmit = '.js-search-form input' + ","  + config.programYearDdnContainer + "";
                    
                    $(document).on('keypress', function (e) {
                        if (e.which == 13) {
                            e.preventDefault();
                            $(config.searchButton).trigger("click");
                            $(config.mrSearchButton).trigger("click");

                        }
                    });
                };
        
                var triggerAjaxRequest = function () {
                    console.log("InsideAjax");
                    loadingDynamicHbsTemplates();
                    $(config.displaySpinner).show();
                    $(config.volSummaryContainer).hide();
                    $(config.searchDetailContainer).hide();
                    $(config.retailerRankingsContainer).hide();
                    leftPaneExpandCollapse.hideSearchBar();

                    // var allAssignedSites = [];

                    // $(config.assignedSitesDdn).find("option").each(function () {
                    //     allAssignedSites.push($(this).val());
                    // });

                     var allPermissions = [];

                    $(config.permissionsDdn).find("option").each(function () {
                        allPermissions.push($(this).val());
                    });

                    var postData = {};
                    postData.soldTo = $(config.soldToDdn).val() === null ? "null" : $(config.soldToDdn).val().toString();
                    // postData.parentSoldTo = $(config.parentSoldToDdn).val() === null ? "null" : $(config.parentSoldToDdn).val().toString();
                    postData.status = $(config.statusDdn).val() === null ? "null" : $(config.statusDdn).val().toString();
                    // postData.mrStatus = $(config.mrStatusDdn).val() === null ? "null" : $(config.mrStatusDdn).val().toString();
                    // postData.assignedSites = $(config.assignedSitesDdn).val() ? $(config.assignedSitesDdn).val() : allAssignedSites;
                    postData.permissions= $(config.permissionsDdn).val() ? $(config.permissionsDdn).val() : allPermissions;
                    postData.emailId=$(config.emailId).val();
                    postData.userId=$(config.userId).val();
                    postData.name=$(config.name).val();

                    
                    function successCallback(data) {
                        $(config.displaySpinner).hide();
                        $(config.volSummaryContainer).show();
                        // $(config.mrCompanySummaryContainer).show();
                        $(config.searchDetailContainer).show();
                        $(config.retailerRankingsContainer).show();
                        cbp.cmPage.cmData = data;
                        setSummaryValues();
                       
                        loadingDynamicHbsTemplates();
                        populatingTable(data.userSearchViewData.searchResults.usersList);
                        populatingmrCompanyTable(data.mrCompanySearchViewData.searchResults.companyList);
                        leftPaneExpandCollapse.resetSearchFormHeight();
                        enableMobileDefaultDropDown();
                    }
        
                    function errorCallback() {
                        $(config.displaySpinner).hide();
                        $(config.volSummaryContainer).show();
                        // $(config.mrCompanySummaryContainer).show();
                        $(config.searchDetailContainer).show();
                        $(config.retailerRankingsContainer).show();
                        console.log("error");
                    }
        
                    $.ajax({
                        type: cbp.cmPage.globalUrl.method,
                       // 'CSRFToken':CSRFToken,
                        data: postData,
                        url: cbp.cmPage.globalUrl.searchResultsURL,
                        success: successCallback,
                        error: errorCallback
                    });
        
                };
                var mrtriggerAjaxRequest = function () {
                    console.log("InsideAjax");
                    loadingDynamicHbsTemplates();
                    $(config.displaySpinner).show();
                    // $(config.volSummaryContainer).hide();
                    $(config.mrCompanySummaryContainer).hide();
                    $(config.searchDetailContainer).hide();
                    $(config.retailerRankingsContainer).hide();
                    leftPaneExpandCollapse.hideSearchBar();
                    function successCallback(data) {
                        $(config.displaySpinner).hide();
                        // $(config.volSummaryContainer).show();
                        $(config.mrCompanySummaryContainer).show();
                        $(config.searchDetailContainer).show();
                        $(config.retailerRankingsContainer).show();
                        cbp.cmPage.cmData = data;
                      
                        setMrSummaryValues();
                        loadingDynamicHbsTemplates();
                        populatingTable(data.userSearchViewData.searchResults.usersList);
                        populatingmrCompanyTable(data.mrCompanySearchViewData.searchResults.companyList);
                        leftPaneExpandCollapse.resetSearchFormHeight();
                        enableMobileDefaultDropDown();
                    }
        
                    function errorCallback() {
                        $(config.displaySpinner).hide();
                        // $(config.volSummaryContainer).show();
                        $(config.mrCompanySummaryContainer).show();
                        $(config.searchDetailContainer).show();
                        $(config.retailerRankingsContainer).show();
                        console.log("error");
                    }
        
                    $.ajax({
                        type: cbp.cmPage.globalUrl.method,
                       // 'CSRFToken':CSRFToken,
                        // data: postData,
                        url: cbp.cmPage.globalUrl.searchResultsURL,
                        success: successCallback,
                        error: errorCallback
                    });
        
                };
               

                var populatingAssignedSites = function () {
                    var soldToId = $(config.parentSoldToDdn).val();
                    $(config.displaySpinner).show();

                    function successCallback(data) {
                    console.log("cbp.srPage.shipToDropDown['options'] >>>>",cbp.srPage.shipToDropDown["options"]);
                    $(config.displaySpinner).hide();
                    
                    var assignedSitesOptions = [];
                    var obj = {};
                    var data = data.dataList;
                    if (data.length==0){
                        cbp.cmPage.assignedSitesDropdown.assignedSitesAvailable = false;
                    }
                    if (data.length == 1) {
                        cbp.cmPage.assignedSitesDropdown.singleOption = true;
                        // $(config.searchButton).removeAttr("disabled");
                    }
                    else if (data.length > 1) {
                        obj["key"] = "all";
                        obj["value"] = cbp.cmPage.globalVars.allLocation;
                        assignedSitesOptions.push(obj);
                    }
                    for (var i = 0; i < data.length; i++) {
                        obj = {};
                        obj["key"] = data[i].uid;
                        obj["value"] = data[i].displayName;
                        assignedSitesOptions.push(obj);
                    }
                    cbp.cmPage.assignedSitesDropdown["options"] = assignedSitesOptions;
                    cbp.cmPage.assignedSitesDropdown.searchable = true;
                    $(config.assignedSitesContainer).html(compiledDefaultDdn(cbp.cmPage.assignedSitesDropdown));
                    $(config.assignedSitesDdn).selectpicker('refresh');
                    if (cbp.cmPage.assignedSitesDropdown["options"].length > 1) {
                        $(config.assignedSitesDdn).val('all').selectpicker('refresh');
                    }
                    
                        setMrSummaryValues();
                        $(config.mrCompanySummaryContainer).html(compiledMrCompanySummary(cbp.cmPage));
                   
                    enableMobileDefaultDropDown();
                    // errorCallback();
                }
    
                function errorCallback() {
                    $(config.displaySpinner).hide();
                    console.log("error");
                    var assignedSitesOptions=[{"key":"","value":"All"}];
                    cbp.cmPage.assignedSitesDropdown["options"] = assignedSitesOptions;
                    cbp.cmPage.assignedSitesDropdown.searchable = true;
                    $(config.mrCompanySummaryContainer).html(compiledMrCompanySummary(cbp.cmPage));
                    $(config.assignedSitesDdn).selectpicker('refresh');
                }
     
                $.ajax({
                    type: cbp.cmPage.globalUrl.method,
                    data: {
                        // soldToNumber: soldToId,
                        // CSRFToken:CSRFToken,
                    },
                    url: cbp.cmPage.globalUrl.searchResultsURL,
                    success: successCallback,
                    error: errorCallback
                });
    
            };
        
                var populatingTable = function (usersList) {
                    if (usersList === null || usersList === undefined) {
                        usersList = [];
                    }
                    $(config.sortByDdn).val("status-asc").selectpicker('refresh');
                    $('#table').bootstrapTable({
                        sortName: 'status',
                        sortOrder: 'asc',
                        sortable: true,
                        sortByDropdownId: "#sortByDdn",
                        classes: 'table table-no-bordered',
                        striped: true,
                        iconsPrefix: 'fa',
                        parentContainer: ".js-bottom-detail",
                        undefinedText: "",
                        responsive: true,
                        responsiveBreakPoint: 480,
                        responsiveClass: "bootstrap-table-cardview",
                        columns: [{
                            field: 'delegatedUser',
                            class: 'fas fa-crown',
                            cellStyle: 'xs-pl-10',
                            formatter: function LinkFormatter(value, row, index) {
                                var downloadReport, printReport;
        
                                var downloaded = "",
                                    printed = "";
                                if (row.downloaded) {
                                    downloaded = "success-icon";
                                }
                                if (row.printed) {
                                    printed = "success-icon";
                                }
                                downloadReport = "<span class='fa fa-crown xs-pr-10 " + downloaded + "' data-invoiceId='" + row.invoiceId + "'>" + "</span>";
                                printReport = "<span class='fa fa-print iconsInvoicePrint " + printed + "' data-invoiceId='" + row.invoiceId + "'>" + "</span>";
                                return downloadReport + printReport;
                            }
                        }, {
                            field: 'name',
                            title: cbp.cmPage.globalVars.name,
                            titleTooltip: cbp.cmPage.globalVars.name,
                            sortable:true
                        }, {
                            field: 'userId',
                            title: cbp.cmPage.globalVars.userId,
                            titleTooltip: cbp.cmPage.globalVars.userId,
                            class: 'numberIcon',
                            formatter: function LinkFormatter(value, row, index) {
                                return "<a href='#'" + row.userId + "'>" + value + "</a>";
                            },
                            sortable:true
                            
                         },
                         {
                            field: 'email',
                            title: cbp.cmPage.globalVars.emailAddress,
                            titleTooltip: cbp.cmPage.globalVars.emailAddress,
                            class: 'numberIcon',
                            sortable:true
                         },
                         {
                            field: 'phone',
                            title: cbp.cmPage.globalVars.phoneNumber,
                            titleTooltip: cbp.cmPage.globalVars.phoneNumber,
                         },
                         {
                            field:'role',
                            title: cbp.cmPage.globalVars.role,
                            titleTooltip: cbp.cmPage.globalVars.role,
                            sortable:true
                            
                         },
                         {
                            field:'status',
                            title: cbp.cmPage.globalVars.status,
                            titleTooltip: cbp.cmPage.globalVars.status,
                            sortable:true
                         },
                    ],
                        data: cmData.userSearchViewData.searchResults.usersList
                    });
                    };

                    // var search = function(){
                    //     var postData = {};
                        
                    //     if($(config.soldToDdn).val()){
                    //         postData.soldTo = $(config.soldToDdn).val();
                    //     }
                       
                    //     postData = JSON.stringify(postData); 
                    //     $.when(triggerAjaxRequest(postData, cbp.cmPage.globalUrl.method, cbp.cmPage.globalUrl.searchResultsURL, "application/json")).then(function(response){
                    //         $(config.displaySpinner).hide();
                    //         cbp.cmPage.ccrSearchReponse = response;
                    //         $(config.searchDetailContainer).html(compiledBottomDetail(cbp.cmPage));
                    //         $(config.reportSummaryContainer).html(compiledReportSummary(cbp.cmPage));
                    //         populatingTable(cbp.cmPage.ccrSearchReponse.usersList);
                           
                           
                    //     });
                    // }

                    
                var populatingmrCompanyTable = function (companyList) {
                    if (companyList === null || companyList === undefined) {
                        companyList = [];
                    }
                    $(config.mrSortByDdn).val("status-asc").selectpicker('refresh');
                    $('#retailertable').bootstrapTable({
                        sortName: 'status',
                        sortOrder: 'asc',
                        sortable: true,
                        sortByDropdownId: "#sortByDdn",
                        classes: 'table table-no-bordered',
                        striped: true,
                        iconsPrefix: 'fa',
                        parentContainer: ".js-retailer-rankings",
                        undefinedText: "",
                        responsive: true,
                        responsiveBreakPoint: 480,
                        responsiveClass: "bootstrap-table-cardview",
                        columns: [{
                            field: 'companyName',
                            title: cbp.cmPage.globalVars.companyName ,
                            titleTooltip: cbp.cmPage.globalVars.companyName,
                            class: 'text-wrap',
                            formatter: function LinkFormatter(value, row, index) {
                                return "<a href='#'" + row.companyName + "'>" + value + "</a>";
                            },
                            sortable:true
                        }, {
                            field: 'assignedSites',
                            title: cbp.cmPage.globalVars.assignedSites,
                            titleTooltip: cbp.cmPage.globalVars.assignedSites,
                            sortable:true
                        }, {
                            field: 'status',
                            title: cbp.cmPage.globalVars.status,
                            titleTooltip: cbp.cmPage.globalVars.status,
                            sortable:true
                         },
                    ],
                        data: cmData.mrCompanySearchViewData.searchResults.companyList
                    });
                };
        
                return {
                    init: init
                };
            })();
        
            $(document).ready(function () {
                //Localization setup for dropdown & table
                $.fn.selectpicker.defaults = {
                    noneSelectedText: cbp.cmPage.globalVars.selectDdn.noneSelectedText,
                    noneResultsText: cbp.cmPage.globalVars.selectDdn.noneResultsText,
                    countSelectedText: function (numSelected, numTotal) {
                        return (numSelected == 1) ? cbp.cmPage.globalVars.selectDdn.itemSelected : cbp.cmPage.globalVars.selectDdn.itemSelected1;
                    },
                    maxOptionsText: function (numAll, numGroup) {
                        return [
                            (numAll == 1) ? cbp.cmPage.globalVars.selectDdn.limitReached : cbp.cmPage.globalVars.selectDdn.limitReached1,
                            (numGroup == 1) ? cbp.cmPage.globalVars.selectDdn.groupLimit : cbp.cmPage.globalVars.selectDdn.groupLimit1
                        ];
                    },
                    selectAllText: cbp.cmPage.globalVars.selectDdn.selectAllText,
                    deselectAllText: cbp.cmPage.globalVars.selectDdn.deselectAllText
                };
        
                $.fn.bootstrapTable.locales = {
                    formatLoadingMessage: function () {
                        return cbp.cmPage.globalVars.tableLocales.loadingMessage;
                    },
                    formatRecordsPerPage: function (pageNumber) {
                        return cbp.cmPage.globalVars.tableLocales.recordsPerPage.replace('{0}', pageNumber);
                    },
                    formatShowingRows: function (pageFrom, pageTo, totalRows) {
                        return cbp.cmPage.globalVars.tableLocales.showingRows.replace('{0}', pageFrom).replace('{1}', pageTo).replace('{2}', totalRows);
                    },
                    formatSearch: function () {
                        return cbp.cmPage.globalVars.tableLocales.search;
                    },
                    formatNoMatches: function () {
                        return cbp.cmPage.globalVars.tableLocales.noMatches;
                    },
                    formatPaginationSwitch: function () {
                        return cbp.cmPage.globalVars.tableLocales.paginationSwitch;
                    },
                    formatRefresh: function () {
                        return cbp.cmPage.globalVars.tableLocales.refresh;
                    },
                    formatToggle: function () {
                        return cbp.cmPage.globalVars.tableLocales.toggle;
                    },
                    formatColumns: function () {
                        return cbp.cmPage.globalVars.tableLocales.columns;
                    },
                    formatAllRows: function () {
                        return cbp.cmPage.globalVars.tableLocales.allRows;
                    }
                };
        
                $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales);
        
                leftPaneExpandCollapse.init();
        
                //Global Object manipulations
                cbp.cmPage.cmData = cmData;
                // if ( cbp.cmPage.cmData === undefined) {
                //     cmData.userSearchViewData.searchResults.usersList= [];
                // }
                // if (ccrSearchReponse.retailerRankingsDataList === undefined) {
                //     cbp.cmPage.ccrSearchReponse.retailerRankingsDataList = [];
                // }
                companyManagement.init();
            });
        });
        