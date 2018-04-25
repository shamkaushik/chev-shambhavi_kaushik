

        var optionsLocation = [];
        var optionsYear=[];
        for (var i = 0; i < locationDropDown.length; i++) {
            var obj = {};
            obj["key"] = locationDropDown[i].uid;
            obj["value"] = locationDropDown[i].displayName;
            optionsLocation.push(obj);
        }
        cbp.srPage.locationDropDown["options"] = optionsLocation;
        cbp.srPage.locationDropDown.searchable = true;

        for (var i = 0; i < programYearDropDown.length; i++) {
            var obj = {};
            obj["key"] = programYearDropDown[i].uid;
            obj["value"] = programYearDropDown[i].displayName;
            optionsYear.push(obj);
        }
        cbp.srPage.programYearDropDown["options"] = optionsYear;
        cbp.srPage.programYearDropDown.searchable = true;
        // if(programYearDropDown.length>1)
        // {
        //     optionsYear.unshift({key:"currentYear",value:cbp.srPage.globalVars.currentYear});
        // }
        
        if(locationDropDown.length>1)
        {
            optionsLocation.unshift({key:"all",value:cbp.srPage.globalVars.allTb});
        }
       
        var options=[];
        for (var i = 0; i < shipToDropDown.length; i++) {
            var obj1 = {};
            obj1["key"] = shipToDropDown[i].uid;
            obj1["value"] = shipToDropDown[i].displayName;
            options.push(obj1);
        }
        if(shipToDropDown.length>1)
        {
            options.unshift({key:"all",value:cbp.srPage.globalVars.allTb});
        }
        cbp.srPage.shipToDropDown["options"] = options;
        cbp.srPage.shipToDropDown.searchable = true;
        
        function enableMobileDefaultDropDown() {
            //Enable mobile scrolling by calling $('.selectpicker').selectpicker('mobile'). This enables the device's native menu for select menus.
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
                $('.selectpicker').selectpicker('mobile');
            }
        };
        
        require(["modernizr",
            "jquery",
            "bootstrap",
            "handlebars",
            "moment",
            "calendar",
            "bootstrap-select",
            "bootstrap-table",
            //"chartjs",
            "text!app/components/calendar/_calendar.hbs",
            "text!app/components/dropdown/_defaultDdn.hbs",
            "text!app/page/station-report/searchForm.hbs",
            "text!app/page/station-report/volumeSummary.hbs",
            "text!app/page/station-report/bottomDetail.hbs"
        ], function (modernizr, $, bootstrap, Handlebars, moment, calendar, bootstrapSelect, bootstrapTable,/* Chart,*/ _calendarHBS, _defaultDdnHBS, _searchFormHBS, _volumeSummaryHBS, _bottomDetailHBS) {
        
            //Compiling HBS templates
            var compiledDefaultDdn = Handlebars.compile(_defaultDdnHBS);
            var compiledsearchDate = Handlebars.compile(_calendarHBS);
            var compiledsearchForm = Handlebars.compile(_searchFormHBS);
            var compiledvolumeSummary = Handlebars.compile(_volumeSummaryHBS);
            var compiledBottomDetail = Handlebars.compile(_bottomDetailHBS);
        
            var purchaseVolume = (function () {
                var startDate, endDate;
        
                var srtByDdn = {
                    "options": [{
                        key: "productDescription-asc",
                        value: cbp.srPage.globalVars.prdctNameAZ
                    }, {
                        key: "productDescription-desc",
                        value: cbp.srPage.globalVars.prdctNameZA
                    }, {
                        key: "productCode-asc",
                        value: cbp.srPage.globalVars.prdctCodeAsc
                    }, {
                        key: "productCode-desc",
                        value: cbp.srPage.globalVars.prdctCodeDesc
                    }, {
                        key: "volume-asc",
                        value: cbp.srPage.globalVars.purchaseVolumeAsc
                    },
                    {
                        key: "volume-desc",
                        value: cbp.srPage.globalVars.purchaseVolumeDesc
                    }],
                    label: cbp.srPage.globalVars.sortBy,
                    labelClass: "xs-mr-5",
                    name: "sortByDdn",
                    display: "displayInline"
                };
        
                var config = {
                    locationDdnContainer: ".js-location-ddn",
                    shipToDdnContainer: ".js-shipTo-ddn",
                    programYearDdnContainer:".js-programYear-ddn",
                    dateRangeContainer: ".js-search-dateRange",
                    searchFormContainer: ".js-search-form",
                    volSummaryContainer: ".js-volume-summary",
                    searchDetailContainer: ".js-bottom-detail",
                    sortByDdnContainer: ".js-sortbyDdn",
                    dropDownCommon: ".selectpicker",
                    calendar: "#calendar",
                    searchButton: "#pvSearch",
                    printBtn: "#printBtn",
                    locationDdn: "#locationSelectDdn",
                    shipToDdn: "#shipToSelectDdn",
                    productName: "#productName",
                    sortByDdn: "#sortByDdn",
                    displaySpinner: ".overlay-wrapper",
                    chartBtn: ".js-chartBtn",
                    accountDdnContainer: ".js-account-ddn",
                    accountDdn: "#accountSelectDdn",
                    closeChartBtn: ".js-closeChart"
                };
                
               // Start of Chart JS code
                
                /**
                 * Function: formatDate
                 * Summary: JavaScript method to format the date
                 * Description: The goal of this function is to return a formatted date based the localized format of the user
                 * @param {String} dateString (The invoice creation date).
                 * @return {String} The formatted string based on the user localization preference.
                 */
                // var formatDate = function(dateString) {
                // 	var yearIndex = cbp.srPage.srSearchResponse.localizedDateFormat.toUpperCase().indexOf("YYYY");
                // 	var formattedDateString = dateString.substring(yearIndex,yearIndex+4) + "-";
                // 	var monthIndex = cbp.srPage.srSearchResponse.localizedDateFormat.toUpperCase().indexOf("MM");
                // 	formattedDateString = formattedDateString + dateString.substring(monthIndex,monthIndex+2) + "-";
                // 	var dayIndex = cbp.srPage.srSearchResponse.localizedDateFormat.toUpperCase().indexOf("DD");
                // 	formattedDateString = formattedDateString + dateString.substring(dayIndex,dayIndex+2);			
                // 	//If no time is passed in, set to start of day for correct JS behavior
                // 	return formattedDateString + "T00:00:00";
                // };
                
                // /**
                //  * Function: getInvoiceDates
                //  * Summary: JavaScript method to return a multi-dimension array
                //  * Description: The goal of this function is to return the invoice dates of the returned dates in a multi-deminsion array format
                //  * @param {String} account (The select Ship To of the account).
                //  * @return {String} A list of invoice creation dates after sorting them.
                //  */        
                // var getInvoiceDates = function(account){
                // 	var dateScale = [];
                // 	var dateLabel = [];
                    
                // 	for (i=0; i<cbp.srPage.srSearchResponse.purchasedVolDataList.length; i++) 
                // 		for(x=0;x<cbp.srPage.srSearchResponse.purchasedVolDataList[i].purchasedVolumeDetails.length; x++) {
                // 			var dateString = cbp.srPage.srSearchResponse.purchasedVolDataList[i].purchasedVolumeDetails[x].invoiceCreationDate;
                // 			if (account == cbp.srPage.srSearchResponse.purchasedVolDataList[i].purchasedVolumeDetails[x].shipTo && dateLabel.indexOf(dateString)<0) {	
                // 				var formattedDateString = formatDate(dateString);
                // 				dateLabel[dateLabel.length] = dateString;
                // 				dateScale[dateScale.length] = new Date(formattedDateString);
                // 			}
                // 		}
                    
                    
                // 	//Sort the dates
                // 	//For time-series bar charts need to add a day at the beginning and at the end
                // 	if (dateScale.length >= 1) {
                // 		if(dateScale.length != 1)
                // 			for (var i=0;i<dateScale.length-1;i++) 
                // 				for (var j=i+1;j<dateScale.length;j++)
                // 					if (dateScale[i]>dateScale[j]) {
                // 						var x = dateScale[i];
                // 						dateScale[i] = dateScale[j];
                // 						dateScale[j] = x;
                // 					}
                // 		var d = new Date (dateScale[0].toString());
                //     	d.setDate(d.getDate() - 1);
                //     	dateScale.unshift(d);
                //     	d = new Date (dateScale[dateScale.length - 1].toString());
                //     	d.setDate(d.getDate() + 1);
                //     	dateScale.push(d);
                // 	}
                    
                // 	return dateScale;
                // };
        
                // //Set the colors which will appear on the chart for each of the materials
                // var cbpPVColors = ['#0066B2','#CB1530','#009DD9','#4A7B00','#383838','#4C93C9','#6B6D6F','#8C8F93','#F7E8E9','#E5F3DF'];
                
                // var xValue = function(aDate, dateList) {
                // 	var found = false;
                // 	//Start at 0 because we added an extra day at the beginning
                // 	var index = 0;
                // 	var tempDate = new Date(aDate);
                    
                // 	while (!found) {
                // 		index++;
                // 		if (tempDate.toString() == dateList[index].toString()) {
                // 			found = true;
                // 		}
                // 	}
                // 	return index;
                // };
                
                // var getDatasets = function(account, invoiceDates) {
                // 	var contentSet = [];
                    
                // 	for (var i=0; i<cbp.srPage.srSearchResponse.purchasedVolDataList.length; i++) {
                // 		var data = [];
                // 		var hasSeries = false;
                // 		for(var j=0; j<cbp.srPage.srSearchResponse.purchasedVolDataList[i].purchasedVolumeDetails.length; j++) {	
                // 			if (account == cbp.srPage.srSearchResponse.purchasedVolDataList[i].purchasedVolumeDetails[j].shipTo) {
                // 				hasSeries = true;
                // 				var invDate = formatDate(cbp.srPage.srSearchResponse.purchasedVolDataList[i].purchasedVolumeDetails[j].invoiceCreationDate);
                // 				var x = xValue(invDate, invoiceDates);
                // 				var y = cbp.srPage.srSearchResponse.purchasedVolDataList[i].purchasedVolumeDetails[j].productVolume;
                // 				if (!data[x]) data[x]=0;
                // 				data[x] += y;
                // 			}
                // 		}
                // 		if (hasSeries) {
                // 			var node = {
                // 				label: cbp.srPage.srSearchResponse.purchasedVolDataList[i].productDescription,
                // 				backgroundColor: Color(cbpPVColors[i % cbpPVColors.length]).alpha(0.3).rgbaString(), 
                // 				borderColor: Color(cbpPVColors[i % cbpPVColors.length]).rgbaString(), 
                // 				borderWidth: 2,
                // 				data: data
                // 			}
                // 			contentSet[contentSet.length] = node;
                // 		}
                // 	}
                    
                // 	return contentSet;
                // };
                
                // var calculateMaxThickness = function(dates) {
                // 	var diff = (dates[dates.length-1] - dates[0] + 1)/(1000*3600*24);
                // 	var cnSize = document.getElementsByClassName('top-summary')[0].clientWidth;
                // 	var floor = Math.floor((cnSize/diff)*.66);
                // 	return (floor > 50) ? 50 : floor;
                // };
                
                // var configChart = function(account) {
                // 	var invDates = getInvoiceDates(account);
                // 	var chartSet = getDatasets(account, invDates);
                    
                // 	var chartConfig = {
                // 		type: 'bar',
                // 		data: {
                // 			labels: invDates,
                // 			datasets: chartSet
                // 		},
                // 		options: {
                // 			scales: {
                // 				xAxes: [{
                // 					type: 'time',
                // 					maxBarThickness: calculateMaxThickness(invDates),
                // 					time: {
                // 						unit: 'day',
                // 						tooltipFormat: cbp.srPage.srSearchResponse.localizedDateFormat.toUpperCase()
                // 					},
                // 					scaleLabel: {
                // 						display: true,
                // 						fontStyle: 'bold',
                // 						labelString: cbp.srPage.globalVars.xLabel
                // 					},
                // 					stacked: true
                // 				}],
                // 				yAxes: [{
                // 					scaleLabel: {
                // 						display: true,
                // 						fontStyle: 'bold',
                // 						labelString: cbp.srPage.globalVars.volume
                // 					},
                // 					stacked: true
                // 				}]
                // 			}
                // 		}
                // 	}
                // 	return chartConfig;
                // };
                
                // var getValidShipTos = function() {
                // 	var shipTos = [];
                // 	if (cbp.srPage.srSearchResponse.purchasedVolDataList && cbp.srPage.srSearchResponse.purchasedVolDataList.length > 0)
                // 		for (var i=0; i<cbp.srPage.srSearchResponse.purchasedVolDataList.length; i++) 
                // 			for(var j=0; j<cbp.srPage.srSearchResponse.purchasedVolDataList[i].purchasedVolumeDetails.length; j++) 	
                // 				if (shipTos.indexOf(cbp.srPage.srSearchResponse.purchasedVolDataList[i].purchasedVolumeDetails[j].shipTo) < 0) 
                // 					shipTos[shipTos.length] = cbp.srPage.srSearchResponse.purchasedVolDataList[i].purchasedVolumeDetails[j].shipTo;
                // 	return shipTos;
                // };
                
                // var setAccountOptions = function() {
                // 	var accOptions = [];
                //     if (($('#shipToSelectDdn')[0].length - 1) == 1) {
                // 		var obj = {};
                // 		obj["key"] = $('#shipToSelectDdn')[0][1].value;
                // 		obj["value"] = $('#shipToSelectDdn')[0][1].text;
                // 		accOptions.push(obj);
                // 	} else {
                // 		var shipToVal = $('.js-shipTo-ddn button').text();
                // 		if (shipToVal != "") {
                // 			var shipToOptions = $('#shipToSelectDdn')[0];
                // 			if (shipToVal.substring(0,cbp.srPage.globalVars.allLocation.length) == cbp.srPage.globalVars.allLocation) {	
                // 				var shipTosWithPV = getValidShipTos();
                // 				for (var i = 0; i < shipToOptions.length; i++) {
                // 					if (shipTosWithPV.indexOf(shipToOptions[i].value) >= 0) {
                // 						var obj = {};
                // 						obj["key"] = shipToOptions[i].value;
                // 						obj["value"] = shipToOptions[i].text;
                // 						accOptions.push(obj);
                // 					}
                // 				}
                // 			} else {
                // 				var obj = {};
                // 				obj["key"] = shipToOptions[$(config.shipToDdn)[0].selectedIndex].value;
                // 				obj["value"] = shipToOptions[$(config.shipToDdn)[0].selectedIndex].text;
                // 				accOptions.push(obj);
                // 			}
                // 		}
                // 	}
                // 	cbp.srPage.accDropDown["options"] = accOptions;
                // 	cbp.srPage.accDropDown.searchable = false;
                // 	$(config.accountDdnContainer).html(compiledDefaultDdn(cbp.srPage.accDropDown));
                // 	$(config.accountDdn).selectpicker('refresh');
                // };
                
                //End of Chart JS Code
                
                var init = function () {
                    loadingInitialHbsTemplates();
                    // populatingCalendarComponent();
                    // if (cbp.srPage.locationDropDown["options"].length == 1) {
                    //     populatingShipTo($(config.locationDdn).val());
                    //     $(config.searchButton).removeAttr("disabled");
                    // } 
                    // else if (cbp.srPage.locationDropDown["options"].length > 1) {
                    //     $(config.shipToDdn).attr("disabled", "disabled").selectpicker('refresh');
                    //     $(config.searchButton).attr("disabled", "disabled");
                    // }
                    //cbp.srPage.shipToDropDown.searchable = false;
                    $(config.locationDdn).selectpicker('refresh');
                    $(config.shipToDdn).selectpicker('refresh');

                    // populatingShipTo($(config.locationDdn).val());
                    populatingTable(cbp.srPage.srSearchResponse.purchasedVolDataList);
                    bindEvents();
                };
                
                // var chartBtnSelected = function () {
                // 	document.getElementById("pvChartDiv").style.display = "block";
                // 	var ctx = document.getElementById("pvChart").getContext("2d");
                // 	var account = "";
                //     account = $('#accountSelectDdn').find('option:selected').val();
                // 	window.pvChart = new Chart(ctx, configChart(account));
                // };
                
                // var closeChartBtnSelected = function () {
                // 	document.getElementById("pvChartDiv").style.display = "none";
                // 	window.pvChart.destroy();
                // };
                
                var loadingInitialHbsTemplates = function () {
                    //Appending handlebar templates to HTML
                    $(config.searchFormContainer).html(compiledsearchForm(cbp.srPage));
                    $(config.locationDdnContainer).html(compiledDefaultDdn(cbp.srPage.locationDropDown));
                    $(config.shipToDdnContainer).html(compiledDefaultDdn(cbp.srPage.shipToDropDown));
                    $(config.programYearDdnContainer).html(compiledDefaultDdn(cbp.srPage.programYearDropDown));

                    // $(config.dateRangeContainer).html(compiledsearchDate({
                    //     label: cbp.srPage.globalVars.dateRange,
                    //     iconClass: cbp.srPage.dateRange.iconClass,
                    //     id: cbp.srPage.dateRange.id
                    // }));
        
                    loadingDynamicHbsTemplates();
        
                    //Refresh dropdown at initial dispaly after loading templates
                    $(config.dropDownCommon).selectpicker('refresh');
                    enableMobileDefaultDropDown();
                    $(config.displaySpinner).hide();
                };
        
                var loadingDynamicHbsTemplates = function () {
                    $(config.volSummaryContainer).html(compiledvolumeSummary(cbp.srPage));
                    $(config.searchDetailContainer).html(compiledBottomDetail(cbp.srPage));
                    $(config.sortByDdnContainer).html(compiledDefaultDdn(srtByDdn));
                    $(config.sortByDdnContainer).find(config.dropDownCommon).selectpicker('refresh');
                    enableMobileDefaultDropDown();
                };
        
        
                var bindEvents = function () {
        
                    //Purchase Volume Search button functionality
                    $(config.searchButton).on("click", function (e) {
                        if (!$(this).attr('disabled')) {
                            triggerAjaxRequest();
                        }
                    });
                    
                    // $(document).on("click", config.chartBtn, function () {
                    // 	$(config.chartBtn).addClass("disabled");
                    // 	chartBtnSelected();
                    // });
                    
                    // $(document).on("click", config.closeChartBtn, function () {
                    // 	closeChartBtnSelected();
                    // 	$(config.chartBtn).removeClass("disabled");
                    // });
                    
                    // $(document).on('change',config.accountDdn, function (e) {
                    // 	window.pvChart.destroy();
                    // 	chartBtnSelected();
                    // });
                    
                    $(document).on("click", config.printBtn, function (e) {
                        var win = window.open('', '_blank', 'PopUp' + new Date().getTime() + ',width=1300,height=800');
                        win.document.write('\n                <html>\n                    <head>\n                        <meta charset="utf-8">\n                        <meta http-equiv="X-UA-Compatible" content="IE=edge">\n                        <meta name="viewport" content="width=device-width, initial-scale=1">\n                        <link href="/fuels/_ui/build/assets/css/custom-bootstrap.css" rel="stylesheet" type="text/css"/>\n                        <link href="/fuels/_ui/build/assets/css/app.css" rel="stylesheet" type="text/css"/>\n                        <style>\n     .total-cost-class {font-weight: bold;font-size: 15px;margin-left: 10px;}       .totalCost{text-align : right;padding:5px; 0 0 15px;}             .custBody {\n                            background-color: #ffffff;\n                          }\n                        .ptint-purchase-volume-headerLbl {\n                            color: #464646;\n                            font-weight: bold;\n                            font-size: 20px;\n                            margin-left: 10px;\n                          \tpadding: 0 0 10px 0;\n                        }\n                        .nav-bottom{\n                            border-bottom: none;\n                        }\n                        .navbar-brand{\n                            padding: 30px 0 10px 0;\n                        }\n                        .fixed-table-body{\n                            height:auto !important;\n                        }\n                        .fixed-table-body{\n                       \t \theight: auto !important;\n                        }\n                        </style>\n                    </head>\n                    <body class="custBody">\n                        <div class="wrapper">\n                            <header class="main-header main-header-md js-header" style="">\n                                <div class="nav-bottom">\n                                    <nav class="main-navigation js-enquire-offcanvas-navigation" role="navigation">                                                                                                       \n                                        <div class="row">                                           \n                                            <a class="navbar-brand navbar-left" href="/index.html">\n                                                <img alt="Brand" src="/fuels/_ui/build/assets/images/logo.png">\n                                                <span>business point</span>\n                                            </a>\n                                            <a class="navbar-brand navbar-right" href="/index.html">                                                                                                                          <a class="navbar-brand navbar-right" href="/index.html">\n                                                <img alt="Brand" src="/fuels/_ui/build/assets/images/fob-color-rgb.png">                                                   \n                                             </a>\n                                        </div>                                                                                                                                                 \n                                \n                                    </nav>\n                                </div>\n                            </header>\n                            <div class="col-sm-24">\n                                <h2 class="page-title ptint-purchase-volume-headerLbl">Purchased Volume Report</h2>\n                            </div>\n                            <div class="col-sm-24 xs-mt-10">\n                                <div class="col-sm-12 pull-left"><strong>' + $(".shipToElement").html() + '</strong></div>\n  <div class="col-sm-12 Pull-right text-right"><strong>Total Purchased Volume: ' + cbp.srPage.srSearchResponse.totalVolume + ' ' + cbp.srPage.globalVars.gal + '</strong></div>                              <div class="col-sm-12 Pull-right text-right"><strong>Date: ' + $(".dateElement").html() + '</strong></div>\n                            </div>\n                            <div class="col-sm-24">\n                                ' + $(".tableContainer").html() + '\n     <div class="row xs-mb-10"></div>                       </div>\n                            \n                            <br>\n                        </div>\n                    </body>\n                </html>\n                ');
                        win.document.close();
                    });
        
                    var valueOnSubmit = '.js-search-form input' + ","  +
                        config.locationDdnContainer + "," + config.shipToDdnContainer + "";
        
                    $(document).on('keypress', valueOnSubmit, function (e) {
                        if (e.which == 13) {
                            e.preventDefault();
                            $(config.searchButton).trigger("click");
                        }
                    });
        
                    //Sold to dropdown change to populate ship to
                    $(config.locationDdn).on('change', function (e) {
                        if ($(config.locationDdn).val() !== "") {
                            $(config.searchButton).removeAttr("disabled");
                        } else {
                            $(config.searchButton).attr("disabled", "disabled");
                        }
                        // populatingShipTo($(config.locationDdn).val());
                    });
        
                    $(document).on('change', config.shipToDdn, function (e) {
                        // if ($(this).val() !== "") {
                        //     $(config.searchButton).removeAttr("disabled");
                        // } else {
                        //     $(config.searchButton).attr("disabled", "disabled");
                        // }
                    });
                };
        
                // var populatingShipTo = function () {
                // //     $(config.displaySpinner).show();
        
                //     // function successCallback(data) {
                        
                //     //     $(config.displaySpinner).hide();
        
                //         var shipToOptions = [];
                //         var obj = {};
        
                //         if (data.length == 1) {
                //             cbp.srPage.shipToDropDown.singleOption = true;
                //             // $(config.searchButton).removeAttr("disabled");
                //         }
                //         else if (data.length > 1) {
                //             obj["key"] = "all";
                //             obj["value"] = cbp.srPage.globalVars.allLocation;
        
                //             shipToOptions.push(obj);
                //         }
        
                //         for (var i = 0; i < data.length; i++) {
                //             obj = {};
                //             obj["key"] = data[i].uid;
                //             obj["value"] = data[i].displayName;
                //             shipToOptions.push(obj);
                //         }
        
                //         cbp.srPage.shipToDropDown["options"] = shipToOptions;
                //         cbp.srPage.shipToDropDown.searchable = true;
        
                //         $(config.shipToDdnContainer).html(compiledDefaultDdn(cbp.srPage.shipToDropDown));
        
                //         $(config.shipToDdn).selectpicker('refresh');
        
                //         if (cbp.srPage.shipToDropDown["options"].length > 1) {
                //             $(config.shipToDdn).val('all').selectpicker('refresh');
                //         }
                        //setAccountOptions();
                    //     enableMobileDefaultDropDown();
                    // }
        
                    // function errorCallback() {
                    //     $(config.displaySpinner).hide();
                    //     console.log("error");
                    // }
        
                //     $.ajax({
                //         type: cbp.srPage.globalUrl.method,
                //         data: {
                //             soldToNumber: soldToId,
                //            // CSRFToken:CSRFToken,
                //         },
                //         url: cbp.srPage.globalUrl.shipToURL,
                //         success: successCallback,
                //         error: errorCallback
                //     });
        
                // };

                var setValueForSoldToShipto = function (soldToShipTo, check) {
                    if(check){
                        cbp.srPage.srSearchResponse['soldShipToNormal'] = cbp.srPage.globalVars.allLocation;
                    }
                    else{
                        cbp.srPage.srSearchResponse['soldShipToBlock'] = soldToShipTo.uid;
                        cbp.srPage.srSearchResponse['soldShipToNormal'] = soldToShipTo.displayName;
                    }            
                };
        
                var triggerAjaxRequest = function () {
                    $(config.displaySpinner).show();
                    $(config.volSummaryContainer).hide();
                    $(config.searchDetailContainer).hide();
        
                    leftPaneExpandCollapse.hideSearchBar();
                    var postData = {};
                    postData.shipTo = $(config.shipToDdn).val() === null ? "null" : $(config.shipToDdn).val().toString();
                    postData.soldTo = $(config.locationDdn).val() === null ? "null" : $(config.locationDdn).val().toString();
                    postData.fromDate = startDate;
                    postData.toDate = endDate;
                    postData.productName = $(config.productName).val();
                    //postData.CSRFToken = CSRFToken;
        
                    if ($(config.shipToDdn).val() != 'all') {
                        cbp.srPage.showSoldTo = false;
                    } else {
                        cbp.srPage.showSoldTo = true;
                    }
        
                    function successCallback(data) {
                      
                        $(config.displaySpinner).hide();
                        $(config.volSummaryContainer).show();
                        $(config.searchDetailContainer).show();
        
                        cbp.srPage.srSearchResponse = data;
        
        
                        // cbp.srPage.dateRange.startDate = startDate;
                        // cbp.srPage.dateRange.endDate = endDate;
                        cbp.srPage.srSearchResponse.localizedDateFormat = data.localizedDateFormat.toUpperCase();
                        if(data.multipleSoldTo){
                            setValueForSoldToShipto("all", true);
                        }
                        else{
                            if (data.shipTo) {
                                setValueForSoldToShipto(data.shipTo);
                            }
            
                            if (data.soldTo) {
                                setValueForSoldToShipto(data.soldTo);
                            }
                        }
                        
        
                        // cbp.srPage.globalVars.fromAndToVar = cbp.srPage.globalVars.fromAndTo.replace("{0}", cbp.srPage.dateRange.startDate).replace("{1}", cbp.srPage.dateRange.endDate);
                        
                        //Set the result count before loading dynamic templates
                        if (cbp.srPage.srSearchResponse.resultCount > 0) {
                            cbp.srPage.globalVars.productsFoundVar = cbp.srPage.globalVars.productsFound.replace("{0}", cbp.srPage.srSearchResponse.resultCount);
                        } else {
                            cbp.srPage.globalVars.productsFoundVar = cbp.srPage.globalVars.productsFound.replace("{0}", 0);
                        }
                        loadingDynamicHbsTemplates();
                        
                        //Enable buttons after loading dynamic templates
                        if (cbp.srPage.srSearchResponse.resultCount > 0) {
                            $(config.printBtn).removeClass("disabled");
                            $(config.chartBtn).removeClass("disabled");
                        } else {
                            $(config.printBtn).addClass("disabled");
                            $(config.chartBtn).addClass("disabled");
                        }
                      //  setAccountOptions();
                        populatingTable(cbp.srPage.srSearchResponse.purchasedVolDataList);
                        leftPaneExpandCollapse.resetSearchFormHeight();
                    }
        
                    function errorCallback() {
                        $(config.displaySpinner).hide();
                        $(config.volSummaryContainer).show();
                        $(config.searchDetailContainer).show();
                        console.log("error");
                    }
        
                    $.ajax({
                        type: cbp.srPage.globalUrl.method,
                       // 'CSRFToken':CSRFToken,
                        data: postData,
                        url: cbp.srPage.globalUrl.pvPostURL,
                        success: successCallback,
                        error: errorCallback
                    });
        
                };
        
                var populatingTable = function (purchasedVolDataList) {
        
                    if (purchasedVolDataList === null || purchasedVolDataList === undefined) {
                        purchasedVolDataList = [];
                    }
                    $(config.sortByDdn).val("productCode-asc").selectpicker('refresh');
                    // $(config.sortByDdn).selectpicker('refresh');
        
                    $('#table').bootstrapTable({
                        classes: 'table table-no-bordered',
                        striped: true,
                        sortName: 'productCode',
                        sortOrder: 'asc',
                        iconsPrefix: 'fa',
                        sortable: true,
                        parentContainer: ".js-bottom-detail",
                        sortByDropdownId: "#sortByDdn",
                        undefinedText: "",
                        responsive: true,
                        responsiveBreakPoint: 480,
                        responsiveClass: "bootstrap-table-cardview",
                        columns: [{
                            field: 'report',
                            title: cbp.srPage.globalVars.report ,
                            titleTooltip: cbp.srPage.globalVars.report,
                            class: 'numberIcon text-wrap',
                            cellStyle: 'xs-pl-10',
                            
                            width : '20%'
                        }, {
                            field: 'quarterOne',
                            title: cbp.srPage.globalVars.quarterOne + ((cbp.srPage.globalVars.currency === "" || cbp.srPage.globalVars.currency == null) ? '' : ' (' + cbp.srPage.globalVars.currency + ')'),
                            titleTooltip: cbp.srPage.globalVars.quarterOne,
                            align:'right',
                            width : '13%'
                        }, {
                            field: 'quarterTwo',
                            title: cbp.srPage.globalVars.quarterTwo + ((cbp.srPage.globalVars.currency === "" || cbp.srPage.globalVars.currency == null) ? '' : ' (' + cbp.srPage.globalVars.currency + ')'),
                            titleTooltip: cbp.srPage.globalVars.quarterTwo,
                            class: 'numberIcon',
                            
                            align: 'right',
                            width : '13%'
                         },
                        {
                            field: 'quarterThree',
                            title: cbp.srPage.globalVars.quarterThree + ((cbp.srPage.globalVars.currency === "" || cbp.srPage.globalVars.currency == null) ? '' : ' (' + cbp.srPage.globalVars.currency + ')'),
                            titleTooltip: cbp.srPage.globalVars.quarterThree,
                            class: 'numberIcon',
                            
                            align: 'right',
                            width : '13%',
                            halign: 'right',
                         },
                         {
                            field: 'quarterFour',
                            title: cbp.srPage.globalVars.quarterFour + ((cbp.srPage.globalVars.currency === "" || cbp.srPage.globalVars.currency == null) ? '' : ' (' + cbp.srPage.globalVars.currency + ')'),
                            titleTooltip: cbp.srPage.globalVars.quarterFour,
                            class: 'numberIcon',
                            
                            align: 'right',
                            width : '13%',
                            halign: 'right',
                         },
                         {
                            field: 'yod',
                            title: cbp.srPage.globalVars.yod + ((cbp.srPage.globalVars.currency === "" || cbp.srPage.globalVars.currency == null) ? '' : ' (' + cbp.srPage.globalVars.currency + ')'),
                            titleTooltip: cbp.srPage.globalVars.yod,
                            class: 'numberIcon',
                            align: 'right',
                            width : '15%',
                            halign: 'right',
                         },

                    ],
                        data: purchasedVolDataList
                    });
        
                };
        
                return {
                    init: init
                };
            })();
        
            $(document).ready(function () {
        
                //Localization setup for dropdown & table
                $.fn.selectpicker.defaults = {
                    noneSelectedText: cbp.srPage.globalVars.selectDdn.noneSelectedText,
                    noneResultsText: cbp.srPage.globalVars.selectDdn.noneResultsText,
                    countSelectedText: function (numSelected, numTotal) {
                        return (numSelected == 1) ? cbp.srPage.globalVars.selectDdn.itemSelected : cbp.srPage.globalVars.selectDdn.itemSelected1;
                    },
                    maxOptionsText: function (numAll, numGroup) {
                        return [
                            (numAll == 1) ? cbp.srPage.globalVars.selectDdn.limitReached : cbp.srPage.globalVars.selectDdn.limitReached1,
                            (numGroup == 1) ? cbp.srPage.globalVars.selectDdn.groupLimit : cbp.srPage.globalVars.selectDdn.groupLimit1
                        ];
                    },
                    selectAllText: cbp.srPage.globalVars.selectDdn.selectAllText,
                    deselectAllText: cbp.srPage.globalVars.selectDdn.deselectAllText
                };
        
                $.fn.bootstrapTable.locales = {
                    formatLoadingMessage: function () {
                        return cbp.srPage.globalVars.tableLocales.loadingMessage;
                    },
                    formatRecordsPerPage: function (pageNumber) {
                        return cbp.srPage.globalVars.tableLocales.recordsPerPage.replace('{0}', pageNumber);
                    },
                    formatShowingRows: function (pageFrom, pageTo, totalRows) {
                        return cbp.srPage.globalVars.tableLocales.showingRows.replace('{0}', pageFrom).replace('{1}', pageTo).replace('{2}', totalRows);
                    },
                    formatSearch: function () {
                        return cbp.srPage.globalVars.tableLocales.search;
                    },
                    formatNoMatches: function () {
                        return cbp.srPage.globalVars.tableLocales.noMatches;
                    },
                    formatPaginationSwitch: function () {
                        return cbp.srPage.globalVars.tableLocales.paginationSwitch;
                    },
                    formatRefresh: function () {
                        return cbp.srPage.globalVars.tableLocales.refresh;
                    },
                    formatToggle: function () {
                        return cbp.srPage.globalVars.tableLocales.toggle;
                    },
                    formatColumns: function () {
                        return cbp.srPage.globalVars.tableLocales.columns;
                    },
                    formatAllRows: function () {
                        return cbp.srPage.globalVars.tableLocales.allRows;
                    }
                };
        
                $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales);
        
                leftPaneExpandCollapse.init();
        
                //Global Object manipulations
                cbp.srPage.showSoldTo = true;
                cbp.srPage.srSearchResponse = srSearchResponse;
                if (srSearchResponse.resultCount === undefined || srSearchResponse.resultCount === null) {
                    cbp.srPage.globalVars.productsFoundVar = cbp.srPage.globalVars.productsFound.replace("{0}", 0);
                } else {
                    cbp.srPage.globalVars.productsFoundVar = cbp.srPage.globalVars.productsFound.replace("{0}", srSearchResponse.resultCount);
                }
        
                if (srSearchResponse.purchasedVolDataList === undefined) {
                    cbp.srPage.srSearchResponse.purchasedVolDataList = [];
                }
        
                // cbp.srPage.dateRange.startDate = moment().subtract(7, 'days');
                // cbp.srPage.dateRange.endDate = moment();
        
                // cbp.srPage.globalVars.fromAndToVar = cbp.srPage.globalVars.fromAndTo.replace("{0}", cbp.srPage.dateRange.startDate.format(cbp.srPage.dateRange.format)).replace("{1}", cbp.srPage.dateRange.endDate.format(cbp.srPage.dateRange.format));
        
                purchaseVolume.init();
                enableMobileDefaultDropDown();
        
            });
        
        });
        