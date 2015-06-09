import * as actions from '../actions';
import util from '../util';
import {SVGImport, ElevationChart} from '.';
import PureComponent from './PureComponent';


export default class RouteCard extends PureComponent {
  render() {
    const route = this.props.route;
    return (
      <section className="card">
        <div className="inner">
          <div className="flex s-b">
            <div>
              <strong>{route.name}</strong><br/>
              <small className="text-muted nowrap">
                <strong>{util.km(route.trackLength)}</strong>
                <span className="separation-dot">·</span>
                {route.profile.name} <span className="badge muted">{route.routeIndex + 1}</span>
              </small>
            </div>
            <div className="actions">
             <a onClick={()=>{ actions.fitRoute(route); }}><SVGImport src={require('expand.svg')}/></a>
             <a onClick={()=>{ actions.toggleRouteLock(route); }} className={route.locked && 'active'}><SVGImport src={require('thumb-tack.svg')}/></a>
             <a onClick={()=>{ actions.deleteRoute(route); }}><SVGImport src={require('x.svg')}/></a>
            </div>
          </div>
        </div>
        <ElevationChart route={route}/>
      </section>
    );
  }
}
