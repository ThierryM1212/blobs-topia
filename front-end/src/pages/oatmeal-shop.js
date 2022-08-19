import React, { Fragment } from 'react';
import { MIN_NANOERG_BOX_VALUE, OATMEAL_PRICE, TX_FEE } from '../utils/constants';
import oatmealLogo from "../images/oatmeal.png";
import { formatERGAmount } from '../utils/utils';
import OatmealBuyRequestList from '../components/OatmealBuyRequestList';
import { createOatmealBuyRequest } from '../ergo-related/blob';


export default class OatmealShopPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            oatmealAmount: 0,
            reRenderKey: 0,
        };
        this.handleChangeOatmealAmount = this.handleChangeOatmealAmount.bind(this);
        this.buy = this.buy.bind(this);
    }

    handleChangeOatmealAmount = (e) => {
        this.setState({
            oatmealAmount: e.target.value
        });
    };

    async buy() {
        console.log('buy');
        await createOatmealBuyRequest(this.state.oatmealAmount * OATMEAL_PRICE + 2 * TX_FEE + MIN_NANOERG_BOX_VALUE);
        this.setState({
            reRenderKey: this.state.reRenderKey + 1,
        });
    }

    render() {
        return (
            <Fragment >
                <div className="w-75 d-flex flex-column align-items-center m-2 p-2">
                    <h4>Buy oatmeal</h4>
                    <h6>Use Oatmeal to feed your blobs and increase their power !</h6>
                    <h6>1 Oatmeal token for 1 attack point or 1 defense point</h6>
                    <div className="w-100 zoneabout d-flex flex-column align-items-start m-2 p-2">
                        <table>
                            <tbody>
                                <tr>
                                    <td>
                                        <h6>Price</h6>
                                    </td>
                                    <td>
                                        <h6><strong>{formatERGAmount(OATMEAL_PRICE)} ERG</strong> per Oatmeal token
                                            <img src={oatmealLogo} width="20px" heigth="20px" alt="Oatmeal" />
                                        </h6>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        Amount
                                    </td>
                                    <td>
                                        <input id="oatmealAmount"
                                            type="numeric"
                                            onChange={this.handleChangeOatmealAmount}
                                            value={this.state.oatmealAmount}
                                        />
                                    </td>
                                </tr>
                                {
                                    this.state.oatmealAmount > 0 ?
                                        <tr>
                                            <td>
                                                Total cost
                                            </td>
                                            <td>
                                                <strong>{formatERGAmount(this.state.oatmealAmount * OATMEAL_PRICE + 2 * TX_FEE)} ERG</strong>
                                            </td>
                                        </tr>
                                        : null
                                }
                                <tr>
                                    <td>

                                    </td>
                                    <td>
                                        <button className="btn btn-ultra-voilet m-1"
                                            onClick={() => this.buy()}
                                            disabled={this.state.oatmealAmount <= 0}>
                                            Buy
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <OatmealBuyRequestList reRenderKey={this.state.reRenderKey}/>
            </Fragment>
        )
    }
}