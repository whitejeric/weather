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
import FiveDayWeatherApi from '../util/five-day-weather-api';
import TimezoneApi from '../util/timezone-api';

var moment = require('moment');

var query = ''; //?city=London, Paris, Berlin
var cities = []; //transfrom ^ into array
var citiesWeather = []; //SingleWeatherApi cache
var fiveWeather = [];

var currentCity = 0;

var daysOfTheWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

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
      geoTime: 0,
      tempColor: '',

      day1Weather: {},
      day2Weather: {},
      day3Weather: {},
      day4Weather: {}
    }
  }

  handleSubmit(e){
    cities.push(e);
    currentCity = cities.length - 1;
    this.fetchData();
  }

  fetchData(){
    console.log('fetching: ' + cities[currentCity]);
    console.log(fiveWeather);
    //get the data from the cache if its there
    if (citiesWeather[currentCity] && fiveWeather[currentCity]){
      console.log(citiesWeather[currentCity].name + 's current weather has already been fetched, is now being updated. Index:' + currentCity);
      this.updateData();
    }
    else{
      //request more data from the SingleWeatherApi
      SingleWeatherApi.get(cities[currentCity])
        .then(function(data){
          citiesWeather[currentCity] = data;
          console.log('single weather api call');
          var clientDate = new Date();
          var clientDateInUDTSeconds  = (clientDate.getTime() / 1000);
          TimezoneApi.get(citiesWeather[currentCity].coord.lat, citiesWeather[currentCity].coord.lon, clientDateInUDTSeconds)
              .then(function(doto){
                  this.adjustRegionTime(doto.dstOffset + doto.rawOffset);
            }.bind(this));
            this.fetchFiveDayData();
        }.bind(this));
    }
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
    /*console.log('localtime: ' + localTime);
    console.log('adj: ' + newDate + ' moment: ' + moment(newDate).format('h:mm a'));*/

    if (this.state.geoTime != moment(newDate).format('h:mm a')){
      this.setState({
        geoOff: (geoOffset * 1000),
        geoTime: moment(newDate).format('h:mm a')
      });
    }
  }

  updateData(){
    console.log('updating current weather!');
    console.log('update five data: ');
    console.log(fiveWeather);
    console.log(citiesWeather);
    this.setState({
      weather:citiesWeather[currentCity].weather[0].id,
      temp: Math.round(citiesWeather[currentCity].main.temp - 273.15),
      humidity: Math.round(citiesWeather[currentCity].main.humidity),
      wind: Math.round(citiesWeather[currentCity].wind.speed),
      minTemp: Math.round(citiesWeather[currentCity].main.temp_min - 273.15),
      maxTemp: Math.round(citiesWeather[currentCity].main.temp_max - 273.15),
      lat: citiesWeather[currentCity].coord.lat,
      lng: citiesWeather[currentCity].coord.lon,
      time: citiesWeather[currentCity].dt,
      day1Weather: fiveWeather[currentCity].day1,
      day2Weather: fiveWeather[currentCity].day2,
      day3Weather: fiveWeather[currentCity].day3,
      day4Weather: fiveWeather[currentCity].day4
    });

    console.log(fiveWeather[currentCity].day1 == this.state.day1Weather);

    console.log(this.state.day1Weather);
    console.log(this.state.day2Weather);
    console.log(this.state.day3Weather);
    console.log(this.state.day4Weather);

    this.getTempColor();
    this.getTempColorForFiveDay();
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

  fetchFiveDayData(){
    console.log('fetching forecast for: ' + cities[currentCity] + 'Index: ' + currentCity);
    console.log(fiveWeather[currentCity]);
    //get the data from the cache if its there
    if (fiveWeather[currentCity]){
      console.log(cities[currentCity] + 's forecast has already been fetched, is now being updated.');
      this.updateData();
    }
    else{
      //request more data from the FiveDayWeatherApi
      FiveDayWeatherApi.get(cities[currentCity])
        .then(function(data){
          console.log('five day api call');
          this.getFiveDayData(data.list);
        }.bind(this));
    }
  }

  getFiveDayData(cityArray){
    //console.log(cityArray);
    var offset = parseInt(this.state.geoOff);

    var cityClone = cityArray;

    cityClone.forEach(function(threeHourBlock){
    //  console.log('GMT: ' + threeHourBlock.dt_txt);

      threeHourBlock.dt_txt = new Date(threeHourBlock.dt_txt);
      /*console.log('DATE: ' + threeHourBlock.dt_txt);
        console.log('UDT: ' + threeHourBlock.dt_txt.getTime());*/

      threeHourBlock.dt_txt = threeHourBlock.dt_txt.getTime() + offset;
      /*console.log('UDT2: ' + threeHourBlock.dt_txt);*/

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
          id: currentCity + ' ' + cities[currentCity] + ' ' + daysOfTheWeek[day],
          date: cityClone[j - 4].dt_txt,
          weatherId: cityClone[j - 4].weather[0].id,
          avgTemp: Math.round(dayAvg / 8),
          hiTemp: Math.round(dayHi),
          loTemp: Math.round(dayLo),
          tempColor: ''
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
          id: currentCity + ' ' + cities[currentCity] + ' ' + daysOfTheWeek[day],
          date: cityClone[j - 4].dt_txt,
          weatherId: cityClone[j - 4].weather[0].id,
          avgTemp: Math.round(dayAvg / 8),
          hiTemp: Math.round(dayHi),
          loTemp: Math.round(dayLo),
          tempColor: ''
        };

      }
    }
    //console.log(dayTemps);

    fiveWeather[currentCity] = {
      day1: dayTemps[0],
      day2: dayTemps[1],
      day3: dayTemps[2],
      day4: dayTemps[3]
    };
    this.updateData();
  }

  getTempColor(){
    var color = '';
    if (this.state.temp >= 30){
      color = 'very-warm';
    }
    if (this.state.temp >= 18 && this.state.temp < 30){
      color = 'warm';
    }
    if (this.state.temp > 10 && this.state.temp < 18){
      color = 'normal';
    }
    if (this.state.temp > 0 && this.state.temp < 10){
      color = 'cold';
    }
    if (this.state.temp <= 0){
      color = 'very-cold';
    }
    this.setState({
      tempColor: color
    });
  }

  getTempColorForFiveDay(){
    var color = '';
    var dayArr = [
      this.state.day1Weather,
      this.state.day2Weather,
      this.state.day3Weather,
      this.state.day4Weather
    ];

    dayArr.forEach(function(day){
      if (day.avgTemp >= 30){
        day.tempColor = 'very-warm';
      }
      if (day.avgTemp >= 18 && day.avgTemp < 30){
        day.tempColor = 'warm';
      }
      if (day.avgTemp > 10 && day.avgTemp < 18){
        day.tempColor = 'normal';
      }
      if (day.avgTemp > 0 && day.avgTemp < 10){
        day.tempColor = 'cold';
      }
      if (day.avgTemp <= 0){
        day.tempColor = 'very-cold';
      }
    });
    this.setState({
      day1Weather: dayArr[0],
      day2Weather: dayArr[1],
      day3Weather: dayArr[2],
      day4Weather: dayArr[3]
    });
  }

  render(){
    return (

      <div className={'weather-widget ' + this.state.tempColor}>
        <RegionSelector
          elementColor={'el ' + this.state.tempColor}
          currentCity={cities[currentCity]}
          cities={cities}
          selectFunction={this.changeRegion.bind(this)}
          submitFunction={this.handleSubmit.bind(this)}
        />

      <WeatherSquare sqStyle='big'
          elementColor={'el ' + this.state.tempColor}
          icon={'wi wi-owm-' + this.state.weather}
          temp={this.state.temp}
          minTemp={this.state.minTemp}
          maxTemp={this.state.maxTemp}
          humidity={this.state.humidity}
          wind={this.state.wind}
          localTime={this.state.geoTime}
        />
<br />
  <div className='forecastBox'>
    <WeatherSquare sqStyle='small'
        elementColor={'squarebg ' + this.state.day1Weather.tempColor}
        icon={'wi wi-owm-' + this.state.day1Weather.weatherId}
        temp={this.state.day1Weather.avgTemp}
        minTemp={this.state.day1Weather.loTemp}
        maxTemp={this.state.day1Weather.hiTemp}
        localTime={this.state.day1Weather.date}
      />
    <WeatherSquare sqStyle='small'
          elementColor={'squarebg ' + this.state.day2Weather.tempColor}
          icon={'wi wi-owm-' + this.state.day2Weather.weatherId}
          temp={this.state.day2Weather.avgTemp}
          minTemp={this.state.day2Weather.loTemp}
          maxTemp={this.state.day2Weather.hiTemp}
          localTime={this.state.day2Weather.date}
        />
      <WeatherSquare sqStyle='small'
            elementColor={'squarebg ' + this.state.day3Weather.tempColor}
            icon={'wi wi-owm-' + this.state.day3Weather.weatherId}
            temp={this.state.day3Weather.avgTemp}
            minTemp={this.state.day3Weather.loTemp}
            maxTemp={this.state.day3Weather.hiTemp}
            localTime={this.state.day3Weather.date}
          />
      <WeatherSquare sqStyle='small'
              elementColor={'squarebg ' + this.state.day4Weather.tempColor}
              icon={'wi wi-owm-' + this.state.day4Weather.weatherId}
              temp={this.state.day4Weather.avgTemp}
              minTemp={this.state.day4Weather.loTemp}
              maxTemp={this.state.day4Weather.hiTemp}
              localTime={this.state.day4Weather.date}
            />
        </div>



      </div>

    )
  }
}
