import google from 'google';

const geocoderService = new google.maps.Geocoder();
const autocompleteService = new google.maps.places.AutocompleteService();
const placesService = new google.maps.places.PlacesService(document.createElement('div'));

const queryCache = {};
const autocompleteCache = {};


const geocoder = {
  config: {
    contry_name: null,
    country_code: null,
    region_code: null,
    region_name: null,
    zip_code: null,
  },

  query(address, callback) {
    geocoder.query_Google(address, callback);
  },

  query_Google(address, callback) {
    const bounds = getBounds_Google();
    const cacheKey = `${address}.${bounds}`;
    const cache = queryCache;

    if (cache[cacheKey]) {
      callback(cache[cacheKey]);
      return;
    }

    geocoderService.geocode({address: address, bounds: bounds}, (results, status) => {
      let items = null;
      if (status === 'OK') {
        items = results.map((item) => {
          item.latLng = [item.geometry.location.lat(), item.geometry.location.lng()];
          item.formatted = compactAddress_Google(item.formatted_address);
          item.id = item.place_id;
          return item;
        });
      }
      cache[cacheKey] = items;
      callback(items);
    });
  },

  query_Photon(address, callback) {
    const center = require('./map').getCenter();
    const cacheKey = `${address}.${center}`;
    const cache = queryCache;

    if (cache[cacheKey]) {
      callback(cache[cacheKey]);
      return;
    }

    const url = new URL('//photon.komoot.de/api/');
    const params = {
      q: address,
      lat: center.lat,
      lon: center.lng,
    };
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    fetch(url).then(
      response => response.json(),
    ).then((features) => {
      let items = null;
      items = features.map((item) => {
        let result = item.properties;
        let coords = item.geometry.coordinates;
        result.latLng = [coords[1], coords[0]];
        result.formatted = `${result.name}, ${result.country} (${result.osm_key}.${result.osm_value})`;
        result.id = item.osm_id;
        return result;
      });
      cache[cacheKey] = items;
      return callback(items);
    });
  },

  autocomplete(input, callback) {
    const bounds = getBounds_Google();
    const cacheKey = `${input}.${bounds}`;
    const cache = autocompleteCache;

    if (cache[cacheKey] !== undefined) {
      callback(cache[cacheKey]);
      return;
    }
    autocompleteService.getPlacePredictions({input, bounds, types: ['geocode']}, (predictions, status) => {
      var suggestions = null;
      if (status === 'OK') {
        suggestions = predictions.map(function(prediction) {
          prediction.formatted = compactAddress_Google(prediction.description);
          prediction.html = matchedHTML_Google(prediction.formatted, prediction.matched_substrings);
          prediction.id = prediction.place_id;
          return prediction;
        });
      }
      cache[cacheKey] = suggestions;
      callback(suggestions);
    });
  },

  getPlace(placeId, callback) {
    placesService.getDetails({placeId}, (result, status) => {
      if (status === 'OK') {
        result.latLng = [result.geometry.location.lat(), result.geometry.location.lng()];
        result.formatted = compactAddress_Google(result.formatted_address);
        callback(result);
      } else {
        callback(null);
      }
    });
  },

  reverse(latlng, callback) {
    geocoder.reverse_Google(latlng, callback);
  },

  reverse_Google(latlng, callback) {
    let latLng = new google.maps.LatLng(latlng[0], latlng[1]);
    geocoderService.geocode({latLng}, (results, status) => {
      let result = null;
      if (status === 'OK') {
        result = results[0];
        result.formatted = compactAddress_Google(result.formatted_address);
      }
      callback(result);
    });
  },

  reverse_Nominatim(latlng, callback) {
    const url = '//nominatim.openstreetmap.org/reverse';
    const params = {
      lat: latlng[0],
      lon: latlng[1],
      zoom: 18,
      format: 'json',
      addressdetails: 1
    };
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    fetch(url).then(response => response.json()).then(
      response => {
        let result = null;
        result = response.address;
        result.formatted = compactAddress_Nominatim(response.address);
        callback(null);
    });
  },
};


/* eslint camelcase: 0 */
function getBounds_Google() {
  var map = require('./map');

  var bounds = map.getBounds();
  var southWest = bounds.getSouthWest();
  var northEast = bounds.getNorthEast();

  return new google.maps.LatLngBounds(
    new google.maps.LatLng(southWest.lat, southWest.lng),
    new google.maps.LatLng(northEast.lat, northEast.lng)
  );
}


/* eslint camelcase: 0 */
function matchedHTML_Google(text, matchedSubstrings) {
  var offset = 0;
  matchedSubstrings.forEach(function(match) {
    var pos = match.offset + offset;
    var term = text.substr(pos, match.length);
    var begin = text.substr(0, pos);
    var end = text.substr(pos + match.length);
    text = ''.concat(begin, '<strong>', term, '</strong>', end);
    offset += '<strong></strong>'.length;
  });

  var comma = text.lastIndexOf(', ');
  if (comma > 1) {
    text = ''.concat(text.substr(0, comma), ' <small>', text.slice(comma + 2), '</small>');
  }

  return text;
}


/* eslint camelcase: 0 */
function compactAddress_Google(formattedAddress) {
  var comma = formattedAddress.lastIndexOf(', ');
  if (comma > 0) {
    return formattedAddress.substr(0, comma);
  }
  return formattedAddress;
}

/* eslint camelcase: 0 */
function compactAddress_Nominatim(address) {
  let city = address.city || address.town || address.village || address.hamlet || '';
  if (address.postcode) {
    city = address.postcode + ' ' + city;
  }

  let street = address.road;
  if (address.house_number)
    street = street ? street + ' ' + address.house_number : address.house_number;

  let place = address.attraction;

  let rv = [];
  if (place)
    rv.push(place);
  if (street)
    rv.push(street);
  if (city)
    rv.push(city);
  return rv.join(', ');
}


export default geocoder;
