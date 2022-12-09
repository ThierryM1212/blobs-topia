import React, { Fragment } from 'react';
import { WinPercent } from './WinPercent';
import { blobinatorFightResults } from '../ergo-related/bot_wasm';
import { errorAlert, waitingAlert } from '../utils/Alerts';
import { boxByTokenId } from '../ergo-related/explorer';
import { CONFIG_TOKEN_ID } from '../utils/constants';
import { TransactionId } from './TransactionId';
import GaugeChart from 'react-gauge-chart'
import { BlobinatorItem } from './BlobinatorItem';
import BlobItemLight from './BlobItemLight';


export default class BlobinatorFightItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            blob1: props.blob1,
            blobinator: props.blobinator,
            updateList: props.updateList,
            p1WinTxId: '',
            p2WinTxId: '',
            p1Winindex: -1,
            p2Winindex: -1,
            winningTx: props.winningTx ?? undefined,
        };
    }

    componentDidMount() {
        if (this.state.winningTx) {
            if (this.state.winningTx.inputs[1].address === this.state.winningTx.outputs[1].address) {
                this.setState({
                    p2WinTxId: this.state.winningTx.id,
                })
            } else {
                this.setState({
                    p1WinTxId: this.state.winningTx.id,
                })
            }
        }
    }

    async processFight() {
        var alert = waitingAlert("Preparing the fight results...")
        try {
            const currentConfigBox = await boxByTokenId(CONFIG_TOKEN_ID);
            //console.log("processFight", this.state, currentConfigBox);
            const [p1WinTxId, p2WinTxId] = await blobinatorFightResults(this.state.blob1, this.state.blobinator, currentConfigBox[0]);
            console.log("processFight", p1WinTxId, p2WinTxId)
            if (p1WinTxId[1] === -1 && p2WinTxId[1] === -1) {
                alert = errorAlert("Cannot process the fight yet", "The fight need at least 1 confirmation.");
                return;
            }
            this.setState({
                p1WinTxId: p1WinTxId[0],
                p1Winindex: p1WinTxId[1],
                p2WinTxId: p2WinTxId[0],
                p2Winindex: p2WinTxId[1],
            })
        } catch (e) {
            console.log(e);
        }
        alert.close();
    }

    render() {
        // 20.96 average of [36, 66, 17, 17, 17, 37, 12, 5, 10, 1, 0, 14, 0, 45, 33, 30, 29, 17, 17, 12, 51, 8, 3, 1, 3, 58, 27]
        var p1WinChance = 1 / (20.96);
        const p2WinChance = 1 - p1WinChance;
        //console.log("render FightItem", this.state)
        return (
            <span className="h-100 d-flex flex-column align-items-start">
                {
                    this.state.winningTx ?
                        <div>{(new Date(this.state.winningTx.timestamp)).toLocaleString() + ":"}</div>
                        : null
                }
                <div className="h-100 zonefight d-flex flex-row justify-content-between m-2 p-2 align-items-center">
                    <BlobItemLight
                        blobBoxJSON={this.state.blob1}
                    />
                    <div>
                        <WinPercent win_rate={p1WinChance} />
                        {
                            this.state.winningTx ? null :
                                <TransactionId txId={this.state.p1WinTxId} />
                        }
                    </div>
                    <div className='h-100 d-flex align-items-end'>
                        <div><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /> </div>
                        {
                            this.state.winningTx ?
                                this.state.p1WinTxId !== '' ?
                                    <div className='zoneupgrade m-1 p-1 d-flex flex-column align-items-center'>
                                        <h6>P1 Won !</h6>
                                        <TransactionId txId={this.state.p1WinTxId} />
                                    </div>
                                    :
                                    <div className='zoneupgrade m-1 p-1 d-flex flex-column align-items-center'>
                                        <h6>P2 Won !</h6>
                                        <TransactionId txId={this.state.p2WinTxId} />
                                    </div>
                                :
                                <div>
                                    {
                                        this.state.p1Winindex !== -1 || this.state.p2Winindex !== -1 ?
                                            this.state.p1Winindex < this.state.p2Winindex ?
                                                <div className='w-75 transparent-image' >
                                                    <GaugeChart id="gauge-chart1"
                                                        nrOfLevels={2}
                                                        percent={0.25}
                                                        colors={["#339CFF", "#FF3F33"]}
                                                        hideText={true}
                                                    />
                                                </div>
                                                :
                                                <div className='w-75 transparent-image'>
                                                    <GaugeChart id="gauge-chart1"
                                                        nrOfLevels={2}
                                                        percent={0.75}
                                                        colors={["#339CFF", "#FF3F33"]}
                                                        hideText={true} />
                                                </div>
                                            : null
                                    }
                                    <button className="btn btn-ultra-yellow"
                                        onClick={() => this.processFight()}>Process fight</button>
                                </div>
                        }
                    </div>
                    <div>
                        <WinPercent win_rate={p2WinChance} />
                        {
                            this.state.winningTx ? null :
                                <TransactionId txId={this.state.p2WinTxId} />
                        }
                    </div>

                    <BlobinatorItem blobinatorBox={this.state.blobinator} size={120} />
                </div>
            </span>
        )
    }
}