require(["modernizr",
    "jquery",
    "bootstrap",
    "handlebars",
    "moment",
    "text!app/components/dropdown/_defaultDdn.hbs"

], function(modernizr, $, bootstrap, Handlebars, moment, _defaultDdnHBS) {
    
    var config = {
        keyWordTxtBox: ".js-search-keywords",
        searchButton: "#contentSearch",
        categoryddn: "#categorySelectName",
        contentddn: "#contentTypeSelectName",
        displaySpinner: ".overlay-wrapper"
    }
    
    $(document).on("change", "#quick-order-location", function () {
	    var shipToAddress = $("#quick-order-location").val();
	    shipToChangeAjax(shipToAddress);
	});

	var shipToChangeAjax = function (shipToAddress) {
	    $(config.displaySpinner).show();
	            $.ajax({
	                type: "POST",
	                data: JSON.stringify({shipToAddress: shipToAddress}),
	                contentType: "application/json",
	                dataType:"json",
	                url: orderLubricantFormURL,
					success:ajaxEnded,
					error:function () {
	                    $(config.displaySpinner).hide();
					}
				})
				
				function ajaxEnded(data){
	            	$("#deliveryInstructions").val(data.deliveryInstructions);
	        		$("#poAddress").val(data.poAddress);
					$(config.displaySpinner).hide();
				}
			}

    $(config.displaySpinner).show();
    
    $(document).ready(function() {
    	
    	$(config.displaySpinner).hide();
  		leftPaneExpandCollapse.init();
        
        
        $(document).on("click",config.searchButton, function(){
            var payLoadObj = {};
            
            payLoadObj.freeText = $(config.keyWordTxtBox).val();
                      
            payLoadObj.category = $(config.categoryddn).val() ? $(config.categoryddn).val() + "" : "All";
            payLoadObj.contentType = $(config.contentddn).val() ? $(config.contentddn).val() + "" : "All";
            
            localStorage.setItem("searchObj", JSON.stringify(payLoadObj));
            window.location.href = cbp.homePage.globalUrl.contentSearchUrl.replace("{0}",payLoadObj.freeText);
        });
    });
});
