//Grabbing elements in the main card, where the weather info for the chosen city will be shown
var lastCitySearchEl = document.querySelector(".card-header");
var currentDateEl = document.getElementById("current-day");
var currentIcon = document.querySelector("#current-icon");
console.log(currentIcon);
var cityTemp = document.querySelector("#current-temp");
var cityWind = document.querySelector("#current-wind");
var cityHumidity = document.querySelector("#current-humidity");
var cityDesc = document.querySelector("#current-description");
// Grabbing elements pertaining to the user's search history
var showHistoryEl = document.getElementById("show-history");
var recentHistEl = document.querySelector("#recent-history");
var recentHistList = document.querySelector("#recent-history-list")
//Grabbing the element where the forecasts for the next five days will be displayed
var forecastDisplayEl = document.querySelector("#forecasts");

var futureDaysWeather = [];

for (let i = 0; i < 5; i++) {

    //Getting the HTML elements where the info will be displayed for each of the 5 small cards with the forecast info

    var Day = document.getElementById("day-" + i);
    var Temp = document.getElementById("temp-" + i);
    var Humid = document.getElementById("humidity-" + i);
    var Wind = document.getElementById("wind-" + i);
    var Icon = document.getElementById("icon-" + i);
    var Desc = document.getElementById("description-"+ i);

    //Storing the references to the display elements in an object

    var forecastedWeather = {
        day: Day,
        temp: Temp,
        humid: Humid,
        wind: Wind,
        icon: Icon,
        description: Desc
    }
    futureDaysWeather.push(forecastedWeather); //Storing each of the forecast objects into an array

};

//This is the activated key for the fetch requests

const openWeatherAPIKey = "c78a2807f103a8edbc1b0bba2c9c1d8d";

const countryCode = "ISO 3166-2:US"; //We will limit ourselves to cities in American territories; to be used in the fetching URL to find coordinates.

//Abbreviations for each of the 50 states plus D.C., Virgin Islands and Puerto Rico
var statesArray = ['AL', 'AK', 'AZ', 'AR', 'CA',
    'CO', 'CT', 'DE', 'DC', 'FL',
    'GA', 'HI', 'ID', 'IL', 'IN',
    'IA', 'KS', 'KY', 'LA', 'ME',
    'MD', 'MA', 'MI', 'MN', 'MS',
    'MO', 'MT', 'NE', 'NV', 'NH',
    'NJ', 'NM', 'NY', 'NC', 'ND',
    'OH', 'OK', 'OR', 'PA', 'PR',
    'RI', 'SC', 'SD', 'TN', 'TX',
    'UT', 'VT', 'VA', 'VI', 'WA',
    'WV', 'WI', 'WY'];

