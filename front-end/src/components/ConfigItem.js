import React, { Fragment } from 'react';
import { decodeHex, decodeLongArray } from '../ergo-related/serializer';
import { CONFIG_TOKEN_ID } from '../utils/constants';
import { boxByTokenId } from '../ergo-related/explorer'
import { getRegisterValue } from '../ergo-related/wasm';


export default class ConfigItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            boxId: '',
            boxAddress: '',
            blobScriptHash: '',
            gameScriptHash: '',
            oatmealReserveScriptHash: '',
            blobExchangeFee: 0,
            txFee: 0,
            numOatmealLoser: 0,
            numOatmealWinner: 0,
        };
    }

    async getRegisterLongArray(box, register) {
        var longArray = [];
        try {
            longArray = await decodeLongArray(getRegisterValue(box, register))
        } catch (e) {
            console.log("getRegisterLongArray", e);
        }
        return longArray;
    }

    async getRegisterHex(box, register) {
        var out = '';
        try {
            out = await decodeHex(getRegisterValue(box, register))
        } catch (e) {
            console.log("getRegisterString", e);
        }
        return out;
    }

    async componentDidMount() {
        const currentConfigBox = await boxByTokenId(CONFIG_TOKEN_ID);
        //console.log("ConfigItem componentDidMount currentConfigBox", currentConfigBox);
        if (currentConfigBox.length > 0) {
            const R4Str = await this.getRegisterHex(currentConfigBox[0], "R4");
            const R5Str = await this.getRegisterHex(currentConfigBox[0], "R5");
            const R6array = await this.getRegisterLongArray(currentConfigBox[0], "R6");
            const R7Str = await this.getRegisterHex(currentConfigBox[0], "R7");

            this.setState({
                boxId: currentConfigBox[0].boxId ?? '',
                boxAddress: currentConfigBox[0].address ?? '',
                blobScriptHash: R4Str ?? '',
                gameScriptHash: R5Str ?? '',
                oatmealReserveScriptHash: R7Str ?? '',
                blobExchangeFee: R6array[0] ?? 0,
                txFee: R6array[1] ?? 0,
                numOatmealLoser: R6array[2] ?? 0,
                numOatmealWinner: R6array[3] ?? 0,
                maxPowerDiff: R6array[4] ?? 0,
                oatmealPrice: R6array[5] ?? 0,
            });
        }
    }

    render() {
        const currentBoxDisplay = {
            "Box id": this.state.boxId,
            "Box address": this.state.boxAddress,
            "Blob script hash": this.state.blobScriptHash,
            "Game script hash": this.state.gameScriptHash,
            "Oatmeal reserve script hash": this.state.oatmealReserveScriptHash,
            "Blob exchange fee": this.state.blobExchangeFee,
            "Transaction fee": this.state.txFee,
            "Oatmeal for loser": this.state.numOatmealLoser,
            "Oatmeal for winner": this.state.numOatmealWinner,
            "Max power diff": this.state.maxPowerDiff,
            "Oatmeal price": this.state.oatmealPrice,
        };

        return (
            <Fragment>
                <table className="m-1" >
                    <tbody>
                        {
                            Object.keys(currentBoxDisplay).map( key =>
                                <tr key={key}>
                                    <td>
                                        {key}:
                                    </td>
                                    <td>
                                        {currentBoxDisplay[key]}
                                    </td>
                                </tr>
                            )
                        }
                    </tbody>
                </table>
            </Fragment>

        )
    }
}
