import Leaflet from 'leaflet';
import React from 'react';


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

    this.component = React.render(
      React.createElement(this.getComponentClass(), {map}),
      container
    );

    return container;
  }

});
