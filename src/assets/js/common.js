/*
This file contains common function and js code 
used accross the application
*/

var triggerAjaxRequest = function(data,type,url){   
    console.log('Triggered Ajax');
    function successCallback(res){
        return res;
    }
    function errorCallback(err){
        return err;
    }
    return $.ajax({
        type: type,
        data: data,
        contentType: "application/json",
        dataType:"json",
        url: url,
        success: successCallback,
        error: errorCallback
    });
};