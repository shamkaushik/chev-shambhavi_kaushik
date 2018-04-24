
$(function() {
    function cb(start, end) {
        $('#calendar span').html(start.format('MM-DD-YYYY') + ' - ' + end.format('MM-DD-YYYY'));
    }
    cb(moment().subtract(29, 'days'), moment());

    $('#calendar').daterangepicker({
        ranges: {
           'Today': [moment(), moment()],
           'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
           'Last 7 Days': [moment().subtract(6, 'days'), moment()],
           'Last 30 Days': [moment().subtract(29, 'days'), moment()],
           'This Month': [moment().startOf('month'), moment().endOf('month')],
           'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        },
        'applyClass': 'btn-primary'
    }, cb);
    
    $('#calendar-single').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true
    },
    
    function(start, end, label) {
        $('#calendar span').html(start.format('yyyy-MM-dd'));
    });
   
    function toggleDatePicker(){
      if ($(window).width() <= 480) {
          if(Modernizr.inputtypes.date){
            // $('#calendar').hide();
            // $('#calendar-input-date').show(); 
          }else{
            // $('#calendar').show();
            // $('#calendar-input-date').hide();
          }
      }
      else {
          // $('#calendar').show();
          // $('#calendar-input-date').hide();
      }
    }
    // toggleDatePicker();
    // $(window).resize(toggleDatePicker);
});
