import React, { Fragment } from 'react';
import ReactTooltip from "react-tooltip";
import { uuid } from 'uuidv4';


export default class BlobActionButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            action: this.props.action,
            isDisabled: this.props.isDisabled,
            label: this.props.label,
            tips: this.props.tips,
            id: uuid(),
        };
    }


    render() {
        return (
            <Fragment >
                <button className="btn btn-ultra-voilet m-1"
                    onClick={this.state.action}
                    disabled={this.state.isDisabled}
                    data-tip
                    data-for={this.state.id}>
                    {this.state.label}
                </button>
                <ReactTooltip id={this.state.id}
                    place="right"
                    effect="solid"
                    html={true}
                    delayShow={300}
                    delayHide={300}
                    insecure={true}
                    multiline={true}>
                    {this.state.tips}
                </ReactTooltip>
            </Fragment>
        )
    }
}