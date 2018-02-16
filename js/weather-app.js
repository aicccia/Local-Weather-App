//* ***********************************************
//* ********Event triggers for main functions
//* ***********************************************


let forecastDetailSaved = [],
	forecastSaved = [];
let temperatureSystemIsF = true;

$(document).ready(() => {
	const $zipcode = $("#zipcode");
	$zipcode.css("opacity", 0).animate({opacity: 1}, 3000);

	const json = JSON.stringify(temperatureSystemIsF);
	localStorage.setItem("temperatureSystemIsF", json);

	navigator.geolocation.getCurrentPosition(getCurrentPositionSuccess);

	$("#fahrenheit").click(function () {
		const $this = this;
		if (!$this.hasClass("selected")) {
			temperatureSystemIsF = true;
			forecastDetailSaved = forecastSaved = [];

			const json = JSON.stringify(temperatureSystemIsF);
			localStorage.setItem("temperatureSystemIsF", json);

			const jsonlatlog = localStorage.getItem("latlog");
			const latlog = JSON.parse(jsonlatlog);

			weatherAppModel.updateTemperatureData(latlog[0], latlog[1], temperatureSystemIsF);

			$this.addClass("selected");
			$("#celsius").removeClass("selected");
		}
	});

	$("#celsius").click(function () {
		const $this = $(this);
		if (!$this.hasClass("selected")) {
			temperatureSystemIsF = false;
			forecastDetailSaved = forecastSaved = [];

			const json = JSON.stringify(temperatureSystemIsF);
			localStorage.setItem("temperatureSystemIsF", json);

			const jsonlatlog = localStorage.getItem("latlog");
			const latlog = JSON.parse(jsonlatlog);

			weatherAppModel.updateTemperatureData(latlog[0], latlog[1], temperatureSystemIsF);
			$this.addClass("selected");
			$("#fahrenheit").removeClass("selected");
		}
	});

	$("#forecastDay1").on("mouseenter", {value: 1}, OnMouseEnter);
	$("#forecastDay2").on("mouseenter", {value: 2}, OnMouseEnter);
	$("#forecastDay3").on("mouseenter", {value: 3}, OnMouseEnter);
	$("#forecastDay4").on("mouseenter", {value: 4}, OnMouseEnter);

	getAndUpdateForecastDetail();

	$zipcode.submit(event => {
		event.preventDefault();
		const zipinput = $("#zip").val();
		// verifies that the input is a 5-digit number
		if (/^\d{5}$/g.test(zipinput)) {
			const zipurl = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipinput}`;
			$.getJSON(zipurl, zipdata => {
				const newlat = zipdata.results[0].geometry.location.lat;
				const newlog = zipdata.results[0].geometry.location.lng;
				forecastDetailSaved = [];
				forecastSaved = [];

				weatherAppModel.getCurrentWeatherData(newlat, newlog, temperatureSystemIsF);
				getForecastData(newlat, newlog, temperatureSystemIsF);

				const latlog = [newlat, newlog];
				const jsonlatlog = JSON.stringify(latlog);
				localStorage.setItem("latlog", jsonlatlog);
			});
		} else {
			$("#zip").val("5-digit number only");
		}
	});
});

//////////////////////////////////////////////////////////////////////////////////
const weatherAppModel = {
	updateCurrentWeatherData(lat, lon, temperatureSystemIsF) {
	const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=4bd0296ac3468ba55671920cabb0f745`;

	$.getJSON(url, weather => {
		const weatherData = {
			cloudCoverage: weather.clouds.all,
			temp: weather.main.temp,
			des: weather.weather[0].description,
		    time: new Date(Date.now()).toLocaleTimeString(),
		    city: weather.name,
		    country: weather.sys.country,
		    hum: weather.main.humidity,
			windDirection: findWindDirection(weather.wind.deg),
		    windspeed: (weather.wind.speed * 3600 * 3.28 / 5280).toFixed(0),
		    visibility: Math.round(weather.visibility * 0.000621371)
		};

		weatherAppView.displayCurrentWeather(weatherData);
	});
},
	updateTemperatureData(lat, lon, temperatureSystemIsF) {
		//OpenWeatherMap Current Weather API
		const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=4bd0296ac3468ba55671920cabb0f745`;
		$.getJSON(url, weatherCurrent => {
			weatherAppView.displayCurrentTemperature(weatherCurrent.main.temp, temperatureSystemIsF)
		});

		/*OpenWeatherMap 5-day Forecast API
        the API returns an array of fourty inconvenient 3-hour forecasts. To find weather forecasts for the next four
        24-hour periods, several functions are used to massage the data before it is displayed.
        */
		const urlForecast = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=4bd0296ac3468ba55671920cabb0f745`;
		//the OpenWeatherMap API gives
		$.getJSON(urlForecast, weatherForecast => {
			for (let day = 1; i < 5; day++) {
				weatherAppView.displayForecastTemperatures(weatherForecast, day, temperatureSystemIsF);
			}
		});
	},
	getHighTemp(weatherData, day, temperatureSystemIsF) {
		let maxTemp = 0;
		const startDay = (day - 1 ) * 8;
		for (let e = startDay; e < startDay + 8; e++) {
			if (maxTemp < weatherData.list[e].main.temp_max) {
				maxTemp = weatherData.list[e].main.temp_max;
			}
		}
		if (temperatureSystemIsF) {
			return `${Math.round(maxTemp * (9 / 5) - 459.67)}&#176`;
		}
		return `${Math.round(maxTemp - 273.15)}&#176`;
	},
	getLowTemp(weatherData, day, temperatureSystemIsF) {
		let minTemp = 1000;
		const startDay = (day - 1) * 8;
		for (let e = startDay; e < startDay + 8; e++) {
			if (minTemp > weatherData.list[e].main.temp_min) {
				minTemp = weatherData.list[e].main.temp_min;
			}
		}
		if (temperatureSystemIsF) {
			return `${Math.round(minTemp * (9 / 5) - 459.67)}&#176`;
		}
		return `${Math.round(minTemp - 273.15)}&#176`;
	}
};

////////////////////////////////////////////////////////////////////
const weatherAppView = {
	displayCurrentWeather(temp, description,cloudCoverage,time,city,country,humidity,windDirection,windspeed,visibility) {
		$("#currentTemperature")
			.empty()
			.append(
				`<p> ${getCurrentTemperature(temp, temperatureSystemIsF)}&#176</p>`
			);
		$("#currentDescription")
			.empty()
			.append(`<p>"${description}"</p>`);
		$("#weatherIcon")
			.empty()
			.append(`<img src='icons/${getWeatherIcon(cloudCoverage, false)}'>`);
		$("#updated")
			.css("opacity", 0.2)
			.empty()
			.append(`<p>updated as of ${time}</p>`)
			.animate({opacity: 1}, 1000);
		$("#cityName")
			.css("opacity", 0.2)
			.empty()
			.append(`<p> ${city}, ${country} </p>`)
			.animate({opacity: 1}, 1000);
		$("#currentHumidity")
			.css("opacity", 0.2)
			.empty()
			.append(`<p>Humidity is ${humidity}%.</p>`)
			.animate({opacity: 1}, 1000);
		$("#currentWind")
			.css("opacity", 0.2)
			.empty()
			.append(`<p>Wind is ${windDirection} at ${windspeed} mph.</p>`)
			.animate({opacity: 1}, 1000);
		$("#currentVisibility")
			.css("opacity", 0.2)
			.empty()
			.append(`<p>Visibility is ${visibility} miles.</p>`)
			.animate({opacity: 1}, 1000);
	},
	displayCurrentTemperature(temperature, temperatureSystemIsF) {
		$("#currentTemperature")
			.css("opacity", 0)
			.empty()
			.append(
				`<p> ${getCurrentTemperature(temperature, temperatureSystemIsF)}&#176</p>`
			)
			.animate({opacity: 1}, 2000);
	},
	displayForecastTemperatures(weatherForecast, day, temperatureSystemIsF) {
		$(`#maxTemp${day}`).css("opacity", 0).empty().append(`<p>${weatherAppModel.getHighTemp(weatherForecast, day, temperatureSystemIsF)}</p>`)
			.animate({opacity: 1}, 2000);
		$(`#minTemp${day}`).css("opacity", 0).empty().append(`<p>${weatherAppModel.getLowTemp(weatherForecast, day, temperatureSystemIsF)}</p>`)
			.animate({opacity: 1}, 2000);
	}
};

const weatherAppController = {};


//* ********************************************
//* ************Main Functions
//* *******************************************
function getCurrentPositionSuccess(position) {
	const json = localStorage.getItem("temperatureSystemIsF");
	const temperatureSystemIsF = JSON.parse(json);

	weatherAppModel.updateCurrentWeatherData(
		position.coords.latitude,
		position.coords.longitude,
		temperatureSystemIsF
	);
	getForecastData(
		position.coords.latitude,
		position.coords.longitude,
		temperatureSystemIsF
	);

	const latlog = [position.coords.latitude, position.coords.longitude];
	const jsonlatlog = JSON.stringify(latlog);
	localStorage.setItem("latlog", jsonlatlog);
}



function getForecastData(lat, lon, temperatureSystemIsF) {
	let delayTime = 0;
	let animationDelay = 700;
	const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=4bd0296ac3468ba55671920cabb0f745`;

	$.getJSON(url, weatherForecast => {
		for (let i = 1; i < 5; i++) {
			$(`#date${i}`)
				.css("opacity", 0)
				.empty()
				.append(
					`<h2>${updateForecastDates(i)[0]} ${updateForecastDates(i)[1]}</h2>`
				)
				.delay(delayTime)
				.animate({opacity: 1}, animationDelay);
			$(`#iconForecast${i}`)
				.css("opacity", 0)
				.empty()
				.append(
					`<img src='icons/${getWeatherIcon(
						getAverageCloudCoverage(weatherForecast, i - 1, i - 1 + 7),
						true
					)}'>`
				)
				.delay(delayTime)
				.animate({opacity: 1}, animationDelay);
			$(`#maxTemp${i}`)
				.css("opacity", 0)
				.empty()
				.append(
					`<p>${getHighTemp(
						weatherForecast,
						i - 1,
						i - 1 + 7,
						temperatureSystemIsF
					)}</p>`
				)
				.delay(delayTime)
				.animate({opacity: 1}, animationDelay);
			$(`#minTemp${i}`)
				.css("opacity", 0)
				.empty()
				.append(
					`<p>${getLowTemp(
						weatherForecast,
						i - 1,
						i - 1 + 7,
						temperatureSystemIsF
					)}</p>`
				)
				.delay(delayTime)
				.animate({opacity: 1}, animationDelay);
			$(`#description${i}`)
				.css("opacity", 0)
				.empty()
				.append(
					`<p>${createDescription(weatherForecast, i - 1, i - 1 + 7)}</p>`
				)
				.delay(delayTime)
				.animate({opacity: 1}, animationDelay);
			$(`#windForecast${i}`)
				.css("opacity", 0)
				.empty()
				.append(
					`<img src="icons/wi-strong-wind.svg"> <p>${getAverageWindSpeed(
						weatherForecast,
						i - 1,
						i - 1 + 7,
						"F"
					)} mph</p>`
				)
				.delay(delayTime)
				.animate({opacity: 1}, animationDelay);
			$(`#rainForecast${i}`)
				.css("opacity", 0)
				.empty()
				.append(
					`<img src="icons/wi-raindrops.svg"><p>${getAverageRain(
						weatherForecast,
						i - 1,
						i - 1 + 7
					)}%</p>`
				)
				.delay(delayTime)
				.animate({opacity: 1}, animationDelay);
			delayTime = delayTime + 200;
		}
	});
}

