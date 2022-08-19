import React, { Fragment } from 'react';
import { engageFight } from '../ergo-related/bot_wasm';
import { boxByTokenId, getUnspentBoxesByAddress } from '../ergo-related/explorer';
import { displayTransaction, waitingAlert, errorAlert } from '../utils/Alerts';
import { CONFIG_TOKEN_ID, OATMEAL_RESERVE_SCRIPT_ADDRESS } from '../utils/constants';
import { formatERGAmount } from '../utils/utils';
import BlobItem from './BlobItem';
import { Checkbox } from './Checkbox';
import JSONBigInt from 'json-bigint';

export default class BlobFightPicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fightAmount: props.fightAmount ?? 0,
            blobList: props.blobList ?? [],
            selectedBlob: new Array(props.blobList.length).fill('') ?? [],
        };
    }

    async componentDidUpdate(prevProps, prevState) {
        if (JSONBigInt.stringify(prevProps.blobList)  !== JSONBigInt.stringify(this.props.blobList)) {
            var newSelectedBlobs = new Array(this.props.blobList.length).fill('');
            for (var i = 0; i < this.props.blobList.length; i++) {
                if (Array.isArray(prevProps.selectedBlob) ) {
                    if (prevProps.selectedBlob.includes(this.props.blobList[i].boxId)) {
                        newSelectedBlobs[i] = this.props.blobList[i].boxId;
                    }
                }
            }
            this.setState({
                blobList: this.props.blobList,
                selectedBlob: newSelectedBlobs,
            });
        }
    }

    selectUnselectBlob(boxId) {
        console.log("selectUnselectBlob", boxId)
        const blobIndex = this.state.blobList.findIndex(box => box.boxId === boxId);
        var newSelectBlob = this.state.selectedBlob;
        if (this.state.selectedBlob[blobIndex] === '') {
            newSelectBlob[blobIndex] = boxId;
            this.setState({
                selectedBlob: newSelectBlob,
            })
        } else {
            newSelectBlob[blobIndex] = '';
            this.setState({
                selectedBlob: newSelectBlob,
            })
        }
    }

    async engageFight() {
        waitingAlert("Preparing the fight...")
        const currentConfigBox = await boxByTokenId(CONFIG_TOKEN_ID);
        var reserveOatmealBoxes = await getUnspentBoxesByAddress(OATMEAL_RESERVE_SCRIPT_ADDRESS);
        console.log("processFigth reserveOatmealBoxes",reserveOatmealBoxes)
        if (reserveOatmealBoxes.length === 0) {
            errorAlert("No oatmeal reserve found")
            console.log("processFigth: No Reserve box found")
            return;
        }
        const currentReserveBox = reserveOatmealBoxes[0];
        const blobIndexes = [];
        for (let index = 0; index < this.state.selectedBlob.length; index++) {
            if (this.state.selectedBlob[index] !== '') {
                blobIndexes.push(index);
            }
        }
        console.log("blobIndexes", blobIndexes)
        if (blobIndexes.length === 2) {
            const signedTx = await engageFight(this.state.blobList[blobIndexes[0]], this.state.blobList[blobIndexes[1]], currentReserveBox, currentConfigBox[0]);
            displayTransaction(signedTx.id)
        } else {
            errorAlert("Something went wrong")
        }
    }

    render() {
        const numberOfSelectedBlobs = this.state.selectedBlob.filter(Boolean).length;
        return (
            <Fragment >
                <div className="w-100 d-flex flex-column align-items-start color-nav m-2 p-2" >
                    <div className="w-100 d-flex flex-row justify-content-between">
                        <h5>Fights for {formatERGAmount(this.state.fightAmount)} ERG bet</h5>
                        {
                            numberOfSelectedBlobs === 2 ?
                                <button className="btn btn-ultra-yellow" onClick={() => this.engageFight()}>Engage fight</button>
                                : null

                        }
                        <span>{numberOfSelectedBlobs} blob selected</span>
                    </div>
                    <div className="d-flex flex-wrap" >
                        {
                            this.state.blobList.map((blob, index) =>
                                <div className="d-flex flex-column align-items-center" key={blob.boxId}>
                                    <BlobItem blobBoxJSON={blob} disableActions={true} showOwner={true} />
                                    <div onClick={() => this.selectUnselectBlob(blob.boxId)}>
                                        <Checkbox checked={this.state.selectedBlob[index] === blob.boxId} /></div>
                                </div>
                            )
                        }
                    </div>
                </div>
            </Fragment>
        )
    }
}