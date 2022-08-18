import React from 'react';
import { getBalanceForAddress } from '../ergo-related/explorer';
import { BLOB_SCRIPT_ADDRESS } from '../utils/constants';


export default class AppStatistics extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ergAmount: 0,
            oatmealAmount: 0,
            ergopay: false,
        };
    }


    async componentDidMount() {
        const totalERGInBlobs = await getBalanceForAddress(BLOB_SCRIPT_ADDRESS);
        const numberOfBlobs = 0;

        this.setState({
            ergAmount: nanoERGAmount,
            oatmealAmount: oatmealAmount,
            ergopay: ergopay,
        });
    }

    render() {
        return (
            <div className="d-flex flex-column m-1 p-1">
                
            </div>
        )
    }
}
