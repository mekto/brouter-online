var Regular = require('regular');


function km(valueInMeters) {
  return +(valueInMeters / 1000).toFixed(1) + ' km';
}


Regular.filter('km', km);
