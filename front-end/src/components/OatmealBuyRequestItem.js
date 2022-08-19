import React from 'react';
import { refundRequest } from '../ergo-related/blob.js';
import { processOatmealRequest } from '../ergo-related/bot_wasm.js';
import { boxByTokenId, getUnspentBoxesForAddressUpdated } from '../ergo-related/explorer.js';
import { ergoTreeToAddress } from "../ergo-related/serializer.js";
import { displayTransaction, errorAlert, waitingAlert } from '../utils/Alerts.js';
import { CONFIG_TOKEN_ID, MIN_NANOERG_BOX_VALUE, OATMEAL_PRICE, OATMEAL_SELL_RESERVE_SCRIPT_ADDRESS, TX_FEE } from "../utils/constants.js";
import { formatERGAmount, formatLongString } from '../utils/utils.js';

export default class OatmealBuyRequestItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            full: props.full,
            updateList: props.updateList,
            showRefund: props.showRefund ?? true,
            amountNano: 0,
            ownerAddress: '',
        };
        this.updateOatmealRequest = this.updateOatmealRequest.bind(this);
        this.refund = this.refund.bind(this);
    }

    async componentDidUpdate(prevProps, prevState) {
        if (prevProps.full.boxId !== this.props.full.boxId) { await this.updateOatmealRequest(this.props.full); }
    }

    async updateOatmealRequest(box) {
        const amountNano = box.value;
        const ownerAddress = await ergoTreeToAddress("00" + box.additionalRegisters.R4.serializedValue);
        this.setState({
            full: box,
            amountNano: amountNano,
            ownerAddress: ownerAddress,
            showRefund: ownerAddress === (localStorage.getItem('address') ?? '')
        })
    }

    async componentDidMount() {
        await this.updateOatmealRequest(this.state.full);
    }

    async refund() {
        console.log("refundOatmealRequest", this.state.full.boxId);
        await refundRequest(this.state.full);
        await this.state.updateList();
    }

    async process() {
        console.log("processBlobRequest", this.state.full.boxId);
        waitingAlert("Preparing the transaction to process the oatmeal buy request for "+formatLongString(this.state.ownerAddress, 5) );
        const currentConfigBoxes = await boxByTokenId(CONFIG_TOKEN_ID);
        const reserveList = await getUnspentBoxesForAddressUpdated(OATMEAL_SELL_RESERVE_SCRIPT_ADDRESS);
        if (reserveList.length > 0 && currentConfigBoxes.length > 0) {
            const txId = await processOatmealRequest(this.state.full, reserveList[0], currentConfigBoxes[0]);
            await this.state.updateList();
            displayTransaction(txId);
        } else {
            errorAlert("No reserve found");
        }
    }

    render() {
        return (
            <div className="zonecard d-flex flex-column m-1 p-1 align-items-center" >
                <div className="d-flex flex-column " >
                    <h5>Oatmeal request value: {formatERGAmount(this.state.amountNano)} ERG</h5>
                    <h5>Oatmeal to deliver: {Math.floor(parseInt(this.state.amountNano - TX_FEE - MIN_NANOERG_BOX_VALUE) / OATMEAL_PRICE)}</h5>
                    <h5>Oatmeal request owner: {formatLongString(this.state.ownerAddress, 6)}</h5>
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
