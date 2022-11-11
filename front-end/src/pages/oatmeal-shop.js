import React, { Fragment } from 'react';
import { MIN_NANOERG_BOX_VALUE, OATMEAL_PRICE, TX_FEE } from '../utils/constants';
import { formatERGAmount } from '../utils/utils';
import OatmealBuyRequestList from '../components/OatmealBuyRequestList';
import { createOatmealBuyRequest } from '../ergo-related/blob';
import OatmealSeller from "../images/oatmeal_seller.png";


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
                    <h6>Use Oatmeal to upgrade your armor and weapon</h6>
                    <div className="w-100 zoneabout d-flex flex-row align-items-center">
                        <div className='d-flex flex-column'>
                            <div className='d-flex flex-column m-2 p-2 zoneprice align-items-center'>
                                <br />
                                <div> <strong>{formatERGAmount(OATMEAL_PRICE)} ERG</strong></div>
                                <div> per Oatmeal </div>
                                <br />
                            </div>
                            <div className='d-flex flex-column m-2 p-2  align-items-center'>
                                <input id="oatmealAmount"
                                    type="numeric"
                                    onChange={this.handleChangeOatmealAmount}
                                    value={this.state.oatmealAmount}
                                    autocomplete="off"
                                />
                                {
                                    this.state.oatmealAmount > 0 ?
                                        <div className='d-flex flex-row m-2 p-2'>
                                            <div>Price:&nbsp;</div>
                                            <strong>{formatERGAmount(this.state.oatmealAmount * OATMEAL_PRICE + 2 * TX_FEE)} ERG</strong>
                                        </div>
                                        : <div className='d-flex flex-row m-2 p-2'>
                                            <div>&nbsp;</div>
                                        </div>
                                }
                                <button className="btn btn-ultra-voilet m-1"
                                    onClick={() => this.buy()}
                                    disabled={this.state.oatmealAmount <= 0}>
                                    Buy Oatmeal
                                </button>
                            </div>
                        </div>
                        <img src={OatmealSeller} alt="Oatmeal seller" />
                    </div>
                </div>
                <OatmealBuyRequestList reRenderKey={this.state.reRenderKey} />
            </Fragment>
        )
    }
}