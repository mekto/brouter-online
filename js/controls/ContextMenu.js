import Leaflet from 'leaflet';
import React from 'react';
import ReactDOM, {findDOMNode} from 'react-dom';
import cx from 'classnames';
import * as actions from '../actions';


class ContextMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {visible: false, latLng: null};
  }

  show(latLng) {
    this.setState({visible: true, latLng: latLng});
  }

  hide() {
    this.setState({visible: false});
  }

  setWaypoint(type) {
    actions.putWaypointAtLatLng(type, this.state.latLng);
    this.hide();
  }

  centerMap() {
    this.props.map.panTo(this.state.latLng);
    this.hide();
  }

  render() {
    const latLng = this.state.latLng;
    return (
      <div className={cx('contextmenu', {hide: !this.state.visible})}>
        {latLng && <div className="static text-muted"><small>{latLng.lat.toFixed(6)}, {latLng.lng.toFixed(6)}</small></div>}
        <div className="divider"></div>
        <div className="item" onClick={()=>{ this.setWaypoint('start'); }}>Directions from here</div>
        <div className="item" onClick={()=>{ this.setWaypoint('end'); }}>Directions to here</div>
        <div className="item" onClick={()=>{ this.setWaypoint('via'); }}>Via here</div>
        <div className="divider"></div>
        <div className="item" onClick={this.centerMap.bind(this)}>Center map here</div>
      </div>
    );
  }
}


export default Leaflet.Layer.extend({

  options: {
    pane: 'popupPane',
  },

  onAdd(map) {
    if (!this._control) {
      this._initLayout();
    }
    map.on('contextmenu', this._contextmenu, this);
    map.on('click', this._mapclick, this);
    return this;
  },

  onRemove(map) {
    map.off('contextmenu', this._contextmenu, this);
    map.off('click', this._contextmenu, this);
  },

  _contextmenu(e) {
    this.open(e.latlng);
  },

  _mapclick() {
    this.close();
  },

  open(latlng) {
    this._latlng = Leaflet.latLng(latlng);
    if (this._map) {
      this._updatePosition();
    }
    this._control.show(latlng);
    return this;
  },

  close() {
    this._control.hide();
  },

  _updatePosition() {
    if (!this._map) { return; }

    var pos = this._map.latLngToLayerPoint(this._latlng);
    Leaflet.DomUtil.setPosition(findDOMNode(this._control), pos);
  },

  _initLayout() {
    let container = document.createElement('div');
    this.getPane().appendChild(container);

    this._control = ReactDOM.render(
      <ContextMenu map={this._map} onAction={this.onAction.bind(this)}/>,
      container
    );

    let node = container;
    Leaflet.DomEvent
      .disableClickPropagation(node)
      .disableScrollPropagation(node)
      .on(node, {contextmenu: Leaflet.DomEvent.stopPropagation});
  },

  onAction(action, args) {
    args.action = action;
    this.fire('action', args);
  }

});
