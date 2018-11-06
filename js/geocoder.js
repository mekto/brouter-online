import map from './map';

const queryCache = {};


const geocoder = {
  config: {
    contry_name: null,
    country_code: null,
    region_code: null,
    region_name: null,
    zip_code: null,
  },

  query(address, callback) {
    geocoder.query_Photon(address, callback);
  },

  query_Photon(address, callback) {
    const center = map.getCenter();
    const cacheKey = `${address}.${center}`;
    const cache = queryCache;

    if (cache[cacheKey]) {
      callback(cache[cacheKey]);
      return;
    }

    const url = new URL('https://photon.komoot.de/api/');
    const params = {
      q: address,
      lat: center.lat,
      lon: center.lng,
    };
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    fetch(url).then(
      response => response.json(),
    ).then((response) => {
      let items = null;
      items = response.features.map((item) => {
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

  reverse(latlng, callback) {
    geocoder.reverse_Nominatim(latlng, callback);
  },

  reverse_Nominatim(latlng, callback) {
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
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
        if (result) {
          result.formatted = compactAddress_Nominatim(response.address);
        }
        callback(result || null);
    });
  },
};


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
