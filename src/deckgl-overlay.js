import React, {Component} from 'react';
import DeckGL, {ArcLayer, ScatterplotLayer} from 'deck.gl';
import CubeArcLayer from './cube-arc-layer';

export default class DeckGLOverlay extends Component {

  render() {
    if (!this.props.data) {
      return null;
    }

    const layers = [
      new ScatterplotLayer({
        id: `pickup`,
        data: this.props.data,
        getPosition: d => [d.pickup_longitude, d.pickup_latitude],
        getColor: d => [0, 128, 255],
        radiusScale: 40,
      }),
			new ScatterplotLayer({
        id: `dropoff`,
        data: this.props.data,
        getPosition: d => [d.dropoff_longitude, d.dropoff_latitude],
        getColor: d => [255, 0, 128],
        radiusScale: 40,
      }),
      // hint arc line
      new ArcLayer({
        id: 'arc-layer',
        data: this.props.data,
        getSourcePosition: d => [d.pickup_longitude, d.pickup_latitude],
        getTargetPosition: d => [d.dropoff_longitude, d.dropoff_latitude],
        getSourceColor: d => [0, 128, 255],
        getTargetColor: d => [255, 0, 128],
        getStrokeWidth: 2,
				opacity: 0.5,
      }),
			// cube animation
			new CubeArcLayer({
        id: 'cube-arc-layer',
        data: this.props.data,
        getSourcePosition: d => [d.pickup_longitude, d.pickup_latitude],
        getTargetPosition: d => [d.dropoff_longitude, d.dropoff_latitude],
				currentTime: this.props.currentTime,
	      texture: './textures/crate.gif',
	      scaleTextureX: 0.02,
	      scaleTextureY: 0.02,
	      scaleTextureZ: 0.02,
      }),
    ];

    return (
      <DeckGL {...this.props.viewport} layers={layers} />
    );
  }
}
