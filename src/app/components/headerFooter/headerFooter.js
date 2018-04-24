var selectDdn = {};
selectDdn.noneResultsText = "No result matched {0}";
var videoAjaxUrl = "/assets/json/videoResponse.json";
var dynamicHeader = true;
require(["modernizr",
    "jquery",
    "bootstrap",
    "handlebars",
    "bootstrap-select",
    "text!app/components/header/_header.hbs",
    "text!app/components/footer/_footer.hbs"

], function(modernizr, $, bootstrap, Handlebars, bootstrapSelect, _headerHBS, _footerHBS) {

    var compiledHeader = Handlebars.compile(_headerHBS);
    var compiledFooter = Handlebars.compile(_footerHBS);
    CBP.global = {

    _autoload: [
        "bindToggleOffcanvas",
        "bindHoverIntentMainNavigation",
        "backToHome",
        "offcanvasNavigation",
        "myAccountNavigation"
    ],

    bindToggleOffcanvas: function() {
        $(document).on("click", ".js-toggle-sm-navigation", function() {
            CBP.global.toggleClassState($("main"), "offcanvas");
            CBP.global.toggleClassState($("html"), "offcanvas");
            CBP.global.toggleClassState($("body"), "offcanvas");
        });
    },

    toggleClassState: function($e, c) {
        $e.hasClass(c) ? $e.removeClass(c) : $e.addClass(c);
        return $e.hasClass(c);
    },

    bindHoverIntentMainNavigation: function() {
        var $mainNav = $('.main-navigation');
        var $topLinksHaveSub = $mainNav.find('.js-enquire-has-sub');
        var totalTopLinks = $topLinksHaveSub.length;

        for (var i = 0; i < totalTopLinks; i++){
            var $subNavSection = $topLinksHaveSub.eq(i).find('.sub-navigation-section');
            var ttlSubNav = $subNavSection.length;
            
            //code to check if subsection element having child nodes or not, if not then remove subsection
            var removeSubNavSectionIndex = 0;

            for (var j = ttlSubNav-1; j >= 0 ; j--){
                if($subNavSection.eq(j).find('li').length === 0){
                    $subNavSection.eq(j).remove();
                    removeSubNavSectionIndex++;
                }
            }

            if(removeSubNavSectionIndex > 0){
                $subNavSection = $topLinksHaveSub.eq(i).find('.sub-navigation-section');
                ttlSubNav = $subNavSection.length;
            }
            //end of removing subsection

            var subNavigationHtml = "";
            if(ttlSubNav >= 3 && ttlSubNav < 9){
                for (var j = 0; j < ttlSubNav; j++){
                    subNavigationHtml += '<div class="sub-navigation-section">';
                    if($subNavSection.eq(j).html()){
                        subNavigationHtml += $subNavSection.eq(j).html();
                    }
                    j++;
                    if($subNavSection.eq(j).html()){
                        subNavigationHtml += $subNavSection.eq(j).html();
                    }
                    subNavigationHtml += "</div>";
                }
                $topLinksHaveSub.eq(i).find('div.row').html(subNavigationHtml);
            }else if(ttlSubNav >= 9){
                var len = ttlSubNav;
                for (var j = 0; j < ttlSubNav; j++){
                    subNavigationHtml += '<div class="sub-navigation-section">';
                    if($subNavSection.eq(j).html()){
                        subNavigationHtml += $subNavSection.eq(j).html();
                    }
                    j++;
                    if($subNavSection.eq(j).html()){
                        subNavigationHtml += $subNavSection.eq(j).html();
                    }
                    if( ((j+2) % 3) == 0 && (len % 4 > 0 || ttlSubNav % 4 == 0)){
                        len--;
                        j++;
                        if($subNavSection.eq(j).html()){
                            subNavigationHtml += $subNavSection.eq(j).html();
                        }
                    }
                    subNavigationHtml += "</div>";
                }
                $topLinksHaveSub.eq(i).find('div.row').html(subNavigationHtml);
            }

        }

        enquire.register("screen and (min-width:" + screenMdMin + ")", {

            match: function() {
                $("nav.main-navigation > ul > li").hoverIntent(function() {
                    var $this = $(this),
                        itemWidth = $this.width();
                    var $subNav = $this.find('.sub-navigation'),
                        subNavWidth = $subNav.outerWidth();
                    var mainNavWidth = $mainNav.width();

                    // get the left position for sub-navigation to be centered under each <li>
                    var leftPos = $this.position().left + itemWidth / 2 - subNavWidth / 2;
                    // get the top position for sub-navigation. this is usually the height of the <li> unless there is more than one row of <li>
                    var topPos = $this.position().top + $this.height();

                    if (leftPos > 0 && leftPos + subNavWidth < mainNavWidth) {
                        // .sub-navigation is within bounds of the .main-navigation
                        $subNav.css({
                            "left": leftPos,
                            "top": topPos,
                            "right": "auto"
                        });
                    } else if (leftPos < 0) {
                        // .suv-navigation can't be centered under the <li> because it would exceed the .main-navigation on the left side
                        $subNav.css({
                            "left": 0,
                            "top": topPos,
                            "right": "auto"
                        });
                    } else if (leftPos + subNavWidth > mainNavWidth) {
                        // .suv-navigation can't be centered under the <li> because it would exceed the .main-navigation on the right side
                        $subNav.css({
                            "right": 0,
                            "top": topPos,
                            "left": "auto"
                        });
                    }
                    $this.addClass("md-show-sub");
                    $this.find('input.txt-search-box').focus();
                }, function() {
                    $(this).removeClass("md-show-sub");
                });
            },

            unmatch: function() {
                // on screens smaller than screenMdMin (1024px) remove inline styles from .sub-navigation and remove hoverIntent
                $("nav.main-navigation > ul > li .sub-navigation").removeAttr("style");
                $("nav.main-navigation > ul > li").hoverIntent(function() {
                    // unbinding hover
                });
            }

        });
    },

    backToHome: function() {
        $(".backToHome").on("click", function() {
            var sUrl = CBP.config.contextPath;
            window.location = sUrl;
        });
    },
    offcanvasNavigation: function() {

        enquire.register("screen and (max-width:" + screenSmMax + ")", {

            match: function() {

                $(document).on("click", ".js-enquire-offcanvas-navigation .js-enquire-has-sub > a", function(e) {
                    e.preventDefault();
                    $(".js-userAccount-Links").hide();
                    $(".js-enquire-offcanvas-navigation > ul.js-offcanvas-links").addClass("active");
                    $(".js-enquire-offcanvas-navigation .js-enquire-has-sub").removeClass("active");
                    $(this).parent(".js-enquire-has-sub").addClass("active");
                });


                $(document).on("click", ".js-enquire-offcanvas-navigation .js-enquire-sub-close", function(e) {
                    e.preventDefault();
                    $(".js-userAccount-Links").show();
                    $(".js-enquire-offcanvas-navigation > ul.js-offcanvas-links").removeClass("active");
                    $(".js-enquire-offcanvas-navigation .js-enquire-has-sub").removeClass("active");
                });

            },

            unmatch: function() {

                $(".js-enquire-offcanvas-navigation > ul.js-offcanvas-links").removeClass("active");
                $(".js-enquire-offcanvas-navigation .js-enquire-has-sub").removeClass("active");

                $(document).off("click", ".js-enquire-offcanvas-navigation .js-enquire-has-sub > a");
                $(document).off("click", ".js-enquire-offcanvas-navigation .js-enquire-sub-close");


            }


        });

    },

    myAccountNavigation: function() {

        //copy the site logo
        $('.js-mobile-logo').html($('.js-site-logo a').clone());

        //Add the order form img in the navigation
        $('.nav-form').html($('<span class="glyphicon glyphicon-list-alt"></span>'));


        var aAcctData = [];
        var sSignBtn = "";

        //my account items
        var oMyAccountData = $(".accNavComponent");

        //the my Account hook for the desktop
        var oMMainNavDesktop = $(".accNavComponentAccount > ul");

        //offcanvas menu for tablet/mobile
        var oMainNav = $(".main-navigation > ul.nav.nav-pills");

        if (oMyAccountData) {
            var aLinks = oMyAccountData.find("a");
            for (var i = 0; i < aLinks.length; i++) {
                aAcctData.push({
                    link: aLinks[i].href,
                    text: aLinks[i].title
                });
            }
        }

        var navClose = '';
        navClose += '<div class="close-nav">';
        // modified class from glyphicon to fontAwesome below
        navClose += '<button type="button" class="js-toggle-sm-navigation btn"><span class="fa fa-close"></span></button>';
        navClose += '</div>';

        //create Sign In/Sign Out Button
        if ($(".liOffcanvas a") && $(".liOffcanvas a").length > 0) {
            sSignBtn += '<li class=\"auto liUserSign\" ><a class=\"userSign\" href=\"' + $(".liOffcanvas a")[0].href + '\">' + $(".liOffcanvas a")[0].innerHTML + '</a></li>';
        }

        //create Welcome User + expand/collapse and close button
        //This is for mobile navigation. Adding html and classes.
        var oUserInfo = $(".md-secondary-navigation ul li.logged_in");
        //Check to see if user is logged in
        if (oUserInfo && oUserInfo.length === 1) {
            var sUserBtn = '';
            sUserBtn += '<li class=\"auto \">';
            sUserBtn += '<div class=\"userGroup\">';
            sUserBtn += '<span class="glyphicon glyphicon-user myAcctUserIcon"></span>';
            sUserBtn += '<div class=\"userName\">' + oUserInfo[0].innerHTML + '</div>';
            if (aAcctData.length > 0) {
                sUserBtn += '<a class=\"collapsed js-nav-collapse\" id="signedInUserOptionsToggle" data-toggle=\"collapse\"  data-target=\".offcanvasGroup1\">';
                sUserBtn += '<span class="glyphicon glyphicon-chevron-up myAcctExp"></span>';
                sUserBtn += '</a>';
            }
            sUserBtn += '</div>';
            sUserBtn += navClose;

            $('.js-sticky-user-group').html(sUserBtn);


            $('.js-userAccount-Links').append(sSignBtn);
            $('.js-userAccount-Links').append($('<li class="auto"><div class="myAccountLinksContainer js-myAccountLinksContainer"></div></li>'));


            //FOR DESKTOP
            var myAccountHook = $('<a class=\"myAccountLinksHeader collapsed js-myAccount-toggle\" data-toggle=\"collapse\" data-parent=".md-secondary-navigation" href=\"#accNavComponentDesktopOne\">' + oMyAccountData.data("title") + '</a>');
            myAccountHook.insertBefore(oMyAccountData);

            //FOR MOBILE
            //create a My Account Top link for desktop - in case more components come then more parameters need to be passed from the backend
            var myAccountHook = [];
            myAccountHook.push('<div class="sub-nav">');
            myAccountHook.push('<a id="signedInUserAccountToggle" class=\"myAccountLinksHeader collapsed js-myAccount-toggle\" data-toggle=\"collapse\" data-target=".offcanvasGroup2">');
            myAccountHook.push(oMyAccountData.data("title"));
            myAccountHook.push('<span class="glyphicon glyphicon-chevron-down myAcctExp"></span>');
            myAccountHook.push('</a>');
            myAccountHook.push('</div>');

            $('.js-myAccountLinksContainer').append(myAccountHook.join(''));

            //add UL element for nested collapsing list
            $('.js-myAccountLinksContainer').append($('<ul data-trigger="#signedInUserAccountToggle" class="offcanvasGroup2 offcanvasNoBorder collapse js-nav-collapse-body subNavList js-myAccount-root sub-nav"></ul>'));


            //offcanvas items
            //TODO Follow up here to see the output of the account data in the offcanvas menu
            for (var i = aAcctData.length - 1; i >= 0; i--) {
                var oLink = oDoc.createElement("a");
                oLink.title = aAcctData[i].text;
                oLink.href = aAcctData[i].link;
                oLink.innerHTML = aAcctData[i].text;

                var oListItem = oDoc.createElement("li");
                oListItem.appendChild(oLink);
                oListItem = $(oListItem);
                oListItem.addClass("auto ");
                $('.js-myAccount-root').append(oListItem);
            }

        } else {
            var navButtons = (sSignBtn.substring(0, sSignBtn.length - 5) + navClose) + '</li>';
            $('.js-sticky-user-group').html(navButtons);
        }

        //desktop
        for (var i = 0; i < aAcctData.length; i++) {
            var oLink = oDoc.createElement("a");
            oLink.title = aAcctData[i].text;
            oLink.href = aAcctData[i].link;
            oLink.innerHTML = aAcctData[i].text;

            var oListItem = oDoc.createElement("li");
            oListItem.appendChild(oLink);
            oListItem = $(oListItem);
            oListItem.addClass("auto col-md-4");
            oMMainNavDesktop.get(0).appendChild(oListItem.get(0));
        }

        //hide and show contnet areas for desktop
        $('.accNavComponentAccount').on('shown.bs.collapse', function() {

            if ($('.accNavComponentCompany').hasClass('in')) {
                $('.js-myCompany-toggle').click();
            }

        });

        $('.accNavComponentCompany').on('shown.bs.collapse', function() {

            if ($('.accNavComponentAccount').hasClass('in')) {
                $('.js-myAccount-toggle').click();
            }

        });

        //change icons for up and down


        $('.js-nav-collapse-body').on('hidden.bs.collapse', function(e) {

            var target = $(e.target);
            var targetSpan = target.attr('data-trigger') + ' > span';
            if (target.hasClass('in')) {
                $(targetSpan).removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
            } else {
                $(targetSpan).removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
            }

        });

        $('.js-nav-collapse-body').on('show.bs.collapse', function(e) {
            var target = $(e.target);
            var targetSpan = target.attr('data-trigger') + ' > span';
            if (target.hasClass('in')) {
                $(targetSpan).removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');

            } else {
                $(targetSpan).removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
            }

        });

        //$('.offcanvasGroup1').collapse();


    }


};
    $(document).ready(function() {
        $(".js-header").html(compiledHeader({}));
        $(".js-footer").html(compiledFooter({}));
        CBP.global.bindToggleOffcanvas();
        CBP.global.bindHoverIntentMainNavigation();
        CBP.global.backToHome();
        CBP.global.offcanvasNavigation();
    });
});

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
function loadCss(url) {
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    document.getElementsByTagName("head")[0].appendChild(link);
}

if(getParameterByName('lang') == 'th'){
    loadCss('/assets/css/custom-bootstrap_th.css');
    loadCss('/assets/css/app_th.css');
}