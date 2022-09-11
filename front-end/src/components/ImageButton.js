import React, { Fragment } from 'react';
import ReactTooltip from "react-tooltip";
import { uuid } from 'uuidv4';


export default class ImageButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            action: this.props.action,
            alt: this.props.alt,
            tips: this.props.tips,
            image: this.props.image,
            id: uuid(),
        };
    }


    render() {
        return (
            <Fragment >
                <img className="btn transparent-image"
                    src={this.state.image}
                    onClick={this.state.action}
                    alt={this.props.alt}
                    data-tip
                    data-for={this.state.id}
                />
                <ReactTooltip id={this.state.id}
                    place="top"
                    effect="solid"
                    html={true}
                    delayShow={500}
                    delayHide={300}
                    insecure={true}
                    multiline={true}>
                    {this.state.tips}
                </ReactTooltip>
            </Fragment>
        )
    }
}