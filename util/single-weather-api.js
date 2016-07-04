var Fetch = require('whatwg-fetch');
var rootUrl = 'http://api.openweathermap.org/data/2.5/weather?q=';
var apiUrl = '&appid=bfb3f70a8cf06a906ea097f79fba35e3';

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
