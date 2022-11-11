import React from 'react';
import { getBalance, getWalletAddressList } from '../ergo-related/wallet';
import { promptErgAddr, promptErgAddrList } from "../utils/Alerts"
import { OATMEAL_TOKEN_ID, SPICY_OATMEAL_TOKEN_ID } from '../utils/constants';
import { formatERGAmount, formatLongString } from '../utils/utils';
import ergoLogo from "../images/ergo-erg-logo.png";
import oatmealLogo from "../images/oatmeal.png";
import spicyOatmealLogo from "../images/spicy_oatmeal.png";
import ReactTooltip from 'react-tooltip';


export default class InputAddress extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ergAmount: 0,
            oatmealAmount: 0,
            spicyOatmealAmount: 0,
            ergopay: false,
        };
        this.setAddress = this.setAddress.bind(this);
        this.promptErgAddress = this.promptErgAddress.bind(this);
    }

    setAddress(address) {
        const oldAddr = localStorage.getItem('address') ?? '';
        if (oldAddr !== address) {
            localStorage.setItem('address', address);
            window.location.reload();
        }
    };

    async promptErgAddress() {
        const addrList = await getWalletAddressList();
        console.log("addrList", addrList)
        var newAddr = '';
        if (addrList.length > 0) {
            newAddr = await promptErgAddrList(addrList);
        } else {
            newAddr = await promptErgAddr();
        }

        //console.log("promptErgAddress", newAddr);
        if (newAddr) {
            this.setAddress(newAddr)
        }
    }

    async componentDidMount() {

        const nanoERGAmount = await getBalance('ERG');
        const oatmealAmount = await getBalance(OATMEAL_TOKEN_ID);
        const spicyOatmealAmount = await getBalance(SPICY_OATMEAL_TOKEN_ID);
        var ergopay = false;
        if (typeof ergo === 'undefined') {
            ergopay = true;
        }
        //console.log("InputAddress componentDidMount", nanoERGAmount, oatmealAmount)
        this.setState({
            ergAmount: nanoERGAmount,
            oatmealAmount: oatmealAmount,
            spicyOatmealAmount: spicyOatmealAmount,
            ergopay: ergopay,
        });
    }

    render() {
        const address = localStorage.getItem('address') ?? '';
        return (
            <div className="d-flex flex-row m-1 p-1 align-items-center">
                <div className='d-flex flex-column '>
                    <button className="btn btn-ultra-blue m-1" onClick={this.promptErgAddress}>
                        {
                            address === '' ?
                                <div>Set ERG address</div>
                                :
                                <div>
                                    {formatLongString(address, 6)}
                                    {this.state.ergopay ?
                                        <div>ergopay</div>
                                        : null
                                    }
                                </div>
                        }
                    </button>
                </div>
                {
                    address === '' ?
                        null
                        :
                        <div className="zonecard d-flex flex-column m-1 p-1 w-100">
                            <div className="w-100 d-flex flex-row justify-content-between align-items-center">
                                <div >{formatERGAmount(this.state.ergAmount)} </div>
                                &nbsp;
                                <div data-tip data-for="ERG balance">
                                    <img src={ergoLogo} width="20px" heigth="20px" alt="ERG" />
                                </div>
                                <ReactTooltip id="ERG balance"
                                    place="bottom"
                                    effect="solid"
                                    data-html={true}
                                    delayShow={300}
                                    delayHide={300}>
                                    <div className="d-flex flex-column">
                                        ERG balance
                                    </div>
                                </ReactTooltip>
                            </div>
                            <div className="w-100 d-flex flex-row justify-content-between align-items-center">
                                <div ><small>{this.state.oatmealAmount}</small></div>
                                &nbsp;
                                <div data-tip data-for="Oatmeal">
                                <img src={oatmealLogo} width="16px" heigth="16px" alt="Oatmeal" />
                                </div>
                                <ReactTooltip id="Oatmeal"
                                    place="bottom"
                                    effect="solid"
                                    data-html={true}
                                    delayShow={300}
                                    delayHide={300}>
                                    <div className="d-flex flex-column">
                                        <div>Oatmeal tokens</div>
                                        <div>Feed your blob and upgrade its armor</div>
                                    </div>
                                </ReactTooltip>
                            </div>
                            <div className="w-100 d-flex flex-row justify-content-between align-items-center">
                                <div ><small>{this.state.spicyOatmealAmount}</small></div>
                                &nbsp;
                                <div data-tip data-for="Spicy Oatmeal">
                                <img src={spicyOatmealLogo} width="16px" heigth="16px" alt="Oatmeal" />
                                </div>
                                <ReactTooltip id="Spicy Oatmeal"
                                    place="bottom"
                                    effect="solid"
                                    data-html={true}
                                    delayShow={300}
                                    delayHide={300}>
                                    <div className="d-flex flex-column">
                                        <div>Spicy Oatmeal tokens</div>
                                        <div>Used to fight the Blobinator once invocated.</div>
                                    </div>
                                </ReactTooltip>
                            </div>
                        </div>
                }
            </div>
        )
    }
}
