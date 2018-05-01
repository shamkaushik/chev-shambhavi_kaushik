require(["modernizr",
    "jquery",
    "bootstrap",
    "handlebars",
    "bootstrap-select",
    "bootstrap-table",
    "common",
    "text!app/components/dropdown/_defaultDdn.hbs",
    "text!app/page/report-1099/searchForm.hbs",
    "text!app/page/report-1099/bottomDetail.hbs",
    "text!app/page/report-1099/reportSummary.hbs",

], function(modernizr, $, bootstrap, Handlebars, bootstrapSelect, bootstrapTable, common, _defaultDdnHBS, _searchFormHBS, _bottomDetailHBS, _reportSummaryHBS) {

    //Compiling HBS templates
    var compiledDefaultDdn = Handlebars.compile(_defaultDdnHBS);
    var compiledsearchForm = Handlebars.compile(_searchFormHBS);
    var compiledBottomDetail = Handlebars.compile(_bottomDetailHBS);
    var compiledReportSummary = Handlebars.compile(_reportSummaryHBS);

    var report1099page = (function() {
        
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
            reportSummaryContainer: ".js-report-summary",
            printBtn: "#printBtn"
        };

        var populateAccountDropdown = function(){
            var options = [];
            for (var i = 0; i < accountList.length; i++) {
                var obj = {};
                obj["key"] = accountList[i].accountNumber;
                obj["value"] = accountList[i].accountAddress;
                options.push(obj);
            }
            cbp.report1099Page.accountDropDown["options"] = options;
        }

        var loadingInitialHbsTemplates = function() {
            //Appending handlebar templates to HTML
            $(config.searchFormContainer).html(compiledsearchForm(cbp.report1099Page));
            loadingDynamicHbsTemplates();
            $(config.displaySpinner).hide();
        };

        var loadingDynamicHbsTemplates = function() {
            $(config.searchDetailContainer).html(compiledBottomDetail(cbp.report1099Page));
            $(config.reportSummaryContainer).html(compiledReportSummary());
            $(config.accountDdnContainer).html(compiledDefaultDdn(cbp.report1099Page.accountDropDown));
            $(config.yearDdnContainer).html(compiledDefaultDdn(cbp.report1099Page.yearDropDown));
            $(config.qtrDdnContainer).html(compiledDefaultDdn(cbp.report1099Page.qtrDropDown));
            $(config.dropDownCommon).selectpicker('refresh');
            enableMobileDefaultDropDown();
        };

        var enableMobileDefaultDropDown = function() {
            //Enable mobile scrolling by calling $('.selectpicker').selectpicker('mobile'). This enables the device's native menu for select menus.
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
                $(config.dropDownCommon).selectpicker('mobile');
            }
        };

        var getTableColumns = function(){
            return [{
                field: 'site',
                title: 'Site',
                class: 'site-name',
                footerFormatter: function(){
                    return "<span><strong>Total</strong></span>";
                }
            }, {
                field: 'm1',
                title: 'January',
                class: 'text-right',
                footerFormatter: function(){
                    return "<span><strong>2,258,109.13</strong></span>";
                }
            },{
                field: 'm2',
                title: 'February',
                class: 'text-right',
                footerFormatter: function(){
                    return "<span><strong>2,258,109.13</strong></span>";
                }
            },{
                field: 'm3',
                title: 'March',
                class: 'text-right',
                footerFormatter: function(){
                    return "<span><strong>2,258,109.13</strong></span>";
                }
            }, {
                field: 'yeartodate',
                title: 'Year To Date (USD)',
                class: 'text-right',
                footerFormatter: function(){
                    return "<span><strong>12,258,109.13</strong></span>";
                }
            }];
        };

        var getTableData = function(){
            return [{
                site: '3017501 Redwood Oil Co. 7761 Old Redwood Highway',
                m1: '276,737.46',
                m2: '159,986.59',
                m3: '2,621,118.72',
                yeartodate: '477,528.78'
            }, {
                site: '3016754 Redwood Oil Co. 50 Professional CRT #100',
                m1: '276,737.46',
                m2: '159,986.59',
                m3: '2,621,118.72',
                yeartodate: '477,528.78'
            },{
                site: '3017501 Redwood Oil Co. 7761 Old Redwood Highway',
                m1: '276,737.46',
                m2: '159,986.59',
                m3: '2,621,118.72',
                yeartodate: '477,528.78'
            },{
                site: '3016754 Redwood Oil Co. 50 Professional CRT #100',
                m1: '276,737.46',
                m2: '159,986.59',
                m3: '2,621,118.72',
                yeartodate: '477,528.78'
            },];
        };

        var populatingTable = function(tablecol, tabledata){
            $('#table').bootstrapTable({
                classes: 'table table-no-bordered',
                striped: true,
                iconsPrefix: 'fa',
                parentContainer: ".js-bottom-detail",
                responsive: true,
                responsiveBreakPoint: 768,
                responsiveClass: "bootstrap-table-cardview",
                undefinedText: "",
                showFooter: true,
                columns: tablecol,
                data: tabledata
            });
        }

        var printPreview = '<html>'+
            '<head>'+
                '<meta charset="utf-8">'+
                '<meta http-equiv="X-UA-Compatible" content="IE=edge">'+
                '<meta name="viewport" content="width=device-width, initial-scale=1">'+
                '<link href="/assets/css/custom-bootstrap.css" rel="stylesheet" type="text/css"/>'+
                '<link href="/assets/css/app.css" rel="stylesheet" type="text/css"/>'+
                '<style>'+
                    '.custBody {'+
                    '    background-color: #ffffff;'+
                    '}'+
                    '.table {'+
                    '    max-width: 98%;'+
                    '    margin-left: 20px;'+
                    '}'+
                    '.nav-bottom {'+
                    '    border-bottom: none;'+
                    '}'+
                '</style>'+
            '</head>'+
            '<body class="custBody">'+
                '<div class="wrapper">'+
                    '<header class="main-header main-header-md js-header" style="">'+
                        '<div class="nav-bottom">'+
                            '<nav class="main-navigation js-enquire-offcanvas-navigation" role="navigation">'+
                                '<div class="row">  <a class="navbar-brand navbar-left" href="/index.html"> <img alt="Brand" src="/assets/images/logo.png">'+
                                '<span>business point</span> </a> <a class="navbar-brand navbar-right" href="/index.html"> <img alt="Brand" src="/assets/images/fob-color-rgb.png">  </a>'+
                                '</div>'+
                            '</nav>'+
                        '</div>'+
                    '</header>'+
                '</div>'+
            '</body>'+
            '</html>';

        var bindEvents = function(){
            $(document).on('click', config.printBtn, function(){
                var printPreviewSummary = compiledReportSummary();
                var win = window.open('', '_blank', 'PopUp' + ',width=1300,height=800');
                win.document.write(printPreview);
                //win.document.write('\n                <html>\n                    <head>\n                        <meta charset="utf-8">\n                        <meta http-equiv="X-UA-Compatible" content="IE=edge">\n                        <meta name="viewport" content="width=device-width, initial-scale=1">\n                        <link href="/assets/css/custom-bootstrap.css" rel="stylesheet" type="text/css"/>\n                        <link href="/assets/css/app.css" rel="stylesheet" type="text/css"/>\n                        <style>\n                         .custBody {\n                            background-color: #ffffff;\n                          }\n                        .order-history-view-headerLabel {\n                            color: #009dd9;\n                            font-weight: bold;\n                                                                                                     font-size: 20px;\n                            margin-left: 22px;\n                                                                                                     padding: 0 0 0px 0;\n                        }\n\t\t\t\t\t\t.table{\n\t\t\t\t\t\t\tmax-width:98%;\n\t\t\t\t\t\t\tmargin-left:20px;\n}\t\n.nav-bottom{\n                                                                                                     border-bottom: none;\n                                                                                      }\n                                                                                      .navbar-brand{\n                                                                                                     \n                                                                                      }\n                                                                                      .fixed-table-body{\n                                                                                                     height:auto !important;\n                                                                                      }\n                        </style>\n                    </head>\n                    <body class="custBody">\n                        <div class="wrapper">\n                            <header class="main-header main-header-md js-header" style="">\n                                <div class="nav-bottom">\n                                    <nav class="main-navigation js-enquire-offcanvas-navigation" role="navigation">\n                                                                                                                                                \n                                        <div class="row">                                            \n                                                <a class="navbar-brand navbar-left" href="/index.html">\n                                                    <img alt="Brand" src="/assets/images/logo.png">\n                                                    <span>business point</span>\n                                                </a>\n                                                                                                                                                                               <a class="navbar-brand navbar-right" href="/index.html">\n                                                    <img alt="Brand" src="/assets/images/fob-color-rgb.png">                                                    \n                                                </a>\n                                            </div>                                                                                                                                                  \n                                        \n                                    </nav>\n                                </div>\n                            </header>\n                            </div>\n                    </body>\n                </html>\n                ');
                win.document.write(printPreviewSummary);
                win.document.write($(".tableContainer").html());
                win.document.close();
            });
        }

        var init = function() {
            populateAccountDropdown();
            loadingInitialHbsTemplates();
            populatingTable(getTableColumns(), getTableData());
            bindEvents();
        };

        return {
            init: init
        };
    })();

    $(document).ready(function() {
        report1099page.init();
        leftPaneExpandCollapse.init();
    });
});