function stopAnimation(day, callback) {
	$(`#date${day}`).finish();
	$(`#iconForecast${day}`).finish();
	$(`#maxTemp${day}`).finish();
	$(`#minTemp${day}`).finish();
	$(`#description${day}`).finish();
	$(`#windForecast${day}`).finish();
	$(`#rainForecast${day}`).finish();
	callback();
}

function getAndUpdateForecastDetail() {
	const json = localStorage.getItem("latlog");
	const latlog = JSON.parse(json);

	const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${
		latlog[0]
		}&lon=${latlog[1]}&appid=4bd0296ac3468ba55671920cabb0f745`;

	$.getJSON(url, weatherForecast => {
		let day = 1;
		// put in timezone detector. UTC is currently 5 hours ahead(4 in the spring I think) and they only give data every 3
		// hours, making the time 6 hours ahead of us the closest forcast(in actuality this data is for 1 hours later(1 am instead of 12am)
		// to find the 12 am data for the next 4 nights
		for (let e = 0; e < weatherForecast.list.length && day < 5; e++) {
			if (weatherForecast.list[e].dt_txt.includes("06:00:00")) {
				$(`#forecastDetailTime${day}1`)
					.empty()
					.append("<h3>12:00 am</h3>");
				$(`#forecastDetailIcon${day}1`)
					.empty()
					.append(
						`<img src='icons/${getDetailForecastIcon(
							weatherForecast.list[e].weather[0].id,
							false
						)}'>`
					);
				$(`#forecastDetailTemp${day}1`)
					.empty()
					.append(
						`<p>${getCurrentTemperature(
							weatherForecast.list[e].main.temp,
							temperatureSystemIsF
						)}&#176</p>`
					);
				day++;
			}
		}
		day = 1;
		// //to find the 6am data for the next 4 days
		for (let e = 0; e < weatherForecast.list.length && day < 5; e++) {
			if (weatherForecast.list[e].dt_txt.includes("12:00:00")) {
				$(`#forecastDetailTime${day}2`)
					.empty()
					.append("<h3>6:00 am</h3>");
				$(`#forecastDetailIcon${day}2`)
					.empty()
					.append(
						`<img src='icons/${getDetailForecastIcon(
							weatherForecast.list[e].weather[0].id,
							true
						)}'>`
					);
				$(`#forecastDetailTemp${day}2`)
					.empty()
					.append(
						`<p>${getCurrentTemperature(
							weatherForecast.list[e].main.temp,
							temperatureSystemIsF
						)}&#176</p>`
					);
				day++;
			}
		}
		day = 1;
		// //to find the noon data for the next 4 days
		for (let e = 0; e < weatherForecast.list.length && day < 5; e++) {
			if (weatherForecast.list[e].dt_txt.includes("18:00:00")) {
				$(`#forecastDetailTime${day}3`)
					.empty()
					.append("<h3>12:00 pm</h3>");
				$(`#forecastDetailIcon${day}3`)
					.empty()
					.append(
						`<img src='icons/${getDetailForecastIcon(
							weatherForecast.list[e].weather[0].id,
							true
						)}'>`
					);
				$(`#forecastDetailTemp${day}3`)
					.empty()
					.append(
						`<p>${getCurrentTemperature(
							weatherForecast.list[e].main.temp,
							temperatureSystemIsF
						)}&#176</p>`
					);
				day++;
			}
		}
		day = 1;
		// //to find the 6pm data for the next 4 nights
		for (let e = 0; e < weatherForecast.list.length && day < 5; e++) {
			if (weatherForecast.list[e].dt_txt.includes("00:00:00")) {
				$(`#forecastDetailTime${day}4`)
					.empty()
					.append("<h3>6:00 pm</h3>");
				$(`#forecastDetailIcon${day}4`)
					.empty()
					.append(
						`<img src='icons/${getDetailForecastIcon(
							weatherForecast.list[e].weather[0].id,
							true
						)}'>`
					);
				$(`#forecastDetailTemp${day}4`)
					.empty()
					.append(
						`<p>${getCurrentTemperature(
							weatherForecast.list[e].main.temp,
							temperatureSystemIsF
						)}&#176</p>`
					);
				day++;
			}
		}
	});
}

