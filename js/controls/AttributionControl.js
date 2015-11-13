import React from 'react';
import Control from './Control';


class AttributionComponent extends React.Component {
  state = { layerAttributions: [] }

  componentDidMount() {
    this.props.map.on('layerchange', ::this.updateLayerAttributions);
  }

  updateLayerAttributions(e) {
    this.setState({
      layerAttributions: e.layers.map(layer => layer.attribution),
    });
  }

  render() {
    return (
      <div>
        <span>© <a href="http://leafletjs.com" title="A JS library for interactive maps" target="_blank">Leaflet</a> | </span>
        {this.state.layerAttributions.map((attribution, i) =>
          <span key={i}>tiles <span dangerouslySetInnerHTML={{__html: attribution}}></span> | </span>
        )}
        <span>routing © <a href="http://brouter.de/brouter/" title="BRouter: Let's get serious about bike routing" target="_blank">BRouter</a> | </span>
        <span>search © <a href="https://www.google.com/maps" target="_blank">Google</a> | </span>
        <span>code on <a href="https://github.com/mekto/brouter-online" target="_blank">GitHub</a></span>
      </div>
    );
  }
}


export default Control.extend({
  options: {
    position: 'bottomright',
    className: 'leaflet-control-attribution',
  },
  getComponentClass() { return AttributionComponent; }
});
