define("textArea", ["handlebars",
    "text!app/components/textArea/_textArea.hbs"
], function(Handlebars, _textAreaHBS) {

    var compiledTextArea = Handlebars.compile(_textAreaHBS);

    $.fn.charactersLeft = function(config) {
        //default values if nothing passed as config object
        var config = config || {
            textMsg: "{0} characters remaining",
            charLimit: 200,
            rows: 3,
            cssClass: "form-control",
            showRemaining: true,
            showAlways: false,
            value:''
        };
        var textMsg = config.textMsg;
        var charLimit = config.charLimit;
        config.value = config.value || "";
        config.value = config.value.substr(0, config.charLimit);
        $(this).html(compiledTextArea(config));
        var selector = $(this).find("textarea");

        selector.attr('maxlength', charLimit);

        if(config.showAlways){
            updateCountdownOnLoad.call($(selector));
            $(selector).on('keyup', updateCountdownOnLoad);
        }
        else{
            $(selector).on('keyup', updateCountdown);
        }

        /**
         * update the counter for additional information
         */
        function updateCountdown() {
            // 200 is the default max message length
            var remaining = charLimit - $(this).val().length;
            if (remaining < charLimit) {
                $(this).next('.remain-char').text(textMsg.replace("{0}", remaining)).show().toggleClass('error', remaining == 0);
            } else {
                $(this).next('.remain-char').html('').hide();
            }
        }

        function updateCountdownOnLoad() {
            // 200 is the default max message length
            var remaining = charLimit - $(this).val().length;
            $(this).next('.remain-char').text(textMsg.replace("{0}", remaining)).show().toggleClass('error', remaining == 0);
            if (remaining < charLimit) {
                $(this).next('.remain-char').text(textMsg.replace("{0}", remaining)).toggleClass('error', remaining == 0);
            }
        }
    };
});