//* ****************************************************
//* ***************Helper Functions
//* ****************************************************
// function updateForecastDetail(weatherForecast.list,day,time,isDay) {
//
// }

function getDetailForecastIcon(id, isDay) {
	if (isDay) {
		if (id === 800) {
			return "day.svg";
		}
		if (id === 801) {
			return "cloudy-day-1.svg";
		}
		if (id === 802) {
			return "cloudy-day-2.svg";
		}
		if (id === 803) {
			return "cloudy-day-3.svg";
		}
		if (id === 804) {
			return "cloudy.svg";
		}
		if (300 <= id && id < 350) {
			return "rainy-2.svg";
		}
		if (500 <= id && id < 550) {
			return "rainy-3.svg";
		}
		if (200 <= id && id < 250) {
			return "thunder.svg";
		}
	} else {
		if (id === 800) {
			return "night.svg";
		}
		if (id === 801) {
			return "cloudy-night-1.svg";
		}
		if (id === 802) {
			return "cloudy-night-2.svg";
		}
		if (id === 803) {
			return "cloudy-night-3.svg";
		}
		if (id === 804) {
			return "cloudy.svg";
		}
		if (300 < id && id < 350) {
			return "rainy-4.svg";
		}
		if (500 <= id && id < 550) {
			return "rainy-6.svg";
		}
		if (200 <= id && id < 250) {
			return "thunder.svg";
		}
	}
	return "";
}

