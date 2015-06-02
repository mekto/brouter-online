import Leaflet from 'leaflet';
import Store from './utils/Store';
import Waypoints from './utils/Waypoints';
import Routes from './utils/Routes';
import Route from './utils/Route';
import profiles, {profileOptions} from './profiles';
import geocoder from './geocoder';
import routing from './routing';
import util from './util';
import config from '../config';


const messages = util.keyMirror({
  DISTANCE_TOO_LONG: null,
  DISTANCE_TOO_LONG_FOR_AUTOCALCULATION: null,
});


class MapStore extends Store {
  constructor() {
    super();
    this.map = require('./map');

    const waypoints = new Waypoints();
    const routes = new Routes();
    const profile = profiles[0];
    const routeIndex = 0;
    const isPending = false;
    const message = null;
    const profileSettings = util.toObject(profileOptions.map((option) => {
      return [option.id, option.defaultValue];
    }));

    waypoints._map = this.map;
    waypoints.add();
    waypoints.add();

    waypoints.on('dragend', this.onWaypointDragEnd.bind(this));
    waypoints.on('remove', this.onWaypointRemove.bind(this));

    this.state = {
      waypoints, routes, profile, profileSettings,
      routeIndex, isPending, message,
    };
  }

  calculateRoute(options={}) {
    const force = options.force || false;
    const fit = options.fit || true;

    const waypoints = this.state.waypoints.getWithMarkers();
    const routes = this.state.routes;
    const profile = this.state.profile;
    const profileSettings = this.state.profileSettings;
    const routeIndex = this.state.routeIndex;
    const latLngs = waypoints.map(waypoint => waypoint.getLatLng());
    const distance = util.calculateDistance(latLngs);
    const fitOptions = {paddingTopLeft: [250, 20]};


    if (waypoints.length < 2) {
      return false;
    }

    routes.clear();
    if (distance > config.maxBrouterCalculationDistance) {
      this.setState({message: messages.DISTANCE_TOO_LONG});
      return false;
    }
    else if (distance > config.maxBrouterAutoCalculationDistance && !force) {
      this.setState({message: messages.DISTANCE_TOO_LONG_FOR_AUTOCALCULATION});
      return false;
    }

    if (this.trailer) {
      this.map.removeLayer(this.trailer);
    }
    this.trailer = new Leaflet.Polyline(latLngs, {color: '#555', weight: 1, className: 'trailer-line'});
    this.trailer.addTo(this.map);

    if (fit && !this.map.getBounds().contains(latLngs)) {
      this.map.fitBounds(latLngs, fitOptions);
    }

    routing.route(waypoints, profile.getSource(profileSettings), routeIndex, (geojson) => {
      if (geojson) {
        const route = new Route(geojson, waypoints);
        route.addTo(this.map);
        routes.push(route);

        if (fit && !this.map.getBounds().contains(route.layer.getBounds())) {
          this.map.fitBounds(route.layer.getBounds(), fitOptions);
        }
      }
      if (this.trailer) {
        this.map.removeLayer(this.trailer);
        delete this.trailer;
      }
      this.setState({isPending: false});
    });

    this.setState({isPending: true, message: null});

    return true;
  }

  toggleProfileSetting(id, value) {
    const profileSettings = this.state.profileSettings;
    profileSettings[id] = value;

    if (id === 'ignore_cycleroutes' && value)
      profileSettings.stick_to_cycleroutes = false;
    else if (id === 'stick_to_cycleroutes' && value)
      profileSettings.ignore_cycleroutes = false;
    this.setState({profileSettings});
    this.calculateRoute();
  }

  setProfile(profile) {
    this.setState({profile});
    this.calculateRoute();
  }

  setRouteIndex(routeIndex) {
    this.setState({routeIndex});
    this.calculateRoute();
  }

  setWaypoint(type, latlng) {
    const waypoints = this.state.waypoints;
    let waypoint;
    switch (type) {
      case 'start': waypoint = waypoints.first; break;
      case 'end': waypoint = waypoints.last; break;
      case 'via': waypoint = waypoints.insert(waypoints.length - 1); break;
    }
    waypoint.setPosition({latlng}, this.forceUpdate.bind(this));
    if (!this.calculateRoute())
      this.forceUpdate();
  }

  swapWaypoints(first, second) {
    this.state.waypoints.swap(first, second);

    // do not calculate route if swapping first and second
    if (first || !this.calculateRoute()) {
      this.forceUpdate();
    }
  }

  geocode(waypoint, address) {
    geocoder.query(address, (results) => {
      if (results && results[0]) {
        const result = results[0];
        result.address = address;
        waypoint.setPosition(result);

        if (!this.calculateRoute()) {
          this.map.setView(waypoint.getLatLng(), 14);
          this.forceUpdate();
        }
      }
    });
  }

  onWaypointDragEnd(event) {
    const waypoint = event.waypoint;
    waypoint.queryAddress(this.forceUpdate.bind(this));
    if (!this.calculateRoute({fit: false}))
      this.forceUpdate();
  }

  onWaypointRemove() {
    this.calculateRoute();
  }
}


export default new MapStore();
export {messages};
