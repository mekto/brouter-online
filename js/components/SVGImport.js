import React from 'react';


export default class SVGImport extends React.Component {
  render() {
    return <span dangerouslySetInnerHTML={{__html: this.props.src}}></span>;
  }
}
