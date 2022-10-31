import React from 'react';
import { getBoxesByAddress, getUnspentBoxesByAddress } from '../ergo-related/explorer';
import { getUtxosListValue } from '../ergo-related/wasm';
import { BLOBINATOR_SCRIPT_ADDRESS, BLOB_SCRIPT_ADDRESS, GAME_SCRIPT_ADDRESS } from "../utils/script_constants";
import { formatERGAmount } from '../utils/utils';

/* global BigInt */

export default class AppStatistics extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ergAmount: 0,
            numberOfBlobs: 0,
            numberOfBlobinators: 0,
            blobinatorAmount: 0,
            numberofFights: 0,
            fightAmount: 0,
        };
    }


    async componentDidMount() {
        const blobList = await getUnspentBoxesByAddress(BLOB_SCRIPT_ADDRESS);
        const fightList = await getBoxesByAddress(GAME_SCRIPT_ADDRESS);
        const blobinatorList = await getBoxesByAddress(BLOBINATOR_SCRIPT_ADDRESS);
        this.setState({
            ergAmount: getUtxosListValue(blobList),
            numberOfBlobs: blobList.length,
            numberofFights: fightList.length,
            fightAmount: getUtxosListValue(fightList),
            numberOfBlobinators: blobinatorList.length,
            blobinatorAmount: getUtxosListValue(blobinatorList),
        });
    }

    render() {
        return (
            <div className="d-flex flex-column zonecard m-1 p-1">
                <h4>Game statistics</h4>
                <div className="w-100 d-flex flex-row justify-content-between m-1 p-1">
                    <h5>Number of living blobs: </h5> <strong>{this.state.numberOfBlobs}</strong>
                </div>
                <div className="w-100 d-flex flex-row justify-content-between m-1 p-1">
                    <h5>Amount of ERG in the blobs: </h5> <strong>{formatERGAmount(this.state.ergAmount)} ERG</strong>
                </div>
                <div className="w-100 d-flex flex-row justify-content-between m-1 p-1">
                    <h5>Number of fights processed: </h5> <strong>{this.state.numberofFights}</strong>
                </div>
                <div className="w-100 d-flex flex-row justify-content-between m-1 p-1">
                    <h5>Erg amount played: </h5> <strong>{formatERGAmount(this.state.fightAmount)} ERG</strong>
                </div>
                <div className="w-100 d-flex flex-row justify-content-between m-1 p-1">
                    <h5>Number of Blobinators fight: </h5> <strong>{Math.round(this.state.numberOfBlobinators / 2)}</strong>
                </div>
                <div className="w-100 d-flex flex-row justify-content-between m-1 p-1">
                    <h5>Blobinators amount played: </h5> <strong>{formatERGAmount(BigInt(this.state.blobinatorAmount) / BigInt(2)).toString()} ERG</strong>
                </div>
            </div>
        )
    }
}
