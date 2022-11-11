import React from 'react';
import { getBoxesByAddress, getUnspentBoxesByAddress } from '../ergo-related/explorer';
import { getUtxosListValue } from '../ergo-related/wasm';
import { BLOBINATOR_SCRIPT_ADDRESS, BLOB_SCRIPT_ADDRESS, GAME_SCRIPT_ADDRESS } from "../utils/script_constants";
import { formatERGAmount } from '../utils/utils';


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
        const blobinatorList = await getUnspentBoxesByAddress(BLOBINATOR_SCRIPT_ADDRESS);
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
                <h5>Game statistics</h5>
                <div className="w-100 d-flex flex-row justify-content-between m-1 p-1">
                    <h6>Number of living blobs: </h6> <strong>{this.state.numberOfBlobs}</strong>
                </div>
                <div className="w-100 d-flex flex-row justify-content-between m-1 p-1">
                    <h6>Amount of ERG in the blobs: </h6> <strong>{formatERGAmount(this.state.ergAmount)} ERG</strong>
                </div>
                <div className="w-100 d-flex flex-row justify-content-between m-1 p-1">
                    <h6>Number of fights processed: </h6> <strong>{this.state.numberofFights}</strong>
                </div>
                <div className="w-100 d-flex flex-row justify-content-between m-1 p-1">
                    <h6>Erg amount played: </h6> <strong>{formatERGAmount(this.state.fightAmount)} ERG</strong>
                </div>
                <div className="w-100 d-flex flex-row justify-content-between m-1 p-1">
                    <h6>Number of living Blobinators: </h6> <strong>{this.state.numberOfBlobinators}</strong>
                </div>
                <div className="w-100 d-flex flex-row justify-content-between m-1 p-1">
                    <h6>Blobinators total value: </h6> <strong>{formatERGAmount(this.state.blobinatorAmount)} ERG</strong>
                </div>
            </div>
        )
    }
}
