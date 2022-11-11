import React, { Fragment } from 'react';
import { DEFAULT_EXPLORER_API_ADDRESS } from '../utils/constants';
import BlobinatorImage from '../images/blobinator_avec_fond.png';
import OpenNewImage from '../images/outline_open_in_new_black_24dp.png';
import { formatERGAmount, formatLongString } from '../utils/utils';

export class BlobinatorItem extends React.Component {
    render() {
        const blobinatorBox = this.props.blobinatorBox;

        return (
            <Fragment>
                <div className="d-flex flex-column align-items-center zoneblobinator m-2 p-2">
                    <h6><strong>Blobinator</strong></h6>
                    <img className="rounded-image" src={BlobinatorImage} alt="Blobinator" width={200} />

                    <div className="w-100 d-flex flex-row justify-content-between">
                        <div><strong>Value</strong></div>
                        <div><strong>{formatERGAmount(blobinatorBox.value)} ERG</strong></div>
                    </div>
                    <div className="w-100 d-flex flex-row justify-content-between">
                        <div><strong>Victories</strong></div>
                        <div><strong>{blobinatorBox.additionalRegisters.R8.renderedValue}</strong></div>
                    </div>
                    <div className="w-100 d-flex flex-row justify-content-between">
                        <div><strong>Box ID</strong></div>
                        <div><strong>{formatLongString(blobinatorBox.boxId, 4) } </strong>
                        <img className="transparent-image" src={OpenNewImage} alt="view box" 
                            onClick={() => {
                                const url = DEFAULT_EXPLORER_API_ADDRESS + '/api/v1/boxes/' + blobinatorBox.boxId;
                                window.open(url, '_blank').focus();
                            }}
                        />
                        </div>
                    </div>

                </div>
            </Fragment>
        )

    }
}