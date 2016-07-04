import React from 'react';
import moment from 'moment';
import ReactBootstrap, {Glyphicon} from 'react-bootstrap';

export default class WeatherSquare extends React.Component{
  constructor(){
    super();
    this.state={
      mouseOver: false
    }
  }

  handleMouseEnter(){
    this.setState({
      mouseOver: true
    });

  }

  handleMouseLeave(){
    this.setState({
      mouseOver: false
    });
  }

  render(){
    var toRender = '';
    var tempDisplay ='';
    var windAndRain = '';
    var format = 'C';
    var temp = this.props.temp;
    var minTemp = this.props.minTemp;
    var maxTemp = this.props.maxTemp;

    if (this.props.farenheit){
      temp = Math.round(temp * 1.8) + 32;
      minTemp = Math.round(minTemp * 1.8) + 32;
      maxTemp = Math.round(maxTemp * 1.8) + 32;
      format = 'F';
    }

    if (this.state.mouseOver){
      tempDisplay = (
          <div className='temps'>
            <span className={this.props.sqStyle+'Temp'}>
              {maxTemp}<i className="wi wi-degrees"></i>/{minTemp}<i className="wi wi-degrees"></i>
            </span>
          </div>
      );
    }
    else{
      if (this.props.humidity && this.props.wind){
        windAndRain = (
          <div>
            <span><i className="wi wi-humidity"></i> {this.props.humidity}</span>
            <br />
            <span><i className="wi wi-small-craft-advisory"></i> {this.props.wind} km/h</span>
          </div>
        )
      }
        tempDisplay = (
          <div className='temps'>
            <div className={this.props.sqStyle+'Temp'}>{temp}<i className="wi wi-degrees"></i>{format}</div>
              {windAndRain}
          </div>
      );
    }

    if (this.props.sqStyle === 'big'){
      toRender = (
        <div onMouseEnter={this.handleMouseEnter.bind(this)} onMouseLeave={this.handleMouseLeave.bind(this)}>
          <span className='largeWeatherIcon'>
            <i className={this.props.icon}></i>
          </span>
          <br/>
        {tempDisplay}
        </div>
      )
    }
    else {
      toRender= (
        <div onMouseEnter={this.handleMouseEnter.bind(this)} onMouseLeave={this.handleMouseLeave.bind(this)}>
          <span className='smallWeatherIcon'>
            <i className={this.props.icon}></i>
          </span>
          <br />
        {tempDisplay}
        </div>
      )
    }

    return(
      <div className={this.props.sqStyle + 'WeatherSquare'}>{toRender}</div>
    )
  }
}
