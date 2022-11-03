import React, { Fragment } from 'react';
import { burnReserve } from '../ergo-related/admin_game';


export default class OatmealReserveItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            boxId: props.boxId,
            tokenId: props.tokenId,
            tokenAmount: props.tokenAmount,
            tokenId2: props.tokenId2,
            tokenAmount2: props.tokenAmount2,
        };
    }

    async burn(boxId) {
        return await burnReserve(boxId);
    }

    formatLongString(str) {
        if (str.length > 30) {
            return str.substring(0, 10) + "..." + str.substring(str.length - 10, str.length);
        } else {
            return str;
        }
    }

    render() {
        return (
            <table className="m-1" >
                <tbody>
                    <tr>
                        <td>
                            Box id:
                        </td>
                        <td>
                            {this.formatLongString(this.state.boxId)}
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Token ID:
                        </td>
                        <td>
                            {this.formatLongString(this.state.tokenId)}
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
                    {
                        this.state.tokenAmount2 ?
                            <Fragment>
                                <tr>
                                    <td>
                                        Token ID:
                                    </td>
                                    <td>
                                        {this.formatLongString(this.state.tokenId2)}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        Token amount:
                                    </td>
                                    <td>
                                        {this.state.tokenAmount2}
                                    </td>
                                </tr>
                            </Fragment>
                            : null
                    }
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