function getWeatherIcon(cloudCoverage, forecastYesNo) {
	const timeNow = new Date(Date.now());
	//	let timeOfSunrise = new Date(timeNow).setHours(0, 0, 0, 0) + new Date(apiSunriseTime).setDate(1) - 18000000;
	const timeOfSunrise = new Date(timeNow).setHours(6, 30, 0, 0);
	const timeOfSunset = new Date(timeNow).setHours(19, 30, 0, 0);

	if ((timeNow < timeOfSunrise || timeOfSunset < timeNow) && !forecastYesNo) {
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

function getCurrentTemperature(temp, temperatureSystemIsF) {
	if (temperatureSystemIsF) {
		return Math.round(Math.floor(temp) * (9 / 5) - 459.67);
	}
	return Math.round(Math.floor(temp) - 273.15);
}

function findWindDirection(degrees) {
	if (degrees < 23 || degrees >= 338) {
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

function updateForecastDates(increment) {
	const timeNow = new Date(Date.now());
	const datePlus = new Date(timeNow.setDate(timeNow.getDate() + increment));
	const datePlusDayOfWeek = getDayOfWeek(datePlus.getDay());

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


function getAverageCloudCoverage(weatherData, startPeriod, endPeriod) {
	let totalCloudCoverage = 0;
	for (let e = startPeriod; e < endPeriod + 1; e++) {
		totalCloudCoverage += weatherData.list[e].clouds.all;
	}
	return totalCloudCoverage / (endPeriod - startPeriod + 2);
}

function getAverageWindSpeed(
	weatherData,
	startPeriod,
	endPeriod,
	weatherSystem
) {
	let averageWindSpeed = 0;
	for (let e = startPeriod; e < endPeriod + 1; e++) {
		averageWindSpeed += weatherData.list[e].wind.speed;
	}
	if (weatherSystem === "F") {
		averageWindSpeed = Math.round(
			averageWindSpeed / (endPeriod - startPeriod + 1) * 3.28 * 3600 / 5280
		);
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
	return Math.round(averageRain / (endPeriod - startPeriod + 1) * 0.7 * 100);
}

function createDescription(weatherData, startPeriod, endPeriod) {
	let clouds, rain;
	const averageCloudCoverage = getAverageCloudCoverage(
		weatherData,
		startPeriod,
		endPeriod
	);
	const averageRain = getAverageRain(weatherData, startPeriod, endPeriod);

	if (averageCloudCoverage < 10) {
		clouds = "clear";
	} else if (averageCloudCoverage < 30) {
		clouds = "few clouds";
	} else if (averageCloudCoverage < 45) {
		clouds = "scattered clouds ";
	} else if (averageCloudCoverage < 60) {
		clouds = "broken clouds";
	} else if (averageCloudCoverage < 80) {
		clouds = "cloudy";
	} else {
		clouds = "overcast";
	}

	if (averageRain === 0) {
		rain = "with no rain";
	} else if (averageRain < 15) {
		rain = "with a small chance of rain";
	} else if (averageRain < 30) {
		rain = "with a chance of rain";
	} else if (averageRain < 50) {
		rain = "with probably some rain";
	} else if (averageRain < 70) {
		rain = "with almost certainly some rain";
	} else {
		rain = "with lots of rain";
	}

	return `${clouds} ${rain}`;
}

function printForecastDayDetail(day) {
	return `
	<div class="forecastDetail" id="11">
		<div class="forecastDetailQuad" id="forecastDetail11">
			<div class="forecastDetailTime" id="forecastDetailTime${day}1"></div>
			<div class="forecastDetailIcon" id="forecastDetailIcon${day}1"></div>
			<div class="forecastDetailTemp" id="forecastDetailTemp${day}1"></div>
		</div>
		<div class="forecastDetailQuad" id="forecastDetail12">
			<div class="forecastDetailTime" id="forecastDetailTime${day}2"></div>
			<div class="forecastDetailIcon" id="forecastDetailIcon${day}2"></div>
			<div class="forecastDetailTemp" id="forecastDetailTemp${day}2"></div>
		</div>
		<div class="forecastDetailQuad" id="forecastDetail14">
			<div class="forecastDetailTime" id="forecastDetailTime${day}4"></div>
			<div class="forecastDetailIcon" id="forecastDetailIcon${day}4"></div>
			<div class="forecastDetailTemp" id="forecastDetailTemp${day}4"></div>
		</div>
		<div class="forecastDetailQuad" id="forecastDetail13">
			<div class="forecastDetailTime" id="forecastDetailTime${day}3"></div>
			<div class="forecastDetailIcon" id="forecastDetailIcon${day}3"></div>
			<div class="forecastDetailTemp" id="forecastDetailTemp${day}3"></div>
		</div>
	</div>`;
}

function OnMouseEnter(event) {
	const $forecastDay = $(`#forecastDay${event.data.value}`);
	$(".redButton").hide();
	$forecastDay.off("mouseenter");
	if (!forecastSaved[event.data.value] && $(`#rainForecast4`).text() !== "") {
		stopAnimation(event.data.value, function () {
			forecastSaved[event.data.value] = $forecastDay.html();
		});
	}

	if (!forecastDetailSaved[event.data.value]) {
		$forecastDay.empty().append(printForecastDayDetail(event.data.value));
		getAndUpdateForecastDetail();
	} else {
		$forecastDay.empty().append(forecastDetailSaved[event.data.value]);
	}
	$forecastDay.on("mouseleave", {value: event.data.value}, OnMouseLeave);
}

function OnMouseLeave(event) {
	const $forecastDay = $(`#forecastDay${event.data.value}`);
	$forecastDay.off("mouseleave");
	if (
		!forecastDetailSaved[event.data.value] &&
		$(`#forecastDetailTemp${event.data.value}4`).text() !== ""
	) {
		forecastDetailSaved[event.data.value] = $forecastDay.html();
	}
	$forecastDay.empty().append(forecastSaved[event.data.value]);
	$forecastDay.on("mouseenter", {value: event.data.value}, OnMouseEnter);
}
