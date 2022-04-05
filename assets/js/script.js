var searchFormEl = document.querySelector('#search-form');
var resultTextEl = document.querySelector('#result-text');
var resultContentEl = document.querySelector('#result-content');
var resultCardContentEl = document.querySelector('#result-cards');
var historyEl = document.querySelector('#history-content');
var searchInputVal = ""
var history = [];
var APIkey = "6eaf1337acba1c6298fe0be89eacdfd5"

//to handle the search task
function handleSearchFormSubmit(event) {
    event.preventDefault();

    var searchInputVal = document.querySelector('#search-input').value;
    console.log(searchInputVal)
    //if no value was input
    if (!searchInputVal) {
        console.error('You need a search input value!');
        resultCardContentEl.innerHTML = ""
        return;
    }

    var query = searchInputVal
    searchApi(query);

    console.log(query)
    //pulls history if it exists
    function renderHistory() {
        var historicalSearch = document.createElement('div');
        historicalSearch.classList.add('card', 'historical-search', 'bg-light', 'text-dark', 'mb-3', 'p-3');
        historicalSearch.textContent = searchInputVal
        historicalSearch.dataset.value = searchInputVal
        historyEl.append(historicalSearch)
        console.log(historicalSearch)
    }
    renderHistory();
    // still need to get all the previous options in one go and save it 
    var history = [];
    history.push(query);
    localStorage.setItem("history", JSON.stringify(history))

}

// pulls from history and renders history from local storage
function pullHistory() {
    var storedHistory = JSON.parse(localStorage.getItem("history"));

    if (storedHistory !== null) {
        for (var i = 0; i < storedHistory.length; i++) {
            console.log(storedHistory)
            var historicalSearch = document.createElement('div');
            historicalSearch.classList.add('card', 'historical-search', 'bg-light', 'text-dark', 'mb-3', 'p-3');
            historicalSearch.textContent = storedHistory
            historicalSearch.dataset.value = storedHistory
            historyEl.append(historicalSearch)
        }
    }

}
pullHistory();

//if a selection from history was selected, to run the search API
var historyElSubmit = function (event) {

    var previousOpt = event.target.getAttribute('data-value');
    console.log("historical selection is" + previousOpt)
    if (previousOpt) {
        var query = previousOpt
        searchApi(query)
    }


}

//search for the lon lat from the input
function searchApi(query) {
    var locQueryUrl = 'https://api.openweathermap.org/geo/1.0/direct?';


    locQueryUrl = locQueryUrl + 'q=' + query + '&limit=5&appid=' + APIkey

    console.log(locQueryUrl)
    fetch(locQueryUrl)

        .then(function (response) {
            console.log(response);
            if (!response.ok) {
                throw response.json();
            }


            return response.json();
        })
        .then(function (locRes) {
            console.log(locRes)


            //if no results came back
            if (!locRes.length) {
                console.log('No results found!');
                resultContentEl.innerHTML = '<h3>No results found, search again!</h3>';
                resultTextEl.textContent = ""
                resultCardContentEl.innerHTML = ""
            }
            // if results came back with the lon and lat
            else {
                var country = locRes[0].country
                var today = moment().format("MMM Do, YYYY");
                resultContentEl.innerHTML = ""
                resultCardContentEl.innerHTML = ""
                resultTextEl.textContent = "Showing results for " + query + ", " + country
                resultContentEl.innerHTML = '<p>' + today + '</p>';
                console.log('Results have been found for ' + query)
                var lon = locRes[0].lon
                var lat = locRes[0].lat

                console.log(lon)
                console.log(lat)
                searchWeatherForcast(lon, lat, country);


            }
        })

}

