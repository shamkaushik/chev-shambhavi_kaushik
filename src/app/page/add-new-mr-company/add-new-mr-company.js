require(["modernizr",
    "jquery",
    "bootstrap",
    "handlebars",
    "parsley",
    "bootstrap-select",
    "bootstrap-table",
    "bootstrap-dialog",
    "text!app/components/dropdown/_defaultDdn.hbs",
    "text!app/page/add-new-mr-company/add-new-mr-company-summary.hbs",
    "text!app/page/add-new-mr-company/bottomDetail.hbs"

], function (modernizr, $, bootstrap, Handlebars, parsley, bootstrapSelect, bootstrapTable, bootstrapDialog, _defaultDdnHBS, _addNewMrCompanySummaryHBS, _bottomDetailHBS) {

    var parentSoldToDdnOptions = [], selectedSites = [];
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
          parentSoldToDdn: '#parentSoldToDdn',
          associatedSitesTable: ".tableContainer",
          addNewMarketerRetailerBtn: ".js-btn-create-marketer",
          resetButton: '.js-reset-user-btn',
          dropDownCommon: ".selectpicker"
        };

        var init = function () {
          populateDropDowns(addNewMrCompanyResponse.soldToDropDown,parentSoldToDdnOptions,"parentSoldToDropdown");
          setStatusLabel(addNewMrCompanyResponse.status);
          loadingInitialHbsTemplates();
          bindEvents();
          populatingTable(addNewMrCompanyResponse.availableSites);
        };

        var loadingInitialHbsTemplates = function () {
          loadingDynamicHbsTemplates();
          $(config.displaySpinner).hide();
          $(config.parentSoldToDropdownContainer).html(compiledDefaultDdn(cbp.addNewMrComapnyPage.parentSoldToDropdown));
        };

        var setStatusLabel = function (value) {
          cbp.addNewMrComapnyPage.status = value;
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
            obj["key"]  = dropDownName === "parentSoldToDropdown" ? dropDownList[i].uid : dropDownList[i].value;
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
          var k = requestedOptions[i];
          optionDropdown.push(sortListMap[k]);
        }
          return optionDropdown;
        };

        var triggerAjaxRequest = function(data,type,url,contType){
          function successCallback(res){
            return res;
          }
          function errorCallback(err){
            return err;
          }
          return $.ajax({
            type: type,
            data: data,
            url: url,
            contentType: contType,
            headers: {'CSRFToken':cbp.addNewMrComapnyPage.globalVars.csrfToken},
            success: successCallback,
            error: errorCallback
          });
        };

        var bindEvents = function () {
          $(document).on('click',config.backtoCompanyMgt,function() {
            window.location.href=cbp.addNewMrComapnyPage.globalUrl.returnToCompanyMgtUrl;
          });

          $(document).on('change',config.parentSoldToDdn ,function(e) {
            getAssociatedSites();
          });

          $(document).on('click',config.addNewMarketerRetailerBtn ,function(e) {
            var atleastOneSiteSelected = isAtleastOneSiteSelected();
            validateForm();
            if ($('#form').parsley().isValid() && atleastOneSiteSelected) {
              console.log("in form submit");
              var postData = setPayload();
              $('#addNewMrCompanyForm #addNewMrCompanyFormData').val(postData);
              $('#addNewMrCompanyForm').submit();
            }
          });

          $(document).on('click',config.resetButton ,function(e) {
            resetPage();
          });

          $(document).on('focusout', $('.mr-company-input') ,function(e) {
            validateForm(e.target);
          });

        };

        var isAtleastOneSiteSelected = function () {
          if(selectedSites.length<=0){
            showErrorMessage(cbp.addNewMrComapnyPage.globalVars.siteSelectErrorMsg, $('.siteSelectedErrorMsg'), true);
            return false;
          }
          return true;
        }

        var showErrorMessage = function(errorMsg, element, displayError) {
            element.text(errorMsg);
            displayError ? element.removeClass('hide') : element.addClass('hide');
        };

        var validateForm = function(element) {
          if(element)
            $(element).parsley().validate();
          else
            $('#form').parsley().validate();
        };

        var getAssociatedSites = function () {
          var postData = {};
          postData.parentSoldTo  =  $(config.parentSoldToDdn).val() === null ? "null" : $(config.parentSoldToDdn).val().toString();
          $.when(triggerAjaxRequest(postData,cbp.addNewMrComapnyPage.globalUrl.method,
            cbp.addNewMrComapnyPage.globalUrl.associatedSiteUrl)).then(function(result) {
            $(config.displaySpinner).hide();
            $(config.associatedSitesTable+' #table').bootstrapTable('destroy');
            populatingTable(result);
          });
        };

        var setPayload = function () {
          var payLoad = {};
          var companyInfoObj = {};
          companyInfoObj.parentSoldTo  =  $(config.parentSoldToDdn).val() === null ? "null" : $(config.parentSoldToDdn).val().toString();
          companyInfoObj.status = cbp.addNewMrComapnyPage.status === 'Active' ? true : false
          companyInfoObj.firstName = $('.company-name1').val();
          companyInfoObj.lastName =  $('.company-name2').val();
          payLoad.companyInfo = companyInfoObj;
          payLoad.b2bUnits = selectedSites;
          payLoad = JSON.stringify(payLoad);
          return payLoad;
        };

        var resetPage = function () {
          openResetPageConfirmationPopup();
        };

        var openResetPageConfirmationPopup = function() {
          bootstrapDialog.closeAll()
          bootstrapDialog.show({
            title: cbp.addNewMrComapnyPage.globalVars.resetPageTitle,
            message: cbp.addNewMrComapnyPage.globalVars.resetPageConfirmation,
            buttons: [{
              label: "Cancel",
              cssClass: 'btn-default xs-ml-10',
              action: function(dialogRef) {
                dialogRef.close();
              }
            },{
                label: cbp.addNewMrComapnyPage.globalVars.resetPageTitle,
                cssClass: 'btn-primary xs-ml-10',
                action: function(dialogRef) {
                  bootstrapDialog.closeAll();
                  addNewMrCompanyPage.init();
                  $(config.dropDownCommon).selectpicker('refresh');
                  $("html, body").animate({ scrollTop: 0 }, 500);
                }
            }]
          });
        };


        var populatingTable = function (availableSites) {
          $(config.sortByDdn).val("site-asc").selectpicker('refresh');
          $('#table').bootstrapTable({
            classes: 'table table-no-bordered',
            striped: true,
            sortOrder: 'asc',
            iconsPrefix: 'fa',
            sortable: true,
            parentContainer: ".js-bottom-detail",
            sortByDropdownId: "#sortByDdn",
            responsive: false,
            responsiveBreakPoint: 768,
            sortName: 'displayName',
            responsiveClass: "bootstrap-table-cardview",
            onCheck: function (row, $element) {
              selectedSites.push(row.uid);
              showErrorMessage(cbp.addNewMrComapnyPage.globalVars.siteSelectErrorMsg, $('.siteSelectedErrorMsg'), false);
            },
            onCheckAll: function (rows) {
              selectedSites = [];
              var len = rows.length;
              for (var i = 0; i < len; i++) {
                selectedSites.push(rows[i].uid);
              }
              showErrorMessage(cbp.addNewMrComapnyPage.globalVars.siteSelectErrorMsg, $('.siteSelectedErrorMsg'), false);
            },
            onUncheck: function (row, $element) {
              var index = selectedSites.indexOf(row.uid);
              if (index > -1) {
                selectedSites.splice(index, 1);
              }
            },
            onUncheckAll: function (rows) {
              selectedSites = [];
            },
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
                width: '100%'

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
