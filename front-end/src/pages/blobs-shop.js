import React, { Fragment } from 'react';
import { BLOB_SCRIPT_ADDRESS } from "../utils/script_constants";
import { getSpentAndUnspentBoxesFromMempool, searchBlobUnspentBoxes } from '../ergo-related/explorer';
import BlobItem from '../components/BlobItem';
import { waitingAlert } from '../utils/Alerts';


export default class BlobsShopPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            blobList: [],
        };
        this.handleChangeBlobList = this.handleChangeBlobList.bind(this);
        this.fetchBlobs = this.fetchBlobs.bind(this);
    }

    handleChangeBlobList(event) {
        this.setState({ blobList: event.target.id });
    }

    async componentDidMount() {
        var alert = waitingAlert("Loading the blob list...");
        await this.fetchBlobs();
        alert.close();
    }

    async fetchBlobs() {
        const blobBoxesTmp = await searchBlobUnspentBoxes('R7', '2');
        const [spentBoxes, newBoxes] = await getSpentAndUnspentBoxesFromMempool(BLOB_SCRIPT_ADDRESS);
        const spentBoxIds = spentBoxes.map(box => box.boxId);
        var blobBoxes = blobBoxesTmp.filter(box => !spentBoxIds.includes(box.boxId));
        var blobList = [];
        for (const box of blobBoxes) {
            try {
                const blobState = box.additionalRegisters.R7.renderedValue;
                if (blobState === '2') { // mempool boxes not filtered
                    blobList.push(box);
                }
            } catch (e) {
                console.log("fetchBlobs", e)
            }

        }
        this.setState({
            blobList: blobList
        })
    }

    render() {
        return (
            <Fragment >
                <div className="w-100 d-flex flex-column align-items-center m-2 p-2">
                    {
                        this.state.blobList.length > 0 ?
                            <h4>Blobs for sale</h4>
                            :
                            <h4>No blob for sale</h4>
                    }
                    <div className="w-75 d-flex flex-wrap">
                        {this.state.blobList.map(item => (
                            <BlobItem
                                key={item.boxId}
                                blobBoxJSON={item}
                                updateList={this.fetchBlobs}
                                showOwner={true}
                            />
                        ))}
                    </div>
                    <br />
                </div>
            </Fragment>
        )
    }
}