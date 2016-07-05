var Fetch = require('whatwg-fetch');
var rootUrl = 'http://api.openweathermap.org/data/2.5/weather?q=';
var apiUrl = '&appid=OPENWEATHER_API_KEY';

module.exports = {
  get: function(place){
    place = place.replace(' ', '_');
    return fetch(rootUrl + place + apiUrl, {
      headers: {

      }
    })
    .then(function(response){
      return response.json();
    });
  }
};
