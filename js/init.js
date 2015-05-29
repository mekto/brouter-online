import request from 'superagent';
import map from './map';
import geocoder from './geocoder';


request.get('http://freegeoip.net/json/').timeout(1999).end((res) => {
  if (res && res.ok) {
    map.setView([res.body.latitude, res.body.longitude], 8);
    geocoder.countryCode = res.body.country_code;
  } else {
    map.setView([49, 18], 4);
  }
});
