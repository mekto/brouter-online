import React from 'react';
import PropTypes from 'prop-types';
import util from '../util';


export default class Sortable extends React.Component {

  static propTypes = {
    handle: PropTypes.string,
    swapItems: PropTypes.func.isRequired,
    onSort: PropTypes.func,
  }
  static defaultProps = { onSort: () => {} }

  onDragOver(item, event) {
    if (!this.dragged || this.dragged === item)
      return;
    event.preventDefault();

    if (this.dragged.props.item === item.props.item)
      return;
    this.props.swapItems(
      this.dragged.props.item,
      item.props.item
    );
    this.sorted = true;
  }

  onDragStart(item, event) {
    if (this.props.handle) {
      const handle = event.target.querySelector(this.props.handle);
      if (!handle.contains(this.activeElement)) {
        event.preventDefault();
        return;
      }
    }
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', '1');
    this.dragged = item;
    this.sorted = false;
    this.handle = null;
  }

  onDragEnd() {
    if (this.dragged) {
      this.dragged = null;
    }
    if (this.sorted) {
      this.props.onSort();
      this.sorted = false;
    }
  }

  render() {
    const props = util.skip(this.props, ['swapItems', 'onSort']);
    return (
      <div {...props} onMouseMove={(e)=>{ this.activeElement = e.target; }} onMouseLeave={()=>{ this.activeElement = null; }}>
        {this.props.children.map(this.renderChild, this)}
      </div>
    );
  }

  renderChild(child) {
    return React.cloneElement(child, {
      onDragStart: this.onDragStart.bind(this, child),
      onDragEnd: this.onDragEnd.bind(this),
      onDragOver: this.onDragOver.bind(this, child),
      onDrop: this.onDragEnd.bind(this),
    });
  }
}


Sortable.Item = class extends React.Component {
  render() {
    return (
      <div {...this.props} draggable="true">
        {this.props.children}
      </div>
    );
  }
};
