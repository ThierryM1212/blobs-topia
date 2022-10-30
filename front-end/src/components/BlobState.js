import React, { Fragment } from 'react';
import { NANOERG_TO_ERG } from '../utils/constants';


export class BlobState extends React.Component {
    render() {
        const STATE_LABEL_MAP = {
            '0': 'Quiet',
            '1': 'Waiting for fight',
            '2': 'On sale',
            '3': 'Fighting',
            '4': 'Waiting',
            '5': 'Fighting',
        }

        const STATE_VALUE_LABEL_MAP = {
            '0': 'Waiting action',
            '1': 'Bet',
            '2': 'Price',
            '3': 'Bet',
            '4': 'the Blobinator',
            '5': 'the Blobinator',
        }

        const STATE_COLOR_MAP = {
            '0': 'green',
            '1': 'yellow',
            '2': 'blue',
            '3': 'red',
            '4': 'orange',
            '5': 'red',
        }

        const state = this.props.state;
        const stateValue = this.props.stateValue;


        return (
            <Fragment>
                <div className={"m-1 p-1 btn-ultra-" + STATE_COLOR_MAP[state]}>
                    <div>{STATE_LABEL_MAP[state]}</div>
                    <div>
                        {STATE_VALUE_LABEL_MAP[state] + " "}
                        {parseInt(stateValue) > 0 ?
                            (parseInt(stateValue) / NANOERG_TO_ERG).toFixed(4) + " ERG"
                            : null
                        }
                    </div>


                </div>
            </Fragment>
        )

    }
}