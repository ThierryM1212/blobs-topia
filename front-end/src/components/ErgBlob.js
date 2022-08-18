import React from 'react';
import { BlobMouth } from './BlobMouth';
import { BlobEyes } from './BlobEyes';


export class ErgBlob extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            path: this.props.path,
            color1: this.props.color1,
            color2: this.props.color2,
            eyes_pos: this.props.eyes_pos,
            mouth_type: this.props.mouth_type,
            name: this.props.name,
            rotate: this.props.rotate,
        };
    }

    async componentDidUpdate(prevProps, prevState) {
        //console.log("BlobItem componentDidUpdate", prevProps, this.props)
        if (prevProps.path !== this.props.path ||
            prevProps.color1 !== this.props.color1 ||
            prevProps.color2 !== this.props.color2 ||
            prevProps.eyes_pos !== this.props.eyes_pos ||
            prevProps.mouth_type !== this.props.mouth_type ||
            prevProps.name !== this.props.name
        ) {
            this.setState({
                path: this.props.path,
                color1: this.props.color1,
                color2: this.props.color2,
                eyes_pos: this.props.eyes_pos,
                mouth_type: this.props.mouth_type,
                name: this.props.name
            });
        }
    }

    render() {
        var pos_eyes_x = 110, pos_eyes_y = 120, eyes_dist = 30;
        return (
            <div className="container-md " >
                <strong>
                    {this.state.name}
                </strong>
                <div className="card p-1 ergblob">
                    <div className={`shape ${this.props.rotate ? "rotate" : ""}`} >
                        <svg viewBox="0 0 250 250" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                            <defs>
                                <linearGradient id={`gradient_${this.props.color1 + this.props.color2}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" style={{ "stopColor": this.state.color1 }} />
                                    <stop offset="100%" style={{ "stopColor": this.state.color2 }} />
                                </linearGradient>
                            </defs>
                            <path d={this.state.path}
                                fill={`url(#gradient_${this.props.color1 + this.props.color2})`} strokeWidth="2px" stroke="#000000" />
                            <BlobEyes eyes_pos={this.state.eyes_pos}
                                pos_eyes_x={pos_eyes_x}
                                pos_eyes_y={pos_eyes_y}
                                eyes_dist={eyes_dist}
                            />
                            <BlobMouth
                                mouth_type={this.state.mouth_type}
                                pos_eyes_x={pos_eyes_x}
                                pos_eyes_y={pos_eyes_y}
                                eyes_dist={eyes_dist}
                            />
                        </svg>
                    </div>
                </div>
            </div>
        );
    }
}

export default ErgBlob;
