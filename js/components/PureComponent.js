import React from 'react';


export default class PureComponent extends React.Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = React.addons.PureRenderMixin.shouldComponentUpdate.bind(this);
  }
}
