import {OrderedMap, Map} from 'immutable';
import Store from './utils/Store';
import Waypoint from './utils/Waypoint';
import Route from './utils/Route';
import util from './util';
import profiles, {profileOptionValues} from './profiles';
import MapUtils from './utils/MapUtils';
import {messages} from './constants';
import config from '../config';


let _waypoints = new OrderedMap();
let _routes = new OrderedMap();
let _profile = profiles[0];
let _routeIndex = 0;
let _isPending = false;
let _message = null;
let _profileOptions = new Map(profileOptionValues);
let _trailer = null;


function addWaypoint(props={}, insertIndex) {
  if (!props.id)
    props.id = util.id();
  const id = props.id;
  const latLng = props.latLng;
  delete props.latLng;

  if (insertIndex === undefined) {
    _waypoints = _waypoints.set(id, new Waypoint(props));
  } else {
    const keySeq = _waypoints.keySeq();
    const waypoint = new Waypoint(props);
    _waypoints = new OrderedMap(keySeq.splice(insertIndex, 0, id).map(id_ => {
      return [id_, _waypoints.get(id_, waypoint)];
    }));
  }

  if (latLng) {
    updateWaypoint(id, {latLng});
  }

  MapUtils.updateWaypointMarkers(_waypoints);
}

function updateWaypoint(id, updates) {
  const waypoint = _waypoints.get(id);
  if (updates.latLng) {
    updates.marker = MapUtils.createWaypointMarker(id, updates.latLng);
    delete updates.latLng;
  }
  _waypoints = _waypoints.set(id, waypoint.merge(updates));
}

function deleteWaypoint(id) {
  MapUtils.removeLayer(_waypoints.get(id).marker);
  _waypoints = _waypoints.delete(id);

  MapUtils.updateWaypointMarkers(_waypoints);
}

function swapWaypoints(idA, idB) {
  const keySeq = _waypoints.keySeq();
  const indexA = keySeq.indexOf(idA);
  const indexB = keySeq.indexOf(idB);

  _waypoints = new OrderedMap(keySeq.splice(indexA, 1).splice(indexB, 0, idA).map(id => {
    return [id, _waypoints.get(id)];
  }));

  MapUtils.updateWaypointMarkers(_waypoints);
}


function addRoute(props) {
  if (!props.id)
    props.id = util.id();
  if (!props.name)
    props.name = `${props.waypoints.first().address} - ${props.waypoints.last().address}`;
  if (!props.color)
    props.color = MapUtils.getRouteFreeColor();
  props.layer = MapUtils.createRouteLayer(props.geojson, props.color);
  _routes = _routes.set(props.id, new Route(props));
}

function updateRoute(id, updates) {
  _routes = _routes.set(id, _routes.get(id).merge(updates));
}

function deleteRoute(id) {
  MapUtils.removeLayer(_routes.get(id).layer);
  _routes = _routes.delete(id);
}

function clearRoutes(removeLocked=false) {
  const routesToDelete = _routes.filter(route => removeLocked || !route.locked);
  routesToDelete.keySeq().forEach(deleteRoute, this);
}


// add initial A & B waypoinsts
addWaypoint();
addWaypoint();


class AppStore extends Store {
  get waypoints() { return _waypoints; }
  get routes() { return _routes; }
  get profile() { return _profile; }
  get routeIndex() { return _routeIndex; }
  get message() { return _message; }
  get isPending() { return _isPending; }
  get profileOptions() { return _profileOptions; }

  get validWaypoints() { return _waypoints.filter(waypoint => waypoint.marker); }

  canCalculateRoute(force=false) {
    const waypoints = this.validWaypoints;
    if (waypoints.size < 2)
      return messages.MISSING_WAYPOINTS;

    const distance = MapUtils.calculateDistance(waypoints);
    if (distance > config.maxBrouterCalculationDistance) {
      return messages.DISTANCE_TOO_LONG;
    }
    else if (distance > config.maxBrouterAutoCalculationDistance && !force) {
      return messages.DISTANCE_TOO_LONG_FOR_AUTOCALCULATION;
    }
    return true;
  }
}

export default new AppStore({
  CALCULATE_ROUTE() {
    MapUtils.removeLayer(_trailer);
    _trailer = MapUtils.createTrailer(MapUtils.getLatLngsFromWaypoints(_waypoints));
    _message = null;
    _isPending = true;
    clearRoutes();
    this.emitChange();
  },

  CALCULATE_ROUTE_SUCCESS(params) {
    MapUtils.removeLayer(_trailer);
    _trailer = null;
    _isPending = false;
    addRoute(params);
    this.emitChange();
  },

  CALCULATE_ROUTE_FAIL() {
    MapUtils.removeLayer(_trailer);
    _trailer = null;
    _isPending = false;
    this.emitChange();
  },

  CALCULATE_ROUTE_STOP({message}) {
    if (message === messages.MISSING_WAYPOINTS)
      message = null;
    if (message !== _message) {
      _message = message;
      this.emitChange();
    }
  },

  UPDATE_WAYPOINT({id, updates}) {
    updateWaypoint(id, updates);
    this.emitChange();
  },

  DELETE_WAYPOINT(id) {
    deleteWaypoint(id);
    this.emitChange();
  },

  SWAP_WAYPOINTS(ids) {
    if (Array.isArray(ids)) {
      const [idA, idB] = ids;
      swapWaypoints(idA, idB);
    } else {
      swapWaypoints(_waypoints.first().id, _waypoints.last().id);
    }
    this.emitChange();
  },

  ADD_VIA_WAYPOINT(props) {
    const insertIndex = _waypoints.size - 1;
    addWaypoint(props, insertIndex);
    this.emitChange();
  },

  GEOCODE_START({id, address}) {
    updateWaypoint(id, {address, loading: true});
    this.emitChange();
  },

  GEOCODE_SUCCESS({id, latLng, address}) {
    updateWaypoint(id, {latLng, address, loading: false});
    this.emitChange();
  },

  GEOCODE_FAIL({id}) {
    updateWaypoint(id, {loading: false});
    this.emitChange();
  },

  REVERSE_GEOCODE_START({id, latLng}) {
    updateWaypoint(id, {address: MapUtils.latLngToString(latLng), loading: true});
    this.emitChange();
  },

  REVERSE_GEOCODE_SUCCESS({id, address}) {
    updateWaypoint(id, {address, loading: false});
    this.emitChange();
  },

  REVERSE_GEOCODE_FAIL({id}) {
    updateWaypoint(id, {loading: false});
    this.emitChange();
  },

  UPDATE_ROUTE({id, updates}) {
    updateRoute(id, updates);
    this.emitChange();
  },

  DELETE_ROUTE(id) {
    deleteRoute(id);
    this.emitChange();
  },

  SET_PROFILE(profile) {
    _profile = profile;
    this.emitChange();
  },

  SET_ROUTE_INDEX(routeIndex) {
    _routeIndex = routeIndex;
    this.emitChange();
  },

  SET_PROFILE_OPTION({optionId, value}) {
    _profileOptions = _profileOptions.set(optionId, value);
    if (optionId === 'ignore_cycleroutes' && value)
      _profileOptions = _profileOptions.set('stick_to_cycleroutes', false);
    else if (optionId === 'stick_to_cycleroutes' && value)
      _profileOptions = _profileOptions.set('ignore_cycleroutes', false);
    this.emitChange();
  }
});
