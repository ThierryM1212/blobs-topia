import React, { Fragment } from 'react';
import ErgBlob from './ErgBlob';
import { Rating } from 'react-simple-star-rating'
import { copySuccess, promptFeedAmount } from '../utils/Alerts';
import { BLOB_ARMORS, NANOERG_TO_ERG, RATING_RANGES } from '../utils/constants';

import { decodeString, decodeLongArray, ergoTreeToAddress, decodeIntArray } from '../ergo-related/serializer';
import { addWidthDrawBlob, buyBlob, feedBlob, killBlob, setBlobStatus } from '../ergo-related/blob';
import { BlobState } from './BlobState';
import { formatLongString, getBlobPowers } from '../utils/utils';
import CopyIcon from '../images/outline_content_copy_black_24dp.png';
import OpenAction from '../images/outline_keyboard_double_arrow_right_black_24dp.png';
import CloseAction from '../images/outline_keyboard_double_arrow_left_black_24dp.png';
import PaperArmor from '../images/armure_carton.png';

export default class BlobItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            blobBoxJSON: props.blobBoxJSON,
            path: '',
            color1: '',
            color2: '',
            eyes_pos: 0,
            mouth_type: 0,
            name: '',
            info: [],
            power: 0,
            defense: 0,
            state: [0, 0],
            updateList: props.updateList,
            blobId: '0',
            showActions: props.showActions ?? false,
            ownerAddress: '',
            rating: 0,
            disableActions: props.disableActions ?? false,
            showStatus: props.showStatus ?? true,
            showOwner: props.showOwner ?? false,
        };
        this.toggleActions = this.toggleActions.bind(this);

    }

    async componentDidUpdate(prevProps, prevState) {
        //console.log("BlobItem componentDidUpdate", prevProps, this.props)
        if (prevProps.blobBoxJSON.boxId !== this.props.blobBoxJSON.boxId) { await this.updateBlob(this.props.blobBoxJSON); }
    }

    async updateBlob(box) {

        //console.log("blobBoxJSON", box)
        const desc = await decodeString(box.additionalRegisters.R4.serializedValue);
        const descArray = desc.toString().split(":");
        const [power, defense] = getBlobPowers(box.additionalRegisters.R5.renderedValue);
        const ownerAddress = await ergoTreeToAddress("00" + box.additionalRegisters.R6.serializedValue);
        const averagePower = (power + defense) / 2;
        //const averagePower = 6000;
        var rating = 0;
        for (const i of RATING_RANGES) {
            if (averagePower >= i) {
                rating++;
            } else {
                break;
            }
        }
        //console.log("rating", rating);
        //console.log("ownerAddress", ownerAddress);

        this.setState({
            boxId: box.boxId,
            path: descArray[5],
            color1: '#' + descArray[1],
            color2: '#' + descArray[2],
            eyes_pos: descArray[3],
            mouth_type: descArray[4],
            name: descArray[0],
            info: JSON.parse(box.additionalRegisters.R5.renderedValue),
            power: power,
            defense: defense,
            blobId: box.additionalRegisters.R9.renderedValue,
            state: [box.additionalRegisters.R7.renderedValue, box.additionalRegisters.R8.renderedValue],
            ownerAddress: ownerAddress,
            rating: rating,
            showActions: this.state.showActions,
        })
    }

    async componentDidMount() {
        await this.updateBlob(this.state.blobBoxJSON);
    }

    async kill(blobBoxJSON) {
        await killBlob(blobBoxJSON);
        await this.state.updateList();
    }

    async addWidthDraw(mode, blobBoxJSON) {
        await addWidthDrawBlob(mode, blobBoxJSON);
        await this.state.updateList();
    }

    async buy(blobBoxJSON) {
        await buyBlob(blobBoxJSON);
        await this.state.updateList();
    }

    async setStatus(mode, blobBoxJSON) {
        await setBlobStatus(mode, blobBoxJSON);
        await this.state.updateList();
    }

    async feed(blobBoxJSON) {
        const [defAmount, attAmount] = await promptFeedAmount();
        await feedBlob(blobBoxJSON, 'feed', defAmount, attAmount);
        await this.state.updateList();
    }

    async upgradeArmor(blobBoxJSON) {
        await feedBlob(blobBoxJSON, 'armor');
        await this.state.updateList();
    }

    toggleActions() {
        this.setState({
            showActions: !this.state.showActions,
        })
    }

    render() {
        const ownBlob = (this.state.ownerAddress === localStorage.getItem('address'));
        return (
            <div className="zonecard d-flex flex-row m-1 p-1 align-items-center" >
                <div className="d-flex flex-column zoneblob " >
                    <div className="d-flex flex-row justify-content-between w-100">
                        <Rating initialValue={this.state.rating} readonly={true} size={20} />
                        {
                            this.state.disableActions ? null :
                                this.state.showActions ?
                                    <img className="transparent-image" src={CloseAction} onClick={this.toggleActions} alt="toggleActions" />
                                    :
                                    <img className="transparent-image" src={OpenAction} onClick={this.toggleActions} alt="toggleActions" />

                        }
                    </div>
                    <ErgBlob key={"ergblob" + this.state.boxId}
                        color1={this.state.color1}
                        color2={this.state.color2}
                        path={this.state.path}
                        eyes_pos={this.state.eyes_pos}
                        mouth_type={this.state.mouth_type}
                        name={this.state.name}
                    />
                    <div className="d-flex flex-row justify-content-between m-2">
                        <div></div>
                        <div className="d-flex flex-column align-items-center">
                            <img className="armor" src={PaperArmor} alt={BLOB_ARMORS[0].name} />
                            {BLOB_ARMORS[0].name}
                        </div>
                        <div></div>
                    </div>
                    <div className="border-white d-flex flex-column align-items-center p-2" >
                        <div className="d-flex flex-row justify-content-between w-100">
                            <div><strong>Value</strong></div>
                            <div><strong>{parseInt(this.state.blobBoxJSON.value) / NANOERG_TO_ERG} ERG</strong></div>
                        </div>
                        <div className="d-flex flex-row justify-content-between w-100">
                            <div><strong>Attack power</strong></div>
                            <div><strong>{this.state.power}</strong></div>
                        </div>
                        <div className="d-flex flex-row justify-content-between w-100">
                            <div><strong>Defense power</strong></div>
                            <div><strong>{this.state.defense}</strong></div>
                        </div>
                        <div className="d-flex flex-row justify-content-between w-100">
                            <div>Attack</div>
                            <div>{this.state.info[0]}</div>
                        </div>
                        <div className="d-flex flex-row justify-content-between w-100">
                            <div>Defense</div>
                            <div>{this.state.info[1]}</div>
                        </div>
                        <div className="d-flex flex-row justify-content-between w-100">
                            <div>Armor</div>
                            <div>{this.state.info[4]}</div>
                        </div>
                        <div className="d-flex flex-row justify-content-between w-100">
                            <div>Fights</div>
                            <div>{this.state.info[2]}</div>
                        </div>
                        <div className="d-flex flex-row justify-content-between w-100">
                            <div>Victories</div>
                            <div>{this.state.info[3]}</div>
                        </div>
                        <div className="d-flex flex-row justify-content-between w-100">
                            <div>ID</div>
                            <div>{this.state.blobId}</div>
                        </div>
                        {this.state.showStatus ?
                            <BlobState state={this.state.state[0]} stateValue={this.state.state[1]} />
                            : null
                        }
                        {
                            this.state.showOwner ?
                                <div className="m-2 d-flex flex-row justify-content-between w-100">
                                    <div >{formatLongString(this.state.ownerAddress, 5)}</div>
                                    <img className="transparent-image" src={CopyIcon} alt="copy" onClick={() => {
                                        navigator.clipboard.writeText(this.state.ownerAddress);
                                        copySuccess();
                                    }} />
                                </div>
                                : null
                        }


                    </div>
                </div>
                {
                    this.state.showActions ?
                        <div className="d-flex flex-column " >
                            {
                                ownBlob ?
                                    <Fragment>
                                        <button className="btn btn-ultra-voilet m-1" onClick={() => this.kill(this.state.blobBoxJSON)}
                                            disabled={this.state.state[0] !== '0'} >Kill Blob</button>
                                        <button className="btn btn-ultra-voilet m-1" onClick={() => this.addWidthDraw('add', this.state.blobBoxJSON)}
                                            disabled={this.state.state[0] !== '0'} >Deposit</button>
                                        <button className="btn btn-ultra-voilet m-1" onClick={() => this.addWidthDraw('widthdraw', this.state.blobBoxJSON)}
                                            disabled={this.state.state[0] !== '0'} >Widthdraw</button>
                                        <button className="btn btn-ultra-voilet m-1" onClick={() => this.setStatus('sell', this.state.blobBoxJSON)}
                                            disabled={this.state.state[0] !== '0'} >Sell</button>
                                        <button className="btn btn-ultra-voilet m-1" onClick={() => this.setStatus('reset', this.state.blobBoxJSON)}
                                            disabled={this.state.state[0] !== '2'} >Cancel sell</button>
                                        <button className="btn btn-ultra-voilet m-1" onClick={() => this.setStatus('fight', this.state.blobBoxJSON)}
                                            disabled={this.state.state[0] !== '0'} >Fight</button>
                                        <button className="btn btn-ultra-voilet m-1" onClick={() => this.setStatus('reset', this.state.blobBoxJSON)}
                                            disabled={this.state.state[0] !== '1'} >Cancel fight</button>
                                        <button className="btn btn-ultra-voilet m-1" onClick={() => this.feed(this.state.blobBoxJSON)}
                                            disabled={this.state.state[0] !== '0'} >Feed</button>
                                        <button className="btn btn-ultra-voilet m-1" onClick={() => this.upgradeArmor(this.state.blobBoxJSON)}
                                            disabled={this.state.state[0] !== '0'} >Upgrade armor</button>
                                    </Fragment>
                                    :
                                    <Fragment>
                                        <button className="btn btn-ultra-voilet m-1" onClick={() => this.buy(this.state.blobBoxJSON)}
                                            disabled={this.state.state[0] !== '2'} >Buy</button>
                                    </Fragment>
                            }
                        </div>
                        : null
                }

            </div>
        )
    }
}