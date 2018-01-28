function getCurrentLatLog(position) {
	getWeather(position.coords.latitude, position.coords.longitude);
}

function getWeather(lat, log) {
	const url = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${log}&appid=4bd0296ac3468ba55671920cabb0f745`;

	$.getJSON(url, function (weather) {
		const temp = weather.main.temp;
		const tempConverted = (Math.floor(temp) * (9 / 5) - 459.67).toFixed(1);
		$(".temperature").empty().append(`<p> ${tempConverted} F</p>`);
		const city = weather.name;
		const country = weather.sys.country;
		$(".location").empty().append(`<p> ${city}, ${country} </p>`);
		const des = weather.weather[0].description;
		$(".description").empty().append(`<p> ${des} </p>`);
		let windspeed = weather.wind.speed;
		windspeed = ((windspeed * 3600) * 3.28 / 5280).toFixed(0);
		$(".wind").empty().append(`<p>Wind is blowing at ${windspeed} mph.</p>`);
		const hum = weather.main.humidity;
		$(".sky").empty().append("<p>Humidity is " + hum + "%.</p>");
	});
}

$(document).ready(function () {
	navigator.geolocation.getCurrentPosition(getCurrentLatLog);

	$("#zipcode").submit(function (event) {
		const zipinput = $("#zip").val();
		//verifies that the input is a 5-digit number
		if ((/^\d{5}$/g.test(zipinput))) {
			const zipurl = `http://maps.googleapis.com/maps/api/geocode/json?address=${zipinput}`;
			$.getJSON(zipurl, function (zipdata) {
				let newlat = zipdata.results[0].geometry.location.lat;
				let newlog = zipdata.results[0].geometry.location.lng;

				getWeather(newlat, newlog);
			});
		} else {
			$("#zip").val("Please enter a 5-digit number.");
		}
		event.preventDefault();
	});
});



