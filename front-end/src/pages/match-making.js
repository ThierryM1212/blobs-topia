import React, { Fragment } from 'react';
import { BLOB_SCRIPT_ADDRESS } from "../utils/script_constants";
import BlobFightPicker from '../components/BlobFightPicker';
import { getSpentAndUnspentBoxesFromMempool, searchBlobUnspentBoxes } from '../ergo-related/explorer';
import { waitingAlert } from '../utils/Alerts';



export default class MatchMakingPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            blobReadyToFightMap: {},
        };
    }

    async componentDidMount() {
        var alert = waitingAlert("Loading the blob list...");
        await this.fetchBlobs();
        alert.close();
    }

    async fetchBlobs() {
        const blobBoxesTmp = await searchBlobUnspentBoxes('R7', '1');;
        var [spentBoxes, newBoxes] = await getSpentAndUnspentBoxesFromMempool(BLOB_SCRIPT_ADDRESS);
        var spentBoxIds = spentBoxes.map(box => box.boxId);
        var blobBoxes = blobBoxesTmp.concat(newBoxes).filter(box => !spentBoxIds.includes(box.boxId));
        var blobAmountDict = {};
        for (const box of blobBoxes) {
            try {
                const blobState = box.additionalRegisters.R7.renderedValue;
                const fightAmount = box.additionalRegisters.R8.renderedValue;
                if (blobState === '1') {
                    //console.log("fetchBlobs found waiting for fight ", box, fightAmount)
                    if (blobAmountDict[fightAmount]) {
                        blobAmountDict[fightAmount] = [...blobAmountDict[fightAmount], box];
                    } else {
                        blobAmountDict[fightAmount] = [box];
                    }
                }
            } catch (e) {
                console.log("fetchBlobs", e)
            }

        }
        //console.log("blobAmountDict ", blobAmountDict)
        this.setState({
            blobReadyToFightMap: blobAmountDict,
        })
    }

    render() {
        //console.log("match making render", this.state.blobReadyToFightMap, Object.keys(this.state.blobReadyToFightMap).length)
        return (
            <Fragment >
                <div className="w-75 d-flex flex-column m-2" >

                    {
                        Object.keys(this.state.blobReadyToFightMap).length > 0 ?
                            <div>
                                <h4>Pick two fighters for the same amount and trigger the fight.</h4>
                                <h6>(No signing required)</h6>
                            {
                            Object.keys(this.state.blobReadyToFightMap).map(key =>
                                <BlobFightPicker fightAmount={key} blobList={this.state.blobReadyToFightMap[key]} key={key} />
                                )
                                }
                            </div>
                            :
                            <h4>No blob waiting for fight</h4>
                    }
                </div>
            </Fragment>
        )
    }
}
