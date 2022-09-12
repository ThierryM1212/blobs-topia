import React, { Fragment } from 'react';
import ReactTooltip from "react-tooltip";
import { Rating } from 'react-simple-star-rating';
import { uuid } from 'uuidv4';
import { RATING_RANGES } from '../utils/constants';
import ProgressBar from 'react-bootstrap/ProgressBar';

export default class BlobRating extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            averagePower: this.props.averagePower ?? 0,

            id: uuid(),
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.averagePower !== this.props.averagePower) {
            this.setState({
                averagePower: this.props.averagePower,
            });
        }
    }

    render() {
        var rating = 0;
        for (const i of RATING_RANGES) {
            if (this.state.averagePower >= i) {
                rating++;
            } else {
                break;
            }
        }

        return (

            <Fragment >
                <div className="d-flex flex-column align-items-center">
                    <div data-tip
                        data-for={this.state.id}>
                        <Rating initialValue={rating}
                            readonly={true}
                            size={20}
                        />
                    </div>
                    <ReactTooltip id={this.state.id}
                        place="top"
                        effect="solid"
                        data-html={true}
                        delayShow={300}
                        delayHide={300}
                        insecure={true}
                        multiline={true}>
                        <div className="d-flex flex-column">
                            <div>Average power: {this.state.averagePower} </div>
                            <div>Next level: {RATING_RANGES[rating]} </div>
                            <ProgressBar now={this.state.averagePower}
                                min={RATING_RANGES[rating - 1]}
                                max={RATING_RANGES[rating]}
                                variant="info"
                            />
                        </div>
                    </ReactTooltip>
                </div>
            </Fragment>
        )
    }
}