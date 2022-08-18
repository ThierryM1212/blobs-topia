import React from 'react';
import OctogonImage from "../images/octogone.png";


export class WinPercent extends React.Component {

    render() {
        const win_rate = this.props.win_rate;

        return (
            <div className="d-flex flex-column winning-percent">
                <div className="d-flex flex-column justify-content-center p-3">
                    <img src={OctogonImage} alt="winning percent" />
                    <div className="centered"><div>~Win %</div>
                        <div>{(win_rate * 100).toFixed(2)}</div></div>
                </div>
            </div>
        )

    }
}
