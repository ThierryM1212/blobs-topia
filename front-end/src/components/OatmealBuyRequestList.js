import React, { Fragment } from 'react';
import { OATMEAL_BUY_REQUEST_SCRIPT_ADDRESS, OATMEAL_SELL_RESERVE_SCRIPT_ADDRESS } from "../utils/script_constants";
import { getSpentAndUnspentBoxesFromMempool, getUnspentBoxesForAddressUpdated } from '../ergo-related/explorer';
import OatmealBuyRequestItem from './OatmealBuyRequestItem';


export default class OatmealBuyRequestList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            oatmealBuyRequestList: [],
            reRenderKey: props.reRenderKey,
        };
        this.fetchOatmealBuyRequests = this.fetchOatmealBuyRequests.bind(this);
    }

    async componentDidMount() {
        await this.fetchOatmealBuyRequests();
    }

    async componentDidUpdate(prevProps, prevState) {
        if (prevProps.reRenderKey  !== this.props.reRenderKey) {
            this.setState({
                reRenderKey: this.props.reRenderKey,
            })
            await this.fetchOatmealBuyRequests();
        }
    }

    async fetchOatmealBuyRequests() {
        const oatmealBuyRequestBoxesTmp = await getUnspentBoxesForAddressUpdated(OATMEAL_BUY_REQUEST_SCRIPT_ADDRESS);
        // eslint-disable-next-line no-unused-vars
        const [spentBoxes, newBoxes] = await getSpentAndUnspentBoxesFromMempool(OATMEAL_SELL_RESERVE_SCRIPT_ADDRESS);
        const spentBoxIds = spentBoxes.map(box => box.boxId);
        var oatmealBuyRequestBoxes = oatmealBuyRequestBoxesTmp.filter(box => !spentBoxIds.includes(box.boxId));
        this.setState({
            oatmealBuyRequestList: oatmealBuyRequestBoxes,
        })
    }

    render() {
        console.log("OatmealBuyRequestList", this.state.oatmealBuyRequestList)
        return (
            <Fragment >
                <br />
                {
                    this.state.oatmealBuyRequestList.length > 0 ?
                        <Fragment >
                            <h4>
                                Oatmeal buy requests pending
                            </h4>
                            <h6>
                                You can use this screen to process oatmeal buy requests sent by other players (no signing required)... you're the bot.
                            </h6>
                            <div className="w-75 d-flex flex-wrap">
                                {this.state.oatmealBuyRequestList.map(item =>
                                    <OatmealBuyRequestItem
                                        key={item.boxId}
                                        full={item}
                                        updateList={this.fetchOatmealBuyRequests}
                                        showRefund={false}
                                    />
                                )}
                            </div>
                        </Fragment>
                        :
                        <h4>
                            No oatmeal buy requests pending
                        </h4>
                }
            </Fragment>
        )
    }
}