import React from 'react';
import { computeP1WinningChance } from '../utils/utils';
import BlobItem from './BlobItem';
import { WinPercent } from './WinPercent';
import { processFightResult } from '../ergo-related/bot_wasm';
import { waitingAlert } from '../utils/Alerts';
import { boxByTokenId } from '../ergo-related/explorer';
import { CONFIG_TOKEN_ID } from '../utils/constants';
import { TransactionId } from './TransactionId';
import GaugeChart from 'react-gauge-chart'


export default class FightItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            blob1: props.blob1,
            blob2: props.blob2,
            gameBox: props.gameBox,
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
            if (this.state.winningTx.inputs[0].value === this.state.winningTx.outputs[0].value) {
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
        const currentConfigBox = await boxByTokenId(CONFIG_TOKEN_ID);
        //console.log("processFight", this.state, currentConfigBox);
        const [p1WinTxId, p2WinTxId] = await processFightResult(this.state.blob1, this.state.blob2, this.state.gameBox, currentConfigBox[0]);
        //console.log("processFight", p1WinTxId, p2WinTxId)
        this.setState({
            p1WinTxId: p1WinTxId[0],
            p1Winindex: p1WinTxId[1],
            p2WinTxId: p2WinTxId[0],
            p2Winindex: p2WinTxId[1],
        })
        alert.close();
    }

    render() {
        const p1WinChance = computeP1WinningChance(this.state.blob1, this.state.blob2);
        const p2WinChance = 1 - p1WinChance;
        //console.log("render FightItem", this.state)
        return (
            <div className="w-100 zonefight d-flex flex-row justify-content-between m-2 p-2 align-items-center">
                <BlobItem
                    blobBoxJSON={this.state.blob1}
                    disableActions={true}
                    showStatus={false}
                    showOwner={true}
                />
                <div>
                    <WinPercent win_rate={p1WinChance} />
                    {
                        this.state.winningTx ? null :
                            <TransactionId txId={this.state.p1WinTxId} />
                    }
                </div>
                <div className='h-100 d-flex align-items-end'>
                    {
                        this.state.winningTx ?
                            this.state.p1WinTxId !== '' ?
                                <div><h3>P1 Won !</h3><TransactionId txId={this.state.p1WinTxId} /></div>
                                :
                                <div><h3>P2 Won !</h3><TransactionId txId={this.state.p2WinTxId} /></div>
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
                <BlobItem
                    blobBoxJSON={this.state.blob2}
                    disableActions={true}
                    showStatus={false}
                    showOwner={true}
                />
            </div>
        )
    }
}