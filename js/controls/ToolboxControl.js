import React from 'react';
import Control from './Control';
import cx from 'classnames';
import profiles, {profileOptions} from '../profiles';
import util from '../util';
import f from '../filters';
import config from '../../config';
import store from '../store';
import {PureComponent, Sortable, SVGImport, RouteCard} from '../components';
import {messages} from '../constants';
import * as actions from '../actions';

const CSSTransitionSpan = React.addons.CSSTransitionGroup;


function getStateFromStores() {
  return {
    waypoints: store.waypoints,
    routes: store.routes,
    profile: store.profile,
    routeIndex: store.routeIndex,
    isPending: store.isPending,
    message: store.message,
    profileOptions: store.profileOptions,
  };
}


class ToolboxComponent extends PureComponent {
  constructor(props) {
    super(props);

    this.state = getStateFromStores();
  }

  componentDidMount() {
    store.addChangeListener(this.onChange);
  }

  onChange = () => {
    this.setState(getStateFromStores());
  }

  render() {
    return (
      <div className="toolbox">
        <WaypointsSection waypoints={this.state.waypoints} isPending={this.state.isPending}/>
        <ProfileSection profile={this.state.profile} profileOptions={this.state.profileOptions}
          routeIndex={this.state.routeIndex}/>
        {this.renderMessagePanel()}
        <RouteCardsSection routes={this.state.routes}/>
      </div>
    );
  }

  renderMessagePanel() {
    if (!this.state.message)
      return null;

    const maxDistance = f.km(config.maxBrouterCalculationDistance);
    return (
      <div className="info">
        {this.state.message === messages.DISTANCE_TOO_LONG &&
          <span>Can't calculate distances longer than {maxDistance} as the crow flies.</span>}
        {this.state.message === messages.DISTANCE_TOO_LONG_FOR_AUTOCALCULATION &&
          <span>Press <a onClick={()=>{ actions.calculateRoute({force: true}); }}>Find route</a> button to calculate route.</span>}
      </div>
    );
  }
}


class WaypointsSection extends PureComponent {
  render() {
    return (
      <section className="waypoints">
        <WaypointList waypoints={this.props.waypoints}/>

        <button className="search-button" onClick={()=>{ actions.calculateRoute({force: true}); }}>
          {!this.props.isPending
            ? <SVGImport src={require('directions.svg')}/>
            : <SVGImport src={require('tail-spin.svg')}/>}
        </button>

        {this.props.waypoints.length === 2 &&
        <div className="swap" onClick={()=>{ actions.swapWaypoints(); }}>
          <SVGImport src={require('swap.svg')}/>
        </div>}
      </section>
    );
  }
}


class RouteCardsSection extends PureComponent {
  render() {
    return (
      <div>
        {this.props.routes.map(route =>
          <RouteCard route={route} key={route.id}/>
        )}
      </div>
    );
  }
}


class ProfileSection extends PureComponent {
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
                  <span key={i} className="item" onClick={()=>{ actions.setProfile(profile); this.setState({showProfileDropdown: false}); }}>{profile.name}</span>
                )}
              </div>}
            </div>
          </div>
          <div className="field">
            <label>Route index:</label>
            {[0, 1, 2, 3].map((idx) =>
              <span key={idx} className={cx('badge', {active: this.props.routeIndex === idx})} onClick={()=>{ actions.setRouteIndex(idx); }}>{idx + 1}</span>
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
          {profileOptions.map((option, i) =>
            this.props.profile.options.indexOf(option.id) > -1 &&
              <label key={i}>
                <input
                  type="checkbox"
                  onChange={(e) => actions.setProfileOption(option.id, e.target.checked)}
                  checked={!!this.props.profileOptions[option.id]}/>
                  {option.desc}
              </label>
          )}
        </div>}
      </section>
    );
  }
}


class WaypointList extends PureComponent {
  render() {
    return (
      <Sortable className="inner" handle=".label" swapItems={actions.swapWaypoints} onSort={actions.calculateRoute}>
        {this.props.waypoints.map((waypoint, i) =>
          <Sortable.Item className="waypoint" item={waypoint} key={waypoint.id}>
            <span className="label">
              <SVGImport src={require('grip.svg')}/>
              <span className="icon">{f.indexToLetter(i)}</span>
            </span>
            <WaypointInput value={waypoint.address} onEnter={(e)=> actions.onWaypointInputEnter(waypoint, e.target.value)}/>
            <CSSTransitionSpan transitionName="fade" transitionEnterTimeout={500} transitionLeaveTimeout={500}>
              {waypoint.loading &&
                <span className="loading-indicator"><SVGImport key="indicator" src={require('loading-spokes.svg')}/></span>}
            </CSSTransitionSpan>
          </Sortable.Item>
        )}
      </Sortable>
    );
  }
}


class WaypointInput extends PureComponent {
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
