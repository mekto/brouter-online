import React from 'react';
import { CSSTransitionGroup } from 'react-transition-group'
import Control from './Control';
import cx from 'classnames';
import {profileOptions} from '../profiles';
import util from '../util';
import f from '../filters';
import config from '../../config';
import store from '../store';
import {Sortable, SVGImport, RouteCard} from '../components';
import {messages} from '../constants';
import {findById} from '../immulib';
import * as actions from '../actions';


function getStateFromStore() {
  const { waypoints, routes, profiles, options, messages, isPending } = store.getState();
  return {
    waypoints,
    routes,
    profiles,
    options,
    messages,
    isPending,
  };
}


class ToolboxComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = getStateFromStore();
  }

  componentDidMount() {
    store.subscribe(this.onChange);
  }

  onChange = () => {
    this.setState(getStateFromStore());
  }

  render() {
    const { waypoints, routes, profiles, options, isPending } = this.state;
    return (
      <div className="toolbox">
        <WaypointsSection waypoints={waypoints} isPending={isPending}/>
        <ProfileSection profiles={profiles} options={options}/>
        {this.renderErrorMessagePanel()}
        {this.renderInfoMessagePanel()}
        <RouteCardsSection routes={routes}/>
      </div>
    );
  }

  renderInfoMessagePanel() {
    if (!this.state.messages.info)
      return null;

    const displayMessages = [messages.DISTANCE_TOO_LONG, messages.DISTANCE_TOO_LONG_FOR_AUTOCALCULATION];
    if (displayMessages.indexOf(this.state.messages.info) == -1) {
      return null;
    }

    const maxDistance = f.km(config.maxBrouterCalculationDistance);
    return (
      <div className="info">
        {this.state.messages.info === messages.DISTANCE_TOO_LONG &&
          <span>Can't calculate distances longer than {maxDistance} as the crow flies.</span>}
        {this.state.messages.info === messages.DISTANCE_TOO_LONG_FOR_AUTOCALCULATION &&
          <span>Press <a onClick={()=>{ actions.calculateRoute({force: true}); }}>Find route</a> button to calculate route.</span>}
      </div>
    );
  }

  renderErrorMessagePanel() {
    if (this.state.messages.error === null)
      return null;

    return (
      <div className="error">
        <div className="actions">
          <a onClick={()=>{ actions.clearErrorMessage(); }}><SVGImport src={require('../../svg/x.svg')}/></a>
        </div>
        <div><strong>Error while calculating route</strong></div>
        <div>{this.state.messages.error}</div>
      </div>
    );
  }
}


class WaypointsSection extends React.Component {
  render() {
    return (
      <section className="waypoints">
        <WaypointList waypoints={this.props.waypoints}/>

        <button className="search-button" onClick={()=>{ actions.calculateRoute({force: true}); }}>
          {!this.props.isPending
            ? <SVGImport src={require('../../svg/directions.svg')}/>
            : <SVGImport src={require('../../svg/tail-spin.svg')}/>}
        </button>

        {this.props.waypoints.length === 2 &&
        <div className="swap" onClick={()=>{ actions.swapWaypoints(); }}>
          <SVGImport src={require('../../svg/swap.svg')}/>
        </div>}
      </section>
    );
  }
}


class RouteCardsSection extends React.Component {
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


class ProfileSection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showProfileDropdown: false,
      showProfileOptions: true,
    };
  }

  setProfile(profile) {
    actions.setProfile(profile);

    this.setState({showProfileDropdown: false});
    if (profile.id === 'custom') {
      this.setState({showProfileOptions: true});
    }
  }

  onCustomProfileSourceChange(e) {
    actions.setCustomProfileSource(e.target.value);
  }

  render() {
    const { profiles, options } = this.props;
    const profile = profiles::findById(options.profileId);
    return (
      <section className="profile">
        <div className="flex v-center">
          <SVGImport src={require('../../svg/bike.svg')}/>
          <div className="field" style={{width: '120px'}}>
            <label>Profile:</label>
            <div className="dropdown">
              <button className={cx({active: this.state.showProfileDropdown})} onClick={()=>{ this.setState({showProfileDropdown: !this.state.showProfileDropdown}); }}>
                {profile.name} <i className="caret"/>
              </button>
              {this.state.showProfileDropdown &&
              <div className="dropdown-menu">
                {profiles.map(profile =>
                  <span key={profile.id} className="item" onClick={() => this.setProfile(profile.id)}>{profile.name}</span>
                )}
              </div>}
            </div>
          </div>
          <div className="field">
            <label>Route index:</label>
            {[0, 1, 2, 3].map((idx) =>
              <span key={idx} className={cx('badge', {active: options.routeIndex === idx})} onClick={()=>{ actions.setRouteIndex(idx); }}>{idx + 1}</span>
            )}
          </div>
          <div className="auto"></div>

          {(profile.options || profile.id === 'custom') &&
          <button className={cx({active: this.state.showProfileOptions})} onClick={() => this.setState({showProfileOptions: !this.state.showProfileOptions})}>
            <SVGImport src={require('../../svg/settings.svg')}/>
          </button>}
        </div>

        {profile.options && this.state.showProfileOptions &&
        <div className="profile-options">
          {profileOptions.map((option, i) =>
            profile.options.includes(option.id) &&
              <label key={i}>
                <input
                  type="checkbox"
                  onChange={(e) => actions.setProfileOption(option.id, e.target.checked)}
                  checked={!!options.profileOptions[option.id]}/>
                {option.name}
              </label>
          )}
        </div>}
        {profile.id === 'custom' && this.state.showProfileOptions &&
        <div className="custom-profile-options">
          <div><label>Profile source</label></div>
          <div>
            <textarea wrap="off" spellCheck={false} value={profile.source} onChange={::this.onCustomProfileSourceChange}>
            </textarea>
          </div>
        </div>}
      </section>
    );
  }
}


class WaypointList extends React.Component {
  render() {
    return (
      <Sortable className="inner" handle=".label" swapItems={(wpA, wpB) => actions.reorderWaypoints(wpA.id, wpB.id)} onSort={actions.calculateRoute}>
        {this.props.waypoints.map((waypoint, i) =>
          <Sortable.Item className="waypoint" item={waypoint} key={waypoint.id}>
            <span className="label">
              <SVGImport src={require('../../svg/grip.svg')}/>
              <span className="icon">{f.indexToLetter(i)}</span>
            </span>
            <WaypointInput value={waypoint.address} onEnter={(e)=> actions.geocodeWaypoint(waypoint.id, e.target.value)}/>
            <CSSTransitionGroup transitionName="fade" transitionEnterTimeout={500} transitionLeaveTimeout={500}>
              {waypoint.loading &&
                <span className="loading-indicator"><SVGImport key="indicator" src={require('../../svg/loading-spokes.svg')}/></span>}
            </CSSTransitionGroup>
            {waypoint.latLng && !waypoint.loading &&
                <span className="clear-button" onClick={() => { this.props.waypoints.length > 2 ? actions.deleteWaypoint(waypoint.id) : actions.clearWaypoint(waypoint.id); }}><SVGImport src={require('../../svg/x.svg')}/></span>
            }
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
