import React from 'react';
import ReactDOM, {findDOMNode, unmountComponentAtNode} from 'react-dom';
import Leaflet from 'leaflet';
import f from '../filters';
import map from '../map';
import PureComponent from './PureComponent';


const MIN_ALTITUDE_SPAN = 160;


export default class ElevationChart extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      width: null,
      height: null,
      guide: null,
    };
  }

  componentDidMount() {
    const svg = findDOMNode(this);
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
    const guide = this.state.guide;

    if (this.coords === undefined) {
      const coords = this.props.route.coordinates.map(([lng, lat, alt]) => ({lat, lng, alt}));
      coords[0].dist = 0;
      if (coords[0].alt === undefined)
        coords[0].alt = coords[1].alt;

      let [min, max] = scaleExtent(coords, coord => coord.alt);
      const elevationSpan = max - min;
      let yScalePadding = elevationSpan * 0.1;
      if (elevationSpan < MIN_ALTITUDE_SPAN) {
        max = min + MIN_ALTITUDE_SPAN;
        yScalePadding = (max - min) * 0.1;
      } else {
        max += yScalePadding;  // top padding
      }
      min -= yScalePadding;

      let trackLength = 0;
      for (let i = 1; i < coords.length; ++i) {
        trackLength += Leaflet.CRS.Earth.distance(coords[i], coords[i - 1]);
        coords[i].dist = trackLength;
      }

      const xScale = linearScale([0, trackLength], [0, width]);
      const yScale = linearScale([min, max], [height, 0]);
      const xInvertedScale = linearScale([0, width], [0, trackLength]);
      const yScaleTicks = linearTickRange([min + yScalePadding, max - yScalePadding], 5);

      let points = coords.map(({dist, alt}) => ({x: dist, y: alt}));
      points = Leaflet.LineUtil.simplify(points, points.length * 0.003);

      const linePoints = getPointsArray(points, xScale, yScale).join(' ');
      const areaPoints = `${linePoints} ${width},${height} 0,${height}`;

      this.coords = coords;
      this.xScale = xScale;
      this.yScale = yScale;
      this.xInvertedScale = xInvertedScale;
      this.yScaleTicks = yScaleTicks;
      this.points = this.points;

      this.linePoints = linePoints;
      this.areaPoints = areaPoints;
    }

    const guideLeftLabels = guide && guide.pos > width - 90;
    const showYScaleTicks = guide === null || guide.pos < width - 45;

    return (
      <g>
        <polyline points={this.areaPoints} className="area"/>
        <polyline points={this.linePoints} className="line"/>

        {showYScaleTicks &&
          <g className="y-axis">
            {this.yScaleTicks.map(tick => (
              <g key={tick} transform={`translate(0, ${this.yScale(tick)})`}>
                <line className="tick" x1={width - 6} x2={width}/>
                <text className="tick-label" x={width - 8} dy=".32em">{`${tick} m`}</text>
              </g>
            ))}
          </g>
        }

        {guide &&
          <g transform={`translate(${guide.pos}, 0)`} className={guideLeftLabels ? 'labels-left' : null}>
            <line className="guide" y2={height}/>

            <text className="guide-label" x={guideLeftLabels ? -3 : 3} y="9">{Math.round(guide.alt) + ' m'}</text>
            <text className="guide-label" x={guideLeftLabels ? -3 : 3} y="22">{f.km(guide.dist, 2)}</text>
          </g>
        }

        <rect fill="none" stroke="none" width={width} height={height}
          onMouseMove={this.onShowGuide.bind(this)}
          onMouseOut={this.onHideGuide.bind(this)}
          onClick={this.onPan.bind(this)}
          style={{pointerEvents: 'all'}}/>
      </g>
    );
  }

  onShowGuide(event) {
    const guide = this._getHoverData(event);
    this.setState({guide});

    let container;
    if (this._heightIndicator) {
      container = findDOMNode(this._heightIndicator).parentElement;
    } else {
      container = document.createElement('div');
      map.getPanes().popupPane.appendChild(container);
    }
    this._heightIndicator = ReactDOM.render(<HeightIndicator alt={guide.alt} dist={guide.dist}/>, container);

    const svg = findDOMNode(this._heightIndicator);
    const point = map.latLngToLayerPoint([guide.lat, guide.lng]);
    Leaflet.DomUtil.setPosition(container, point.subtract([3, svg.height.baseVal.value - 3]));
  }

  onHideGuide() {
    this.setState({guide: null});

    if (this._heightIndicator) {
      const container = findDOMNode(this._heightIndicator).parentElement;
      unmountComponentAtNode(container);
      container.parentElement.removeChild(container);
      delete this._heightIndicator;
    }
  }

  onPan(event) {
    const {lat, lng} = this._getHoverData(event);
    map.panTo([lat, lng]);
  }

  _getHoverData(event) {
    const pos = event.clientX - event.target.getBoundingClientRect().left;
    const dist = this.xInvertedScale(pos);
    const index = bisect(this.coords.map(coord => coord.dist), dist);
    return Object.assign({pos}, this.coords[index]);
  }
}


class HeightIndicator extends React.Component {
  render() {
    return (
      <svg className="height-indicator" width="80" height="60">
        <g transform="translate(3, 0)">
          <line className="guide" y2="60"/>

          <text className="guide-label" x="3" y="9">{Math.round(this.props.alt) + ' m'}</text>
          <text className="guide-label" x="3" y="20">{f.km(this.props.dist, 2)}</text>
          <circle cx="0" cy="57" r="2.5"/>
        </g>
      </svg>
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