//to search for the weather using lon lat 
function searchWeatherForcast(lon, lat, country) {
    var localWeatherQueryUrl = "https://api.openweathermap.org/data/2.5/onecall?units=metric&lat=" + lat + "&lon=" + lon + "&appid=" + APIkey
    console.log(localWeatherQueryUrl)
    fetch(localWeatherQueryUrl)
        .then(function (response) {
            if (!response.ok) {
                throw response.json();
            }

            return response.json();
        })
        .then(function (weatherRes) {
            console.log(weatherRes)
            var currentTemp = weatherRes.current.temp

            console.log("current weather is " + currentTemp)
            //prints current weather
            printResults(weatherRes, country)
            //prints the future forecast and date
            for (var i = 0; i < 5; i++) {
                var date = moment().add(i + 1, 'days').format('MMMM Do YYYY')

                printForecastResults(weatherRes.daily[i], date);
            }

        });
}
//adds the cards for current weather
function printResults(resultObj, country) {
    console.log(resultObj)
    console.log('the country is ' + country)
    var resultCard = document.createElement('div');
    resultCard.classList.add('custom-card', 'text-dark', 'mb-3', 'p-3');

    var resultBody = document.createElement('div');
    resultBody.classList.add('card-body');
    resultCard.append(resultBody);


    var titleEl = document.createElement('h3');
    titleEl.textContent = searchInputVal;

    var bodyContentEl = document.createElement('p');

    var weatherIcon = resultObj.current.weather[0]
    var iconLocation = weatherIcon.icon
    var weatherDescription = weatherIcon.description

    var iconPNG = "https://openweathermap.org/img/wn/" + iconLocation + ".png";

    bodyContentEl.innerHTML +=
        '<img src="' + iconPNG + '" alt=" ' + weatherDescription + '"><br/>'
    bodyContentEl.innerHTML +=
        '<strong> ' + weatherDescription + '</strong><br/>';

    var temp = resultObj.current.temp
    temp = Math.round(temp)
    bodyContentEl.innerHTML +=
        '<strong>Temperature: ' + temp + '°C</strong><br/>';


    bodyContentEl.innerHTML +=
        '<strong>Wind Speed: ' + resultObj.current.wind_speed + ' MPS</strong><br/>';

    bodyContentEl.innerHTML +=
        '<strong>Humidity: ' + resultObj.current.humidity + '%</strong><br/>';

    var UVindex = resultObj.current.uvi
    //determines the uv index colour
    if (UVindex <= 2) {
        bodyContentEl.innerHTML +=
            '<p style="color:green"> UV index: ' + UVindex + '</p>';
    } else if (UVindex > 2 && UVindex <= 5) {
        bodyContentEl.innerHTML +=
            '<p style="color:#F6BE00"> UV index: ' + UVindex + '</p>';
    }
    else if (UVindex > 5 && UVindex <= 7) {
        bodyContentEl.innerHTML +=
            '<p style="color:orange"> UV index: ' + UVindex + '</p>';
    }
    else if (UVindex > 7 && UVindex <= 10) {
        bodyContentEl.innerHTML +=
            '<p style="color:red"> UV index: ' + UVindex + '</p>';
    }
    else {
        bodyContentEl.innerHTML +=
            '<p style="color:purple"> UV index: ' + UVindex + '</p>';
    }

    //appends the card to the body
    resultBody.append(titleEl, bodyContentEl);
    resultContentEl.append(resultCard);

}

//prints the future forecast and date
function printForecastResults(resultObj, date) {
    console.log(resultObj)
    var resultCard = document.createElement('div');
    resultCard.classList.add('col-lg-2-5', 'text-black', 'mb-3', 'p-2');

    var resultBody = document.createElement('div');
    resultBody.classList.add('card-body');
    resultCard.append(resultBody);


    var titleEl = document.createElement('h3');
    titleEl.textContent = searchInputVal;

    var bodyContentEl = document.createElement('p');

    var weatherIcon = resultObj.weather[0]
    var iconLocation = weatherIcon.icon
    var weatherDescription = weatherIcon.description

    var iconPNG = "https://openweathermap.org/img/wn/" + iconLocation + ".png";

    bodyContentEl.innerHTML +=
        date + '<br/>';

    bodyContentEl.innerHTML +=
        '<img src="' + iconPNG + '" alt=" ' + weatherDescription + '"><br/>'
    bodyContentEl.innerHTML +=
        '<strong> ' + weatherDescription + '</strong><br/>';

    var temp = resultObj.temp.day
    temp = Math.round(temp)
    bodyContentEl.innerHTML +=
        '<strong>Temperature: ' + temp + '°C</strong><br/>';


    bodyContentEl.innerHTML +=
        '<strong>Wind Speed: ' + resultObj.wind_speed + ' MPS</strong><br/>';

    bodyContentEl.innerHTML +=
        '<strong>Humidity: ' + resultObj.humidity + '%</strong><br/>';

    var UVindex = resultObj.uvi

    if (UVindex <= 2) {
        bodyContentEl.innerHTML +=
            '<p style="color:green"> UV index: ' + UVindex + '</p>';
    } else if (UVindex > 2 && UVindex <= 5) {
        bodyContentEl.innerHTML +=
            '<p style="color:#F6BE00"> UV index: ' + UVindex + '</p>';
    }
    else if (UVindex > 5 && UVindex <= 7) {
        bodyContentEl.innerHTML +=
            '<p style="color:orange"> UV index: ' + UVindex + '</p>';
    }
    else if (UVindex > 7 && UVindex <= 10) {
        bodyContentEl.innerHTML +=
            '<p style="color:red"> UV index: ' + UVindex + '</p>';
    }
    else {
        bodyContentEl.innerHTML +=
            '<p style="color:purple"> UV index: ' + UVindex + '</p>';
    }

    resultBody.append(titleEl, bodyContentEl);
    resultCardContentEl.append(resultCard);

}


//event listener for buttons
searchFormEl.addEventListener('submit', handleSearchFormSubmit);
historyEl.addEventListener('click', historyElSubmit);