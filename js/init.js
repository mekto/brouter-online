import request from 'superagent';
import map from './map';
import geocoder from './geocoder';

import ZoomControl from './controls/ZoomControl';
import LocateControl from './controls/LocateControl';
import LayersControl from './controls/LayersControl';
import ToolboxControl from './controls/ToolboxControl';
import ContextMenu from './controls/ContextMenu';


new ZoomControl().addTo(map);
new LocateControl().addTo(map);
new LayersControl().addTo(map);
new ToolboxControl().addTo(map);
new ContextMenu().addTo(map);


request.get('http://freegeoip.net/json/').timeout(1999).end((err, res) => {
  if (!err && res.ok) {
    map.setView([res.body.latitude, res.body.longitude], 8);
    geocoder.config = res.body;
  } else {
    map.setView([49, 18], 4);
  }
});
