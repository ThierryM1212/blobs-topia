import React, { Fragment } from 'react';
import { decodeHex, decodeHexArray, decodeIntArray, decodeLongArray } from '../ergo-related/serializer';
import { CONFIG_TOKEN_ID } from '../utils/constants';
import { boxByTokenId } from '../ergo-related/explorer'
import { getRegisterValue } from '../ergo-related/wasm';
import { chunkArray, formatERGAmount } from '../utils/utils';


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
            blobinatorFeeScriptHash: '',
            blobinatorScriptHash: '',
            blobinatorReserveScriptHash: '',
            blobExchangeFee: 0,
            txFee: 0,
            numOatmealLoser: 0,
            numOatmealWinner: 0,
            maxPowerDiff: 0,
            oatmealPrice: 0,
            blobinatorFee: 0,
            blobinatorMinValue: 0,
            blobinatorFightTokNum: 0,
            blobinatorModuloWin: 0,
            armorStatArray: [],
            weaponUpgradePrices: [],
            weaponStatArray: [],
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

    async getRegisterIntArray(box, register) {
        var longArray = [];
        try {
            longArray = await decodeIntArray(getRegisterValue(box, register))
        } catch (e) {
            console.log("getRegisterIntArray", e);
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
        console.log("ConfigItem componentDidMount currentConfigBox", currentConfigBox);
        if (currentConfigBox.length > 0) {
            const R4StrArray = await this.getRegisterHexArray(currentConfigBox[0], "R4");
            const R5LongArray = await this.getRegisterLongArray(currentConfigBox[0], "R5");
            const R6LongArray = await this.getRegisterLongArray(currentConfigBox[0], "R6");
            const R7LongArray = await this.getRegisterLongArray(currentConfigBox[0], "R7");
            const R8IntArray = await this.getRegisterIntArray(currentConfigBox[0], "R8");
            console.log("R8IntArray", R8IntArray)

            this.setState({
                boxId: currentConfigBox[0].boxId ?? '',
                boxAddress: currentConfigBox[0].address ?? '',
                blobScriptHash: R4StrArray[0] ?? '',
                gameScriptHash: R4StrArray[1] ?? '',
                oatmealReserveScriptHash: R4StrArray[2] ?? '',
                burnAllScriptHash: R4StrArray[3] ?? '',
                blobinatorFeeScriptHash: R4StrArray[4] ?? '',
                blobinatorScriptHash: R4StrArray[5] ?? '',
                blobinatorReserveScriptHash: R4StrArray[6] ?? '',
                blobExchangeFee: R5LongArray[0] ?? 0,
                txFee: R5LongArray[1] ?? 0,
                numOatmealLoser: R5LongArray[2] ?? 0,
                numOatmealWinner: R5LongArray[3] ?? 0,
                maxPowerDiff: R5LongArray[4] ?? 0,
                oatmealPrice: R5LongArray[5] ?? 0,
                blobinatorFee: R5LongArray[6] ?? 0,
                blobinatorMinValue: R5LongArray[7] ?? 0,
                blobinatorFightTokNum: R5LongArray[8] ?? 0,
                blobinatorModuloWin: R5LongArray[9] ?? 0,
                armorStatArray: chunkArray(R6LongArray, 3) ?? [],
                weaponUpgradePrices: R7LongArray,
                weaponStatArray: chunkArray(R8IntArray, 2) ?? [],
            });
        }
    }

    render() {
        var currentBoxDisplay = {
            "Box id": this.state.boxId,
            "Box address": this.state.boxAddress,
            "Blob script hash": this.state.blobScriptHash,
            "Game script hash": this.state.gameScriptHash,
            "Oatmeal reserve script hash": this.state.oatmealReserveScriptHash,
            "Burn All script hash": this.state.burnAllScriptHash,
            "Blobinator fee script hash": this.state.blobinatorFeeScriptHash,
            "Blobinator script hash": this.state.blobinatorScriptHash,
            "Blobinator reserve script hash": this.state.blobinatorReserveScriptHash,
            "Blob exchange fee": parseInt(this.state.blobExchangeFee) / 10 + "%",
            "Miner fee": formatERGAmount(this.state.txFee) + " ERG",
            "Oatmeal for loser": this.state.numOatmealLoser,
            "Oatmeal for winner": this.state.numOatmealWinner,
            "Max power diff": this.state.maxPowerDiff,
            "Oatmeal price": formatERGAmount(this.state.oatmealPrice) + " ERG",
            "Blobinator fee": parseInt(this.state.blobinatorFee) / 10 + "%",
            "Blobinator minvalue": formatERGAmount(this.state.blobinatorMinValue) + " ERG",
            "Blobinator fight token amount": this.state.blobinatorFightTokNum,
            "Blobinator modulo win": this.state.blobinatorModuloWin,
        };
        //console.log("weaponStatArray", this.state.weaponStatArray)

        return (
            <Fragment>
                <table className="m-1" >
                    <tbody>
                        {
                            Object.keys(currentBoxDisplay).map(key =>
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
                <h5>Armor statistics and prices</h5>
                <table className="m-1" >
                    <tbody>
                        <tr>
                            <td>Armor lvl</td><td>Oatmeal price</td><td>Att power</td><td>Def power</td>

                        </tr>
                        {
                            this.state.armorStatArray.map((armor, index) =>
                                <tr>
                                    <td>{index}</td><td>{armor[0]}</td><td>{armor[1]}</td><td>{armor[2]}</td>
                                </tr>
                            )
                        }
                    </tbody>
                </table>
                <h5>Weapon upgrade prices</h5>
                <table className="m-1" >
                    <tbody>
                        <tr>
                            <td>Change weapon Oatmeal</td>
                            <td>lvl 0-{'>'}1</td>
                            <td>lvl 1-{'>'}2</td>
                            <td>lvl 2-{'>'}3</td>
                        </tr>
                        <tr>
                            <td>{this.state.weaponUpgradePrices[0]} Oatmeal</td>
                            <td>{this.state.weaponUpgradePrices[1]} Oatmeal</td>
                            <td>{this.state.weaponUpgradePrices[2]} Oatmeal</td>
                            <td>{this.state.weaponUpgradePrices[3]} Oatmeal</td>
                        </tr>
                    </tbody>
                </table>
                <h5>Weapon statistics</h5>

                <table className="m-1" >
                    <tbody>
                        <tr>
                            <td>level</td>
                            <td colspan="2">Stick</td>
                            <td colspan="2">Swords</td>
                            <td colspan="2">Axes</td>
                            <td colspan="2">Maces</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td>Att</td><td>Def</td>
                            <td>Att</td><td>Def</td>
                            <td>Att</td><td>Def</td>
                            <td>Att</td><td>Def</td>
                        </tr>
                        {
                            this.state.weaponStatArray[0] ?
                                <Fragment>
                                    {
                                        [0, 1, 2, 3].map(i =>
                                            <tr>
                                                <td>{i}</td>
                                                {
                                                    i === 0 ?
                                                    <Fragment>
                                                        <td>{this.state.weaponStatArray[0][0]}</td>
                                                        <td>{this.state.weaponStatArray[0][1]}</td>
                                                    </Fragment>
                                                    :
                                                    <Fragment>
                                                        <td></td>
                                                        <td></td>
                                                    </Fragment>
                                                }
                                                <td>{this.state.weaponStatArray[i+1][0]}</td>
                                                <td>{this.state.weaponStatArray[i+1][1]}</td>
                                                <td>{this.state.weaponStatArray[i+5][0]}</td>
                                                <td>{this.state.weaponStatArray[i+5][1]}</td>
                                                <td>{this.state.weaponStatArray[i+9][0]}</td>
                                                <td>{this.state.weaponStatArray[i+9][1]}</td>
                                            </tr>
                                        )
                                    }
                                </Fragment>
                                : null
                        }
                    </tbody>
                </table>
            </Fragment>

        )
    }
}
