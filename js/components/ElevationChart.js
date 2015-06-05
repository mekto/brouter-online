import React from 'react';
import Leaflet from 'leaflet';


const MIN_ALTITUDE_SPAN = 200;
const CHART_TOP_PADDING = 20;


export default class ElevationChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      width: null,
      height: null,
    };
    window.route = props.route;
  }

  componentDidMount() {
    const svg = React.findDOMNode(this);
    this.setState({
      width: svg.clientWidth,
      height: svg.clientHeight,
    });
  }

  render() {
    return (
      <svg className="elevation-chart">
        {this.state.width && this.renderInner()}
      </svg>
    );
  }

  renderInner() {
    const width = this.state.width;
    const height = this.state.height;
    const coords = this.props.route.coordinates.map(([lng, lat, alt]) => ({lat, lng, alt}));
    let [min, max] = scaleExtent(coords, coord => coord.alt);
    if (max - min < MIN_ALTITUDE_SPAN) {
      max = min + MIN_ALTITUDE_SPAN;
    }

    let trackLength = 0;
    for (let i = 1; i < coords.length; ++i) {
      trackLength += Leaflet.CRS.Earth.distance(coords[i], coords[i - 1]);
      coords[i].dist = trackLength;
    }
    coords[0].dist = 0;

    const xScale = linearScale([0, trackLength], [0, width]);
    const yScale = linearScale([min, max], [height, CHART_TOP_PADDING]);

    let points = coords.map(({dist, alt}) => ({x: dist, y: alt}));
    points = Leaflet.LineUtil.simplify(points, points.length * 0.003);

    const linePoints = getPointsArray(points, xScale, yScale).join(' ');
    const areaPoints = `${linePoints} ${width},${height} 0,${height}`;

    return (
      <g>
        <polyline points={linePoints} className="line"/>
        <polyline points={areaPoints} className="area"/>
      </g>
    );
  }
}


/*
  Takes an array of values and returns an array of
  points plotted according to the given x and y scales
*/
function getPointsArray(array, xScale, yScale) {
  return array.map(({x, y}) => {
    return xScale(x) + ',' + yScale(y);
  });
}


/*
  Returns a function that scales a value from a given domain to a given range.
*/
function linearScale(domain, range) {
  const d0 = domain[0], r0 = range[0], multipler = (range[1] - r0) / (domain[1] - d0);

  return function(num) {
    return r0 + ((num - d0) * multipler);
  };
}

/*
  Returns the minimum and maximum value in given array.
*/
function scaleExtent(array, accessor) {
  if (accessor) {
    array = array.map(accessor);
  }
  return [Math.min.apply(null, array), Math.max.apply(null, array)];
}


function linearTickRange(domain, m) {
  var extent = scaleExtent(domain),
      span = extent[1] - extent[0],
      step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10)),
      err = m / span * step,
      range = [],
      i = 0,
      j;

  if (err <= 0.15) step *= 10;
  else if (err <= 0.35) step *= 5;
  else if (err <= 0.75) step *= 2;

  var start = Math.ceil(extent[0] / step) * step;
  var stop = Math.floor(extent[1] / step) * step + step * 0.5;

  while ((j = start + step * i++) < stop)
    range.push(j);

  return range;
}

/*
  Locates the insertion point for x in array to maintain sorted order.
*/
function bisect(array, x) {
  var lo = 0, hi = array.length, mid;
  while (lo < hi) {
    mid = lo + hi >>> 1;
    if (array[mid] < x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
