define("toggleSwitch", ["handlebars",
    "text!app/components/toggleSwitch/_toggleSwitch.hbs"
], function(Handlebars, _toggleSwitchHBS) {

    var compiledtoggleSwitch = Handlebars.compile(_toggleSwitchHBS);

    $.fn.toggleSwitch = function(config) {
        //default values if nothing passed as config object
        var config = config || {
            name: "switch",
            cssClass: "test",
            label: "Options",
            //LabelBlock: true,
            options: [{
                label: "option 1",
                value: "1"
            }, {
                label: "Option 2",
                value: "2",
                default: true
            }]
        };

        // toggleSwitch will be driving styles from less
        $(this).addClass('toggleSwitch').html(compiledtoggleSwitch(config));

        var group = $(this).find('.btn-group');
        var name = group.attr('data-toggle-name');
        var hidden = $('input[name="' + name + '"]');

        $('div.btn-group[data-toggle-name]').each(function() {
            $('button', group).each(function() {
                var button = $(this);
                button.on('click', function() {
                    $('button', group).removeClass('btn-primary').addClass('btn-default');
                    hidden.val($(this).val());
                    //hidden.val() will be hidden text variable which will hold the selected value
                    if (button.val() == hidden.val()) {
                        button.removeClass('btn-default').addClass('btn-primary');
                    }
                });
            });
        });
    };
});
