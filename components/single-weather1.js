import React from 'react';
import ReactBootstrap from 'react-bootstrap';
import {
  DropdownButton, MenuItem, Input,
  FormGroup, FormControl, ControlLabel,
  ButtonGroup, Dropdown, Glyphicon} from 'react-bootstrap';

import HotSearch from './hot-search';
import WeatherSquare from './weather-square';
import RegionSelector from './region-selector';

import SingleWeatherApi from '../util/single-weather-api';
import TimezoneApi from '../util/timezone-api';

var moment = require('moment');

var query = ''; //?city=London, Paris, Berlin
var cities = []; //transfrom ^ into array
var citiesWeather = []; //SingleWeatherApi cache
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

export default class SingleWeather extends React.Component{
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
      console.log(citiesWeather[currentCity].name + ' has already been fetched, is now being updated.');
      this.updateData();
    }
    else{
      //request more data from the SingleWeatherApi
      SingleWeatherApi.get(cities[currentCity])
        .then(function(data){
          citiesWeather[currentCity] = data;
          console.log(data);
          var clientDate = new Date();
          var clientDateInUDTSeconds  = (clientDate.getTime() / 1000);
          TimezoneApi.get(citiesWeather[currentCity].coord.lat, citiesWeather[currentCity].coord.lon, clientDateInUDTSeconds)
              .then(function(doto){
                  this.adjustRegionTime(doto.dstOffset + doto.rawOffset);
            }.bind(this));
          this.updateData();
        }.bind(this));
    }
    this.render();
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
    console.log('localtime: ' + localTime);
    console.log('adj: ' + newDate + ' moment: ' + moment(newDate).format('h:mm a'));

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
      weather:citiesWeather[currentCity].weather[0].id,
      temp: Math.round(citiesWeather[currentCity].main.temp - 273.15),
      humidity: Math.round(citiesWeather[currentCity].main.humidity),
      wind: Math.round(citiesWeather[currentCity].wind.speed),
      minTemp: Math.round(citiesWeather[currentCity].main.temp_min - 273.15),
      maxTemp: Math.round(citiesWeather[currentCity].main.temp_max - 273.15),
      lat: citiesWeather[currentCity].coord.lat,
      lng: citiesWeather[currentCity].coord.lon,
      time: citiesWeather[currentCity].dt
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

  //  this.adjustRegionTime();

    //class names with dynamic data
    var weatherClass = 'wi wi-owm-';
    weatherClass = weatherClass.concat(this.state.weather);
    var bgColorClass = 'weather-widget '; //very warm, warm, normal etc.
    var elementsColorClass = 'el ';

    //set bg color based on temp
    if (this.state.temp >= 30){
      bgColorClass += 'very-warm';
      elementsColorClass += 'very-warm';
    }
    if (this.state.temp >= 18 && this.state.temp < 30){
      bgColorClass += 'warm';
      elementsColorClass += 'warm';
    }
    if (this.state.temp > 10 && this.state.temp < 18){
      bgColorClass += 'normal';
      elementsColorClass += 'normal';
    }
    if (this.state.temp > 0 && this.state.temp < 10){
      bgColorClass += 'cold';
      elementsColorClass += 'cold';
    }
    if (this.state.temp <= 0){
      bgColorClass += 'very-cold';
      elementsColorClass += 'very-cold';
    }


    return (

      <div className={bgColorClass}>

        <WeatherSquare sqStyle='mainWeatherSquare'
          elementColor={elementsColorClass}
          icon={weatherClass}
          temp={this.state.temp}
          minTemp={this.state.minTemp}
          maxTemp={this.state.maxTemp}
          humidity={this.state.humidity}
          wind={this.state.wind}
          localTime={this.state.geoTime}
        />

        <RegionSelector
          elementColor={elementsColorClass}
          currentCity={cities[currentCity]}
          cities={cities}
          selectFunction={this.changeRegion.bind(this)}
          submitFunction={this.handleSubmit.bind(this)}
        />
      </div>

    )
  }
}
