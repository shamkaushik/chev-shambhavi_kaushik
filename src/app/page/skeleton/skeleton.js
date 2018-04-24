require(["modernizr",
    "jquery",
    "bootstrap",
    "handlebars",
    "text!app/components/header/_header.hbs",
    "text!app/components/footer/_footer.hbs",
    "text!app/components/calendar/_calendar.hbs",
    "text!app/components/dropdown/_defaultDdn.hbs"

], function(modernizr, $, bootstrap, Handlebars, _headerHBS, _footerHBS, _calendarHBS, _defaultDdnHBS) {

    var compiledHeader = Handlebars.compile(_headerHBS);
    var compiledFooter = Handlebars.compile(_footerHBS);

    $(document).ready(function() {

        $(".js-header").html(compiledHeader({}));
        $(".js-footer").html(compiledFooter({}));
		$(".overlay-wrapper").hide();
		leftPaneExpandCollapse.init(); 
    });

    
});

