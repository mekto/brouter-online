import Leaflet from 'leaflet';
import React from 'react';
import Control from './Control';
import cs from 'classnames';
import Waypoints from '../utils/Waypoints';
import Routes from '../utils/Routes';
import Route from '../utils/Route';
import geocoder from '../geocoder';
import routing from '../routing';
import profiles, {profileOptions} from '../profiles';
import config from '../../config';
import utils from '../utils';
import {ContextMenu, SVGImport} from '../components';


class ToolboxComponent extends React.Component {
  constructor(props) {
    super(props);

    this.contextMenu = new ContextMenu();
    this.contextMenu.on('action', this.handleMenuAction, this);
    this.props.map.addLayer(this.contextMenu);

    let waypoints = new Waypoints();
    let routes = new Routes();

    waypoints._map = props.map;
    waypoints.add();
    waypoints.add();

    waypoints.on('dragend', (e) => { this.queryWaypoint(e.waypoint); });
    waypoints.on('remove', () => { this.calculateRoute(); });

    let profileOptions_ = {};
    profileOptions.forEach((option) => {
      profileOptions_[option.id] = option.defaultValue;
    });

    this.state = {
      waypoints: waypoints,
      routes: routes,

      profile: profiles[0],
      alternativeidx: 0,
      profileOptions: profileOptions_,

      loading: false,
      showProfileOptions: false,

      infoPanel: null,
    };
  }

  handleMenuAction(e) {
    if (e.action === 'setWaypoint') {
      this.setWaypoint(e.waypointType, e.latlng);
    }
  }

