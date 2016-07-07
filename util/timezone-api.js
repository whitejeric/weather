
import {GOOGLE_TIMEZONE_BROWSER_KEY} from './api-keys';

var Fetch = require('whatwg-fetch');
var rootUrl = 'https://maps.googleapis.com/maps/api/timezone/json?location=';
var apiUrl = `&key=${GOOGLE_TIMEZONE_BROWSER_KEY}`;

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
