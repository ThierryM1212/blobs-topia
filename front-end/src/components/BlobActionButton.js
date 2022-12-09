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
            image: this.props.image,
            id: uuid(),
        };
    }

    async componentDidUpdate(prevProps, prevState) {
        //console.log("BlobItem componentDidUpdate", prevProps, this.props)
        if (prevProps !== this.props) {
            this.setState({
                action: this.props.action,
                isDisabled: this.props.isDisabled,
                label: this.props.label,
                tips: this.props.tips,
                image: this.props.image,
                id: uuid(),
            })
        }
    }

    render() {
        //console.log("BlobActionButton", this.state);
        return (
            <Fragment >
                {
                    this.state.image ?
                        <div className="zoneupgrade d-flex flex-column justify-content-center" >
                            <img
                                type="image"
                                src={this.state.image}
                                alt={this.state.label}
                                width={30}
                                height={30}
                                className={this.state.isDisabled ? "btn blob-action-button disabled-image" : "btn blob-action-button transparent-image"}
                                data-tip
                                data-for={this.state.id}
                                onClick={this.state.action}
                            />
                        </div>
                        :
                        <button className="btn btn-ultra-voilet m-1"
                            onClick={this.state.action}
                            disabled={this.state.isDisabled}
                            data-tip
                            data-for={this.state.id}>
                            {this.state.label}
                        </button>
                }

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