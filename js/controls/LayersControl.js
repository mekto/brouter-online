import Leaflet from 'leaflet';
import React from 'react';
import cs from 'classnames';
import Control from './Control';
import config from '../../config.js';


var copyrights = {
  OSM: '© <a href="http://openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
  MapBox: '© <a href="http://www.mapbox.com" target="_blank">MapBox</a>',
  Thunderforest: '© <a href="http://www.thunderforest.com" target="_blank">Thunderforest</a>',
  Heidelberg: '© <a href="http://openmapsurfer.uni-hd.de/" target="_blank">GIScience Research Group @ University of Heidelberg</a>',
  WaymarkedTrails: '© <a href="http://cycling.waymarkedtrails.org" target="_blank">Waymarked Trails</a>',
  OpenMapLT: '© <a href="http://openmap.lt" target="_blank">OpenMap.lt</a>',
};


var leafletLayer = function(name, url, attribution) {
  return {
    name: name,
    create: function() {
      return new Leaflet.TileLayer(url, {attribution: attribution});
    }
  };
};

var mapboxLayer = function(name, type, attribution) {
  return {
    name: name,
    create: function() {
      var url = 'https://{s}.tiles.mapbox.com/v4/' + type + '/{z}/{x}/{y}.png?access_token=' + config.mapboxAccessToken;
      return new Leaflet.TileLayer(url, {attribution: attribution});
    }
  };
};


var baseLayers = [
  leafletLayer('OSM Standard', 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', copyrights.OSM),
  leafletLayer('OpenMapSurfer', 'http://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}', copyrights.Heidelberg),
  leafletLayer('OSM Cycle', 'http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png', copyrights.Thunderforest),
  mapboxLayer('MapBox Street', 'mekto.hj5462ii', copyrights.MapBox),
  mapboxLayer('MapBox Terrain', 'mekto.hgp09m7l', copyrights.MapBox),
  leafletLayer('OSM Transport', 'http://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png', copyrights.Thunderforest),
];

var overlays = [
  leafletLayer('Cycling Routes', 'http://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png', copyrights.WaymarkedTrails),
];


class LayersComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      activeLayer: null,
      activeOverlays: {},
    };
  }

  toggleMenu() {
    this.setState({expanded: !this.state.expanded});
  }

  closeMenu() {
    this.setState({expanded: false});
  }

  setLayer(layer) {
    var activeLayer = this.state.activeLayer;
    if (layer === activeLayer)
      return false;

    if (activeLayer) {
      this.props.map.removeLayer(activeLayer.layer);
      delete activeLayer.layer;
    }
    activeLayer = layer;
    activeLayer.layer = layer.create();
    this.props.map.addLayer(activeLayer.layer);
    this.setState({activeLayer}, ::this.fireChangeEvent);
  }

  toggleOverlay(overlay) {
    var activeOverlays = this.state.activeOverlays;
    var layer = activeOverlays[overlay.name];
    if (!layer) {
      layer = activeOverlays[overlay.name] = overlay.create();
      this.props.map.addLayer(layer);
      layer.bringToFront();
    } else {
      this.props.map.removeLayer(layer);
      delete activeOverlays[overlay.name];
    }
    this.setState({activeOverlays}, ::this.fireChangeEvent);
  }

  fireChangeEvent() {
    const layers = [{
      name: this.state.activeLayer.name,
      layer: this.state.activeLayer.layer,
      attribution: this.state.activeLayer.layer.getAttribution(),
    }];
    Object.entries(this.state.activeOverlays).forEach(([name, layer]) => {
      layers.push({
        name,
        layer,
        attribution: layer.getAttribution(),
      });
    });
    this.props.map.fire('layerchange', { layers });
  }

  componentDidMount() {
    this.setLayer(baseLayers[0]);

    this.props.map.on('click', () => {
      if (this.state.expanded) {
        this.closeMenu();
      }
    });
  }

  render() {
    return (
      <div className="layers-control">
        <div className="leaflet-bar">
          <a className="control-button" onClick={this.toggleMenu.bind(this)} title="Show layers">
            <svg width="16" height="16" className="icon icon-layers" viewBox="0 0 23.303 21.461">
              <polygon points="23.303,6.333 11.652,0 0,6.333 11.652,12.667" className="fill" />
              <polygon points="11.652,14.709 2.166,9.555 0,10.732 11.652,17.063 23.303,10.732 21.137,9.555" className="fill" />
              <polygon points="11.652,19.107 2.166,13.952 0,15.127 11.652,21.461 23.303,15.127 21.137,13.952" className="fill" />
            </svg>
          </a>
        </div>

        {this.state.expanded && this.renderMenu()}
      </div>
    );
  }

  renderMenu() {
    return (
      <div className="layers-menu">
        <h5>Layers</h5>
        {baseLayers.map((layer, i) =>
          <PreviewMinimap
            key={i}
            map={this.props.map}
            layer={layer}
            active={layer === this.state.activeLayer}
            onClick={() => this.setLayer(layer)}/>
        )}

        <br className="clear"/>

        <h5>Overlays</h5>
        {overlays.map((overlay, i) =>
          <PreviewMinimap
            key={i}
            map={this.props.map}
            layer={overlay}
            active={!!this.state.activeOverlays[overlay.name]}
            onClick={() => this.toggleOverlay(overlay)}/>
        )}
      </div>
    );
  }
}


class PreviewMinimap extends React.Component {
  constructor(props) {
    super(props);
    this.updateView = this.updateView.bind(this);
  }
  componentDidMount() {
    this.layer = this.props.layer.create();
    this.minimap = new Leaflet.Map(this.refs.map, {
      attributionControl: false,
      zoomControl: false,
      dragging: false,
    });
    this.minimap.addLayer(this.layer);
    this.minimap.dragging.disable();
    this.minimap.touchZoom.disable();
    this.minimap.doubleClickZoom.disable();
    this.minimap.scrollWheelZoom.disable();

    this.props.map.on('moveend', this.updateView);
    this.updateView();
  }
  componentWillUnmount() {
    this.minimap.removeLayer(this.layer);
    this.minimap.remove();
  }
  updateView() {
    this.props.map.off('moveend', this.updateView);
    this.minimap.invalidateSize();
    this.minimap.setView(this.props.map.getCenter(), Math.max(this.props.map.getZoom() - 1, 4));
  }
  render() {
    return (
      <div className={cs('preview-minimap', {active: this.props.active})} onClick={this.props.onClick}>
        <span className="name">{this.props.layer.name}</span>
        <div className="minimap-container">
          <div className="minimap" ref="map"></div>
        </div>
      </div>
    );
  }
}


export default Control.extend({
  getComponentClass() { return LayersComponent; }
});
