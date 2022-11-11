import React from 'react';
import { decodeLong, decodeLongArray, decodeString } from '../ergo-related/serializer';
import { NANOERG_TO_ERG } from '../utils/constants';
import { burnReserve } from '../ergo-related/admin_game';
import { formatLongString } from '../utils/utils';


export default class ReserveItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: props.name,
            boxId: props.boxId,
            tokenAmount: props.tokenAmount,
            value: props.value,
            identifier: props.identifier,
            blobPrice: '0',
            blobMintFee: '0',
            blobPriceAndFee: props.blobPriceAndFee,
        };
        this.decodeName = this.decodeName.bind(this);
        this.decodeIdentifier = this.decodeIdentifier.bind(this);
        this.decodeBlobPriceAndFee = this.decodeBlobPriceAndFee.bind(this);
    }

    decodeName() {
        decodeString(this.state.name)
            .then(decodedName => {
                this.setState({
                    name: decodedName
                })
            })
            .catch((error) => console.log(error));
    }

    decodeIdentifier() {
        console.log("this.state.identifier",this.state.identifier);
        decodeLong(this.state.identifier)
            .then(decodedidentifier => {
                console.log("decodedidentifier",decodedidentifier);
                this.setState({
                    identifier: decodedidentifier
                })
            })
            .catch((error) => console.log(error));
    }

    decodeBlobPriceAndFee() {
        decodeLongArray(this.state.blobPriceAndFee)
            .then(decodedArray => {
                this.setState({
                    blobPrice: decodedArray[0],
                    blobMintFee: decodedArray[1],
                })
            })
            .catch((error) => console.log(error));
    }

    componentDidMount() {
        this.decodeName();
        this.decodeIdentifier();
        this.decodeBlobPriceAndFee();
    }

    async burn(boxId) {
        return await burnReserve(boxId);
    }

    render() {

        return (

            <table className="m-1" >
                <tbody>
                    <tr>
                        <td>
                            Reserve name:
                        </td>
                        <td>
                            {this.state.name}
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Box id:
                        </td>
                        <td>
                            {formatLongString(this.state.boxId, 10)}
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Token amount:
                        </td>
                        <td>
                            {this.state.tokenAmount}
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Reserve value:
                        </td>
                        <td>
                            {parseFloat(parseInt(this.state.value) / NANOERG_TO_ERG).toFixed(4)} ERG
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Next blob id:
                        </td>
                        <td>
                            {this.state.identifier}
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Blob price:
                        </td>
                        <td>
                            {parseFloat(parseInt(this.state.blobPrice) / NANOERG_TO_ERG).toFixed(4)} ERG
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Blob mint Fee:
                        </td>
                        <td>
                            {parseFloat(parseInt(this.state.blobMintFee) / NANOERG_TO_ERG).toFixed(4)} ERG
                        </td>
                    </tr>
                    <tr>
                        <td></td>
                        <td className="tdright">
                            <button className="btn btn-ultra-voilet" onClick={() => this.burn(this.state.boxId)}>Burn reserve</button>
                        </td>
                    </tr>
                </tbody>
            </table>

        )
    }
}