var stateNamesArray = ['Alabama', 'Arkansas', 'Arizona', 'Arkansas', 'California',
    'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Florida',
    'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana',
    'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
    'Maryland', 'Massachussets', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
    'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Puerto Rico',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas',
    'Utah', 'Vermont', 'Virginia', 'Virgin Islands', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming'];

// Grabbing the form elements
var stateInputEl = document.querySelector('#state-input');
var stateInputBtn = document.querySelector('#state-btn');

var cityInputEl = document.querySelector("#city-input");
var cityInputBtn = document.querySelector("#city-btn")

// Variables to store the input from the user
var cityInput;
var stateInput;

//Event listeners for each button of each input field
cityInputBtn.addEventListener('click', () => {

    recentHistEl.setAttribute("style", "visibility:hidden;");
    cityInput = cityInputEl.value;
    console.log(cityInput);
    if (!stateInput || !cityInput) {
        alert("Remember that both inputs are required.");
    } else {
        findCityCoordinates(cityInput, stateInput);
    };

})

stateInputBtn.addEventListener('click', () => {
    var state = stateInputEl.value.toUpperCase();
    for (let i = 0; i < 53; i++) {
        if (state === stateNamesArray[i].toUpperCase()) {
            stateInput = statesArray[i];
        };
    };
    console.log(stateInput);
    if (!cityInput || !stateInput) {
        alert("Remember that both inputs are required.");
    } else {
        findCityCoordinates(cityInput, stateInput);
    };

});

//This loosely boolean-valued variable will serve to trigger an alert to the user if the chosen city is not in the specified territory
var cityIsInState;

//Array to store the coordinates found with GeoCoding API
var cityCoord = new Array(2);

//Array to retrieve and store from client-side storage
var searchedCities = JSON.parse(localStorage.getItem("searchedCities")) || [];
//Var stores the last city that was searched
var lastCitySearched;


//Displaying the weather info of the last city searched in case there is something in localStorage
function init() {

    if (searchedCities.length === 0) {
        lastCitySearchEl.textContent = "Please enter a city and a state in the provided input fields.";
        currentDateEl.textContent = new Date();
    } else {

        lastCitySearched = searchedCities[searchedCities.length - 1];
        findCurrentWeather(lastCitySearched.lat, lastCitySearched.lon);

    };
}

init();

//Makes a fetch request to GeoCode API to find the latitude and longitude odf the city
function findCityCoordinates(city, state) {

    var geoCodeAPIUrl = "https://api.openweathermap.org/geo/1.0/direct?q=" + city + "," + state + ", " + countryCode + "&limit=1&appid=" + openWeatherAPIKey;

    fetch(geoCodeAPIUrl)
        .then(function (response) {
            if (!response.ok) {

                return Promise(reject(response.statusText));
            }

            return response.json()
        })
        .then(function (data) {

            if (!data) {
                return;
            }

            console.log(data);
            cityIsInState = data.length;
            console.log(Boolean(cityIsInState));

            if (Boolean(cityIsInState)) { //Verifies if the city entered is in the given U.S. territory

                cityCoord[0] = data[0].lat;
                cityCoord[1] = data[0].lon;

                //Making calls to the following two functions, passing the coordinates as arguments, in order to retrieve data about current and future weather conditions

                findCurrentWeather(cityCoord[0], cityCoord[1]);
                findNextFiveForecasts(cityCoord[0], cityCoord[1]);

                //Storing data that would be relevant for future repeated searches into localStorage

                var currentCity = {

                    name: cityInput,
                    state: stateInput,
                    lat: cityCoord[0],
                    lon: cityCoord[1]

                };
                console.log(currentCity);

                if (currentCity !== undefined) {
                    searchedCities.push(currentCity);
                }

                localStorage.setItem("searchedCities", JSON.stringify(searchedCities));
                console.log(localStorage);

            } else {
                alert("The chosen city is not in the selected U.S. territory.")
            };
        }).catch(function (err) {
            console.log(err);
        });
}

// Uses OpenWeather API to find current weather conditions for the city, displays the info on main card

function findCurrentWeather(lat, lon) {

    var findCurrentWeatherUrl = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=" + openWeatherAPIKey;

    fetch(findCurrentWeatherUrl)
        .then(function (response) {
            if (!response.ok) {

                return Promise(reject(response.statusText));
            }

            return response.json();

        }).then(function (data) {
            if (!data) {
                return;
            }

            console.log(data);

            //Updating the info on the card corresponding to the last city searched

            var currentIconUrl = "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png";
            currentIcon.setAttribute("src", "./assets/images/10n.png");

            currentDateEl.textContent = dayjs(dayjs.unix(data.dt)).format('dddd, MMM D, YYYY');
            cityTemp.textContent = data.main.temp + ' °F';
            cityWind.textContent = data.wind.speed + ' mph';
            cityHumidity.textContent = data.main.humidity + '%';
            cityDesc.textContent = data.weather[0].main;
            lastCitySearchEl.textContent = data.name;

        }).catch(function (err) {
            console.log(err);
        });
}

// Uses Next Five Days Weather Forecast API in order to find that info for the given city and print the results on the small cards

function findNextFiveForecasts(lat, lon) {

    var fiveDayForecastUrl = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=" + openWeatherAPIKey;

    fetch(fiveDayForecastUrl)
        .then(function (response) {
            if (!response.ok) {

                return Promise(reject(response.statusText));
            }

            return response.json();

        }).then(function (data) {
            if (!data) {
                return;
            }
            console.log(data.list);//An object with weather forecasts for each 3 hour period during the next five days. 

            forecastDisplayEl.style.visibility = "visible";

            for (let i = 0; i < 5; i++) {

                var weatherForecast = data.list[i * 8]; //We choose to display the forecast for the weather conditions at 0:00 AM (midnight)of every day

                futureDaysWeather[i].day.textContent = dayjs(weatherForecast.dt_txt).format('dddd, MMM D, YYYY');
                futureDaysWeather[i].temp.textContent = weatherForecast.main.temp + " °F";
                futureDaysWeather[i].wind.textContent = weatherForecast.wind.speed + " mph";
                futureDaysWeather[i].humid.textContent = weatherForecast.main.humidity + "%";
                futureDaysWeather[i].icon.src = "https://openweathermap.org/img/w/" + weatherForecast.weather[0].icon + ".png";
                futureDaysWeather[i].description.textContent =  weatherForecast.weather[0].main;

            };
        }).catch(function (err) {
            console.log(err);
        })
}

//This button allows us to search recent history

showHistoryEl.addEventListener('toggle', showSearchedCities);

//Renders the names of the recently searched cities to the screen, allowing the user to retrieve weather info about them again

function showSearchedCities(event) {

    event.stopPropagation();

    if (searchedCities.length === 0) {

        alert("No cities have been searched yet. Please enter info on any American city you like in the given fields.");

    } else {

        recentHistEl.style.visibility = "visible";

        for (let i = 2; i < recentHistList.children.length; i++) {

            recentHistList.removeChild(recentHistList.children[i]);//The already dynamically created elements are removed to prevent duplication
        };

        for (let k = 0; k < searchedCities.length; k++) {
            var btn = document.createElement("button");
            btn.className = "btn btn-info btn-large";
            btn.textContent = searchedCities[k].name.toUpperCase() + ", " + searchedCities[k].state;
            recentHistEl.children[1].appendChild(btn);
        };
    }

}


//Using event delegation, once the user clicks a button on the recent history search list, another search is triggered
recentHistList.addEventListener('click', function (event) {

    event.preventDefault();

    var element = event.target;
    var btnText = element.innerHTML;
    var cityStateArr = btnText.split(",");
    var city = cityStateArr[0];
    var state = cityStateArr[1];

    findCityCoordinates(city, state);

})

//Gets the buttons, displayed on top of the list with the searched city items, that allow the user to either delete or close the search history.

var closeList = document.getElementById("close-history");
var deleteList = document.getElementById("delete-history");

//Adding the event handlers for functionality
closeList.addEventListener("click", function (event) {
    event.preventDefault();
    recentHistEl.setAttribute("style", "visibility:hidden;");
    window.alert = function(){ };
});

deleteList.addEventListener("click", function (event) {
    event.preventDefault();
    searchedCities = [];
    for (let i = 2; i < recentHistList.children.length; i++) {

        recentHistList.removeChild(recentHistList.children[i]);

    }
    localStorage.clear();
    
    window.alert = function(){ };
});
