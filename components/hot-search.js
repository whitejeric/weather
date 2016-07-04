import React from 'react';
import Geosuggest from 'react-geosuggest';
import ReactBootstrap from 'react-bootstrap';
import {
  ListGroupItem, FormGroup, FormControl,
  ControlLabel, Clearfix, ListGroup,
  Glyphicon
        } from 'react-bootstrap';

require("react-bootstrap/lib/Nav");

export default class HotSearch extends React.Component{
  constructor(){
    super();
    this.state={
      inputField: '',
      suggestedCities: [],
      inputErr: '^',
      matchedSubString: '',
      safeToUpdate: false,
      hover: [false, false, false, false, false]
    }
  }

  handleTextChange(e){
    var input = e.target.value;
    this.setState({
      inputField: input,
      safeToUpdate: true
    });

    var myLatLng = new google.maps.LatLng({lat: 49, lng: -123});

    var service = new google.maps.places.AutocompleteService();

    service.getPlacePredictions(
      {
        input: "'" + input + "'",
        types: ['(cities)'],
        location: myLatLng,
        radius: (3364 * 1000)
      },
        this.updateSuggestion.bind(this)
    );

  }

  handleListPress(e){
    var input = e;
    var partsOfStr = e.split(',');
    this.setState({
      inputField: '',
      inputErr: '^',
      safeToUpdate: false,
      suggestedCities: []
    });
    console.log(partsOfStr.length);
    if (partsOfStr.length > 2){
      var onlyCityAndState = partsOfStr[0] + ', ' + partsOfStr[1];
      this.props.submitFunc(onlyCityAndState);
    }
    else{
      this.props.submitFunc(e);
    }
  }

  handleSubmit(e){
    console.log(this.state.inputField);
    e.preventDefault();

    this.props.submitFunc(this.state.inputField);
    this.setState({
      inputField : '',
      suggestedCities: []
    });
  }

  handleMouseOver(index){
    var newList = [];
    if (index > 0){
      newList = this.state.hover.slice(0, index - 1);
    }
    newList[index] = true;
    newList.concat(this.state.hover.slice(index + 1, this.state.hover.length - 1));
    this.setState({
      hover: newList
    });
  }

  handleMouseOff(index){
    this.setState({
      hover: [false, false, false, false, false ]
    });
  }

  updateSuggestion(predictions, status){
    if (!this.state.safeToUpdate){
      return;
    }

    this.setState({
      suggestedCities: []
    });

    var newCities = [];

    if (status != google.maps.places.PlacesServiceStatus.OK) {
      this.setState({
        inputErr: '0 results.',
        safeToUpdate: false
      });
      return;
    }

    predictions.forEach(function(prediction) {
      newCities.push(prediction.description);
    });

    this.setState({
      suggestedCities: newCities,
      inputErr: '',
      safeToUpdate: false
    });
  }


  render(){

    var suggestListItemHover = {
      font: '200 14px/1.5 Helvetica, Verdana, sans-serif',
      color: 'black',
      cursor: 'default'
    }

    var suggestListItem = {
      font: '200 14px/1.5 Helvetica, Verdana, sans-serif',
      cursor: 'default',
      opacity: '0.5',
    }
    return(
      <div className='suggest-list-container'>
        <form onSubmit={this.handleSubmit.bind(this)} autoComplete="off">
           <input className='hot-input' ref='searchInput' type="text" placeholder="Enter city name" value={this.state.inputField} onChange={this.handleTextChange.bind(this)} justified/>

          <ul className="suggest-list">
            {(!this.state.suggestedCities[0]) ?
                '':
                <div>
                {
                  this.state.suggestedCities.map((city, index) => {
                    return <li style={this.state.hover[index] ? suggestListItemHover : suggestListItem}
                              href='#'
                              key={index}
                              eventKey={index}
                              onClick={() => {this.handleListPress(this.state.suggestedCities[index])}}
                              onMouseOver={() => {this.handleMouseOver(index)}}
                              onMouseLeave={() => {this.handleMouseOff(index)}}
                              >
                                {this.state.suggestedCities[index]}
                            </li>
                  })
                }
              </div>
              }

          </ul>


        </form>
      </div>
    )
  }
}

propTypes: {
  submitFunc:  React.PropTypes.func.isRequired
}
