import Leaflet from 'leaflet';
import React from 'react';
import Control from './Control';
import store from '../store';
import { getStateFromStore } from '../utils/store';
import { setLocate } from '../actions';


class LocateComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = getStateFromStore();
  }

  componentDidMount() {
    this.props.map.on('locationfound', this.onLocationFound.bind(this));
    this.props.map.on('locationerror', this.stopLocating.bind(this));
    store.subscribe(this.onChange);
  }

  onChange = () => {
    this.setState(getStateFromStore());
  }

  toggleLocate() {
    if (this.state.options.locateStatus === 'off')
      this.locate();
    else
      this.stopLocating();
  }

  locate() {
    this.props.map.locate({setView: true, maxZoom: 15});
    setLocate('searching');
  }

  stopLocating() {
    this.props.map.stopLocate();
    setLocate('off');

    if (this._locationCircle) {
      this.props.map.removeLayer(this._locationCircle);
      this.props.map.removeLayer(this._locationMarker);
      this._locationCircle = null;
      this._locationMarker = null;
    }
  }

  onLocationFound(e) {
    setLocate('on');

    if (!this._locationCircle) {
      this._locationCircle = new Leaflet.Circle(e.latlng, e.accuracy, {
        color: '#136aec',
        fillColor: '#136aec',
        fillOpacity: 0.15,
        weight: 2,
        opacity: 0.5
      });
      this._locationMarker = new Leaflet.CircleMarker(e.latlng, {
        color: '#136aec',
        fillColor: '#2a93ee',
        fillOpacity: 0.7,
        weight: 2,
        opacity: 0.9,
        radius: 5
      });
      this._locationCircle.addTo(this.props.map);
      this._locationMarker.addTo(this.props.map);
    } else {
      this._locationCircle.setLatLng(e.latlng).setRadius(e.accuracy);
      this._locationMarker.setLatLng(e.latlng);
    }
  }

  render() {
    return (
      <div className="leaflet-bar">
        <a className="control-button" onClick={this.toggleLocate.bind(this)} title="Show my location">
          <svg width="14" height="14" className={`icon icon-locate icon-locate-${this.state.options.locateStatus}`} viewBox="0 0 24 24">
            <path d="M16 12c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4zm8 1h-3.06c-.454 4.193-3.747 7.486-7.94 7.94V24h-2v-3.06c-4.194-.454-7.486-3.747-7.942-7.94H0v-2h3.058C3.514 6.806 6.806 3.514 11 3.058V0h2v3.058c4.193.456 7.486 3.75 7.94 7.942H24v2zm-4.5-1c0-4.1-3.4-7.5-7.5-7.5S4.5 7.9 4.5 12s3.4 7.5 7.5 7.5 7.5-3.4 7.5-7.5z"/>
          </svg>
        </a>
      </div>
    );
  }
}


export default Control.extend({
  getComponentClass() { return LocateComponent; }
});
