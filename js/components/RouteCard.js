import React from 'react';
import * as actions from '../actions';
import {km} from '../filters';
import {SVGImport, ElevationChart} from '.';
import {getRouteTrackLength} from '../reducers/routes';


export default class RouteCard extends React.Component {
  render() {
    const route = this.props.route;
    return (
      <section className="card">
        <div className="inner">
          <div className="flex s-b">
            <div>
              <strong>{route.name}</strong><br/>
              <small className="text-muted nowrap">
                <strong>{km(getRouteTrackLength(route))}</strong>
                <span className="separation-dot">·</span>
                {route.profile.name} <span className="badge muted">{route.routeIndex + 1}</span>
              </small>
            </div>
            <div className="actions">
             <a onClick={()=>{ actions.fitRoute(route.id); }}><SVGImport src={require('expand.svg')}/></a>
             <a onClick={()=>{ actions.toggleRouteLock(route.id); }} className={route.locked && 'active'}><SVGImport src={require('thumb-tack.svg')}/></a>
             <a onClick={()=>{ actions.deleteRoute(route.id); }}><SVGImport src={require('x.svg')}/></a>
            </div>
          </div>
        </div>
        <ElevationChart route={route}/>
      </section>
    );
  }
}
