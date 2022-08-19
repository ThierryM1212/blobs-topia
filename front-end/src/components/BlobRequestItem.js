import React from 'react';
import { refundRequest } from '../ergo-related/blob.js';
import { processBlobRequest } from '../ergo-related/bot_wasm.js';
import { boxByTokenId, getUnspentBoxesForAddressUpdated } from '../ergo-related/explorer.js';
import { decodeString } from "../ergo-related/serializer.js";
import { displayTransaction, errorAlert, waitingAlert } from '../utils/Alerts.js';
import { CONFIG_TOKEN_ID, RESERVE_SCRIPT_ADDRESS } from "../utils/constants.js";
import { formatERGAmount } from '../utils/utils.js';
import ErgBlob from "./ErgBlob.js";

export default class BlobRequestItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            full: props.full,
            path: '',
            color1: '',
            color2: '',
            eyes_pos: 0,
            mouth_type: 0,
            name: '',
            updateList: props.updateList,
            showRefund: props.showRefund ?? true,
        };
        this.updateBlobRequest = this.updateBlobRequest.bind(this);
        this.refund = this.refund.bind(this);
    }

    async componentDidUpdate(prevProps, prevState) {
        if (prevProps.full.boxId !== this.props.full.boxId) { await this.updateBlobRequest(this.props.full); }
    }

    async updateBlobRequest(box) {
        const desc = await decodeString(box.additionalRegisters.R4.serializedValue);
        const descArray = desc.toString().split(":");
        this.setState({
            boxId: box.boxId,
            path: descArray[5],
            color1: '#' + descArray[1],
            color2: '#' + descArray[2],
            eyes_pos: descArray[3],
            mouth_type: descArray[4],
            name: descArray[0],
        })
    }

    async componentDidMount() {
        await this.updateBlobRequest(this.state.full);
    }

    async refund() {
        console.log("refundBlobRequest", this.state.full.boxId);
        await refundRequest(this.state.full);
        await this.state.updateList();
    }

    async process() {
        console.log("processBlobRequest", this.state.full.boxId);
        waitingAlert("Preparing the transaction to process the blob request");
        const currentConfigBoxes = await boxByTokenId(CONFIG_TOKEN_ID);
        const reserveList = await getUnspentBoxesForAddressUpdated(RESERVE_SCRIPT_ADDRESS);
        if (reserveList.length > 0 && currentConfigBoxes.length > 0) {
            const txId = await processBlobRequest(this.state.full, reserveList[0], currentConfigBoxes[0]);
            await this.state.updateList();
            displayTransaction(txId);
        } else {
            errorAlert("No reserve found");
        }
    }

    render() {
        return (
            <div className="zonecard d-flex flex-column m-1 p-1 align-items-center" >
                <div className="d-flex flex-column zoneblob " >
                    <ErgBlob key={"ergblob" + this.state.boxId}
                        color1={this.state.color1}
                        color2={this.state.color2}
                        path={this.state.path}
                        eyes_pos={this.state.eyes_pos}
                        mouth_type={this.state.mouth_type}
                        name={this.state.name}
                    />
                    Blob mint price: {formatERGAmount(this.state.full.value)} ERG
                </div>
                <div className="d-flex flex-row justify-content-between" >
                    <button className="btn btn-ultra-yellow m-1" onClick={() => this.process()}>Process</button>
                    {
                        this.state.showRefund ?
                            <button className="btn btn-ultra-voilet m-1" onClick={() => this.refund()}>Refund</button>
                            : null
                    }
                </div>
            </div>
        )
    }
}
