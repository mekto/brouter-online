import React from 'react';
import Control from './Control';
import cx from 'classnames';
import store, {messages} from '../store';
import profiles, {profileOptions} from '../profiles';
import util from '../util';
import config from '../../config';
import {Sortable, SVGImport, RouteCard} from '../components';


class ToolboxComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = store.getStateAsObject();
    store.addChangeListener(newState => {
      this.setState(newState);
    });
  }

  render() {
    return (
      <div className="toolbox">
        <WaypointsSection waypoints={this.state.waypoints} isPending={this.state.isPending}/>
        <ProfileSection profile={this.state.profile} profileSettings={this.state.profileSettings}
          routeIndex={this.state.routeIndex}/>
        {this.renderMessagePanel()}
        <RouteCardsSection routes={this.state.routes}/>
      </div>
    );
  }

  renderMessagePanel() {
    if (!this.state.message)
      return null;

    const maxDistance = util.km(config.maxBrouterCalculationDistance);
    return (
      <div className="info">
        {this.state.message === messages.DISTANCE_TOO_LONG &&
          <span>Can't calculate distances longer than {maxDistance} as the crow flies.</span>}
        {this.state.message === messages.DISTANCE_TOO_LONG_FOR_AUTOCALCULATION &&
          <span>Press <a onClick={()=>{ store.calculateRoute({force: true}); }}>Find route</a> button to calculate route.</span>}
      </div>
    );
  }
}


class WaypointsSection extends React.Component {
  render() {
    return (
      <section className="waypoints">
        <WaypointList waypoints={this.props.waypoints}/>

        <button className="search-button" onClick={()=>{ store.calculateRoute({force: true}); }}>
          {!this.props.isPending
            ? <SVGImport src={require('directions.svg')}/>
            : <SVGImport src={require('tail-spin.svg')}/>}
        </button>

        {this.props.waypoints.length === 2 &&
        <div className="swap" onClick={()=>{ store.swapWaypoints(); }}>
          <SVGImport src={require('swap.svg')}/>
        </div>}
      </section>
    );
  }
}


class RouteCardsSection extends React.Component {
  render() {
    return (
      <div>
        {this.props.routes.map((route, i) =>
          <RouteCard route={route} key={i}/>)}
      </div>
    );
  }
}


class ProfileSection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showProfileDropdown: false,
      showProfileOptions: false,
    };
  }

  render() {
    return (
      <section className="profile">
        <div className="flex v-center">
          <SVGImport src={require('bike.svg')}/>
          <div className="field" style={{width: '120px'}}>
            <label>Profile:</label>
            <div className="dropdown">
              <button className={cx({active: this.state.showProfileDropdown})} onClick={()=>{ this.setState({showProfileDropdown: !this.state.showProfileDropdown}); }}>
                {this.props.profile.name} <i className="caret"/>
              </button>
              {this.state.showProfileDropdown &&
              <div className="dropdown-menu">
                {profiles.map((profile, i) =>
                  <span key={i} className="item" onClick={()=>{ store.setProfile(profile); this.setState({showProfileDropdown: false}); }}>{profile.name}</span>
                )}
              </div>}
            </div>
          </div>
          <div className="field">
            <label>Route index:</label>
            {[0, 1, 2, 3].map((idx) =>
              <span key={idx} className={cx('badge', {active: this.props.routeIndex === idx})} onClick={()=>{ store.setRouteIndex(idx); }}>{idx + 1}</span>
            )}
          </div>
          <div className="auto"></div>

          {this.props.profile.options &&
          <button className={cx({active: this.state.showProfileOptions})} onClick={() => this.setState({showProfileOptions: !this.state.showProfileOptions})}>
            <SVGImport src={require('settings.svg')}/>
          </button>}
        </div>

        {this.props.profile.options && this.state.showProfileOptions &&
        <div className="profile-options">
          {profileOptions.map((setting, i) =>
            this.props.profile.options.indexOf(setting.id) > -1 &&
              <label key={i}>
                <input
                  type="checkbox"
                  onChange={(e) => store.toggleProfileSetting(setting.id, e.target.checked)}
                  checked={!!this.props.profileSettings[setting.id]}/>
                  {setting.desc}
              </label>
          )}
        </div>}
      </section>
    );
  }
}


class WaypointList extends React.Component {
  onEnter(waypoint, e) {
    store.geocode(waypoint, e.target.value);
  }

  render() {
    return (
      <Sortable className="inner" swapItems={store.swapWaypoints.bind(store)} onSort={store.calculateRoute.bind(store)}>
        {this.props.waypoints.map((waypoint, i) =>
          <Sortable.Item className="waypoint" item={waypoint} key={i}>
            <Sortable.Handle className="label">
              <SVGImport src={require('grip.svg')}/>
              <span className="icon">{util.indexToLetter(i)}</span>
            </Sortable.Handle>
            <WaypointInput value={waypoint.text} onEnter={this.onEnter.bind(this, waypoint)}/>
          </Sortable.Item>
        )}
      </Sortable>
    );
  }
}


class WaypointInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: props.value};
  }

  componentWillReceiveProps(props) {
    this.setState({value: props.value});
  }

  onKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.props.onEnter(e);
    }
  }

  onChange(e) {
    this.setState({value: e.target.value});
  }

  render() {
    return (
      <input type="text" value={this.state.value} onKeyDown={this.onKeyDown.bind(this)} onChange={this.onChange.bind(this)}/>
    );
  }
}


export default Control.extend({
  options: { position: 'topleft' },
  getComponentClass() { return ToolboxComponent; }
});
