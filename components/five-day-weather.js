import React from 'react';
import ReactBootstrap from 'react-bootstrap';
import {
  DropdownButton, MenuItem, Input,
  FormGroup, FormControl, ControlLabel,
  ButtonGroup, Dropdown, Glyphicon} from 'react-bootstrap';

import HotSearch from './hot-search';
import WeatherSquare from './weather-square';
import RegionSelector from './region-selector';
import SingleWeather from './single-weather';

import FiveDayWeatherApi from '../util/five-day-weather-api';
import TimezoneApi from '../util/timezone-api';

var moment = require('moment');

var query = ''; //?city=London, Paris, Berlin
var cities = []; //transfrom ^ into array
var citiesWeather = []; //FiveDayWeatherApi cache
var currentCity = 0;


cities = ['disabled, Canada',
          'Edmonton, AB', 'Fort McMurray, AB', 'Toronto, ON',
          'Vancouver, BC',
          'disabled, United States',
          'Charles City, VA', 'Clayton, NC', 'Salt Lake City, UT',
          'New York, NY',
          'disabled, South America',
          'Guatemala City, Guatemala', 'Lima, Peru', 'Santiago, Chile'];

require("react-bootstrap/lib/Nav");

export default class FiveDayWeather extends React.Component{
  constructor(){
    super();
    console.log('construct!');
    this.state={
      weather: '',
      temp: 0,
      humidity: 0,
      wind: 0,
      minTemp: 0,
      maxTemp: 0,
      lat: 0,
      lng: 0,
      time: 0,
      geoOff: 0,
      geoTime: 0
    }
  }

  handleSubmit(e){
    cities.push(e);
    currentCity = cities.length - 1;
    this.fetchData();
  }

  fetchData(){
    console.log('fetching: ' + cities[currentCity]);
    //get the data from the cache if its there
    if (citiesWeather[currentCity]){
      console.log(citiesWeather[currentCity].city.name + ' has already been fetched, is now being updated.');
      this.updateData();
    }
    else{
      //request more data from the FiveDayWeatherApi
      FiveDayWeatherApi.get(cities[currentCity])
        .then(function(data){
          citiesWeather[currentCity] = data;
          console.log(data);
          var d = new Date();
          var t  = (d.getTime() / 1000);
          TimezoneApi.get(citiesWeather[currentCity].city.coord.lat, citiesWeather[currentCity].city.coord.lon, t)
              .then(function(doto){
                  this.adjustRegionTime(doto.dstOffset + doto.rawOffset);
                  this.getFiveDayData(citiesWeather[currentCity].list);
            }.bind(this));
          this.updateData();
        }.bind(this));
    }
    this.render();
  }

  getFiveDayData(cityArray){
    //console.log(cityArray);
    var offset = parseInt(this.state.geoOff);

    var cityClone = cityArray;

    cityClone.forEach(function(threeHourBlock){
    //  console.log('GMT: ' + threeHourBlock.dt_txt);

      threeHourBlock.dt_txt = new Date(threeHourBlock.dt_txt);
  //    console.log('DATE: ' + threeHourBlock.dt_txt);
    //  console.log('UDT: ' + threeHourBlock.dt_txt.getTime());

      threeHourBlock.dt_txt = threeHourBlock.dt_txt.getTime() + offset;
  //    console.log('UDT2: ' + threeHourBlock.dt_txt);

      threeHourBlock.dt_txt = moment(threeHourBlock.dt_txt).format('DD/MM/YYYY h:mm a')
    });


    var today = new Date();
    var browserOffset = today.getTimezoneOffset() * 60 * 1000;
    var browserToday = new Date(today.getTime() + offset + browserOffset);

    var todayDayCount = browserToday.getDate();
    var tmrwDayCount = cityClone[0].dt_txt.substring(0, 2);
    var tmrwDayIndex = 0;

    for (var i = 0; i < cityClone.length && tmrwDayCount == todayDayCount; i++){
      tmrwDayCount = cityClone[i].dt_txt.substring(0, 2);
      if (tmrwDayCount != todayDayCount){
        tmrwDayIndex = i;
      }
    }

    var hour = 2;
    var hourHi = 0;
    var hourLo = 0;
    var day = 0;
    var dayTemps = [];
    var dayAvg = 0;
    var dayHi = cityClone[tmrwDayIndex].main.temp_max - 273.15;
    var dayLo = cityClone[tmrwDayIndex].main.temp_min - 273.15;

    for (var j = tmrwDayIndex; j < cityClone.length; j++){
      if (hour >= 26){
        dayTemps[day] = {
          date: cityClone[j - 4].dt_txt,
          weatherId: cityClone[j - 4].weather[0].id,
          avgTemp: Math.round(dayAvg / 8),
          hiTemp: Math.round(dayHi),
          loTemp: Math.round(dayLo)
        };
        dayAvg = 0;
        hour = 2;
        day++;
        dayHi = cityClone[j].main.temp_max - 273.15;
        dayLo = cityClone[j].main.temp_min - 273.15;
      }
      hourHi = cityClone[j].main.temp_max - 273.15;
      hourLo = cityClone[j].main.temp_min - 273.15;

      // console.log('dayHi ' + Math.round(dayHi) + ' hourHi ' + Math.round(hourHi));

      if (hourHi > dayHi){
        dayHi = hourHi;
      }
      //console.log('dayLo ' + Math.round(dayLo) + ' hourLo ' + Math.round(hourLo));

      if (hourLo < dayLo){
        dayLo = hourLo;
      }

      dayAvg = dayAvg + ((hourLo + hourHi) / 2);

      //console.log('current M/m: ' + Math.round(dayHi) + ' / ' + Math.round(dayLo) + '  on day: ' + day + ' date: ' + cityClone[j].dt_txt + ' h: ' + hour);

      hour+=3;

      if (j == cityClone.length - 1){
        dayTemps[day] = {
          date: cityClone[j - 4].dt_txt,
          weatherId: cityClone[j - 4].weather[0].id,
          avgTemp: Math.round(dayAvg / 8),
          hiTemp: Math.round(dayHi),
          loTemp: Math.round(dayLo)
        };

      }
    }
    console.log(dayTemps);

  }

