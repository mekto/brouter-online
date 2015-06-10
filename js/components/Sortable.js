import React from 'react';
import util from '../util';


class Sortable extends React.Component {

  static propTypes = {
    swapItems: React.PropTypes.func.isRequired,
    onSort: React.PropTypes.func,
  }
  static defaultProps = { onSort: () => {} }

  onDragOver(item, event) {
    if (!this.dragged || this.dragged === item)
      return;
    event.preventDefault();
    this.props.swapItems(
      this.dragged.props.item,
      item.props.item
    );
    this.sorted = true;
  }

  onDragStart(item, event) {
    if (!event.target.contains(this.handle)) {
      event.preventDefault();
      return;
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

  setHandle(handle) {
    this.handle = handle;
  }

  render() {
    const props = util.skip(this.props, ['swapItems', 'onSort']);
    return (
      <div {...props}>
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
      setHandle: this.setHandle.bind(this),
    });
  }
}


class Item extends React.Component {
  constructor(props) {
    super(props);
    this.state = { activeHandle: false };
  }

  render() {
    return (
      <div {...this.props} draggable="true">
        {React.Children.map(this.props.children, this.renderChild, this)}
      </div>
    );
  }

  renderChild(child) {
    if (child && child.type === Sortable.Handle) {
      return React.cloneElement(child, {
        onMouseEnter: (e) => this.props.setHandle(e.target),
        onMouseLeave: () => this.props.setHandle(null),
      });
    }
    return child;
  }

  toggleHandle(activeHandle) {
    this.setState({activeHandle});
  }
}


class Handle extends React.Component {
  render() {
    return <span {...this.props}>{this.props.children}</span>;
  }
}


Sortable.Item = Item;
Sortable.Handle = Handle;


export default Sortable;
export {Item, Handle};
