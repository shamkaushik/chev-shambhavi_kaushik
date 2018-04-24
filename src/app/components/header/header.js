var CBP = {
    config: {}
};
var screenXs = "480px";
var screenSm = "640px";
var screenMd = "1024px";
var screenLg = "1400px";

var screenXsMin = "480px";
var screenSmMin = "640px";
var screenMdMin = "1024px";
var screenLgMin = "1400px";

var screenXsMax = "639px";
var screenSmMax = "1023px";
var screenMdMax = "1399px";

var leftPaneExpandCollapse = (function(){
  //Private
  var config = {
    searchBar : ".search",
    expandSearch : ".search-collapse",
    collapseSearch : ".search .fa-close",
    rightPanel : ".right-pane",
    toggleSearchMobile : ".toggle-search-mobile",
    leftPanel : ".left-pane",
    searchForm : ".search-content"
  };

  var hideSearchBar = function(){
    $(config.expandSearch).removeClass("hidden-md");
    $(config.searchBar).removeClass("visible-md-inline-block search-expand").addClass("hidden-md");
    $(config.rightPanel).removeClass("col-md-offset-1");
  };

  var showSearchBar = function(){
    $(this).addClass("hidden-md");
    $(config.searchBar).addClass("visible-md-inline-block search-expand").removeClass("hidden-md");
    $(config.rightPanel).addClass("col-md-offset-1");
  };

  var resetSearchFormHeight = function(){
    if ($(window).width() > 1023) {
        // 571px
        if($(config.rightPanel).height() > 571){
          $(config.leftPanel).find(config.searchForm).css('min-height', $(config.rightPanel).height() + 'px');
        }
        else{
          if($(config.rightPanel).height() <= $(config.leftPanel).height()){
            $(config.rightPanel).css('min-height', $(config.leftPanel).height() + 'px');
          }else{
            $(config.rightPanel).height('auto');
            $(config.leftPanel).find(config.searchForm).css('min-height', '571px');
          }

        }
    }else{
        $(config.leftPanel).find(config.searchForm).css('min-height', '0px');
        $(config.leftPanel).find(config.searchForm).height('auto');
    }
  };

  // Public
  var init = function(){
    $(config.collapseSearch).on("click",hideSearchBar);
    $(window).resize(function(){
      hideSearchBar();
      resetSearchFormHeight();
    });
    $(config.expandSearch).on("click",showSearchBar);
    $(config.toggleSearchMobile).on("click", function(){
      $(".search-form").toggleClass("show");
      $(this).find(".fa-chevron-down").toggleClass("close-icon");
    });

    $(document).on("click", ".search-form button.btn-primary", function(){
        $(".search-form").removeClass("show");
        $(config.toggleSearchMobile).find(".fa-chevron-down").removeClass("close-icon");
    });
    resetSearchFormHeight();
  };


  return {
    init: init,
    hideSearchBar: hideSearchBar,
    showSearchBar: showSearchBar,
    resetSearchFormHeight: resetSearchFormHeight
  };

})();


