import React from 'react';
import { describeArc } from '../utils/svgUtils'

export class BlobMouth extends React.Component {


    render() {
        const mouth_type = this.props.mouth_type;
        const pos_eyes_x = this.props.pos_eyes_x;
        const pos_eyes_y = this.props.pos_eyes_y;
        const eyes_dist = this.props.eyes_dist;
        const transform = "translate(" + pos_eyes_x + "," + (pos_eyes_y + 15) + ")"

        var mouth_path = describeArc(pos_eyes_x + eyes_dist / 2, pos_eyes_y - 10, 30, 160, 200);
        if (mouth_type === "2") {
            mouth_path = describeArc(pos_eyes_x + eyes_dist / 2, pos_eyes_y + 50, 30, 340, 20);
        }
        if (mouth_type === "4") {
            mouth_path = describeArc(pos_eyes_x + eyes_dist / 2, pos_eyes_y + 10, 15, 130, 230);
            return (
                <g>
                    <path d={mouth_path} stroke="#000000" strokeWidth="2" strokeLinecap="round" fill="#ffffff" />
                    <line x1={pos_eyes_x + 3} y1={pos_eyes_y + 19} x2={pos_eyes_x + eyes_dist - 3} y2={pos_eyes_y + 19} stroke="#000000" strokeWidth="2" strokeLinecap="round" />
                </g>
            );
        }
        if (mouth_type === "3") {
            return (
                <line x1={pos_eyes_x + 5} y1={pos_eyes_y + 20} x2={pos_eyes_x + eyes_dist - 5} y2={pos_eyes_y + 20} stroke="#000000" strokeWidth="2" strokeLinecap="round" />
            )
        }
        if (mouth_type === "5") {
            return (
                <g transform={transform}>
                    <path fill="#be3c3c"
                        strokeWidth="0.07"
                        d="M 26.32,6.16 C 25.25131,6.16 24.23029,6.0375 23.25351,5.85935 21.53046,6.49901 18.88537,7.28 16.24,7.28 13.59463,7.28 10.94954,6.49901 9.22649,5.85935 8.24971,6.0375 7.22869,6.16 6.16,6.16 5.41331,6.16 2.52,6.16 0,5.6 c 0,0 3.54669,3.36 8.4,6.16 2.30153,1.32783 5.37551,1.68 7.84,1.68 2.46449,0 5.53847,-0.35217 7.84,-1.68 4.85331,-2.8 8.4,-6.16 8.4,-6.16 -2.52,0.56 -5.41331,0.56 -6.16,0.56 z"
                    />
                    <path
                        fill="#d2504b"
                        strokeWidth="0.07"
                        d="M 9.22649,5.85935 C 11.87515,5.37614 14.19579,4.48 16.24,4.48 c 2.04421,0 4.36485,0.89614 7.01351,1.37935 C 24.23029,6.0375 25.25131,6.16 26.32,6.16 c 0.74669,0 3.64,0 6.16,-0.56 C 27.90669,3.78 21.84,0 19.04,0 17.36,0 17.31331,0.78393 16.24,0.78393 15.16669,0.78393 15.12,0 13.44,0 10.64,0 4.57331,3.78 0,5.6 2.52,6.16 5.41331,6.16 6.16,6.16 7.22869,6.16 8.24971,6.0375 9.22649,5.85935 Z"
                    />
                </g>
            );
        }

        return (
            <path d={mouth_path} stroke="#000000" strokeWidth="2" strokeLinecap="round" fill="none" />
        );
    }
}
