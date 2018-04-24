define("customValidate", ["handlebars",
    "text!app/components/customValidation/_customValidation.hbs"
], function(Handlebars, _customValidationHBS) {

    var compiledErrorList = Handlebars.compile(_customValidationHBS);

    $.fn.customValidate = function(options) {

        var self = this;
        var config = options || false;
        var isTiHiError = false;
        var isHardError = false;

        return $(this).each(function(){
            var errorMessageList = {};
            errorMessageList.messages = [];
            var $element = $(this);
            var errorContainer = $element.data("validate-error-container");
            errorContainer = typeof(errorContainer) === undefined ? false:errorContainer;
            var validationList = getCustomValidations($element);
            var validate = validationList.length;            
            if(validate){
                
                //$element.attr("data-validate", true);
                errorMessageList.messages = validationList;
                if(config.showValidationAlways){
                    $element.closest("tr").find("td.validation-container").prepend(compiledErrorList(errorMessageList));
                }
                else{
                    if(errorContainer)
                        $element.siblings(errorContainer).html(compiledErrorList(errorMessageList));
                    else
                        $element.parent().prepend(compiledErrorList(errorMessageList));
                }
                evaluateValidations($element, validationList, errorContainer);

                // input event
                $element.on("input",function(event){
                   isHardError = false;                        
                   evaluateValidations($(this), validationList, errorContainer);  
                });
                if(config.showValidationAlways){
                    showValidationOnLoad($element);
                    showValidationOnBlur($element);
                }
                else{
                    setFocusEvent($element, errorContainer);
                    setBlurEvent($element, errorContainer);
                }

            } //end if validate
            else {
                // do nothing
                return;
            }

        });
        
        // validation core plugin code
        function evaluateValidations($element, validationList, errorContainer){
                    var value = $element.val().trim();
                    var eleGoodState = $element.attr("data-goodstate");

                    if(isNaN(value) || value.toString().indexOf('.') > 0){
                        if(eleGoodState)
                          $element.val(eleGoodState);
                        else
                          $element.val('');
                    }
                    else{
                        $element.attr("data-goodstate", value);
                    }
                    var isValid = true;
                    var qty = $element.attr("data-goodstate");
                    
                    // if(qty!==""){
                        $.each(validationList, function(index, item){
                            executeValidation(item, qty);                            
                            if(isHardError)
                                return false;
                        });
                    // }

                    if(isHardError){
                      // hard error..do not bother about ti hi error or any other soft error
                      if(config.showValidationAlways){
                          $element.addClass("validation-error");
                          $element.closest("tr").find("td.validation-container").find(".validation-errors-list").addClass("validation-error");
                      }
                      else{
                          
                        if(errorContainer){
                            $element.removeClass("validation-error");
                            $element.siblings(errorContainer).find(".validation-errors-list").addClass("validation-error");
                        }
                        else{                            
                            $element.addClass("validation-error");
                            $element.siblings(".validation-errors-list").addClass("validation-error");
                        }
                      }

                    }
                    else {
                        // no hard error
                        if(config.showValidationAlways){
                          $element.removeClass("validation-error");
                          $element.closest("tr").find("td.validation-container").find(".validation-errors-list").removeClass("validation-error");
                        }
                        else{
                            if(errorContainer){
                                $element.removeClass("validation-error");
                                $element.siblings(errorContainer).find(".validation-errors-list").removeClass("validation-error");
                            }
                            else{
                                $element.removeClass("validation-error");
                                $element.siblings(".validation-errors-list").removeClass("validation-error");
                            }
                        }
                        
                        if(isTiHiError){
                            
                             // only ti hi error
                             if(config.showValidationAlways){
                                  $element.addClass("has-error-message");
                                  $element.closest("tr").find("td.validation-container").find(".validation-errors-list").find(".js-ti-hi-message").addClass("has-error-message");
                              }
                            else{
                                if(errorContainer){                                    
                                    $element.addClass("has-error-message");
                                    $element.siblings(errorContainer).find(".js-ti-hi-message").addClass("has-error-message");
                                }
                                else{
                                    $element.addClass("has-error-message");
                                    $element.siblings(".validation-errors-list").find(".js-ti-hi-message").addClass("has-error-message");
                                }
                            }
                                
                        }
                        else{
                            // no error at all..all good
                            if(config.showValidationAlways){
                                  $element.removeClass("has-error-message");
                                  $element.closest("tr").find("td.validation-container").find(".validation-errors-list").find(".js-ti-hi-message").removeClass("has-error-message");
                              }
                            else{
                                if(errorContainer){
                                    $element.removeClass("has-error-message");
                                    $element.siblings(errorContainer).find(".js-ti-hi-message").removeClass("has-error-message");
                                }
                                else{
                                    $element.removeClass("has-error-message");
                                    $element.siblings(".validation-errors-list").find(".js-ti-hi-message").removeClass("has-error-message");
                                }
                            }
                        }
                    }
        }


        // plugin specific methods. PRIVATE
        function setFocusEvent($element, errorContainer){
            $element.on("focus",function(event){
                event.stopPropagation();
                if(errorContainer)
                    $element.siblings(errorContainer).find(".validation-errors-list").show();
                else
                    $element.siblings(".validation-errors-list").show();
            });
        }


        function showValidationOnLoad($element){
            $element.closest("tr").find("td.validation-container").find(".validation-errors-list").show();
        }


        function showValidationOnBlur($element){
            $element.siblings(".validation-errors-list").show();
        }

        function setBlurEvent($element, errorContainer){
            $element.on("blur", function(event){
                event.stopPropagation();
                $element.removeClass("validation-error");
                if(errorContainer)
                    $element.siblings(errorContainer).find(".validation-errors-list").removeClass("validation-error").hide();
                else
                    $element.siblings(".validation-errors-list").removeClass("validation-error").hide();
            });
        }

        function executeValidation(item, value){
            switch (item.rule) {
                case 'minCheckValidation': return validateMinQuantityCheck(value, item.requirement);

                case 'maxCheckValidation': return validateMaxQuantityCheck(value, item.requirement);

                case 'multiCheckValidation': return validateMultipleQuantityCheck(value, item.requirement);

                case 'tiHiCheckValidation': return validateTiHiCheck(value, item.requirement);
                    
                
                case 'minLineItemVolumeValidation': console.log(value);return validateMinLineItemVolume(value, item.requirement, item.orderVolume);
                    
                case 'maxLineItemVolumeValidation': return validateMaxLineItemVolume(value, item.requirement, item.orderVolume);

                    
                default:

            }
        }


        function getCustomValidations($element){

            var validationList = [];

            //minimum quantity check
            var minCheckValidationValue = $element.data("validate-mincheck") || false;
            if(minCheckValidationValue){
                var minCheckValidationMessage = $element.data("validate-mincheck-message")|| "Minimum value required {0}";
                minCheckValidationMessage = minCheckValidationMessage.replace("{0}", minCheckValidationValue);
                var obj = {};
                obj.rule = "minCheckValidation";
                obj.message = minCheckValidationMessage;
                obj.requirement = minCheckValidationValue;
                validationList.push(obj);
            }

            //maximum quantity check
            var maxCheckValidationValue = $element.data("validate-maxcheck") || false;
            if(maxCheckValidationValue){
                var maxCheckValidationMessage = $element.data("validate-maxcheck-message")|| "Maximum value can be {0}";
                maxCheckValidationMessage = maxCheckValidationMessage.replace("{0}", maxCheckValidationValue);
                var obj = {};
                obj.rule = "maxCheckValidation";
                obj.message = maxCheckValidationMessage;
                obj.requirement = maxCheckValidationValue;
                validationList.push(obj);
            }

            //multiple of check
            var multiCheckValidationValue = $element.data("validate-multicheck") || false;
            if(multiCheckValidationValue){
                var multiCheckValidationMessage = $element.data("validate-multicheck-message") || "Value should be multiple of {0}";
                multiCheckValidationMessage = multiCheckValidationMessage.replace("{0}",multiCheckValidationValue);
                var obj = {};
                obj.rule = "multiCheckValidation";
                obj.message = multiCheckValidationMessage;
                obj.requirement = multiCheckValidationValue;
                validationList.push(obj);
            }

            //Ti X Hi check

            var tiValidationValue = $element.data("validate-ti") || false;
            var hiValidationValue = $element.data("validate-hi") || false;
            if(tiValidationValue && hiValidationValue){
                var tiHiValue = tiValidationValue*hiValidationValue;
                var tiHiCheckValidationMessage = $element.data("validate-tihi-message")|| "TI x HI: {0}x{1} ({2})";
                tiHiCheckValidationMessage = tiHiCheckValidationMessage.replace("{0}", tiValidationValue).replace("{1}", hiValidationValue).replace("{2}", tiHiValue);
                var obj = {};
                obj.rule = "tiHiCheckValidation";
                obj.message = tiHiCheckValidationMessage;
                obj.requirement = tiHiValue;
                validationList.push(obj);
            }
            
            
            //Min Vol check for EU

            var minLineItemVolume = $element.data("validate-minvolume") || false;            
            if(minLineItemVolume){
               
                var minLineItemVolumeMessage = $element.data("validate-minvolume-message");
                var orderVolume = $element.data("volume");
                minLineItemVolumeMessage = minLineItemVolumeMessage.replace("{0}", minLineItemVolume);
                var obj = {};
                obj.rule = "minLineItemVolumeValidation";
                obj.message = minLineItemVolumeMessage;
                obj.requirement = minLineItemVolume;
                obj.orderVolume = orderVolume;
                validationList.push(obj);
            }

            
             
            //Max Vol check for EU

            var maxLineItemVolume = $element.data("validate-maxvolume") || false;            
            if(maxLineItemVolume){
               
                var maxLineItemVolumeMessage = $element.data("validate-maxvolume-message");
                var orderVolume = $element.data("volume");
                maxLineItemVolumeMessage = maxLineItemVolumeMessage.replace("{0}", maxLineItemVolume);
                var obj = {};
                obj.rule = "maxLineItemVolumeValidation";
                obj.message = maxLineItemVolumeMessage;
                obj.requirement = maxLineItemVolume;
                obj.orderVolume = orderVolume;
                validationList.push(obj);
            }


            return validationList;

        };

        // Custom validation methods goes here. PRIVATE
        function validateMinQuantityCheck(value, requirement) {            
            // Make an exception for 0
              if(value==0 || value>=requirement)
                isHardError = false;
            else
                isHardError = true;
            
            //return (value==0 || value>=requirement);
        };

        function validateMaxQuantityCheck(value, requirement) { 
            if(value<=requirement)
                isHardError = false;
            else
                isHardError = true;
            
            //return value<=requirement;
        };

        function validateMultipleQuantityCheck(value, requirement){  
            if(value%requirement === 0)
                isHardError = false;
            else
                isHardError = true;
            
            //return value%requirement === 0;
        };

        function validateTiHiCheck(value, requirement){
            if(value%requirement === 0)
                isTiHiError = false;
            else
                isTiHiError = true;
			isHardError = false;
            //return value%requirement === 0;
        };
        
        
        function validateMinLineItemVolume(value, requirement, orderVolume){
            var computedValue = Math.round(value * orderVolume);
            
            if(computedValue < requirement)
                isHardError = true;
            else
                isHardError = false;
            //console.log(isHardError,"min",value,orderVolume);
        };

        function validateMaxLineItemVolume(value, requirement, orderVolume){
            var computedValue = Math.round(value * orderVolume);
            if(computedValue > requirement)
                isHardError = true;
            else
                isHardError = false;
            //console.log(isHardError,"max");
        };

        // other checks in future
    };
});
