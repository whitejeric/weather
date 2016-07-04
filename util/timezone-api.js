var Fetch = require('whatwg-fetch');
var rootUrl = 'https://maps.googleapis.com/maps/api/timezone/json?location=';
var apiUrl = '&key=AIzaSyAs-o9mhtpo6N2D2zcsTh0ZStajK8Ihbes';

module.exports = {
  get: function(lat, lng, timeInGMT){
    return fetch(rootUrl + lat + ',' + lng + '&timestamp=' + timeInGMT + apiUrl, {
      headers: {

      }
    })
    .then(function(response){
      return response.json();
    });
  }
};
