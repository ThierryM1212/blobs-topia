import React, { Fragment } from 'react';
import { NANOERG_TO_ERG } from '../utils/constants';

export class BlobState extends React.Component {
    render() {
        const STATE_LABEL_MAP = {
            '0': 'Quiet',
            '1': 'Waiting for fight',
            '2': 'On sale',
            '3': 'Fighting',
        }

        const STATE_VALUE_LABEL_MAP = {
            '0': undefined,
            '1': 'Bet',
            '2': 'Price',
            '3': 'Bet',
        }

        const STATE_COLOR_MAP = {
            '0': 'green',
            '1': 'yellow',
            '2': 'blue',
            '3': 'red',
        }

        const state = this.props.state;
        const stateValue = this.props.stateValue;


        return (
            <Fragment>
                <div className={"m-1 p-1 btn-ultra-" + STATE_COLOR_MAP[state]}>
                    <div>{STATE_LABEL_MAP[state]}</div>
                    {STATE_VALUE_LABEL_MAP[state] ?
                        <div>
                            {STATE_VALUE_LABEL_MAP[state] + " " + (parseInt(stateValue) / NANOERG_TO_ERG).toFixed(4) + " ERG"}
                        </div>
                        : <div>Waiting action</div>
                    }

                </div>
            </Fragment>
        )

    }
}