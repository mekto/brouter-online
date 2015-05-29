var L = require('leaflet');
var google = require('google');

var geocoderService = new google.maps.Geocoder();


var geocoder = {
  query(address, callback) {
    geocoderService.geocode({address: address, bounds: getBounds()}, function(results, status) {
      if (status === 'OK') {
        var result = results[0];
        result.latlng = new L.LatLng(result.geometry.location.lat(), result.geometry.location.lng());
        result.address = compactAddress(result.formatted_address);
        callback(result);
      } else {
        callback(null);
      }
    });
  },
};


function getBounds() {
  var map = require('./map');

  var bounds = map.getBounds();
  var southWest = bounds.getSouthWest();
  var northEast = bounds.getNorthEast();

  return new google.maps.LatLngBounds(new google.maps.LatLng(southWest.lat, southWest.lng),
                                      new google.maps.LatLng(northEast.lat, northEast.lng));
}


function compactAddress(formattedAddress) {
  var comma = formattedAddress.lastIndexOf(', ');
  if (comma > 0) {
    return formattedAddress.substr(0, comma);
  }
  return formattedAddress;
}


module.exports = geocoder;
