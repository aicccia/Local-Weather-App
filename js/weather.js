//************************************************
//*********Event triggers for main functions
//************************************************

$(document).ready(function () {
	let temperatureSystem = "F";

	$("#zipcode").css("opacity", 0).animate({opacity: 1}, 3000);

	//gets latitude and longitude and then calls getCurrentWeather() and getForcastWeather()
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


//*********************************************
//*************Main Functions
//********************************************
function getCurrentLatLog(position) {
	getAndUpdateCurrentWeather(position.coords.latitude, position.coords.longitude);
	getAndUpdateForecastWeather(position.coords.latitude, position.coords.longitude);
}

function getAndUpdateCurrentWeather(lat, log) {
	const url = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${log}&appid=4bd0296ac3468ba55671920cabb0f745`;

	$.getJSON(url, function (weather) {

		// if (temperatureSystem==="F") {
		// 	$("#fahrenheit").addClass("tempSystemSelected");
		// 	$("#celsius").removeClass("tempSystemSelected");
		// } else {
		// 	$("#celsius").addClass("tempSystemSelected");
		// 	$("#fahrenheit").removeClass("tempSystemSelected");
		// }

		const cloudCoverage = weather.clouds.all;
		const temp = weather.main.temp;
		const tempConverted = Math.round(Math.floor(temp) * (9 / 5) - 459.67);
		const des = weather.weather[0].description;
		const time = new Date(Date.now()).toLocaleTimeString();
		const city = weather.name;
		const country = weather.sys.country;
		const hum = weather.main.humidity;
		const windDirection = findWindDirection(weather.wind.deg);
		const windspeed = ((weather.wind.speed * 3600) * 3.28 / 5280).toFixed(0);
		const visibility = Math.round(weather.visibility*0.000621371);

		$(".temperature").empty().append(`<p> ${tempConverted} F</p>`);
		$(".description").empty().append(`<p> ${des} </p>`);
		$("#weatherIcon").empty().append(`<img src='icons/${getWeatherIcon(cloudCoverage)}'>`);
		$(".updated").css("opacity",0.2).empty().append(`<p>updated as of ${time}</p>`).animate({opacity: 1}, 1000);
		$(".location").css("opacity",0.2).empty().append(`<p> ${city}, ${country} </p>`).animate({opacity: 1}, 1000);
		$(".humidity").css("opacity",0.2).empty().append(`<p>Humidity is ${hum}%.</p>`).animate({opacity: 1}, 1000);
		$(".wind").css("opacity",0.2).empty().append(`<p>Wind is ${windDirection} at ${windspeed} mph.</p>`).animate({opacity: 1}, 1000);
		$(".visibility").css("opacity",0.2).empty().append(`<p>Visibility is ${visibility} miles.</p>`).animate({opacity: 1}, 1000);

	});
}


function getAndUpdateForecastWeather(lat, log) {
	$(".date").css("opacity",0.2).empty().append(`<p>${updateForecastDates(1)[0]} ${updateForcastDates(1)[1]}</p>`).animate({opacity: 1}, 1000);
}


//*****************************************************
//****************Helper Functions
//*****************************************************
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

function getWeatherIcon(cloudCoverage) {

	let timeNow = new Date(Date.now());
	//	let timeOfSunrise = new Date(timeNow).setHours(0, 0, 0, 0) + new Date(apiSunriseTime).setDate(1) - 18000000;
	let timeOfSunrise = new Date(timeNow).setHours(6, 30, 0, 0);
	let timeOfSunset = new Date(timeNow).setHours(20, 0, 0, 0);

	if (timeOfSunrise < timeNow && timeNow < timeOfSunset) {
		if (cloudCoverage < 10) {
			return "day.svg";
		}
		if (cloudCoverage < 30) {
			return "cloudy-day-1.svg";
		}
		if (cloudCoverage < 60) {
			return "cloudy-day-2.svg";
		}
		if (cloudCoverage < 75) {
			return "cloudy-day-3.svg";
		}
		if (cloudCoverage < 101) {
			return "cloudy.svg";
		}
	} else {
		if (cloudCoverage < 10) {
			return "night.svg";
		}
		if (cloudCoverage < 30) {
			return "cloudy-night-1.svg";
		}
		if (cloudCoverage < 60) {
			return "cloudy-night-2.svg";
		}
		if (cloudCoverage < 75) {
			return "cloudy-night-3.svg";
		}
		if (cloudCoverage < 101) {
			return "cloudy.svg";
		}
	}
}

function getDayOfWeek(day) {
	switch(day)  {
		case 1:
			return "Mon";
		case 2:
			return "Tue";
		case 3:
			return "Wed";
		case 4:
			return "Thu";
		case 5:
			return "Fri";
		case 6:
			return "Sat";
		case 7:
			return"Sun";
	}
}

function updateForecastDates(increment) {
	let timeNow = new Date(Date.now());
	let datePlus = new Date(timeNow.setDate(timeNow.getDate() + increment));
	let datePlusDayOfWeek = getDayOfWeek(datePlus.getDay());

	return [datePlusDayOfWeek, datePlus.getDate()];
}




