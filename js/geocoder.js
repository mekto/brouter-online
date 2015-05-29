import Leaflet from 'leaflet';
import superagent from 'superagent';


export default {
  config: {
    contry_name: null,
    country_code: null,
    region_code: null,
    region_name: null,
    zip_code: null,
  },

  query(address, callback) {
    let center = require('./map').getCenter();
    let req = superagent.get('//photon.komoot.de/api/');
    req.query({
      q: address,
      lat: center.lat,
      lon: center.lng,
    });
    req.end(response => {
      if (response.ok) {
        let item = response.body.features[0];
        let result = item.properties;
        let coords = item.geometry.coordinates;

        result.address = address;
        result.latlng = Leaflet.latLng(coords[1], coords[0]);
        callback(result);
      } else {
        callback(null);
      }
    });
  },

  reverse(latlng, callback) {
    let req = superagent.get('//nominatim.openstreetmap.org/reverse');
    req.query({
      lat: latlng.lat,
      lon: latlng.lng,
      zoom: 18,
      format: 'json',
      addressdetails: 1
    });
    req.end(response => {
      if (response.ok) {
        let result = response.body.address;
        result.formatted = compactAddress(response.body.address);
        callback(result);
      }
      callback(null);
    });
  }
};


function compactAddress(address) {
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
