import React, { Fragment } from 'react';
import { BLOBINATOR_TOKEN_ID, GAME_ADDRESS, GAME_TOKEN_ID, NANOERG_TO_ERG, OATMEAL_TOKEN_ID, SPICY_OATMEAL_TOKEN_ID } from '../utils/constants';
import { RESERVE_SCRIPT_ADDRESS, OATMEAL_RESERVE_SCRIPT_ADDRESS, OATMEAL_SELL_RESERVE_SCRIPT_ADDRESS, BLOBINATOR_RESERVE_SCRIPT_ADDRESS, BLOBINATOR_SCRIPT_ADDRESS, BURN_ALL_SCRIPT_ADDRESS } from "../utils/script_constants";
import { getUnspentBoxesByAddress } from '../ergo-related/explorer';
import ReserveItem from '../components/ReserveItem';
import ConfigItem from '../components/ConfigItem';
import OatmealReserveItem from '../components/OatmealReserveItem';
import { adminCollectBurnFee, adminInvokeBlobinator, mintBlobinatorReserve, mintGameTokenReserve, mintOatmealReserve, updateConfigurationBox } from '../ergo-related/admin_game';
import { getRegisterValue, getTokenAmount, getUtxosListValue } from '../ergo-related/wasm';
import { promptErgAmount } from '../utils/Alerts';
import { formatERGAmount } from '../utils/utils';


