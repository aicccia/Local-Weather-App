/**
 * Created by Nicholas on 7/10/2016.
 */

$(document).ready(function() {

	navigator.geolocation.getCurrentPosition(getWeatherData);

	function getWeatherData(position) {
		const lat = position.coords.latitude;
		const log = position.coords.longitude;

		const url = "http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + log + "&appid=4bd0296ac3468ba55671920cabb0f745";

		$.getJSON(url, function(weather) {
			const temp = weather.main.temp;
			const tempConverted = (Math.floor(temp)*(9/5)-459.67).toFixed(1);
			$(".temperature").empty().append(`<p> ${tempConverted} F</p>`);

			const city = weather.name;
			const country = weather.sys.country;
			$(".location").empty().append(`<p> ${city}, ${country} </p>`);

			const des = weather.weather[0].description;
			$(".description").empty().append(`<p> ${des} </p>`);

			let windspeed = weather.wind.speed;
			windspeed = ((windspeed*3600)*3.28/5280).toFixed(0);
			$(".wind").empty().append(`<p>The wind is blowing at ${windspeed} mph.</p>`);
			const hum = weather.main.humidity;
			$(".sky").empty().append("<p>The humidity is "+hum+"%.</p>");

		});
	}
});

