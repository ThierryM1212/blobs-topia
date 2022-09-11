import React, { Fragment } from 'react';
import { BLOB_ARMORS } from '../utils/items_constants';
import ReactTooltip from "react-tooltip";
import { uuid } from 'uuidv4';


export default class ArmorItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            armorLevel: this.props.armorLevel ?? 0,
            id: uuid(),
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.armorLevel !== this.props.armorLevel) {
            this.setState({
                armorLevel: this.props.armorLevel,
            });
        }
    }

    render() {
        const armorLevel = this.state.armorLevel;

        return (

            <Fragment >
                <div className="d-flex flex-column align-items-center">
                    <img className="armor"
                        src={BLOB_ARMORS[armorLevel].image}
                        alt={BLOB_ARMORS[armorLevel].name}
                        data-tip
                        data-for={this.state.id}
                    />
                    <ReactTooltip id={this.state.id}
                        place="right"
                        effect="solid"
                        data-html={true}
                        delayShow={300}
                        delayHide={300}
                        insecure={true}
                        multiline={true}>
                        <div className="d-flex flex-column ">
                            <div className="w-100 d-flex flex-row justify-content-between m-1 p-1">
                                <strong>{BLOB_ARMORS[armorLevel].name}</strong>
                                <span>(level {armorLevel})</span>
                            </div>
                            <div className="w-100 d-flex flex-row justify-content-between ">
                                <span>Attack power</span><span className='armorValue'>{BLOB_ARMORS[armorLevel].attack_power}</span>
                            </div>
                            <div className="w-100 d-flex flex-row justify-content-between ">
                                <span>Defense power</span><span className='armorValue'>{BLOB_ARMORS[armorLevel].defense_power}</span>
                            </div>
                            <div className="w-100 d-flex flex-row m-1 p-1 ">
                                <span>{BLOB_ARMORS[armorLevel].description}</span>
                            </div>
                        </div>
                    </ReactTooltip>
                </div>
            </Fragment>
        )
    }
}