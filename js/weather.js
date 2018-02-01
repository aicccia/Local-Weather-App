//************************************************
//*********Event triggers for main functions
//************************************************

$(document).ready(function () {
	let temperatureSystemIsF = true;
	let forecastDetailSaved = [], forecastSaved = [];


	$("#zipcode").css("opacity", 0).animate({opacity: 1}, 3000);

	//gets latitude and longitude and then calls getCurrentWeather() and getForcastWeather()
	navigator.geolocation.getCurrentPosition(getCurrentPositionSuccess);

	$("#fahrenheit").click(function() {
		$()

	});

	$("#forecastDay1").on("mouseenter", { value: 1 }, OnMouseEnter);
	$("#forecastDay2").on("mouseenter", { value: 2 }, OnMouseEnter);
	$("#forecastDay3").on("mouseenter", { value: 3 }, OnMouseEnter);
	$("#forecastDay4").on("mouseenter", { value: 4 }, OnMouseEnter);
	$("#forecastDay5").on("mouseenter", { value: 5 }, OnMouseEnter);


	function OnMouseEnter(event) {
		let $forecastDay = $(`#forecastDay${event.data.value}`);
		$forecastDay.off("mouseenter");
		if (!forecastSaved[event.data.value]) {
			forecastSaved[event.data.value] = $forecastDay.html();
		}
		if (!forecastDetailSaved[event.data.value]) {
			$forecastDay.empty().append(printForecastDayDetail(event.data.value));
		} else {
			$forecastDay.empty().append(forecastDetailSaved[event.data.value]);
		}
		$forecastDay.on("mouseleave", { value: event.data.value }, OnMouseLeave);
	}

	function OnMouseLeave(event) {
		let $forecastDay = $(`#forecastDay${event.data.value}`);
		$forecastDay.off("mouseleave");
		if (!forecastDetailSaved[event.data.value]) {
			forecastDetailSaved[event.data.value] = $forecastDay.html();
		}
		$forecastDay.empty().append(forecastSaved[event.data.value]);
		$forecastDay.on("mouseenter", { value: event.data.value }, OnMouseEnter);
	}




	$("#zipcode").submit(function (event) {
		const zipinput = $("#zip").val();
		//verifies that the input is a 5-digit number
		if ((/^\d{5}$/g.test(zipinput))) {
			const zipurl = `http://maps.googleapis.com/maps/api/geocode/json?address=${zipinput}`;
			$.getJSON(zipurl, function (zipdata) {
				let newlat = zipdata.results[0].geometry.location.lat;
				let newlog = zipdata.results[0].geometry.location.lng;

				getAndUpdateCurrentWeather(newlat, newlog);
				getAndUpdateForecastWeather(newlat, newlog);
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
function getCurrentPositionSuccess(position) {
	getCurrentWeatherData(position.coords.latitude, position.coords.longitude);
	getForecastData(position.coords.latitude, position.coords.longitude);
}

function getCurrentWeatherData(lat, lon) {
	const url = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=4bd0296ac3468ba55671920cabb0f745`;

	$.getJSON(url, function (weather) {
		const cloudCoverage = weather.clouds.all;
		const temp = weather.main.temp;
		const des = weather.weather[0].description;
		const time = new Date(Date.now()).toLocaleTimeString();
		const city = weather.name;
		const country = weather.sys.country;
		const hum = weather.main.humidity;
		const windDirection = findWindDirection(weather.wind.deg);
		const windspeed = ((weather.wind.speed * 3600) * 3.28 / 5280).toFixed(0);
		const visibility = Math.round(weather.visibility * 0.000621371);

		$("#currentTemperature").empty().append(`<p> ${getCurrentTemperature(temp,true)}&#176</p>`);
		$("#currentDescription").empty().append(`<p> ${des} </p>`);
		$("#weatherIcon").empty().append(`<img src='icons/${getWeatherIcon(cloudCoverage, false)}'>`);
		$("#updated").css("opacity", 0.2).empty().append(`<p>updated as of ${time}</p>`).animate({opacity: 1}, 1000);
		$("#location").css("opacity", 0.2).empty().append(`<p> ${city}, ${country} </p>`).animate({opacity: 1}, 1000);
		$("#currentHumidity").css("opacity", 0.2).empty().append(`<p>Humidity is ${hum}%.</p>`).animate({opacity: 1}, 1000);
		$("#currentWind").css("opacity", 0.2).empty().append(`<p>Wind is ${windDirection} at ${windspeed} mph.</p>`).animate({opacity: 1}, 1000);
		$("#currentVisibility").css("opacity", 0.2).empty().append(`<p>Visibility is ${visibility} miles.</p>`).animate({opacity: 1}, 1000);
	});
}


function getForecastData(lat, lon) {
	const url = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=4bd0296ac3468ba55671920cabb0f745`;

	$.getJSON(url, function (weatherForecast) {
		for (let i = 1; i < 6; i++) {
			$(`#date${i}`).css("opacity", 0.2).empty().append(`<p>${updateForecastDates(i)[0]} ${updateForecastDates(i)[1]}</p>`).animate({opacity: 1}, 1000);
			$(`#iconForecast${i}`).css("opacity", 0.2).empty().append(`<img src='icons/${getWeatherIcon(getAverageCloudCoverage(weatherForecast, (i - 1), (i - 1) + 7), true)}'>`).animate({opacity: 1}, 1000);
			$(`#maxTemp${i}`).css("opacity", 0.2).empty().append(`<p>${getHighTemp(weatherForecast, (i - 1), (i - 1) + 7, "F")}</p>`).animate({opacity: 1}, 1000);
			$(`#minTemp${i}`).css("opacity", 0.2).empty().append(`<p>${getLowTemp(weatherForecast, (i - 1), (i - 1) + 7, "F")}</p>`).animate({opacity: 1}, 1000);
			$(`#description${i}`).css("opacity", 0.2).empty().append(`<p>${createDescription(weatherForecast, (i - 1), (i - 1) + 7)}</p>`).animate({opacity: 1}, 1000);
			$(`#windForecast${i}`).css("opacity", 0.2).empty().append(`<img src="icons/wi-strong-wind.svg"> <p>${getAverageWindSpeed(weatherForecast, (i - 1), (i - 1) + 7, "F")} mph</p>`).animate({opacity: 1}, 1000);
			$(`#rainForecast${i}`).css("opacity", 0.2).empty().append(`<img src="icons/wi-raindrops.svg"><p>${getAverageRain(weatherForecast, (i - 1), (i - 1) + 7)}%</p>`).animate({opacity: 1}, 1000);
		}
	});
}

/*
function getAndUpdateForecastDetail(day) {
	const json = localStorage.getItem('weatherForecast');
	const weatherForecast = JSON.parse(json);

	$(`#forecastDetailTime=11`).css("opacity", 0.2).empty().append(`<p>${updateForecastDates(day)[0]} ${updateForecastDates(day)[1]}</p>`).animate({opacity: 1}, 1000);
	$(`#iconForecast${i}`).css("opacity", 0.2).empty().append(`<img src='icons/${getWeatherIcon(getAverageCloudCoverage(weatherForecast, (i - 1), (i - 1) + 7), true)}'>`).animate({opacity: 1}, 1000);
}
*/


//*****************************************************
//****************Helper Functions
//*****************************************************
function getCurrentTemperature(temp,temperatureSystemIsF)  {
	if (temperatureSystemIsF) {
		return Math.round(Math.floor(temp) * (9 / 5) - 459.67);
	} else {
		return Math.round(Math.floor(temp) - 273.15);
	}
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

function getWeatherIcon(cloudCoverage, forecastYesNo) {


	let timeNow = new Date(Date.now());
	//	let timeOfSunrise = new Date(timeNow).setHours(0, 0, 0, 0) + new Date(apiSunriseTime).setDate(1) - 18000000;
	let timeOfSunrise = new Date(timeNow).setHours(6, 30, 0, 0);
	let timeOfSunset = new Date(timeNow).setHours(19, 30, 0, 0);

	if ((timeNow < timeOfSunrise || timeOfSunset < timeNow) && (!forecastYesNo)) {
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
	} else {
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
	}
}


function updateForecastDates(increment) {
	let timeNow = new Date(Date.now());
	let datePlus = new Date(timeNow.setDate(timeNow.getDate() + increment));
	let datePlusDayOfWeek = getDayOfWeek(datePlus.getDay());

	return [datePlusDayOfWeek, datePlus.getDate()];
}

function getDayOfWeek(day) {
	switch (day) {
		case 0:
			return "Sun";
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
	}
}


function getHighTemp(weatherData, startPeriod, endPeriod, weatherSystem) {
	let maxTemp = 0;
	for (let e = startPeriod; e < endPeriod + 1; e++) {
		if (maxTemp < weatherData.list[e].main.temp_max) {
			maxTemp = weatherData.list[e].main.temp_max;
		}
	}
	if (weatherSystem) {
		return `${Math.round(maxTemp * (9 / 5) - 459.67)}&#176`;
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
		return `${Math.round(minTemp * (9 / 5) - 459.67)}&#176`;
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
		averageWindSpeed = averageWindSpeed + weatherData.list[e].wind.speed;
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
	return Math.round(((averageRain / (endPeriod - startPeriod + 1)) * 0.7) * 100);
}

function createDescription(weatherData, startPeriod, endPeriod) {
	let clouds, rain;
	let averageCloudCoverage = getAverageCloudCoverage(weatherData, startPeriod, endPeriod);
	let averageRain = getAverageRain(weatherData, startPeriod, endPeriod);

	if (averageCloudCoverage < 10) {
		clouds = "is clear";
	} else if (averageCloudCoverage < 30) {
		clouds = "there are some clouds";
	} else if (averageCloudCoverage < 60) {
		clouds = "is cloudy";
	} else {
		clouds = "is overcast";
	}

	if (averageRain === 0) {
		rain = "with no rain";
	} else if (averageRain < 25) {
		rain = "with a small chance of rain";
	} else if (averageRain < 50) {
		rain = "with probably some rain";
	} else if (averageRain < 75) {
		rain = "with almost certainly some rain";
	} else {
		rain = "with a lot of rain";
	}

	return `today ${clouds} ${rain}`;
}

function printForecastDayDetail(day) {
	return `
	<div class="forecastDetail" id="11">
		<div class="forecastDetailQuad" id="forecastDetail=${day}1">
			<div class="forecastDetailTime" id="forecastDetailTime=${day}1">time</div>
			<div class="forecastDetailIcon" id="forecastDetailIcon=${day}1">icon</div>
			<div class="forecastDetailTemp" id="forecastDetailTemp=${day}1">temp</div>
		</div>
		<div class="forecastDetailQuad" id="forecastDetail=12">
			<div class="forecastDetailTime" id="forecastDetailTime=${day}2">time</div>
			<div class="forecastDetailIcon" id="forecastDetailIcon=${day}2">icon</div>
			<div class="forecastDetailTemp" id="forecastDetailTemp=${day}2">temp</div>
		</div>
		<div class="forecastDetailQuad" id="forecastDetail=13">
			<div class="forecastDetailTime" id="forecastDetailTime=${day}3">time</div>
			<div class="forecastDetailIcon" id="forecastDetailIcon=${day}3">icon</div>
			<div class="forecastDetailTemp" id="forecastDetailTemp=${day}3">temp</div>
		</div>
		<div class="forecastDetailQuad" id="forecastDetail=14">
			<div class="forecastDetailTime" id="forecastDetailTime=${day}4">time</div>
			<div class="forecastDetailIcon" id="forecastDetailIcon=${day}4">icon</div>
			<div class="forecastDetailTemp" id="forecastDetailTemp=${day}4">temp</div>
		</div>
	</div>`;
}



