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
const fitOptions = {paddingTopLeft: [360, 20]};


class MapStore extends Store {
  constructor() {
    super();
    this.map = require('./map');

    this.waypoints = new Waypoints();
    this.routes = new Routes();
    this.profile = profiles[0];
    this.routeIndex = 0;
    this.isPending = false;
    this.message = null;
    this.profileSettings = util.toObject(profileOptions.map((option) => {
      return [option.id, option.defaultValue];
    }));

    this.waypoints._map = this.map;
    this.waypoints.add();
    this.waypoints.add();

    this.waypoints.on('dragend', this.onWaypointDragEnd.bind(this));
    this.waypoints.on('remove', this.onWaypointRemove.bind(this));
  }

  calculateRoute(options={}) {
    const force = options.force || false;
    const fit = options.fit || true;

    const waypoints = this.waypoints.getWithMarkers();
    const routes = this.routes;
    const profile = this.profile;
    const profileSettings = Object.assign({}, this.profileSettings);
    const routeIndex = this.routeIndex;
    const latLngs = waypoints.map(waypoint => waypoint.getLatLng());
    const distance = util.calculateDistance(latLngs);

    if (waypoints.length < 2) {
      this.emitChange();
      return false;
    }

    routes.clear();
    if (distance > config.maxBrouterCalculationDistance) {
      this.message = messages.DISTANCE_TOO_LONG;
      this.emitChange();
      return false;
    }
    else if (distance > config.maxBrouterAutoCalculationDistance && !force) {
      this.message = messages.DISTANCE_TOO_LONG_FOR_AUTOCALCULATION;
      this.emitChange();
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
        const route = new Route(geojson, waypoints, profile, profileSettings, routeIndex, routes.getFreeColor());
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
      this.isPending = false;
      this.emitChange();
    });

    this.isPending = true;
    this.message = null;
    this.emitChange();

    return true;
  }

  toggleProfileSetting(id, value) {
    const profileSettings = this.profileSettings;
    profileSettings[id] = value;

    if (id === 'ignore_cycleroutes' && value)
      profileSettings.stick_to_cycleroutes = false;
    else if (id === 'stick_to_cycleroutes' && value)
      profileSettings.ignore_cycleroutes = false;
    this.profileSettings = profileSettings;
    this.calculateRoute();
  }

  setProfile(profile) {
    this.profile = profile;
    this.calculateRoute();
  }

  setRouteIndex(routeIndex) {
    this.routeIndex = routeIndex;
    this.calculateRoute();
  }

  setWaypoint(type, latlng) {
    const waypoints = this.waypoints;
    let waypoint;
    switch (type) {
      case 'start': waypoint = waypoints.first; break;
      case 'end': waypoint = waypoints.last; break;
      case 'via': waypoint = waypoints.insert(waypoints.length - 1); break;
    }
    waypoint.setPosition({latlng}, this.emitChange.bind(this));
    this.calculateRoute();
  }

  swapWaypoints(first, second) {
    this.waypoints.swap(first, second);

    // do not calculate route if swapping first and second
    if (first === undefined)
      this.calculateRoute();
  }

  geocode(waypoint, address) {
    geocoder.query(address, (results) => {
      if (results && results[0]) {
        const result = results[0];
        result.address = address;
        waypoint.setPosition(result);

        if (!this.calculateRoute()) {
          this.map.setView(waypoint.getLatLng(), 14);
          this.emitChange();
        }
      }
    });
  }

  fitRoute(route) {
    this.map.fitBounds(route.layer.getBounds(), fitOptions);
  }

  toggleRouteLock(route) {
    route.locked = !route.locked;
    this.emitChange();
  }

  removeRoute(route) {
    const routes = this.routes;
    routes.remove(route);
    this.emitChange();
  }

  panTo(latLng) {
    this.map.panTo(Leaflet.latLng(latLng));
  }

  onWaypointDragEnd(event) {
    const waypoint = event.waypoint;
    waypoint.queryAddress(this.emitChange.bind(this));
    this.calculateRoute({fit: false});
  }

  onWaypointRemove() {
    this.calculateRoute();
  }
}


export default new MapStore();
export {messages};
