import React, { Fragment } from 'react';
import { DEFAULT_EXPLORER_ADDRESS } from '../utils/constants';
import OpenIcon from '../images/outline_open_in_new_black_24dp.png';
import { formatLongString } from '../utils/utils';

export class TransactionId extends React.Component {

    render() {
        const txId = this.props.txId;

        return (
            <Fragment>
                {
                    txId !== '' ?
                        <div>
                            {formatLongString(txId, 5)}
                            <img className="transparent-image" src={OpenIcon} alt="open"
                                onClick={() => {
                                    const url = DEFAULT_EXPLORER_ADDRESS + 'en/transactions/' + txId;
                                    window.open(url, '_blank').focus();
                                }} />
                        </div>
                        : null
                }
            </Fragment>
        )

    }
}