require(["enquire", "hoverIntent", "bootstrap-select", "bootstrap-dialog"], function(enquire, hoverIntent, bootstrapSelect, bootstrapDialog) {

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
				// Event listener for clicking SAML SSO links
				$(document).on("click", ".saml-link", function(){
					var samlFormId = $(this).data('form-target');
					var samlForm = $('#' + samlFormId);
					if (typeof samlForm != undefined) {
						var authUrl = samlForm.data("auth-url");
						if (typeof authUrl != undefined) {     
							// Make AJAX call to retrieve the SAMLResponse
							$.ajax({
								type: "POST",
								url: authUrl,
								dataType: "json",
								async: false,
								success: function(response) {
									// Upon successful response, populate the SAMLResponse and submit the SSO form
									samlForm.find('input[name=SAMLResponse]').val(response.assertionXML);
									samlForm.attr('action', response.acsURL);
									samlForm.submit();
								},
								error : function() {
									console.log("Error while retrieving SAML token.");
								}
							});    					
						}						
					}
				});
		
		
			// content-search component
            $("#categorySelectName").selectpicker("refresh");
            $("#contentTypeSelectName").selectpicker("refresh");
            
            //hybris order lubricant component
            $('[data-toggle="tooltip"]').tooltip();

            if(typeof(selectDdn) != "undefined" && $("#quick-order-location") ){
                $.fn.selectpicker.defaults = {
                          noneResultsText: selectDdn.noneResultsText
                };
            }

            $("#quick-order-location").selectpicker('refresh');

            if($("#shipToAddress").val() === ""){
                if($("#quick-order-location").val()){
                    $("#shipToAddress").val($("#quick-order-location").val());
                    $("#displayButton").tooltip('disable');
                }else{
                    $("#displayButton").addClass("disabled");
                }
            }else{
                $("#quick-order-location").val($("#shipToAddress").val()).selectpicker('refresh');
                $("#displayButton").tooltip('disable');
            }

            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
                $(".selectpicker").selectpicker('mobile');
            }

            $(document).on("click","#displayButton", function(){
                if($(this).hasClass("disabled")){
                    return false;
                }
            });

            $(document).on("changed.bs.select change","#quick-order-location", function(){
                $("#shipToAddress").val($(this).val());
                $("#displayButton").removeClass("disabled").tooltip('disable');
            });

            //End of hybris order lubricant component
            if(typeof(dynamicHeader) === "undefined"){
                setTimeout(function(){
                    CBP.global.bindToggleOffcanvas();
                    CBP.global.bindHoverIntentMainNavigation();
                    CBP.global.backToHome();
                    CBP.global.offcanvasNavigation();
                }, 300);
            }

          // below code is for Order alert notifications

              $(".info_link").on('click', function(e) {
                    e.preventDefault();
                    var str = $(this).attr('data-code');
                    callOrderDetails($(this).attr('data-code'), $(this).attr('data-order-status'));
                  });
              function callOrderDetails(orderID, orderStatus) {
                  $('#orderDetailsForm #orderId').val(orderID);
                  $('#orderDetailsForm #orderStatus').val(orderStatus);
                  $('#orderDetailsForm #hybrisOrder').val(true);
                  $('#orderDetailsForm').submit();
                }
        //end of order alert notifications related code.
              
        $(document).on("click","#lang_form_LangCurrencyComponent a", function(){
            var langSelected = $(this).parent().data("value");
            $("#code").val(langSelected);
            if (window.location.search) {
                $("#search").val(window.location.search);
            }
            $("#lang_form_LangCurrencyComponent").submit();
        });

        //Based on hidden variable enabled/disabled cart
        var noOfItems = $("#cartProductCount").val();
        var cartCounter = $('.cartCounter');
        var viewCartLink = $('.viewCartLink');


        if (noOfItems == 0) {
            cartCounter.addClass('cartCounterDisabled');
            viewCartLink.addClass('disableViewCart');
        } else {
            cartCounter.removeClass('cartCounterDisabled');
        }

        $(document).on("click","a.disableViewCart", function(){
            return false;
        });        

        //Hybris Carousel Component functionality

        $(".carousel").find("div.item:eq(0)").addClass("active");

        $(document).on("click",".carousel-indicators span", function(){
            var carousel = $(this).parents(".carousel");
            if($(this).hasClass('pauseBtn')){
                carousel.carousel('pause');
                $(this).removeClass('pauseBtn').addClass('playBtn');
            }else{
                carousel.carousel('cycle');
                $(this).removeClass('playBtn').addClass('pauseBtn');
            }
        });

        enquire.register("screen and (min-width:" + screenMdMin + ")", {
            match: function() {
              // desktop..
                $(".carousel").carousel().addClass('slide');

                $(".carousel .carousel-caption").each(function(){
                    if($(this).parent().hasClass('data-text')){
                        ellipsCarousel($(this).find(".title"), 180);
                        ellipsCarousel($(this).find(".description"), 400);

                    }else if($(this).parent().hasClass('data-video')){
                        ellipsCarousel($(this).find(".title"), 100);

                    }else{
                        ellipsCarousel($(this).find(".title"), 90);
                        ellipsCarousel($(this).find(".description"), 700);
                    }
                });

            }
        });

        enquire.register("screen and (max-width:" + screenMdMin + ")", {
          match: function() {
            // mobile...
              $(".carousel").removeAttr('data-ride').removeClass('slide');

                $(".carousel .carousel-caption").each(function(){
                    if($(this).parent().hasClass('data-text')){
                        ellipsCarousel($(this).find(".title"), 180);
                        ellipsCarousel($(this).find(".description"), 400);

                    }else if($(this).parent().hasClass('data-video')){
                        ellipsCarousel($(this).find(".title"), 100);

                    }else{
                        ellipsCarousel($(this).find(".title"), 60);
                        ellipsCarousel($(this).find(".description"), 200);
                    }
                });

            }
          });

          function ellipsCarousel(el, allowedLength) {
            var val =  el.data("title") || el.data("desc");
            if (val){
              if(val.length > allowedLength)
                el.html(val.substring(0,allowedLength) + '...');
              else
                el.html(val);
            }
          }

          function playVideo (data) {
            $("div.carousel").carousel('pause'); //videoUrl, encryptionType, encryptionCode

            var video_url = data.videoUrl;
            var enc_type = data.encryptionType;
            var enc_token = data.encryptionCode;
            var dialog = new bootstrapDialog({
                message: function(dialogRef) {
                    var $modalContent = $('<div></div>');
                    var $button = $('<a class="fa fa-close video-close"></a>');
                    // var $message = $('<video width="570" autoplay controls>' +
                    //   '<source src="'+ video_url +'" type="video/mp4">' +
                    //   'Video not supported' +
                    // '</video>');
                    var $message = $('<video id="azuremediaplayer" class="azuremediaplayer amp-default-skin amp-big-play-centered"></video>');

                    $button.on('click', {dialogRef: dialogRef}, function(event){
                        event.data.dialogRef.close();
                    });

                    $modalContent.append($button);
                    $modalContent.append($message);

                    return $modalContent;
                },
                onhide: function(dialogRef){
                  $("div.carousel").carousel('cycle');
                  myPlayer.dispose();
                },
                closable: true
            });
            dialog.realize();
            dialog.getModalHeader().hide();
            dialog.getModalFooter().hide();
            dialog.getModalBody().css('background-color', '#000');
            dialog.getModalBody().css('padding', '40px');
            // dialog.getModalBody().addClass('success-modal');
            dialog.open();

            var myOptions = {
                "logo": { "enabled": false },
                "nativeControlsForTouch": false,
                controls: true,
                autoplay: true,
                width: "auto",
                height: "auto",
            };
            setTimeout(function(){
                myPlayer = amp("azuremediaplayer", myOptions);
                myPlayer.src([
                        {
                                "src": video_url,
                                "type": "application/vnd.ms-sstr+xml",
                                "protectionInfo": [
                                        {
                                                "type": enc_type,
                                                "authenticationToken": enc_token
                                        }
                                ]
                        }
                ]);
            }, 500);
          }
          function loadCss(url) {
              var link = document.createElement("link");
              link.type = "text/css";
              link.rel = "stylesheet";
              link.href = url;
              document.getElementsByTagName("head")[0].appendChild(link);
          }

          function loadScript( url, response ) {
            var script = document.createElement( "script" );
            script.type = "text/javascript";
            if(script.readyState) {  //IE
              script.onreadystatechange = function() {
                if ( script.readyState === "loaded" || script.readyState === "complete" ) {
                  script.onreadystatechange = null;
                  $(".overlay-wrapper").hide();
                  playVideo(response);
                }
              };
            } else {  //Others
              script.onload = function() {
                $(".overlay-wrapper").hide();
                playVideo(response);
              };
            }

            script.src = url;
            document.getElementsByTagName( "head" )[0].appendChild( script );
          }

        //Play video on click of play button for video item
        $(document).on('click',".data-video .video-icon,.data-video .play-video", function(){

            $(".overlay-wrapper").show();
            var videoAssetId = $(this).parent().data("assetId");

            $.ajax({
                type: "GET",
                url: videoAjaxUrl,
                data : {assetId: videoAssetId},
                success: function(response) {
                    // $(".overlay-wrapper").hide();
                    if(response.videoUrl === undefined || response.videoUrl === null || response.videoUrl === ""){
                        alert("Failed to load Video");
                        $(".overlay-wrapper").hide();
                    }else{
                        // playVideo(response);
                        if (typeof(amp) === "undefined") {
                          loadCss('//amp.azure.net/libs/amp/1.7.4/skins/amp-default/azuremediaplayer.min.css');
                          loadScript('//amp.azure.net/libs/amp/1.7.4/azuremediaplayer.min.js', response);
                        }
                        else{
                          playVideo(response);
                          $(".overlay-wrapper").hide();
                        }
                    }
                },
                error : function() {
                    $(".overlay-wrapper").hide();
                    alert("Failed to load Video");
                }
            });


        });

        (function ($) {
            $.each(['show', 'hide'], function (i, ev) {
              var el = $.fn[ev];
              $.fn[ev] = function () {
                this.trigger(ev);
                return el.apply(this, arguments);
              };
            });
        })(jQuery);

        if(typeof(spinnerTimeoutVal) !== 'undefined'){
            $(document).on('show', ".overlay-wrapper", function() {
                $(this).find("span").remove();
                setTimeout(function(){
                  $(".overlay-wrapper").html('<span>'+ spinnerText +'</span>');
                },spinnerTimeoutVal);
            });

            $(document).on('hide', ".overlay-wrapper", function() {
                $(this).find("span").remove();
            }); 
        }

        // Code for google analytics   
        (function(i, s, o, g, r, a, m) {
            i['GoogleAnalyticsObject'] = r;
            i[r] = i[r] || function() {
                (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = 1 * new Date();
            a = s.createElement(o),
            m = s.getElementsByTagName(o)[0];
            a.async = 1;
            a.src = g;
            m.parentNode.insertBefore(a, m)
        })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
        ;

        var component_selector = ".default-page .business-links-subcategory a,.sticky-nav-top,.accountnavigationcollectioncomponent,accountNav ul li,disp-img a,prod_cat .title,.home-page .item.active,.business-links-item,faq-qrg .faq-slot,faq-qrg .qrg-slot,.business-links-component,.faq-wrap .faq-answer,.notify-attention-block .notification-text ul li a,.notify-invoice-block .badge,.notify-invoice-block .order-notification li a,.notify-invoice-block,.title,.notify-system-block, .listingPage .list-results-title a, .js-in-preview-session, .qrg-wrap a span, .cmsimage,.tabHead, .js-footer ul li, .sub-navigation-list li, .cartCounter, .js-sticky-user-group, .nav-pills li, .orderSeaarchPage,a.scrollerProduct div, .scroller, .slider_component,.siteSearch,a.img-responsive";
        var button_selector = ".viewcart-page #submitBtn,.ordersimulatecheckout-page #submitButton,.viewcart-page #simulateBtn,.od-page #modifyCartButton,.od-page #cancelOrderButton,.od-page #reOrderButton,.page-my-account #saveAccount,.eftSearch-page .js-downloadBtn,.eftSearch-page .iconsPrintDownload,.invoices-page .js-downloadBtn,.invoices-page .iconsPrintDownload,.soa-page #printBtn,.page-purchasedvolume #printBtn,.invoices-page .js-payInvBtn,a[data-name='Drum and Pail Label System'],.msa-detail #uploadButton";
        
        
        var userLocation = function() {
        	
        	if(typeof(gaTrackid) === 'undefined'){
                gaTrackid = 'UA-101103598-1';
            }
        	
            ga('create', gaTrackid, 'none');
            
            ga('set', 'userId', userPK); // Set the user ID using signed-in user_id.
            
            if(optInAnalytics){
            	ga('send','pageview',{
                    'dimension4':window.location.pathname.split("?")[0].split("/").pop(),
                    'dimension2':countryCode, //countryCode,
                    'dimension5':regionCode, //regionCode
                    'dimension6':defaultB2BUnitUid, //defaultB2BUnitUid
                    'dimension7':userPK //userPK
                });
            }
            
            
        };

        countryCode ='USA';
        regionCode = "NA";
        gaTrackid = "1234567";
        userPK = "hello";
        optInAnalytics = true;
        defaultB2BUnitUid = '12345';
        
        var checkCountry = setInterval(function(){
            if(countryCode != undefined && regionCode != undefined && gaTrackid != undefined){
                clearInterval(checkCountry);
                userLocation();
            }
        },1000);

        $(document).on("click",component_selector,function(){
           ga('set', 'userId', userPK); // Set the user ID using signed-in user_id.
           if(optInAnalytics){
           ga('send', {
              hitType: 'event',
              eventCategory: 'Component',
              eventAction: 'Click',
              eventLabel:$(this).data('title'),
              dimension1: $(this).data('title'),
              dimension2:countryCode, //countryCode,
              dimension5:regionCode, //regionCode
              dimension6:defaultB2BUnitUid, //defaultB2BUnitUid
              dimension7:userPK //userPK
            });
           }
        });

        $(document).on("click",button_selector,function(){
            ga('set', 'userId', userPK); // Set the user ID using signed-in user_id.
            if(optInAnalytics){
            ga('send', {
              hitType: 'event',
              eventCategory: 'Button',
              eventAction: 'Click',
              eventLabel:$(this).data('name'),
              dimension3: $(this).data('name'),
              dimension2:countryCode, //countryCode,
              dimension5:regionCode, //regionCode
              dimension6:defaultB2BUnitUid, //defaultB2BUnitUid
              dimension7:userPK //userPK
            });
            }
        });
        
        // B-30606
        function sendHeartBeat() {
            console.log("Sending heart beat...");
            
            $.ajax({
                type: "GET",
                url: "/sf/cbpSessionHeartbeat",
                success: function(response) {
                	receivedData = true;
                	console.log("Heartbeat was processed successfully.");
                },
                error : function() {
                    console.log("Error while sending heartbeat.");
                }
            });
            
        }

        // B-30606
        if (typeof sessionHeartbeatInterval !== 'undefined'
        	&& sessionHeartbeatInterval > 0) {
        	sendHeartBeat();
			setInterval(function(){ 
				sendHeartBeat();
			}, sessionHeartbeatInterval);        
        }
});
});