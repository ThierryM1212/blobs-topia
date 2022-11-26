import React from 'react';
import ErgBlob from './ErgBlob';
import { decodeString, ergoTreeToAddress } from '../ergo-related/serializer';
import { getBlobPowers } from '../utils/utils';
import OpenNew from '../images/outline_open_in_new_black_24dp.png';
import ImageButton from './ImageButton';
import BlobRating from './BlobRating';


export default class BlobItemLight extends React.Component {
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
            state: ['0', '0'],
            blobId: '0',
            ownerAddress: '',
            averagePower: 0,
        };
        this.updateBlob = this.updateBlob.bind(this);
        this.blobRef = React.createRef();
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
        })
    }

    async componentDidMount() {
        await this.updateBlob(this.state.blobBoxJSON);
    }

    render() {
        return (
            <div className="zonecard d-flex flex-row m-1 p-1 align-items-center">
                <div className="d-flex flex-column zonebloblight " ref={this.blobRef} >
                    <div className="d-flex flex-row justify-content-between w-100">
                        <BlobRating averagePower={(this.state.power + this.state.defense) / 2} />
                        <div className="d-flex flex-row align-items-end">
                            <ImageButton action={() => { window.open("/blob/" + this.state.blobBoxJSON.additionalRegisters.R9.renderedValue, '_blank').focus() }}
                                alt="photo"
                                tips={"View the blob"}
                                image={OpenNew} />
                        </div>
                    </div>
                    <ErgBlob key={"ergblob" + this.state.boxId}
                        color1={this.state.color1}
                        color2={this.state.color2}
                        path={this.state.path}
                        eyes_pos={this.state.eyes_pos}
                        mouth_type={this.state.mouth_type}
                        name={this.state.name}
                        size={100}
                        
                    />
                    <div className="border-white d-flex flex-column align-items-center p-2" >
                        <div className="d-flex flex-row justify-content-between w-100">
                            <div><strong>Attack</strong></div>
                            <div><strong>{this.state.power}</strong></div>
                        </div>
                        <div className="d-flex flex-row justify-content-between w-100">
                            <div><strong>Defense</strong></div>
                            <div><strong>{this.state.defense}</strong></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}