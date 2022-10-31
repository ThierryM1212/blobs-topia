import React, { Fragment } from 'react';
import { BLOB_SCRIPT_ADDRESS, GAME_SCRIPT_ADDRESS } from "../utils/script_constants";
import { getTransactionsByAddress, getUnspentBoxesForAddressUpdated, getUnspentBoxesForAddressUpdated2 } from '../ergo-related/explorer';
import FightItem from '../components/FightItem';
import { waitingAlert } from '../utils/Alerts';



export default class FightsPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentFights: [],
            previousFights: [],
            gameBoxId: '',
        };
        this.fetchCurrentFights = this.fetchCurrentFights.bind(this);
        this.fetchOldFights = this.fetchOldFights.bind(this);
    }

    async componentDidMount() {
        var alert = waitingAlert("Loading the current fights...");
        await this.fetchCurrentFights();
        alert.close();
        this.fetchOldFights();
    }

    async fetchCurrentFights() {
        const fightBoxes = await getUnspentBoxesForAddressUpdated(GAME_SCRIPT_ADDRESS);
        var blobFights = [];
        const blobBoxes = await getUnspentBoxesForAddressUpdated(BLOB_SCRIPT_ADDRESS);
        for (const box of fightBoxes) {
            try {
                const blob1Id = box.additionalRegisters.R5.renderedValue;
                const blob2Id = box.additionalRegisters.R8.renderedValue;
                var blob1 = undefined, blob2 = undefined;
                for (const blob of blobBoxes) {
                    if (blob.additionalRegisters.R9.renderedValue === blob1Id) {
                        blob1 = blob;
                    }
                    if (blob.additionalRegisters.R9.renderedValue === blob2Id) {
                        blob2 = blob;
                    }
                }
                console.log("gamebox", box)
                if (blob1 && blob2 && box) {
                    blobFights.push({
                        blob1: blob1,
                        blob2: blob2,
                        gameBox: box,
                        gameBoxId: box.boxId,
                    })
                }
            } catch (e) {
                console.log("fetchBlobs", e)
            }

        }
        //console.log("blobFights ", blobFights)
        this.setState({
            currentFights: blobFights,
        })
    }

    async fetchOldFights() {
        const fightTransactions = await getTransactionsByAddress(GAME_SCRIPT_ADDRESS);
        var blobFights = [];
        for (const tx of fightTransactions) {
            try {
                var blob1 = tx.inputs[0];
                var blob2 = tx.inputs[1];
                var gameBox = tx.inputs[2];
                if (blob1.additionalRegisters.R7.renderedValue === '3') {
                    //console.log("gamebox", gameBox)
                    if (blob1 && blob2 && gameBox) {
                        blobFights.push({
                            blob1: blob1,
                            blob2: blob2,
                            gameBox: gameBox,
                            gameBoxId: gameBox.boxId,
                            winningTx: { ...tx },
                        })
                    }
                }
            } catch (e) {
                console.log("fetchBlobs", e)
            }

        }
        console.log("blobFights ", blobFights)
        this.setState({
            previousFights: blobFights,
        })
    }



    render() {
        //console.log("FightsPage", this.state.previousFights)
        return (
            <Fragment >
                <div className="w-100 d-flex flex-column m-2 p-2 align-items-center" >
                    <h4>Current Fights</h4>

                    {this.state.currentFights.length > 0 ?
                        <div className="w-75 d-flex flex-wrap m-2">
                            {
                                this.state.currentFights.map(fight =>
                                    <FightItem blob1={fight.blob1}
                                        blob2={fight.blob2}
                                        gameBox={fight.gameBox}
                                        updateList={this.fetchCurrentFights}
                                        key={fight.gameBoxId} />
                                )
                            }
                        </div>
                        : <div>No figth found currently</div>
                    }
                    <br/>
                    <h4>Fights history</h4>
                    <div className="w-75 d-flex flex-wrap m-2">
                        {
                            this.state.previousFights.map(fight =>
                                <FightItem
                                    blob1={fight.blob1}
                                    blob2={fight.blob2}
                                    gameBox={fight.gameBox}
                                    updateList={this.fetchCurrentFights}
                                    key={fight.gameBoxId}
                                    winningTx={fight.winningTx}
                                />
                            )
                        }
                    </div>

                </div>
            </Fragment>
        )
    }
}
