import React, { Fragment } from 'react';
import { BLOB_SCRIPT_ADDRESS, GAME_SCRIPT_ADDRESS } from "../utils/script_constants";
import { getTransactionByID, searchBoxes, searchUnspentBoxesUpdated } from '../ergo-related/explorer';
import { waitingAlert } from '../utils/Alerts';
import { GAME_TOKEN_ID } from '../utils/constants';
import BlobItem from '../components/BlobItem';
import { toHexString } from '../ergo-related/serializer';
import BlobinatorFightItem from '../components/BlobinatorFightItem';
import FightItem from '../components/FightItem';
let ergolib = import('ergo-lib-wasm-browser');


export default class OneBlobPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            blobId: props.blobId,
            currentBlobJSON: undefined,
            ownBlob: false,
            previousFights: [],
        };
        this.fetchBlob = this.fetchBlob.bind(this);
        this.fetchOldFights = this.fetchOldFights.bind(this);
    }

    async componentDidMount() {
        var alert = waitingAlert("Loading the current fights...");
        const blob = await this.fetchBlob();
        const address = localStorage.getItem('address') ?? "";
        var addressSigmaPropHex = "";
        if (address !== "") {
            addressSigmaPropHex = toHexString((await ergolib).Constant.from_ecpoint_bytes(
                (await ergolib).Address.from_base58(address).to_bytes(0x00).subarray(1, 34)
            ).sigma_serialize_bytes());
        }
        var ownBlob = false;
        if (blob && blob.additionalRegisters.R6 && address !== "") {
            const blobSigmaProp = Buffer.from(blob.additionalRegisters.R6.serializedValue, 'hex')
            if (toHexString(blobSigmaProp) === addressSigmaPropHex) {
                ownBlob = true;
            }
        }
        if (blob) {
            this.setState({
                currentBlobJSON: blob,
                ownBlob: ownBlob,
            })
        }
        this.fetchOldFights();

        alert.close();
    }

    async fetchBlob() {
        const blobs = (await searchUnspentBoxesUpdated(BLOB_SCRIPT_ADDRESS, [GAME_TOKEN_ID], { R9: this.state.blobId }))
        .sort((a, b) => (a.creationHeight< b.creationHeight) ? 1 : -1)
        //console.log("Oneblob fetchBlob",blobs);
        if (blobs && blobs.length >= 1) {
            return blobs[0];
        }
    }

    async fetchOldFights() {
        const userFightList1 = await searchBoxes(GAME_SCRIPT_ADDRESS, [GAME_TOKEN_ID], { R5: this.state.blobId });
        const userFightList2 = await searchBoxes(GAME_SCRIPT_ADDRESS, [GAME_TOKEN_ID], { R8: this.state.blobId });
        const userBlobinatorFightList = await searchBoxes(BLOB_SCRIPT_ADDRESS, [GAME_TOKEN_ID], { R9: this.state.blobId, R7: "5" });
        //console.log("userBlobinatorFightList", userBlobinatorFightList);
        var userFightList = userFightList1.concat(userFightList2).concat(userBlobinatorFightList);
        //console.log("userFightList", userFightList);
        userFightList = userFightList.filter((box, index) => userFightList.findIndex(obj => obj.boxId === box.boxId) === index)
            .sort((a, b) => (a.settlementHeight < b.settlementHeight) ? 1 : -1);
        //console.log("userFightList2", userFightList);

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

    render() {
        return (
            <Fragment >
                {
                    this.state.currentBlobJSON ?
                        <div className="w-100 h-100 d-flex flex-column m-2 p-2 align-items-center" >
                            {
                                this.state.ownBlob ?
                                    <BlobItem blobBoxJSON={this.state.currentBlobJSON} />
                                    :
                                    <BlobItem blobBoxJSON={this.state.currentBlobJSON} disableActions={true} />
                            }
                            <div className="w-100 d-flex flex-column m-2 p-2 align-items-center" >
                                <h4>Blob fights history</h4>
                                {
                                    this.state.previousFights.length > 0 ?
                                        <div className="w-75 d-flex flex-wrap">

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
                                        : <div>No fight found</div>
                                }
                            </div>

                        </div>
                        : <h4>Blob {this.state.blobId} not found.</h4>
                }
            </Fragment>
        )
    }
}
