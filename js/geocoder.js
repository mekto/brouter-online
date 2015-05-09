var L = require('leaflet');

var geocoderService = new google.maps.Geocoder();
var autocompleteService = new google.maps.places.AutocompleteService();
var placesService = new google.maps.places.PlacesService(document.createElement('div'));


var cache = {};


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

  autocomplete(text, callback) {
    if (cache[text] !== undefined) {
      callback(cache[text]);
      return;
    }

    autocompleteService.getPlacePredictions({input: text, bounds: getBounds(), types: ['geocode']}, function(predictions, status) {
      var suggestions = [];
      if (status === 'OK') {
        suggestions = predictions.map(function(prediction) {
          prediction.html = matchedHTML(prediction.description, prediction.matched_substrings);
          return prediction;
        });
      }
      cache[text] = suggestions;
      callback(suggestions);
    });
  },

  resolve(placeId, callback) {
    placesService.getDetails({placeId: placeId}, function(result, status) {
      if (status === 'OK') {
        result.latlng = new L.LatLng(result.geometry.location.lat(), result.geometry.location.lng());
        result.address = compactAddress(result.formatted_address);
        callback(result);
      } else {
        callback(null);
      }
    });
  }
};


function getBounds() {
  var map = require('./map');

  var bounds = map.getBounds();
  var southWest = bounds.getSouthWest();
  var northEast = bounds.getNorthEast();

  return new google.maps.LatLngBounds(new google.maps.LatLng(southWest.lat, southWest.lng),
                                      new google.maps.LatLng(northEast.lat, northEast.lng));
}


function matchedHTML(text, matched_substrings) {
  var offset = 0;
  matched_substrings.forEach(function(match) {
    var pos = match.offset + offset;
    var term = text.substr(pos, match.length),
        begin = text.substr(0, pos),
        end = text.substr(pos + match.length);
    text = ''.concat(begin, '<strong>', term, '</strong>', end);
    offset += '<strong></strong>'.length;
  });

  var comma = text.lastIndexOf(', ');
  if (comma > 1) {
    text = ''.concat(text.substr(0, comma), ' <small>', text.slice(comma + 2), '</small>');
  }

  return text;
}


function compactAddress(formattedAddress) {
  var comma = formattedAddress.lastIndexOf(', ');
  if (comma > 0) {
    return formattedAddress.substr(0, comma);
  }
  return formattedAddress;
}


module.exports = geocoder;