export default class Admin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            reserveName: '',
            reserveTokenAmount: '100',
            reserveIniIdentifier: '1',
            oatmealReserveTokenAmount: '1000',
            oatmealReserveSellTokenAmount: '100000',
            blobinatorReserveTokenAmount: '1000',
            reserveList: [],
            oatmealReserveList: [],
            oatmealReserveSellList: [],
            blobinatorReserveList: [],
            blobinatorList: [],
            burnFeeList: [],
            configList: [],
        };
        this.form = React.createRef();
        this.formConf = React.createRef();
        this.handleChangeReserveTokenAmount = this.handleChangeReserveTokenAmount.bind(this);
        this.handleChangeReserveName = this.handleChangeReserveName.bind(this);
        this.handleChangeReserveList = this.handleChangeReserveList.bind(this);
        this.handleChangeIniIdentifier = this.handleChangeIniIdentifier.bind(this);
        this.fetchReserves = this.fetchReserves.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.mintReserve = this.mintReserve.bind(this);
        this.mintOatmealReserve = this.mintOReserve.bind(this);
    }

    handleChangeBlobinatorReserveTokenAmount(event) {
        this.setState({ blobinatorReserveTokenAmount: event.target.value });
    }

    handleChangeReserveTokenAmount(event) {
        this.setState({ reserveTokenAmount: event.target.value });
    }

    handleChangeOatmealReserveSellTokenAmount(event) {
        this.setState({ oatmealReserveSellTokenAmount: event.target.value });
    }

    handleChangeIniIdentifier(event) {
        this.setState({ reserveIniIdentifier: event.target.value });
    }

    handleChangeReserveList(event) {
        this.setState({ reserveList: event.target.id });
    }

    handleChangeReserveName(event) {
        this.setState({ reserveName: event.target.value });
    }

    handleSubmit(event) {
        if (this.form.current.reportValidity()) {
            event.preventDefault();
            this.mintReserve(this.state.reserveName, this.state.reserveTokenAmount, this.state.reserveIniIdentifier);
        }
    }

    componentDidMount() {
        this.fetchReserves();
    }

    async fetchReserves() {
        const reserveList = await getUnspentBoxesByAddress(RESERVE_SCRIPT_ADDRESS);
        const oatmealReserveList = await getUnspentBoxesByAddress(OATMEAL_RESERVE_SCRIPT_ADDRESS);
        const oatmealReserveSellList = await getUnspentBoxesByAddress(OATMEAL_SELL_RESERVE_SCRIPT_ADDRESS);
        const blobinatorReserveList = await getUnspentBoxesByAddress(BLOBINATOR_RESERVE_SCRIPT_ADDRESS);
        const blobinatorList = await getUnspentBoxesByAddress(BLOBINATOR_SCRIPT_ADDRESS);
        const burnFeeList = await getUnspentBoxesByAddress(BURN_ALL_SCRIPT_ADDRESS);
        this.setState({
            reserveList: reserveList,
            oatmealReserveList: oatmealReserveList,
            oatmealReserveSellList: oatmealReserveSellList,
            blobinatorReserveList: blobinatorReserveList,
            blobinatorList: blobinatorList,
            burnFeeList: burnFeeList,
        })
    }

    async updateConf() {
        return await updateConfigurationBox();
    }

    async invokeBlobinator() {
        const ergAmountFloat = await promptErgAmount('blobinator');
        const ergAmountNano = Math.round(ergAmountFloat * NANOERG_TO_ERG);
        return await adminInvokeBlobinator(ergAmountNano);
    }

    async mintReserve(reserveName, reserveTokenAmount, reserveIniIdentifier) {
        return await mintGameTokenReserve(reserveName, reserveTokenAmount, reserveIniIdentifier);
    }

    async mintOReserve(oatmealReserveTokenAmount) {
        return await mintOatmealReserve(OATMEAL_RESERVE_SCRIPT_ADDRESS, oatmealReserveTokenAmount);
    }

    async mintOSellReserve(oatmealReserveTokenAmount) {
        return await mintOatmealReserve(OATMEAL_SELL_RESERVE_SCRIPT_ADDRESS, oatmealReserveTokenAmount);
    }

    async mintBlobinatorReserve_(tokenAmount) {
        return await mintBlobinatorReserve(tokenAmount);
    }

    async collectBurnFee() {
        return await adminCollectBurnFee();
    }

    render() {

        return (
            <Fragment >
                {
                    localStorage.getItem('address') === GAME_ADDRESS ? null :
                        <h4>This page is usable only by {GAME_ADDRESS}</h4>
                }
                <div className="w-100 content d-flex align-items-center flex-md-column p-2 m-2">

                    <div className="card zonecard w-50 p-2 d-flex align-items-center">
                        <h4>Create new BLOB token reserve</h4>
                        <form ref={this.form} onSubmit={this.handleSubmit}  >
                            <table>
                                <tbody>
                                    <tr>
                                        <td>
                                            <label htmlFor="reservename">Reserve name</label>
                                        </td>
                                        <td>
                                            <input className="form-control"
                                                type="text"
                                                id="reservename"
                                                pattern="[a-zA-Z0-9 _]{1,15}"
                                                required
                                                value={this.state.reserveName}
                                                onChange={this.handleChangeReserveName}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label htmlFor="reservetokenamount">Token amount</label>
                                        </td>
                                        <td>
                                            <input className="form-control"
                                                type="text"
                                                id="reservetokenamount"
                                                pattern="[0-9]+"
                                                required
                                                value={this.state.reserveTokenAmount}
                                                onChange={this.handleChangeReserveTokenAmount}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label htmlFor="reserveidentifier">Initial blob id</label>
                                        </td>
                                        <td>
                                            <input className="form-control"
                                                type="text"
                                                id="reserveidentifier"
                                                pattern="[0-9]+"
                                                required
                                                value={this.state.reserveIniIdentifier}
                                                onChange={this.handleChangeIniIdentifier}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="tdright">
                                            <input className="btn btn-ultra-voilet" type="submit" value="Mint reserve" />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </form>
                    </div>
                    <br />

                    <div className="w-50 ">
                        <h4>Available game token reserves</h4>
                        <ul >
                            {this.state.reserveList.map(item => (
                                <li key={item.boxId} className="card zonecard m-2">
                                    <ReserveItem
                                        boxId={item.boxId}
                                        name={getRegisterValue(item, "R4")}
                                        tokenAmount={getTokenAmount(item, GAME_TOKEN_ID)}
                                        value={item.value}
                                        identifier={getRegisterValue(item, "R7")}
                                        blobPriceAndFee={getRegisterValue(item, "R6")}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="zonecard w-50">
                        <h4>Create new game oatmeal reserve</h4>
                        <table>
                            <tbody>
                                <tr>
                                    <td>
                                        <label htmlFor="reservetokenamount">Token amount</label>
                                    </td>
                                    <td>
                                        <input className="form-control"
                                            type="text"
                                            id="reservetokenamount"
                                            pattern="[0-9]+"
                                            required
                                            value={this.state.oatmealReserveTokenAmount}
                                            onChange={this.handleChangeOatmealReserveTokenAmount}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                    </td>
                                    <td className="tdright">
                                        <button className="btn btn-ultra-voilet" onClick={() => this.mintOReserve(this.state.oatmealReserveTokenAmount)} >Mint oatmeal reserve</button>
                                    </td>
                                </tr>
                            </tbody>

                        </table>
                    </div>

                    <div className="w-50 ">
                        <h4>Available game oatmeal reserves</h4>
                        <ul >
                            {this.state.oatmealReserveList.map(item => (
                                <li key={item.boxId} className="card zonecard m-2">
                                    <OatmealReserveItem
                                        boxId={item.boxId}
                                        tokenId={OATMEAL_TOKEN_ID}
                                        tokenAmount={getTokenAmount(item, OATMEAL_TOKEN_ID)}
                                        tokenId2={SPICY_OATMEAL_TOKEN_ID}
                                        tokenAmount2={getTokenAmount(item, SPICY_OATMEAL_TOKEN_ID)}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="zonecard w-50">
                        <h4>Create new sell oatmeal reserve</h4>
                        <table>
                            <tbody>
                                <tr>
                                    <td>
                                        <label htmlFor="reservetokenamount">Token amount</label>
                                    </td>
                                    <td>
                                        <input className="form-control"
                                            type="text"
                                            id="reservetokenamount"
                                            pattern="[0-9]+"
                                            required
                                            value={this.state.oatmealReserveSellTokenAmount}
                                            onChange={this.handleChangeOatmealReserveSellTokenAmount}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                    </td>
                                    <td className="tdright">
                                        <button className="btn btn-ultra-voilet" onClick={() => this.mintOSellReserve(this.state.oatmealReserveSellTokenAmount)} >Mint oatmeal reserve</button>
                                    </td>
                                </tr>
                            </tbody>

                        </table>
                    </div>

                    <div className="w-50 ">
                        <h4>Available sell oatmeal reserves</h4>
                        <ul >
                            {this.state.oatmealReserveSellList.map(item => (
                                <li key={item.boxId} className="card zonecard m-2">
                                    <OatmealReserveItem
                                        boxId={item.boxId}
                                        tokenId={OATMEAL_TOKEN_ID}
                                        tokenAmount={getTokenAmount(item, OATMEAL_TOKEN_ID)}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="zonecard w-50">
                        <h4>Create new blobinator reserve</h4>
                        <table>
                            <tbody>
                                <tr>
                                    <td>
                                        <label htmlFor="reservetokenamount">Token amount</label>
                                    </td>
                                    <td>
                                        <input className="form-control"
                                            type="text"
                                            id="reservetokenamount"
                                            pattern="[0-9]+"
                                            required
                                            value={this.state.blobinatorReserveTokenAmount}
                                            onChange={this.handleChangeBlobinatorReserveTokenAmount}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                    </td>
                                    <td className="tdright">
                                        <button className="btn btn-ultra-voilet" onClick={() => this.mintBlobinatorReserve_(this.state.blobinatorReserveTokenAmount)} >Mint blobinator reserve</button>
                                    </td>
                                </tr>
                            </tbody>

                        </table>
                    </div>

                    <div className="w-50 ">
                        <h4>Available blobinator reserves</h4>
                        <ul >
                            {this.state.blobinatorReserveList.map(item => (
                                <li key={item.boxId} className="card zonecard m-2">
                                    <OatmealReserveItem
                                        boxId={item.boxId}
                                        tokenId={BLOBINATOR_TOKEN_ID}
                                        tokenAmount={getTokenAmount(item, BLOBINATOR_TOKEN_ID)}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="card zonecard p-2 d-flex align-items-center">
                        <h4>Current game configuration</h4>
                        <ConfigItem />
                    </div>

                    <div className="card zonecard w-50 p-2 m-2 d-flex align-items-center">
                        <h4>Update configuration</h4>
                        <table>
                            <tbody>
                                <tr>
                                    <td className="tdright">
                                        <input className="btn btn-ultra-voilet" type="submit" value="Update configuration" onClick={this.updateConf} />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="card zonecard w-50 p-2 m-2 d-flex align-items-center">
                        <h4>Invoke blobinator</h4>
                        <table>
                            <tbody>
                                <tr>
                                    <td className="tdright">
                                        Number of Blobinators:
                                    </td>
                                    <td className="tdleft">
                                        {this.state.blobinatorList.length}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="tdright">
                                        Amount in Blobinators:
                                    </td>
                                    <td className="tdleft">
                                        {formatERGAmount(getUtxosListValue(this.state.blobinatorList))} ERG
                                    </td>
                                </tr>
                                <tr>
                                    <td className="tdright">
                                        <input className="btn btn-ultra-voilet" type="submit" value="Invoke Blobinator" onClick={this.invokeBlobinator} />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="card zonecard w-50 p-2 m-2 d-flex align-items-center">
                        <h4>Collect burn fee</h4>
                        <table>
                            <tbody>
                                <tr>
                                    <td className="tdright">
                                        Number of Burn fee box:
                                    </td>
                                    <td className="tdleft">
                                        {this.state.burnFeeList.length}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="tdright">
                                        Amount in Burn fee boxes:
                                    </td>
                                    <td className="tdleft">
                                        {formatERGAmount(getUtxosListValue(this.state.burnFeeList))} ERG
                                    </td>
                                </tr>
                                <tr>
                                    <td className="tdright">
                                        <input className="btn btn-ultra-voilet" type="submit" value="Collect" onClick={this.collectBurnFee} />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </Fragment>
        )
    }
}

