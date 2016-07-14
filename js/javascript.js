/**
 * Created by Nicholas on 7/10/2016.
 */

$(document).ready(function() {
    var msg = "Sorry, your browser does not support geolocation.";

    if (Modernizr.geolocation) {
        navigator.geolocation.getCurrentPosition(getWeatherData);
    }
    else {
        alert(msg);
    }


    function getWeatherData(position) {
        var lat = Math.round(position.coords.latitude);
        var log = Math.round(position.coords.longitude);

        var url = "api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+log+"&appid=4bd0296ac3468ba55671920cabb0f745";
        var request = new XMLHttpRequest();
        request.open("GET",url,true);
        request.send(null);
        request.onload = function () {
            "use strict";
            var responseObject = JSON.parse(request.responseText);
            console.log(responseObject);
        }
    }



});