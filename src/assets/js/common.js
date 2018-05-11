/*
This file contains common function and js code 
used accross the application
*/

//basic template for print preview on all pages
/*
const printPreviewTemplate = '<html>'+
        '<head>'+
            '<meta charset="utf-8">'+
            '<meta http-equiv="X-UA-Compatible" content="IE=edge">'+
            '<meta name="viewport" content="width=device-width, initial-scale=1">'+
            '<link href="/assets/css/app.css" rel="stylesheet" type="text/css"/>'+
        '</head>'+
        '<body class="print-preview-wrapper">'+
            '<header class="row">'+
                '<div class="col-xs-24">'+
                    '<div>'+
                        '<a class="navbar-brand pull-left" href="/index.html"> <img alt="Brand" src="/assets/images/logo.png"><span>business point</span></a>'+ 
                        '<a class="pull-right" href="/index.html"> <img alt="Brand" src="/assets/images/fob-color-rgb.png"></a>'+
                    '</div>'+
                '</div>'+
            '</header>'+
        '</body>'+
    '</html>';
*/
//function to trigger ajax request
/*
var triggerAjaxRequest = function(data,type,url){   
    function successCallback(res){
        return res;
    }
    function errorCallback(err){
        return err;
    }
    return $.ajax({
        type: type,
        data: data,
        url: url,
        success: successCallback,
        error: errorCallback
    });
};
*/