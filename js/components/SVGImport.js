import PureComponent from './PureComponent';


export default class SVGImport extends PureComponent {
  render() {
    return <span dangerouslySetInnerHTML={{__html: this.props.src}}></span>;
  }
}
