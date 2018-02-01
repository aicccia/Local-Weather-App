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

function getAndUpdateCurrentWeather(lat, lon) {
	const url = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=4bd0296ac3468ba55671920cabb0f745`;

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

		$("#currentTemperature").empty().append(`<p> ${tempConverted}&#176</p>`);
		$("#currentDescription").empty().append(`<p> ${des} </p>`);
		$("#weatherIcon").empty().append(`<img src='icons/${getWeatherIcon(cloudCoverage)}'>`);
		$("#updated").css("opacity",0.2).empty().append(`<p>updated as of ${time}</p>`).animate({opacity: 1}, 1000);
		$("#location").css("opacity",0.2).empty().append(`<p> ${city}, ${country} </p>`).animate({opacity: 1}, 1000);
		$("#currentHumidity").css("opacity",0.2).empty().append(`<p>Humidity is ${hum}%.</p>`).animate({opacity: 1}, 1000);
		$("#currentWind").css("opacity",0.2).empty().append(`<p>Wind is ${windDirection} at ${windspeed} mph.</p>`).animate({opacity: 1}, 1000);
		$("#currentVisibility").css("opacity",0.2).empty().append(`<p>Visibility is ${visibility} miles.</p>`).animate({opacity: 1}, 1000);

	});
}


function getAndUpdateForecastWeather(lat, lon) {
	const url = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=4bd0296ac3468ba55671920cabb0f745`;

	$.getJSON(url, function (weatherForecast) {
		console.log(weatherForecast);

		$("#iconForecast").css("opacity",0.2).empty().append(`<img src='icons/${getWeatherIcon(getAverageCloudCoverage(weatherForecast, 0, 7))}'>`).animate({opacity: 1}, 1000);
		$("#maxTemp").css("opacity",0.2).empty().append(`<p>${getHighTemp(weatherForecast,0,7,"F")}</p>`).animate({opacity: 1}, 1000);
		$("#minTemp").css("opacity",0.2).empty().append(`<p>${getLowTemp(weatherForecast,0,7, "F")}</p>`).animate({opacity: 1}, 1000);
		$("#description").css("opacity",0.2).empty().append(`<p>${createDescription(weatherForecast,0,7)}</p>`).animate({opacity: 1}, 1000);
		$("#windForecast").css("opacity",0.2).empty().append(`<img src="icons/wi-strong-wind.svg"> <p>${getAverageWindSpeed(weatherForecast,0,7, "F")} mph</p>`).animate({opacity: 1}, 1000);
		$("#rainForecast").css("opacity",0.2).empty().append(`<img src="icons/wi-raindrops.svg"><p>${getAverageRain(weatherForecast,0,7)}%</p>`).animate({opacity: 1}, 1000);
	});

	$(".date").css("opacity",0.2).empty().append(`<p>${updateForecastDates(1)[0]} ${updateForecastDates(1)[1]}</p>`).animate({opacity: 1}, 1000);
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
//	let cloudCoverage = getAverageCloudCoverage(weatherData, startPeriod, endPeriod);

	let timeNow = new Date(Date.now());
	//	let timeOfSunrise = new Date(timeNow).setHours(0, 0, 0, 0) + new Date(apiSunriseTime).setDate(1) - 18000000;
	let timeOfSunrise = new Date(timeNow).setHours(6, 30, 0, 0);
	let timeOfSunset = new Date(timeNow).setHours(19, 30, 0, 0);

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

function getHighTemp(weatherData, startPeriod, endPeriod, weatherSystem) {
	let maxTemp = 0;
	for (let e = startPeriod; e < endPeriod + 1; e++) {
		if (maxTemp < weatherData.list[e].main.temp_max) {
			maxTemp = weatherData.list[e].main.temp_max;
		}
	}
	if (weatherSystem === "F") {
		return `${Math.round(maxTemp * (9/5) - 459.67)}&#176`;
	}

}

function getLowTemp(weatherData, startPeriod, endPeriod, weatherSystem) {
	let minTemp = 1000;
	for (let e = startPeriod; e < endPeriod + 1; e++) {
		if (minTemp > weatherData.list[e].main.temp_min) {
			minTemp = weatherData.list[e].main.temp_min;
		}
	}
	if (weatherSystem === "F") {
		return `${Math.round(minTemp * (9/5) - 459.67)}&#176`;
	}
}

function getAverageCloudCoverage(weatherData, startPeriod, endPeriod) {
	let totalCloudCoverage = 0;
	for (let e = startPeriod; e < endPeriod + 1; e++) {
		totalCloudCoverage = totalCloudCoverage + weatherData.list[e].clouds.all;
	}
	return totalCloudCoverage / (endPeriod - startPeriod + 1);
}

function getAverageWindSpeed(weatherData, startPeriod, endPeriod, weatherSystem) {
	let averageWindSpeed = 0;
	for (let e = startPeriod; e < endPeriod + 1; e++) {
		averageWindSpeed =  averageWindSpeed + weatherData.list[e].wind.speed;
	}
	if (weatherSystem === "F") {
		averageWindSpeed = Math.round(((averageWindSpeed / (endPeriod - startPeriod + 1) * 3.28) * 3600) / 5280);
	}
	return averageWindSpeed;
}

function getAverageRain(weatherData, startPeriod, endPeriod) {
	let averageRain = 0;
	for (let e = startPeriod; e < endPeriod + 1; e++) {
		if (weatherData.list[e].rain) {
			averageRain++;
		}
	}
	return Math.round(((averageRain / (endPeriod - startPeriod + 1))*0.7)*100);
}

function createDescription(weatherData, startPeriod, endPeriod) {
	let clouds, rain;
	let averageCloudCoverage =  getAverageCloudCoverage(weatherData, startPeriod, endPeriod);
	let averageRain = getAverageRain(weatherData, startPeriod, endPeriod);

	if (averageCloudCoverage < 10) {
		clouds = "is clear";
	} else if(averageCloudCoverage < 30) {
		clouds =  "there are some clouds";
	} else if (averageCloudCoverage < 60) {
		clouds = "is cloudy";
	} else {
		clouds = "is overcast";
	}

	if (averageRain === 0) {
		rain = "with no rain";
	} else if(averageRain < 25) {
		rain =  "with a small chance of rain";
	} else if (averageRain < 50) {
		rain = "with probably some rain";
	} else if(averageRain < 75) {
		rain = "almost certainly some rain";
	} else {
		rain = "with a lot of rain";
	}

	return `today ${clouds} ${rain}`;
}


