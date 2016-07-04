import React from 'react';
import ReactBootstrap, {Glyphicon, Dropdown, MenuItem,
                        Button} from 'react-bootstrap';

import HotSearch from './hot-search';

export default class RegionSelector extends React.Component{
  render(){
    let preventDefault = (e) => {
      e.preventDefault();
    }
    var title;

    if (this.props.currentCity.length < 20){
      title = this.props.currentCity;
    }
    else{
      title = this.props.currentCity.split(',')[0];
    }

    return(
      <div className='regionSelector'>
        <div className={this.props.elementColor}>
          <span className='cityHeader'> {title}</span>
            <Dropdown title='' id='dropdown' pullRight>
              <Dropdown.Toggle noCaret bsClass='dropButton'><Glyphicon glyph='th-list'/></Dropdown.Toggle>
              <Dropdown.Menu>
                {
                  this.props.cities.map((city, index) => {
                    var partsOfStr = city.split(',');
                    if (partsOfStr[0] == 'disabled'){
                      return <MenuItem header key={index}><span className='dropHeader'><span className={this.props.elementColor}>{partsOfStr[1]}</span></span></MenuItem>
                    }
                    if (city == this.props.currentCity){
                      return <MenuItem active key={index} eventKey={index} onSelect={this.props.selectFunction.bind(this)}>{city}</MenuItem>
                    }
                    return <MenuItem key={index} eventKey={index} onSelect={this.props.selectFunction.bind(this)}>{city}</MenuItem>
                  })
                }
                <MenuItem divider/>
                <MenuItem onSelect={preventDefault.bind(this)}><HotSearch submitFunc={this.props.submitFunction.bind(this)} /></MenuItem>
              </Dropdown.Menu>
            </Dropdown>

        </div>
      </div>
      )
    }
  }
