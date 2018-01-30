let temperatureSystem = "F";

function getCurrentLatLog(position) {
	getWeather(position.coords.latitude, position.coords.longitude);
}

function findWindDirection(degrees) {
	if (degrees < 23) {
		return "N";
	}
	if (degrees < 68) {
		return "NE";
	}
	if (degrees < 113) {
		return "E";
	}
	if (degrees < 158) {
		return "SE";
	}
	if (degrees < 203) {
		return "S";
	}
	if (degrees < 248) {
		return "SW";
	}
	if (degrees < 293) {
		return "W";
	}
	if (degrees < 338) {
		return "NW";
	}
}

function getWeather(lat, log) {
	const url = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${log}&appid=4bd0296ac3468ba55671920cabb0f745`;

	$.getJSON(url, function (weather) {
		console.log(weather);

		// const weatherIcon = weather.weather[0].icon;
		// $("#weatherIcon").empty().append(`<img src='http://openweathermap.org/img/w/${weatherIcon}.png'>`);

		const temp = weather.main.temp;
		const tempConverted = Math.round(Math.floor(temp) * (9 / 5) - 459.67);
		$(".temperature").empty().append(`<p> ${tempConverted} F</p>`);
		if (temperatureSystem==="F") {
			$("#fahrenheit").addClass("tempSystemSelected");
			$("#celsius").removeClass("tempSystemSelected");
		} else {
			$("#celsius").addClass("tempSystemSelected");
			$("#fahrenheit").removeClass("tempSystemSelected");
		}

		const des = weather.weather[0].description;
		$(".description").empty().append(`<p> ${des} </p>`);

		const time = new Date(Date.now()).toLocaleTimeString();
		$(".updated").css("opacity",0.2).empty().append(`<p>updated as of ${time}</p>`).animate({opacity: 1}, 1000);

		const city = weather.name;
		const country = weather.sys.country;
		$(".location").css("opacity",0.2).empty().append(`<p> ${city}, ${country} </p>`).animate({opacity: 1}, 1000);

		const hum = weather.main.humidity;
		$(".humidity").css("opacity",0.2).empty().append(`<p>Humidity is ${hum}%.</p>`).animate({opacity: 1}, 1000);

		let windDirection = findWindDirection(weather.wind.deg);
		let windspeed = ((weather.wind.speed * 3600) * 3.28 / 5280).toFixed(0);
		$(".wind").css("opacity",0.2).empty().append(`<p>Wind is ${windDirection} at ${windspeed} mph.</p>`).animate({opacity: 1}, 1000);

		const visibility = Math.round(weather.visibility*0.000621371);
		$(".visibility").css("opacity",0.2).empty().append(`<p>Visibility is ${visibility} miles.</p>`).animate({opacity: 1}, 1000);


	});
}

$(document).ready(function () {
	$("#zipcode").css("opacity", 0).animate({opacity: 1}, 3000);

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



