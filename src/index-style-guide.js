require(["modernizr",
    "jquery",
    "bootstrap",
    "handlebars",
    "moment",
    "calendar",
    "timePicker",
    "bootstrap-select",
    "bootstrap-table",
    "textArea",
    "toggleSwitch",
    "customValidate",
    "text!app/components/calendar/_calendar.hbs",
    "text!app/components/dropdown/_defaultDdn.hbs",
    "text!app/page/purchase-volume/bottomDetail.hbs"

], function(modernizr, $, bootstrap, Handlebars, moment, calendar, timePicker, bootstrapSelect, bootstrapTable,  textArea, toggleSwitch, customValidate, _calendarHBS, _defaultDdnHBS, _bottomDetailHBS) {

    var compiledCalendar = Handlebars.compile(_calendarHBS);
    var compiledDefaultDdn = Handlebars.compile(_defaultDdnHBS);
    var compiledBottomDetail = Handlebars.compile(_bottomDetailHBS);
    var purchaseVolume = (function() {
        var srtByDdn = {
            "options": [{
                key: "productDescription-asc",
                value: cbp.indexPage.globalVars.prdctNameAZ
            }, {
                key: "productDescription-desc",
                value: cbp.indexPage.globalVars.prdctNameZA
            }, {
                key: "productCode-asc",
                value: cbp.indexPage.globalVars.prdctCodeAsc
            }, {
                key: "productCode-desc",
                value: cbp.indexPage.globalVars.prdctCodeDesc
            }, {
                key: "displayVolume-asc",
                value: cbp.indexPage.globalVars.purchaseVolume
            }],
            label: cbp.indexPage.globalVars.sortBy,
            labelClass: "xs-mr-5",
            title: cbp.indexPage.globalVars.prdctNameAZ,
            name: "sortByDdn",
            display: "displayInline"
        };

        var config = {
            searchDetailContainer: ".js-bottom-detail",
            sortByDdnContainer: ".js-sortbyDdn",
            productName: "#productName",
            sortByDdn: "#sortByDdn",
            displaySpinner: ".displaySpinner"
        };

        var init = function() {
            loadingDynamicHbsTemplates();
            populatingTable(cbp.indexPage.tableResponse.tableDataList);
            expandAndCollapseTable();
            bindEvents();
        };
        var bindEvents = function () {
          $('#from-input, #to-input').on('blur', function () {
            var regEx = /^\b((1[0-2]|0?[1-9]):([0-5][0-9]) ([AaPp][Mm]))$/;
            var parentContainer = $(this).parent();
            if($(this).val() !== ""){
              timeFormatCheck(parentContainer, regEx, this);
            }
            else if(parentContainer.hasClass('has-error')){
                parentContainer.removeClass("has-error").find(".help-block").remove();

            }
          });
        };
        var loadingDynamicHbsTemplates = function() {
            $(config.searchDetailContainer).html(compiledBottomDetail(cbp.indexPage));
            $(config.sortByDdnContainer).html(compiledDefaultDdn(srtByDdn));
        };
        var populatingTable = function(tableDataList) {
            $(config.sortByDdn).val("productCode-asc").selectpicker('refresh');
            $('#table').bootstrapTable({
                classes: 'table table-no-bordered',
                striped: true,
                detailView: true,
                icons: {
                    detailOpen: 'fa-plus-square-o',
                    detailClose: 'fa-minus-square-o'
                },
                sortName: 'productCode',
                sortOrder: 'asc',
                iconsPrefix: 'fa',
                sortable: true,
                parentContainer: ".js-bottom-detail",
                sortByDropdownId: "#sortByDdn",
                columns: [{
                    field: 'productCode',
                    title: cbp.indexPage.globalVars.code,
                    titleTooltip: cbp.indexPage.globalVars.code,
                    class: 'col-xs-4 numberIcon',
                    cellStyle: 'xs-pl-10',
                    sortable: true
                }, {
                    field: 'productDescription',
                    title: cbp.indexPage.globalVars.product,
                    titleTooltip: cbp.indexPage.globalVars.product,
                    class: 'col-xs-12',
                    sortable: true
                }, {
                    field: 'packageCode',
                    title: cbp.indexPage.globalVars.package,
                    titleTooltip: cbp.indexPage.globalVars.package,
                    class: 'col-xs-2'
                }, {
                    field: 'displayVolume',
                    title: cbp.indexPage.globalVars.volume,
                    titleTooltip: cbp.indexPage.globalVars.volume,
                    class: 'col-xs-6 numberIcon',
                    sortable: true,
                    align: 'right',
                    halign: 'right'
                }],
                data: tableDataList
            });

        };
        var expandAndCollapseTable = function() {
            $('#table').on('expand-row.bs.table', function(e, index, row, $detail) {
                $(config.displaySpinner).show();
                $.ajax({
                    type: cbp.indexPage.globalVars.method,
                    dataType: "json",
                    url: cbp.indexPage.globalVars.indexPostURL,
                    success: function(data) {
                        $detail.html(data.message);
                    },
                    error: function() {
                        console.log(Error);
                    }
                });
            });
        };
        var timeFormatCheck = function (parentContainer, regEx, self) {
          parentContainer.toggleClass('has-error', !(regEx.test($(self).val())));

          if(parentContainer.hasClass('has-error')){
            if(parentContainer.find(".help-block").length){
              parentContainer.find(".help-block").remove();
            }
            parentContainer.append('<span class="help-block"><span class="fa"><span class="fa-warning"></span></span>Invalid time</span>');
          } else{
            parentContainer.find(".help-block").remove();
          }
        };
        return {
            init: init
        };
    })();
    $(document).ready(function() {
        // page search logic
        var pageSearchJSON = {
            label: "Search page",
            title: "Search a page...",
            name: "searchPageSelectDdn",
            searchable: "true",
            showOptions: 10,
            options: []
        };
        
        var pages = $("a.list-group-item");
        var pageOptions = [];
        $.each(pages, function(index, item){
           var obj = {};
           obj.key = $(item).attr("href");
           obj.value = $(item).text();
           
           pageOptions.push(obj);
        });
        pageSearchJSON.options = pageOptions;
        
        $(document).on('changed.bs.select', "#searchPageSelectDdn", function (e) {
            var url = $("#searchPageSelectDdn").val();            
            var win = window.open(url, '_blank');
            win.focus();
            $('.selectpicker').val('');
            $('.selectpicker').selectpicker('refresh');
            
        });
        
        $('#from-input, #to-input').timepicker();

        var dropdownDefaultJSON = {
            label: "Single Select",
            title: "Select...",
            name: "singleSelectDdn",
            options: [{
                key: "add1",
                value: "8306291, INTERTUG BOGOTA, CI.15, Bogota"
            }, {
                key: "add2",
                value: "8306217, INTERTUG MEDELLIN, Entrada A La Puente Autonorte #78-590, Medellin, Antioquia"
            }, {
                key: "add3",
                value: "8306235, INTERTUG CARTAGENA, Calle 64b #106h-5, Cartagena"
            }, {
                key: "add4",
                value: "8306294, INTERTUG CALI, Avenida 3N #60N-15, Cali, Valle del Cauca"
            }, {
                key: "add5",
                value: "8306220, INTERTUG BARRANQUILLA, Cra. 46 #72-101, Barranquilla, Atlantico"
            }, {
                key: "add6",
                value: "8321440, Costa Oil S.A.S, CL 13 MR 8 C 15 AVD Circunvalar, Monteria, Colombia"
            }]
        };

        var dropdownMultiJSON = {
            label: "Multiple select",
            multiple: "true",
            // maxAllowed: 2,
            showOptions: 10,
            selectAll: "true",
            selectAllText: "All",
            deselectAllText: "false",
            title: "Select...",
            name: "multipleSelectDdn",
            options: [{
                key: "add1",
                value: "8306291, INTERTUG BOGOTA, CI.15, Bogota"
            }, {
                key: "add2",
                value: "8306217, INTERTUG MEDELLIN, Entrada A La Puente Autonorte #78-590, Medellin, Antioquia"
            }, {
                key: "add3",
                value: "8306235, INTERTUG CARTAGENA, Calle 64b #106h-5, Cartagena"
            }, {
                key: "add4",
                value: "8306294, INTERTUG CALI, Avenida 3N #60N-15, Cali, Valle del Cauca"
            }, {
                key: "add5",
                value: "8306220, INTERTUG BARRANQUILLA, Cra. 46 #72-101, Barranquilla, Atlantico"
            }, {
                key: "add6",
                value: "8321440, Costa Oil S.A.S, CL 13 MR 8 C 15 AVD Circunvalar, Monteria, Colombia"
            }]
        };
        var dropdownSearchJSON = {
            label: "Select with Search",
            title: "Select...",
            name: "searchSelectDdn",
            searchable: "true",
            options: [{
                key: "add1",
                value: "8306291, INTERTUG BOGOTA, CI.15, Bogota"
            }, {
                key: "add2",
                value: "8306217, INTERTUG MEDELLIN, Entrada A La Puente Autonorte #78-590, Medellin, Antioquia"
            }, {
                key: "add3",
                value: "8306235, INTERTUG CARTAGENA, Calle 64b #106h-5, Cartagena"
            }, {
                key: "add4",
                value: "8306294, INTERTUG CALI, Avenida 3N #60N-15, Cali, Valle del Cauca"
            }, {
                key: "add5",
                value: "8306220, INTERTUG BARRANQUILLA, Cra. 46 #72-101, Barranquilla, Atlantico"
            }, {
                key: "add6",
                value: "8321440, Costa Oil S.A.S, CL 13 MR 8 C 15 AVD Circunvalar, Monteria, Colombia"
            }]
        };
        var tableResponse = {
            "tableDataList": [{
                "productCode": "233946PGC",
                "productDescription": "CHV BRIGHTCUT AH METLWKG F",
                "packageCode": "5G18",
                "volume": 15.5,
                "displayVolume": "15.5"
            }, {
                "productCode": "227811DGC",
                "productDescription": "CHV DELO 50/50 ELC B",
                "packageCode": "55/2",
                "volume": 3.1,
                "displayVolume": "3.1"
            }]
        };
        var calendarObject = {
            label: "Date Range Selector"
        };

        $(".js-calendar-range").html(compiledCalendar(calendarObject));
        // $(".js-calendar").html(compiledCalendar({
        //     label: "Single Date Selector"
        // }));
        $(".js-defaultDdn").html(compiledDefaultDdn(dropdownDefaultJSON));
        $(".js-multipleSelectDdn").html(compiledDefaultDdn(dropdownMultiJSON));
        $(".js-searchableDdn").html(compiledDefaultDdn(dropdownSearchJSON));
        
        $(".js-pageSearchDdn").html(compiledDefaultDdn(pageSearchJSON));

        
        function cb(start, end) {
            $('.js-calendar-range span').html(start.format('MM-DD-YYYY') + ' - ' + end.format('MM-DD-YYYY'));
        }
        cb(moment().subtract(29, 'days'), moment());

        $('.js-calendar-range').daterangepicker({
            ranges: {
                'Today': [moment(), moment()],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            },
            'applyClass': 'btn-primary',
            'minDate': '05/05/2016'
        }, cb);

        $(window).on('resize', function(e) {
            var singleDatePicker = $('input[name="singleDatePicker"]');
            if ($(window).width() <= 480 && Modernizr.inputtypes.date) {

                if (singleDatePicker.data('daterangepicker'))
                    singleDatePicker.data('daterangepicker').remove();

                singleDatePicker.attr('type','date').val("");
            }else{

                singleDatePicker.attr('type','text').val("");

                singleDatePicker.daterangepicker({
                    singleDatePicker: true,
                    showDropdowns: true
                },
                function(start, end, label) {
                  // console.log(start, end);
                    // var years = moment().diff(start, 'years');
                    // alert("You are " + years + " years old.");
                });
            }
        }).resize();

        $(".js-sample-input").on("input", function(event){
            var $element = $(event.target);
            var value = $element.val().trim();
            if(isNaN(parseInt(value))){
               $(this).val('');
            }
            else{
              $(this).val(parseInt(value));
            }
        });

        $('.selectpicker').selectpicker('refresh');

        $("#js-textArea").charactersLeft();

        $(".js-sample-input").customValidate();

        $("#toggle").toggleSwitch();

        $.fn.bootstrapTable.locales = {
            formatLoadingMessage: function() {
                return cbp.indexPage.globalVars.tableLocales.loadingMessage;
            },
            formatPaginationSwitch: function() {
                return cbp.indexPage.globalVars.tableLocales.paginationSwitch;
            }
        };


        $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales);
        //Global Object manipulations
        cbp.indexPage.tableResponse = tableResponse;
        if (tableResponse.resultCount === undefined) {
            cbp.indexPage.globalVars.productsFoundVar = cbp.indexPage.globalVars.productsFound.replace("{0}", 0);
        } else {
            cbp.indexPage.globalVars.productsFoundVar = cbp.indexPage.globalVars.productsFound.replace("{0}", tableResponse.resultCount);
        }
        if (tableResponse.tableDataList === undefined) {
            cbp.indexPage.tableResponse.tableDataList = [];
        }
        purchaseVolume.init();
    });
});
