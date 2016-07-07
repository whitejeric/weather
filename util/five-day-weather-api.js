
import {OPENWEATHER_KEY} from './api-keys';

var Fetch = require('whatwg-fetch');
var rootUrl = 'http://api.openweathermap.org/data/2.5/forecast?q=';
var apiUrl = `&appid=${OPENWEATHER_KEY}`;
=======
var Fetch = require('whatwg-fetch');
var rootUrl = 'http://api.openweathermap.org/data/2.5/forecast?q=';
var apiUrl = '&appid=OPEN_WEATHER_API_KEY';
>>>>>>> 92cea3e056b604b6bdaf47c2992cd0860141f360

module.exports = {
  get: function(place){
    return fetch(rootUrl + place + apiUrl, {
      headers: {

      }
    })
    .then(function(response){
      return response.json();
    });
  }
};