  queryWaypoint(waypoint) {
    var latlng = waypoint.marker.getLatLng();
    waypoint.text = `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
    this.calculateRoute(false, false);
  }

  toggleProfileOption(key, checked) {
    this.state.profileOptions[key] = checked;

    if (key === 'ignore_cycleroutes' && checked)
      this.state.profileOptions.stick_to_cycleroutes = false;
    else if (key === 'stick_to_cycleroutes' && checked)
      this.state.profileOptions.ignore_cycleroutes = false;
    this.setState({profileOptions: this.state.profileOptions});

    this.calculateRoute();
  }

  setProfile(profile) {
    this.setState({
      profile: profile,
      showProfileDropdown: false,
    });
    this.calculateRoute();
  }

  setAlternativeIndex(idx) {
    this.setState({alternativeidx: idx});
    this.calculateRoute();
  }

  swap() {
    this.state.waypoints.swap();
    this.setState({waypoints: this.state.waypoints});
    this.calculateRoute();
  }

  calculateRoute(force=false, fit=true) {
    let waypoints = this.state.waypoints.getWithMarkers();
    if (waypoints.length < 2) {
      this.forceUpdate();
      return false;
    }

    this.state.routes.clear();

    let latlngs = waypoints.map(waypoint => waypoint.marker.getLatLng());
    let distance = utils.calculateDistance(latlngs);
    if (distance > config.maxBrouterCalculationDistance) {
      let maxDistance = utils.km(config.maxBrouterCalculationDistance);
      this.setState({
        infoPanel: <frag>Can't calculate distances longer than {maxDistance} as the crow flies.</frag>
      });
      return false;
    }
    if (distance > config.maxBrouterAutoCalculationDistance && !force) {
      this.setState({
        infoPanel: <frag>Press <em>Find route</em> button to calculate route.</frag>
      });
      return false;
    }

    if (this.trailer) {
      this.props.map.removeLayer(this.trailer);
    }
    this.trailer = new Leaflet.Polyline(latlngs, {color: '#555', weight: 1, className: 'trailer-line'});
    this.trailer.addTo(this.props.map);

    if (fit && !this.props.map.getBounds().contains(latlngs))
      this.props.map.fitBounds(latlngs, {paddingTopLeft: [this._getToolboxWidth(), 0]});

    routing.route(waypoints, this.state.profile.getSource(this.state.profileOptions), this.state.alternativeidx, (geojson) => {
      if (geojson) {
        var route = new Route(geojson, waypoints).addTo(this.props.map);
        this.state.routes.push(route);

        if (fit && !this.props.map.getBounds().contains(route.layer.getBounds()))
          this.props.map.fitBounds(route.layer.getBounds(), {paddingTopLeft: [this._getToolboxWidth(), 0]});
      }
      if (this.trailer) {
        this.props.map.removeLayer(this.trailer);
        this.trailer = null;
      }
      this.setState({loading: false});
    });

    this.setState({
      loading: true,
      infoPanel: null,
    });
    return true;
  }

  setWaypoint(type, latlng) {
    let waypoint;
    if (type === 'start') {
      waypoint = this.state.waypoints.first;
    } else if (type === 'end') {
      waypoint = this.state.waypoints.last;
    } else {
      waypoint = this.state.waypoints.insert(this.state.waypoints.length - 1);
    }
    waypoint.setPosition({latlng});
    this.calculateRoute();
  }

  _getToolboxWidth() {
    return React.findDOMNode(this).getBoundingClientRect().width + 5;
  }

  onWaypointChangePosition(waypoint) {
    if (!this.calculateRoute()) {
      this.props.map.setView(waypoint.marker.getLatLng(), 14);
    }
  }

  render() {
    return (
      <div className="toolbox">
        {this.renderWaypoints()}
        {this.renderProfileSettings()}

        {this.state.infoPanel &&
        <section className="info">{this.state.infoPanel}</section>}

        {this.renderRouteCards()}
      </div>
    );
  }

  renderWaypoints() {
    return (
      <div>
        <section className="waypoints">
          <WaypointList waypoints={this.state.waypoints} onChange={() => this.calculateRoute()} onChangePosition={this.onWaypointChangePosition.bind(this)}/>

          <button className="search-button" onClick={() => this.calculateRoute(true)}>
            {!this.state.loading
              ? <SVGImport src={require('directions.svg')}/>
              : <SVGImport src={require('tail-spin.svg')}/>}
          </button>

          {this.state.waypoints.length === 2 &&
          <div className="swap" onClick={this.swap.bind(this)}>
            <SVGImport src={require('swap.svg')}/>
          </div>}

        </section>

        {/*
        <div className="typeahead-dropdown-menu">
          <div className="item active">Warszawa</div>
          <div className="item">Katowice</div>
          <div className="item">Kraków</div>
        </div>
        */}
      </div>
    );
  }

  renderProfileSettings() {
    let profile = this.state.profile;
    return (
      <section className="profile">
        <div className="flex v-center">
          <SVGImport src={require('bike.svg')}/>
          <div className="field" style={{width: '120px'}}>
            <label>Profile:</label>
            <div className="dropdown">
              <button className={cs({active: this.state.showProfileDropdown})} onClick={() => this.setState({showProfileDropdown: !this.state.showProfileDropdown})}>
                {this.state.profile.name} <i className="caret"/>
              </button>
              {this.state.showProfileDropdown &&
              <div className="dropdown-menu">
                {profiles.map((profile_, i) =>
                  <span key={i} className="item" onClick={() => this.setProfile(profile_)}>{profile_.name}</span>
                )}
              </div>}
            </div>
          </div>
          <div className="field">
            <label>Route index:</label>
            {[0, 1, 2, 3].map((idx) =>
              <span key={idx} className={cs('badge', {active: this.state.alternativeidx === idx})} onClick={() => this.setAlternativeIndex(idx)}>{idx + 1}</span>
            )}
          </div>
          <div className="auto"></div>

          {profile.options &&
          <button className={cs({active: this.state.showProfileOptions})} onClick={() => this.setState({showProfileOptions: !this.state.showProfileOptions})}>
            <SVGImport src={require('settings.svg')}/>
          </button>}
        </div>

        {profile.options && this.state.showProfileOptions &&
        <div className="profile-options">
          {profileOptions.map((option, i) =>
            profile.options.indexOf(option.id) > -1 &&
              <label key={i}>
                <input
                  type="checkbox"
                  onChange={(e) => this.toggleProfileOption(option.id, e.target.checked)}
                  checked={!!this.state.profileOptions[option.id]}/>
                  {option.desc}
              </label>
          )}
        </div>}
      </section>
    );
  }

  renderRouteCards() {
    return (
      this.state.routes.map((route, i) =>
      <section key={i} className="card">
        <div className="flex s-b">
          <div>
            <strong>{route.from.text}</strong> - <strong>{route.to.text}</strong>
          </div>
          <div>
            <small className="text-muted nowrap">{utils.km(route.trackLength)}</small>
          </div>
        </div>
      </section>)
    );
  }
}


class WaypointList extends React.Component {
  notifyUpdate() {
    this.props.onChange(this.props.waypoints);
  }

  setHandle(handle) {
    this.handle = handle;
  }

  dragOver(waypoint, e) {
    e.preventDefault();
    if (this.draggedWaypoint === waypoint)
      return;

    var items = this.props.waypoints;
    var fromIndex = items.indexOf(this.draggedWaypoint);
    var toIndex = items.indexOf(waypoint);

    items.splice(toIndex, 0, items.splice(fromIndex, 1)[0]);
    this.sorted = true;
    this.setState({});
  }

  dragStart(waypoint, e) {
    if (!e.target.contains(this.handle)) {
      e.preventDefault();
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '1');
    this.draggedWaypoint = waypoint;
    this.dragged = e.target;
    this.sorted = false;
    this.handle = null;
  }

  dragEnd() {
    if (this.dragged) {
      this.dragged = null;
      this.draggedWaypoint = null;
    }
    if (this.sorted) {
      this.props.waypoints.updateWaypointMarkers();
      this.notifyUpdate();
      this.sorted = false;
    }
  }

  render() {
    return (
      <div className="inner">
        {this.props.waypoints.map((waypoint, i) =>
          <div key={i} className="waypoint" draggable="true" onDragOver={this.dragOver.bind(this, waypoint)} onDragStart={this.dragStart.bind(this, waypoint)} onDrop={this.dragEnd.bind(this)} onDragEnd={this.dragEnd.bind(this)}>
            <span className="label" onMouseEnter={(e) => this.setHandle(e.target)} onMouseLeave={() => this.setHandle(null)}>
              <SVGImport src={require('grip.svg')}/>
              <span className="icon">{utils.indexToLetter(i)}</span>
            </span>
            <WaypointInput waypoint={waypoint} onChangePosition={this.props.onChangePosition}/>
          </div>
        )}
      </div>
    );
  }
}


class WaypointInput extends React.Component {
  handleChange(e) {
    this.props.waypoint.text = e.target.value;
    this.setState({});
  }

  handleKeyDown(e) {
    if (e.key === 'Enter') {
      geocoder.query(e.target.value, result => {
        if (result) {
          this.props.waypoint.setPosition(result);
          this.props.onChangePosition(this.props.waypoint);
        }
      });
    }
  }

  render() {
    return (
      <input
        type="text"
        value={this.props.waypoint.text}
        onChange={this.handleChange.bind(this)}
        onKeyDown={this.handleKeyDown.bind(this)}/>
    );
  }
}


export default Control.extend({
  options: { position: 'topleft' },
  getComponentClass() { return ToolboxComponent; }
});
