import React from 'react';
import {Sparklines, SparklinesCurve, SparklinesReferenceLine} from 'react-sparklines';

export default (props) => {
  const min = Math.min.apply(null, props.data);
  const max = Math.max.apply(null, props.data);
  console.log('min: ' + min + ' max: ' + max);

  return (
    <div className='squiggle'>
      <Sparklines min={min - 1} max ={max + 1} data={props.data}>
        <SparklinesCurve color={props.color} />

      </Sparklines>
    </div>
  )
}
