import React, { Fragment } from 'react';
import { BLOBINATOR_SCRIPT_ADDRESS, BLOB_SCRIPT_ADDRESS, GAME_SCRIPT_ADDRESS } from "../utils/script_constants";
import { getTransactionByID, getUnspentBoxesForAddressUpdated, searchBoxes, searchUnspentBoxesUpdated } from '../ergo-related/explorer';
import FightItem from '../components/FightItem';
import { waitingAlert } from '../utils/Alerts';
import { GAME_TOKEN_ID } from '../utils/constants';
import { toHexString } from '../ergo-related/serializer';
import BlobinatorFightItem from '../components/BlobinatorFightItem';
let ergolib = import('ergo-lib-wasm-browser');


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
        const blobinatorFightBoxes = (await getUnspentBoxesForAddressUpdated(BLOBINATOR_SCRIPT_ADDRESS))
            .filter(box => box.additionalRegisters.R9.renderedValue !== "0");
        const fightingBlobIDs = blobinatorFightBoxes.map(box => box.additionalRegisters.R9.renderedValue)
            .concat(fightBoxes.map(box => box.additionalRegisters.R5.renderedValue))
            .concat(fightBoxes.map(box => box.additionalRegisters.R8.renderedValue))
            .filter((v, i, a) => a.indexOf(v) === i);
        console.log("fightingBlobIDs", fightingBlobIDs);
        var blobBoxes = (await Promise.all(fightingBlobIDs.map(async (blobId) => {
            const tx = await searchUnspentBoxesUpdated(BLOB_SCRIPT_ADDRESS, [GAME_TOKEN_ID], { "R9": blobId });
            return tx;
        }))).flat();
        var blobFights = [];
        console.log("blobBoxes", blobBoxes);
        //const blobBoxes = await getUnspentBoxesForAddressUpdated(BLOB_SCRIPT_ADDRESS);
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
        for (const box of blobinatorFightBoxes) {
            const blobId = box.additionalRegisters.R9.renderedValue
            for (const blob of blobBoxes) {
                if (blob.additionalRegisters.R9.renderedValue === blobId) {
                    blobFights.push({
                        blob1: blob,
                        blobinator: box,
                        gameBoxId: box.boxId,
                    })
                }
            }
        }
        //console.log("blobFights ", blobFights)
        this.setState({
            currentFights: blobFights,
        })
    }

    async fetchOldFights() {
        const address = localStorage.getItem('address') ?? "";
        if (address !== "") {
            const addressSigmaPropHex = toHexString((await ergolib).Constant.from_ecpoint_bytes(
                (await ergolib).Address.from_base58(localStorage.getItem('address')).to_bytes(0x00).subarray(1, 34)
            ).sigma_serialize_bytes()).slice(4);
            const userFightList1 = await searchBoxes(GAME_SCRIPT_ADDRESS, [GAME_TOKEN_ID], { R4: addressSigmaPropHex });
            const userFightList2 = await searchBoxes(GAME_SCRIPT_ADDRESS, [GAME_TOKEN_ID], { R7: addressSigmaPropHex });
            const userBlobinatorFightList = await searchBoxes(BLOB_SCRIPT_ADDRESS, [GAME_TOKEN_ID], { R6: addressSigmaPropHex, R7: "5" });
            //console.log("userBlobinatorFightList", userBlobinatorFightList);
            var userFightList = userFightList1.concat(userFightList2).concat(userBlobinatorFightList);

            userFightList = userFightList.filter((box, index) => userFightList.findIndex(obj => obj.boxId === box.boxId) === index)
                .sort((a, b) => a.settlementHeight < b.settlementHeight);
            //console.log("userFightList", userFightList);
            
            const userTransactionIDList = userFightList.map(box => box.spentTransactionId).slice(0, 30);
            //console.log("userTransactionIDList", userTransactionIDList);
            var fightTransactions = await Promise.all(userTransactionIDList.map(async (txId) => {
                const tx = await getTransactionByID(txId);
                return tx;
            }));
            fightTransactions = fightTransactions.sort((a, b) => (a.numConfirmations > b.numConfirmations) ? 1 : -1);
            //console.log("fightTransactions", fightTransactions);
            //const fightTransactions = await getTransactionsByAddress(GAME_SCRIPT_ADDRESS);
            var blobFights = [];
            for (const tx of fightTransactions) {
                try {
                    const blob1 = tx.inputs[0];
                    //console.log("blob1", tx)
                    if (tx.inputs.length === 3) {
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
                    } else {
                        var blobinator = tx.inputs[1];
                        if (blob1.additionalRegisters.R7.renderedValue === '5') {
                            if (blob1 && blobinator) {
                                blobFights.push({
                                    blob1: blob1,
                                    blobinator: blobinator,
                                    gameBoxId: blobinator.boxId,
                                    winningTx: { ...tx },
                                })
                            }
                        }
                    }

                } catch (e) {
                    console.log("fetchBlobs", e)
                }

            }
            //console.log("blobFights ", blobFights)
            this.setState({
                previousFights: blobFights,
            })
        }
    }

    render() {
        //console.log("FightsPage", this.state.currentFights, this.state.previousFights)
        return (
            <Fragment >
                <div className="w-100 d-flex flex-column m-2 p-2 align-items-center" >
                    <h4>Current Fights</h4>

                    {this.state.currentFights.length > 0 ?
                        <div className="w-75 d-flex flex-wrap m-2">
                            {
                                this.state.currentFights.map(fight =>
                                    fight.blob2 ?
                                        <FightItem blob1={fight.blob1}
                                            blob2={fight.blob2}
                                            gameBox={fight.gameBox}
                                            updateList={this.fetchCurrentFights}
                                            key={fight.gameBoxId} />
                                        :
                                        <BlobinatorFightItem
                                            blob1={fight.blob1}
                                            blobinator={fight.blobinator}
                                            updateList={this.fetchCurrentFights}
                                            key={fight.gameBoxId}
                                        />
                                )
                            }
                        </div>
                        : <div>No figth found</div>
                    }
                    <br />
                    <h4>My fights history</h4>
                    {
                        this.state.previousFights.length > 0 ?
                            <div className="w-75 d-flex flex-wrap m-2">
                                {
                                    this.state.previousFights.map(fight =>
                                        fight.blob2 ?
                                            <FightItem
                                                blob1={fight.blob1}
                                                blob2={fight.blob2}
                                                gameBox={fight.gameBox}
                                                updateList={this.fetchCurrentFights}
                                                key={fight.gameBoxId}
                                                winningTx={fight.winningTx}
                                            />
                                            : <BlobinatorFightItem
                                                blob1={fight.blob1}
                                                blobinator={fight.blobinator}
                                                updateList={this.fetchCurrentFights}
                                                key={fight.gameBoxId}
                                                winningTx={fight.winningTx}
                                            />
                                    )
                                }
                            </div>
                            : <div>No figth found</div>
                    }
                </div>
            </Fragment>
        )
    }
}
