import React, { Fragment } from 'react';
import { decodeHex, decodeHexArray, decodeLongArray } from '../ergo-related/serializer';
import { CONFIG_TOKEN_ID } from '../utils/constants';
import { boxByTokenId } from '../ergo-related/explorer'
import { getRegisterValue } from '../ergo-related/wasm';
import { formatERGAmount } from '../utils/utils';


export default class ConfigItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            boxId: '',
            boxAddress: '',
            blobScriptHash: '',
            gameScriptHash: '',
            oatmealReserveScriptHash: '',
            burnAllScriptHash: '',
            blobExchangeFee: 0,
            txFee: 0,
            numOatmealLoser: 0,
            numOatmealWinner: 0,
            maxPowerDiff: 0,
            oatmealPrice: 0,
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

    async getRegisterHexArray(box, register) {
        var out = [];
        try {
            out = await decodeHexArray(getRegisterValue(box, register))
        } catch (e) {
            console.log("getRegisterString", e);
        }
        return out;
    }

    async componentDidMount() {
        const currentConfigBox = await boxByTokenId(CONFIG_TOKEN_ID);
        //console.log("ConfigItem componentDidMount currentConfigBox", currentConfigBox);
        if (currentConfigBox.length > 0) {
            const R5LongArray = await this.getRegisterLongArray(currentConfigBox[0], "R5");
            const R4StrArray = await this.getRegisterHexArray(currentConfigBox[0], "R4");

            this.setState({
                boxId: currentConfigBox[0].boxId ?? '',
                boxAddress: currentConfigBox[0].address ?? '',
                blobScriptHash: R4StrArray[0] ?? '',
                gameScriptHash: R4StrArray[1] ?? '',
                oatmealReserveScriptHash: R4StrArray[2] ?? '',
                burnAllScriptHash: R4StrArray[3] ?? '',
                blobExchangeFee: R5LongArray[0] ?? 0,
                txFee: R5LongArray[1] ?? 0,
                numOatmealLoser: R5LongArray[2] ?? 0,
                numOatmealWinner: R5LongArray[3] ?? 0,
                maxPowerDiff: R5LongArray[4] ?? 0,
                oatmealPrice: R5LongArray[5] ?? 0,
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
            "Burn All script hash": this.state.burnAllScriptHash,
            "Blob exchange fee": parseInt(this.state.blobExchangeFee) / 10 + "%",
            "Miner fee": formatERGAmount(this.state.txFee) + " ERG",
            "Oatmeal for loser": this.state.numOatmealLoser,
            "Oatmeal for winner": this.state.numOatmealWinner,
            "Max power diff": this.state.maxPowerDiff,
            "Oatmeal price": formatERGAmount(this.state.oatmealPrice) + " ERG",
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
