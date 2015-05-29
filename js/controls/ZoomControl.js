import React from 'react';
import Control from './Control';


class ZoomComponent extends React.Component {
  zoomIn(e) {
    this.props.map.zoomIn(e.shiftKey ? 3 : 1);
  }
  zoomOut(e) {
    this.props.map.zoomOut(e.shiftKey ? 3 : 1);
  }
  render() {
    return (
      <div className="leaflet-bar">
        <a className="control-button" onClick={this.zoomIn.bind(this)} title="Zoom in">
          <svg width="16" height="16" className="icon" viewBox="0 0 32 32">
            <polyline points="8,16 24,16" strokeLinecap="round" strokeWidth="5" shapeRendering="crispEdges" className="stroke crisp"/>
            <polyline points="16,8 16,24" strokeLinecap="round" strokeWidth="5" shapeRendering="crispEdges" className="stroke crisp"/>
          </svg>
        </a>
        <a className="control-button" onClick={this.zoomOut.bind(this)} title="Zoom out">
          <svg width="16" height="16" className="icon" viewBox="0 0 32 32">
            <polyline points="8,16 24,16" strokeLinecap="round" strokeWidth="5" shapeRendering="crispEdges" className="stroke crisp" />
          </svg>
        </a>
      </div>
    );
  }
}


export default Control.extend({
  getComponentClass() { return ZoomComponent; }
});
