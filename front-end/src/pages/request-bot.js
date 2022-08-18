import React, { Fragment } from 'react';
import { BLOB_REQUEST_SCRIPT_ADDRESS } from '../utils/constants';
import { getUnspentBoxesForAddressUpdated } from '../ergo-related/explorer';
import BlobRequestItem from '../components/BlobRequestItem';

export default class RequestBotPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            blobRequestList: [],
        };
        this.fetchBlobRequests = this.fetchBlobRequests.bind(this);
    }

    async componentDidMount() {
        await this.fetchBlobRequests();
    }

    async fetchBlobRequests() {

        const blobRequestBoxes = await getUnspentBoxesForAddressUpdated(BLOB_REQUEST_SCRIPT_ADDRESS);
        this.setState({
            blobRequestList: blobRequestBoxes,
        })
    }


    render() {
        //console.log("render blob list", this.state.blobList);
        return (
            <Fragment >
                <br />
                {
                    this.state.blobRequestList.length > 0 ?
                        <Fragment >
                            <h4>
                                Blob requests pending
                            </h4>
                            <h6>
                                You can use this screen to process blob requests sent by other players (no signing required)... you're the mint bot.
                            </h6>
                            <div className="w-75 d-flex flex-wrap">
                                {this.state.blobRequestList.map(item =>
                                    <BlobRequestItem
                                        key={item.boxId}
                                        full={item}
                                        updateList={this.fetchBlobRequests}
                                        showRefund={false}
                                    />
                                )}
                            </div>
                        </Fragment>
                        :
                        <h4>
                            No blob requests pending
                        </h4>
                }
            </Fragment>
        )
    }
}