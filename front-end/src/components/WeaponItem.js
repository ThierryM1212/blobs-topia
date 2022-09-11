import React, { Fragment } from 'react';
import { BLOB_WEAPONS } from '../utils/items_constants';
import ReactTooltip from "react-tooltip";
import { uuid } from 'uuidv4';


export default class WeaponItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            weaponType: this.props.weaponType ?? 'initial',
            weaponLevel: this.props.weaponLevel ?? 0,
            id: uuid(),
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.weaponType !== this.props.weaponType || prevProps.weaponLevel !== this.props.weaponLevel) {
            this.setState({
                weaponType: this.props.weaponType,
                weaponLevel: this.props.weaponLevel,
            });
        }
    }

    render() {
        const weapon = BLOB_WEAPONS.find(w => w.type === this.state.weaponType && w.lvl === this.state.weaponLevel) ?? BLOB_WEAPONS[0];
        return (
            <Fragment >
                <div className="d-flex flex-column align-items-center">
                    <img className="armor"
                        src={weapon.image}
                        alt={weapon.name}
                        data-tip
                        data-for={this.state.id}
                    />
                    <ReactTooltip id={this.state.id}
                        place="right"
                        effect="solid"
                        data-html={true}
                        delayShow={300}
                        insecure={true}
                        multiline={true}>
                        <div className="d-flex flex-column ">
                            <div className="w-100 d-flex flex-row justify-content-between m-1 p-1">
                                <strong>{weapon.name}</strong>
                                <span>(level {weapon.lvl})</span>
                            </div>
                            <div className="w-100 d-flex flex-row justify-content-between ">
                                <span>Attack power</span><span className='armorValue'>{weapon.attack_power}</span>
                            </div>
                            <div className="w-100 d-flex flex-row justify-content-between ">
                                <span>Defense power</span><span className='armorValue'>{weapon.defense_power}</span>
                            </div>
                            <div className="w-100 d-flex flex-row m-1 p-1 ">
                                <span>{weapon.description}</span>
                            </div>
                        </div>
                    </ReactTooltip>
                </div>
            </Fragment>
        )
    }
}