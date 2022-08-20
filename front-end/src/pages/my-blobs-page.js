import React, { Fragment } from 'react';
import { BLOB_REQUEST_SCRIPT_ADDRESS, BLOB_SCRIPT_ADDRESS } from '../utils/constants';
import { getSpentAndUnspentBoxesFromMempool, getUnspentBoxesForAddressUpdated, searchBlobUnspentBoxes } from '../ergo-related/explorer';
import BlobItem from '../components/BlobItem';
import { toHexString } from '../ergo-related/serializer';
import BlobRequestItem from '../components/BlobRequestItem';
import { errorAlert, waitingAlert } from '../utils/Alerts';
import { filterBlobList } from '../utils/utils';
let ergolib = import('ergo-lib-wasm-browser');


export default class MyBlobsPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            blobList: [],
            blobRequestList: [],
        };
        this.handleChangeBlobList = this.handleChangeBlobList.bind(this);
        this.fetchBlobs = this.fetchBlobs.bind(this);
        this.fetchBlobRequests = this.fetchBlobRequests.bind(this);
    }

    handleChangeBlobList(event) {
        this.setState({ blobList: event.target.id });
    }

    async componentDidMount() {
        const address = localStorage.getItem('address') ?? '';
        if (address === '') {
            errorAlert('Setup an ERG address to interact with the dApp')
        } else {
            var alert = waitingAlert("Loading the blob list...");
            await this.fetchBlobs();
            alert.close();
            this.fetchBlobRequests();
        }
    }

    async fetchBlobRequests() {
        const addressSigmaPropHex = toHexString((await ergolib).Constant.from_ecpoint_bytes(
            (await ergolib).Address.from_base58(localStorage.getItem('address')).to_bytes(0x00).subarray(1, 34)
        ).sigma_serialize_bytes());
        const blobRequestBoxesTmp = await getUnspentBoxesForAddressUpdated(BLOB_REQUEST_SCRIPT_ADDRESS);
        const [spentBoxes, newBoxes] = await getSpentAndUnspentBoxesFromMempool(BLOB_SCRIPT_ADDRESS);
        const spentBoxIds = spentBoxes.map(box => box.boxId);
        var blobRequestBoxes = blobRequestBoxesTmp.filter(box => !spentBoxIds.includes(box.boxId));
        console.log("blobRequestBoxes", blobRequestBoxes, newBoxes)
        var blobRequestList = [];
        for (const box of blobRequestBoxes) {
            try {
                if (box.additionalRegisters.R5) {
                    const blobRequestSigmaProp = Buffer.from(box.additionalRegisters.R5.serializedValue, 'hex')
                    if (toHexString(blobRequestSigmaProp) === addressSigmaPropHex) {
                        blobRequestList.push(box);
                    }
                }
            } catch (e) {
                console.log("fetchBlobs", e)
            }
        }
        this.setState({
            blobRequestList: blobRequestList
        })
    }

    async fetchBlobs() {
        const addressSigmaPropHex = toHexString((await ergolib).Constant.from_ecpoint_bytes(
            (await ergolib).Address.from_base58(localStorage.getItem('address')).to_bytes(0x00).subarray(1, 34)
        ).sigma_serialize_bytes());
        const blobBoxesTmp = await searchBlobUnspentBoxes('R6', addressSigmaPropHex.slice(4));
        //console.log("fetchBlobs blobBoxesTmp", blobBoxesTmp)
        var [spentBoxes1, newBoxes1] = await getSpentAndUnspentBoxesFromMempool(localStorage.getItem('address'));
        var spentBoxIds = spentBoxes1.map(box => box.boxId);
        var blobBoxes = blobBoxesTmp.filter(box => !spentBoxIds.includes(box.boxId));
        var [spentBoxes2, newBoxes2] = await getSpentAndUnspentBoxesFromMempool(BLOB_SCRIPT_ADDRESS);
        spentBoxIds = spentBoxes2.map(box => box.boxId).concat(spentBoxIds);
        blobBoxes = blobBoxesTmp.concat(newBoxes2).filter(box => !spentBoxIds.includes(box.boxId));
        //console.log("blobBoxes", blobBoxes)
        
        var blobList = filterBlobList(blobBoxes);

        this.setState({
            blobList: blobList
        })
    }

    render() {
        //console.log("render blob list", this.state.blobList);
        return (
            <Fragment >
                <br />
                <h5>
                    Blob fighters
                </h5>
                <div className="w-75 d-flex flex-wrap">
                    {this.state.blobList.map(item => (
                        <BlobItem
                            key={item.boxId}
                            blobBoxJSON={item}
                            updateList={this.fetchBlobs}
                        />
                    ))}
                </div>
                <br />
                {
                    this.state.blobRequestList.length > 0 ?
                        <Fragment >
                            <h5>
                                Blob requests pending
                            </h5>
                            <div className="w-75 d-flex flex-wrap">
                                {this.state.blobRequestList.map(item =>
                                    <BlobRequestItem
                                        key={item.boxId}
                                        full={item}
                                        updateList={this.fetchBlobRequests}
                                    />
                                )}
                            </div>
                        </Fragment>
                        : null
                }
            </Fragment>
        )
    }
}