import React from 'react';
import { DEFAULT_EXPLORER_ADDRESS } from '../utils/constants';

export class ExplorerLink extends React.Component {
    render() {
        const script_address = this.props.address;
        const label = this.props.label;
        return (
            <div className='btn '>
                <a href={`${DEFAULT_EXPLORER_ADDRESS}en/addresses/${script_address}`} target="_blank" rel="noreferrer">{label}</a>
            </div>
        )
    }
}
