import React from 'react';

export class BlobEyes extends React.Component {

    render() {
        const eyes_pos = this.props.eyes_pos;
        const pos_eyes_x = this.props.pos_eyes_x;
        const pos_eyes_y = this.props.pos_eyes_y;
        const eyes_dist = this.props.eyes_dist;

        var delta_eyes_x = 0, delta_eyes_y = 0;

        if (eyes_pos === "2") {
            delta_eyes_x = 2;
            delta_eyes_y = 2;
        } else if (eyes_pos === "3") {
            delta_eyes_x = 2;
            delta_eyes_y = -2;
        } else if (eyes_pos === "4") {
            delta_eyes_x = -2;
            delta_eyes_y = 2;
        } else if (eyes_pos === "5") {
            delta_eyes_x = -2;
            delta_eyes_y = -2;
        }

        return (
            <g>
                <ellipse cx={pos_eyes_x} cy={pos_eyes_y} rx="9" ry="14" strokeWidth="1" stroke="#000000" fill="#FFFFFF" />
                <ellipse cx={pos_eyes_x + eyes_dist} cy={pos_eyes_y} rx="9" ry="14" strokeWidth="1" stroke="#000000" fill="#FFFFFF" />
                <circle cx={pos_eyes_x + delta_eyes_x} cy={pos_eyes_y + delta_eyes_y} r="4" fill="#000000" />
                <circle cx={pos_eyes_x + eyes_dist + delta_eyes_x} cy={pos_eyes_y + delta_eyes_y} r="4" fill="#000000" />
            </g>
        )

    }
}
