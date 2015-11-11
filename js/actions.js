import {dispatch} from './dispatcher';
import geocoder from './geocoder';
import routing from './routing';
import store from './store';
import map from './map';
import MapUtils from './utils/MapUtils';
import util from './util';
import { findById } from './immulib';


/*
  Global
*/
export function calculateRoute(options={}) {
  const {fit=true, force=false} = options;

  const canCalculate = store.canCalculateRoute(force);
  if (canCalculate === true) {
    dispatch('CALCULATE_ROUTE');

    if (fit) {
      fitWaypoints(store.validWaypoints);
    }
    const waypoints = store.validWaypoints;
    const latLngs = MapUtils.getLatLngsFromWaypoints(waypoints);
    const profile = store.profile;
    const routeIndex = store.routeIndex;
    const profileOptions = store.profileOptions;

    routing.route(latLngs, profile.getSource(profileOptions), routeIndex, (geojson) => {
      if (geojson) {
        const id = util.id();
        dispatch('CALCULATE_ROUTE_SUCCESS', {id, geojson, waypoints, profile, profileOptions, routeIndex});
        if (fit) {
          fitRoute(store.routes::findById(id));
        }
      } else {
        dispatch('CALCULATE_ROUTE_FAIL');
      }
    });
  } else {
    dispatch('CALCULATE_ROUTE_ABORT', {message: canCalculate});
  }
}


/*
  Waypoints
*/
export function onWaypointInputEnter(waypoint, address) {
  geocodeWaypoint(waypoint, address, (result) => {
    if (result) {
      if (store.validWaypoints.length === 1) {
        zoomWaypoint(store.waypoints::findById(waypoint.id));
      } else {
        fitWaypoints(store.validWaypoints);
        calculateRoute();
      }
    }
  });
}

export function updateWaypoint(waypoint, updates) {
  dispatch('UPDATE_WAYPOINT', {id: waypoint.id, updates});
}

export function putWaypointAtLatLng(type, latLng) {
  let waypoint;
  if (type !== 'via') {
    if (type === 'start')
      waypoint = store.waypoints[0];
    else if (type === 'end')
      waypoint = store.waypoints[store.waypoints.length - 1];
    updateWaypoint(waypoint, {latLng, address: MapUtils.latLngToString(latLng)});
    waypoint = store.waypoints::findById(waypoint.id);
  } else {
    const id = util.id();
    addViaWaypoint({id, latLng});
    waypoint = store.waypoints::findById(id);
  }
  reverseGeocodeWaypoint(waypoint);
  calculateRoute();
}

export function deleteWaypoint(waypoint) {
  dispatch('DELETE_WAYPOINT', waypoint.id);
}

export function clearWaypoint(waypoint) {
  updateWaypoint(waypoint, {latLng: null, address: ''});
}

export function swapWaypoints(waypointA, waypointB) {
  if (waypointA !== undefined) {
    if (waypointA.id !== waypointB.id) {
      dispatch('SWAP_WAYPOINTS', [waypointA.id, waypointB.id]);
    }
  } else {
    dispatch('SWAP_WAYPOINTS');
    calculateRoute();
  }
}

export function addViaWaypoint(props) {
  dispatch('ADD_VIA_WAYPOINT', props);
}

export function geocodeWaypoint(waypoint, address, callback) {
  dispatch('GEOCODE_START', {id: waypoint.id, address});
  geocoder.query(address, (results) => {
    if (results && results[0]) {
      const result = results[0];
      dispatch('GEOCODE_SUCCESS', {id: waypoint.id, latLng: result.latLng, address});
      if (callback) callback(result);
    } else {
      dispatch('GEOCODE_FAIL', {id: waypoint.id, address});
      callback(null);
    }
  });
}

export function reverseGeocodeWaypoint(waypoint) {
  const latLng = waypoint.getLatLng();
  dispatch('REVERSE_GEOCODE_START', {id: waypoint.id, latLng});
  geocoder.reverse(waypoint.getLatLng(), (result) => {
    if (result) {
      dispatch('REVERSE_GEOCODE_SUCCESS', {id: waypoint.id, latLng, address: result.formatted});
    } else {
      dispatch('REVERSE_GEOCODE_FAIL', {id: waypoint.id, latLng});
    }
  });
}

export function zoomWaypoint(waypoint) {
  map.setView(waypoint.getLatLng(), 14);
}

export function fitWaypoints(waypoints) {
  map.fitBounds(MapUtils.getWaypointBounds(waypoints), MapUtils.FIT_OPTIONS);
}

export function onWaypointDrag(id) {
  reverseGeocodeWaypoint(store.waypoints::findById(id));
  calculateRoute({fit: false});
}

export function onWaypointClick(id) {
  if (MapUtils.getWaypointType(id) === 'via') {
    deleteWaypoint(store.waypoints::findById(id));
    calculateRoute();
  }
}


/*
  Routes
*/
export function fitRoute(route) {
  map.fitBounds(route.layer.getBounds(), MapUtils.FIT_OPTIONS);
}

export function updateRoute(route, updates) {
  dispatch('UPDATE_ROUTE', {id: route.id, updates});
}

export function toggleRouteLock(route) {
  updateRoute(route, {locked: !route.locked});
}

export function deleteRoute(route) {
  dispatch('DELETE_ROUTE', route.id);
}


/*
  Profile
*/
export function setProfile(profile) {
  dispatch('SET_PROFILE', profile);
  calculateRoute();
}

export function setRouteIndex(routeIndex) {
  dispatch('SET_ROUTE_INDEX', routeIndex);
  calculateRoute();
}

export function setProfileOption(optionId, value) {
  dispatch('SET_PROFILE_OPTION', {optionId, value});
  calculateRoute();
}
