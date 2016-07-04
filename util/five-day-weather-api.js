var Fetch = require('whatwg-fetch');
var rootUrl = 'http://api.openweathermap.org/data/2.5/forecast?q=';
var apiUrl = '&appid=bfb3f70a8cf06a906ea097f79fba35e3';

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
