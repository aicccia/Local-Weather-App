/**
 * Created by Nicholas on 7/10/2016.
 */

$(document).ready(function() {

    navigator.geolocation.getCurrentPosition(getWeatherData);

    function getWeatherData(position) {
        var lat = Math.round(position.coords.latitude);
        var log = Math.round(position.coords.longitude);

        var url = "http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + log + "&appid=4bd0296ac3468ba55671920cabb0f745";


        $.getJSON(url, function(weather) {
            var temp = weather.main.temp;
            var tem = (Math.floor(temp)*(9/5)-459.67).toFixed(1);
            $(".tempNumber").empty().append("<p>"+tem+" F</p>");

            var city = weather.name;
            var con = weather.sys.country;
            $(".location").empty().append("<p>"+city+", "+con+"</p>");

            var des = weather.weather[0].description;
            $(".description").empty().append("<p>"+des+"</p>");

            var windspeed = weather.wind.speed;
            windspeed = ((windspeed*3600)*3.28/5280).toFixed(0);
            $(".wind").empty().append("<p>The wind is blowing at "+windspeed+" mph.</p>");
            var hum = weather.main.humidity;
            $(".sky").empty().append("<p>The humidity is "+hum+"%.</p>");

        });
    }





});