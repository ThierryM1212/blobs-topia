import React, { Fragment } from 'react';
import BlobinatorImage from '../images/blobinator_avec_fond.png';
import { formatERGAmount } from '../utils/utils';

export class BlobinatorItem extends React.Component {
    render() {
        const blobinatorBox = this.props.blobinatorBox;
        const size = this.props.size ?? 200;

        return (
            <Fragment>
                <div className='zonecard h-100'>
                    <div className="d-flex flex-column align-items-center zoneblobinator m-1 p-1">
                        <h6><strong>Blobinator</strong></h6>
                        <img className="rounded-image" src={BlobinatorImage} alt="Blobinator" width={size} />
                        <br/>
                        <div className="w-100 d-flex flex-row justify-content-between">
                            <div><strong>{formatERGAmount(blobinatorBox.value)} ERG</strong></div>
                        </div>
                        <div className="w-100 d-flex flex-row justify-content-between">
                            <div><strong>Victories</strong></div>
                            <div><strong>{blobinatorBox.additionalRegisters.R8.renderedValue}</strong></div>
                        </div>
                    </div>
                </div>
            </Fragment >
        )
    }
}