import React, { Fragment } from 'react';
import { BLOBINATOR_FEE_SCRIPT_ADDRESS, BLOBINATOR_SCRIPT_ADDRESS } from "../utils/script_constants";
import { getUnspentBoxesForAddressUpdated } from '../ergo-related/explorer';
import { waitingAlert } from '../utils/Alerts';
import { BlobinatorItem } from '../components/BlobinatorItem';
import { formatERGAmount } from '../utils/utils';
import { getUtxosListValue } from '../ergo-related/wasm';
import { BLOBINATOR_MIN_VALUE } from '../utils/constants';
import { ProgressBar } from 'react-bootstrap';
import { donateBlobinatorFee } from '../ergo-related/admin_game';


export default class BlobinatorPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            blobinatorList: [],
            blobinatorFeeList: [],
        };
        this.fetchBlobinators = this.fetchBlobinators.bind(this);
    }

    async componentDidMount() {
        var alert = waitingAlert("Loading the blobinator list...");
        await this.fetchBlobinators();
        alert.close();
    }

    async fetchBlobinators() {
        const blobinatorList = await getUnspentBoxesForAddressUpdated(BLOBINATOR_SCRIPT_ADDRESS);
        const blobinatorFeeList = await getUnspentBoxesForAddressUpdated(BLOBINATOR_FEE_SCRIPT_ADDRESS);
        this.setState({
            blobinatorList: blobinatorList,
            blobinatorFeeList: blobinatorFeeList,
        })
    }

    async donateToBlobinator() {
        await donateBlobinatorFee();
    }

    render() {
        const totalBlobinatorFeeValue = parseInt(getUtxosListValue(this.state.blobinatorFeeList));
        return (
            <Fragment >
                <div className="w-100 d-flex flex-column align-items-center m-2 p-2">
                    {
                        this.state.blobinatorList.length > 0 ?
                            <div className="w-75">
                                <h4>Blobinators available</h4>
                                <div className="w-100 d-flex flex-wrap">
                                    {this.state.blobinatorList.map(box => (
                                        <BlobinatorItem key={box.boxId} blobinatorBox={box} />
                                    ))}
                                </div>
                            </div>
                            :
                            <h4>No blobinator available.</h4>
                    }
                    <br />
                    {
                        this.state.blobinatorFeeList.length > 0 ?
                            <div className="w-100 d-flex flex-column align-items-center">
                                <h4>Blobinator fee boxes</h4>
                                <div className='d-flex flex-column zonecard m-2 p-2'>
                                    <div className='w-100 d-flex flex-row justify-content-between '>
                                        <div>Amount</div><div>{formatERGAmount(totalBlobinatorFeeValue)} ERG</div>
                                    </div>
                                    <div className='w-100 d-flex flex-row justify-content-between '>
                                        <div>Number of boxes</div><div>{this.state.blobinatorFeeList.length}</div>
                                    </div>
                                    <br />
                                    <div className='w-100 d-flex flex-row justify-content-between '>
                                        <div>Next Blobinator</div><div>{formatERGAmount(totalBlobinatorFeeValue)}/{formatERGAmount(BLOBINATOR_MIN_VALUE)} ERG</div>
                                    </div>
                                    <ProgressBar now={totalBlobinatorFeeValue}
                                        min={0}
                                        max={BLOBINATOR_MIN_VALUE}
                                        variant="info"
                                        label={`${totalBlobinatorFeeValue * 100 / BLOBINATOR_MIN_VALUE}%`}
                                    />
                                    <br />
                                    <div>
                                        <button className='btn btn-ultra-blue' onClick={this.donateToBlobinator} >
                                            Donate for the blobinator
                                        </button>
                                        <div>You can contribute to the Blobinator invocation by fighting other blob.</div>
                                        <div>Or by directly giving ERGs that will be collected to create it.</div>
                                    </div>
                                </div>
                            </div>
                            :
                            <h4>No blobinator fee.</h4>
                    }
                </div>
            </Fragment>
        )
    }
}