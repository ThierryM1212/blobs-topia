import React from 'react'

import { SketchPicker } from 'react-color'
import reactCSS from 'reactcss'


class ColorPicker extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        showPicker: false,
        color: this.props.color,
      };
    }
    
    onClick = () => {
        this.setState({ 
          showPicker: !this.state.showPicker 
        })
    };
 
    onClose = () => {
      this.setState({ 
        showPicker: false 
      })
    };
 
    onChange = (color) => {
        this.setState({ 
          color: color.hex
        });
    };
 
    render() {
 
      const styles = reactCSS({
        'default': {
          color: {
            width: '40px',
            height: '15px',
            borderRadius: '3px',
            background: `${ this.state.color }`,
          },
          popover: {
            position: 'absolute',
            zIndex: '3',
          },
          cover: {
            position: 'fixed',
            top: '0px',
            right: '0px',
            bottom: '0px',
            left: '0px',
          },
          swatch: {
            padding: '6px',
            background: '#ffffff',
            borderRadius: '2px',
            cursor: 'pointer',
            display: 'inline-block',
            boxShadow: '0 0 0 1px rgba(0,0,0,.2)',
          },          
        },
      });
 
      return (
        <div>
          <div style={ styles.swatch } onClick={ this.onClick }>
            <div style={ styles.color } />
          </div>
          { this.state.showPicker ? <div style={ styles.popover }>
            <div style={ styles.cover } onClick={ this.onClose }/>
            <SketchPicker color={ this.state.color } onChange={ this.onChange } />
          </div> : null }
 
        </div>
      )
    }
}
 
export default ColorPicker