  adjustRegionTime(geoOffset){
    //console.log(geoOffset);

    var localTime = new Date();
    var localOff = localTime.getTimezoneOffset() * 60;
    var lTime = localTime.getTime();
    var totalOffset = (localOff + geoOffset)  * 1000;
    var equals = (parseInt(lTime) + totalOffset);

    /*console.log('local offset: ' + (localOff/60));
    console.log('geo offset: ' + (geoOffset/60));
    console.log('total offset: ' + (totalOffset/60));
    console.log('ltime: ' + lTime)
    console.log('ltime + totalOff: ' + equals);
    console.log('ltime - equals: ' + (lTime - equals));
    console.log('ltime - equals: ' + (lTime - equals)/360);*/


    var newDate = new Date(equals);
  /*  console.log('localtime: ' + localTime);
    console.log('adj: ' + newDate + ' moment: ' + moment(newDate).format('h:mm a'));*/

    if (this.state.geoTime != moment(newDate).format('h:mm a')){
      this.setState({
        geoOff: (geoOffset * 1000),
        geoTime: moment(newDate).format('h:mm a')
      });
    }
  }

  updateData(){
    console.log('updating!');

    this.setState({
      weather:citiesWeather[currentCity].list[0].weather[0].id,
      temp: Math.round(citiesWeather[currentCity].list[0].main.temp - 273.15),
      humidity: Math.round(citiesWeather[currentCity].list[0].main.humidity),
      wind: Math.round(citiesWeather[currentCity].list[0].wind.speed),
      minTemp: Math.round(citiesWeather[currentCity].list[0].main.temp_min - 273.15),
      maxTemp: Math.round(citiesWeather[currentCity].list[0].main.temp_max - 273.15),
      lat: citiesWeather[currentCity].city.coord.lat,
      lng: citiesWeather[currentCity].city.coord.lon,
      time: citiesWeather[currentCity].list[0].dt
    });




  }

  componentWillMount(){
    //get the query string data
    console.log('mounting: ' + cities[currentCity]);
    query = location.search.split('=')[1];

    //figure out if we need to display more than one city's weather
    if (query !== undefined){
      cities = query.split(','); //get an array of city names

      //set the interval to load new cities
      if (cities.length > 1){
        setInterval((function(){
          currentCity++;
          if(currentCity === cities.length){
            currentCity = 0;
          }
          this.fetchData(); //reload the city every 5 seconds
        }).bind(this), 5000);
      }
    }

    currentCity = 4; //Vancouver
    //create timer to clear cache after 5 minutes so we can get update data
    setInterval(function(){
      citiesWeather = [];
    }, (1000*60*5));

    this.fetchData();
  }

  changeRegion(index){
    currentCity = index;
    this.fetchData();
  }

  render(){
    console.log('rendering');


    return (
      <div>5day


      </div>

    )
  }
}
