import Leaflet from 'leaflet';
import React from 'react';
import ReactDOM from 'react-dom';


export default Leaflet.Control.extend({
  options: {
    position: 'topright',
  },

  onAdd(map) {
    var container = document.createElement('div');
    Leaflet.DomEvent
      .disableClickPropagation(container)
      .disableScrollPropagation(container)
      .on(container, {contextmenu: Leaflet.DomEvent.stopPropagation});

    this.component = ReactDOM.render(
      React.createElement(this.getComponentClass(), {map}),
      container
    );

    return container;
  }

});
