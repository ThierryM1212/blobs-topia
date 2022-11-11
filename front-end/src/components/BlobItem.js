import React, { Fragment } from 'react';
import ErgBlob from './ErgBlob';
import { confirmAlert, copySuccess, promptFeedAmount } from '../utils/Alerts';
import { NANOERG_TO_ERG } from '../utils/constants';
import { BLOB_ARMORS, WEAPONS_UPGRADE_PRICES } from '../utils/items_constants';
import { decodeString, ergoTreeToAddress } from '../ergo-related/serializer';
import { addWidthDrawBlob, buyBlob, feedBlob, killBlob, setBlobStatus } from '../ergo-related/blob';
import { BlobState } from './BlobState';
import { formatERGAmount, formatLongString, getBlobPowers } from '../utils/utils';
import CopyIcon from '../images/outline_content_copy_black_24dp.png';
import OpenAction from '../images/outline_keyboard_double_arrow_right_black_24dp.png';
import CloseAction from '../images/outline_keyboard_double_arrow_left_black_24dp.png';
import PhotoIcon from '../images/outline_photo_camera_black_24dp.png';
import UpgradeIcon from '../images/outline_upgrade_white_24dp.png';
import SwordsIcon from '../images/swords.png';
import FeedIcon from '../images/outline_restaurant_white_24dp.png';
import BlobinatorIcon from '../images/outline_sports_mma_white_24dp.png';
import AddERGIcon from '../images/Add_ERG.png';
import WithdrawERGIcon from '../images/withdraw_ERG.png';
import CancelIcon from '../images/outline_close_white_24dp.png';
import BuyIcon from '../images/outline_shopping_cart_white_24dp.png';
import ArmorItem from './ArmorItem';
import BlobActionButton from './BlobActionButton';
import exportAsImage from '../utils/exportAsImage';
import ImageButton from './ImageButton';
import WeaponItem from './WeaponItem';
import BlobRating from './BlobRating';


export default class BlobItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            blobBoxJSON: props.blobBoxJSON,
            path: '',
            color1: '',
            color2: '',
            eyes_pos: 0,
            mouth_type: 0,
            name: '',
            info: [],
            power: 0,
            defense: 0,
            state: ['0', '0'],
            updateList: props.updateList,
            blobId: '0',
            showActions: props.showActions ?? false,
            ownerAddress: '',
            averagePower: 0,
            disableActions: props.disableActions ?? false,
            showStatus: props.showStatus ?? true,
            showOwner: props.showOwner ?? false,
        };
        this.toggleActions = this.toggleActions.bind(this);
        this.blobRef = React.createRef();
    }

    async componentDidUpdate(prevProps, prevState) {
        //console.log("BlobItem componentDidUpdate", prevProps, this.props)
        if (prevProps.blobBoxJSON.boxId !== this.props.blobBoxJSON.boxId) { await this.updateBlob(this.props.blobBoxJSON); }
    }

    async updateBlob(box) {

        //console.log("blobBoxJSON", box)
        const desc = await decodeString(box.additionalRegisters.R4.serializedValue);
        const descArray = desc.toString().split(":");
        const [power, defense] = getBlobPowers(box.additionalRegisters.R5.renderedValue);
        const ownerAddress = await ergoTreeToAddress("00" + box.additionalRegisters.R6.serializedValue);

        this.setState({
            boxId: box.boxId,
            path: descArray[5],
            color1: '#' + descArray[1],
            color2: '#' + descArray[2],
            eyes_pos: descArray[3],
            mouth_type: descArray[4],
            name: descArray[0],
            info: JSON.parse(box.additionalRegisters.R5.renderedValue),
            power: power,
            defense: defense,
            blobId: box.additionalRegisters.R9.renderedValue,
            state: [box.additionalRegisters.R7.renderedValue, box.additionalRegisters.R8.renderedValue],
            ownerAddress: ownerAddress,
            showActions: this.state.showActions,
        })
    }

    async componentDidMount() {
        await this.updateBlob(this.state.blobBoxJSON);
    }

    async kill(blobBoxJSON) {
        const ergAmount = formatERGAmount(blobBoxJSON.value);
        const res = await confirmAlert("Are you sure you want to kill " + this.state.name + "?",
            ergAmount + " will be returned to " + this.state.ownerAddress + " and the blob fighter will be destroyed.", "Yes", "No")
        if (!res.isConfirmed) {
            return;
        }
        await killBlob(blobBoxJSON);
        await this.state.updateList();
    }

    async addWidthDraw(mode, blobBoxJSON) {
        await addWidthDrawBlob(mode, blobBoxJSON);
        await this.state.updateList();
    }

    async buy(blobBoxJSON) {
        const blobPrice = formatERGAmount(this.state.state[1]);
        const res = await confirmAlert("Are you sure you want to buy " + this.state.name + " ?",
            "Price: " + blobPrice + " ERGs.", "Yes", "No")
        if (!res.isConfirmed) {
            return;
        }
        await buyBlob(blobBoxJSON);
        await this.state.updateList();
    }

    async setStatus(mode, blobBoxJSON) {
        await setBlobStatus(mode, blobBoxJSON);
        await this.state.updateList();
    }

    async feed(blobBoxJSON) {
        const [defAmount, attAmount] = await promptFeedAmount();
        await feedBlob(blobBoxJSON, 'feed', defAmount, attAmount);
        await this.state.updateList();
    }

    async upgradeArmor(blobBoxJSON) {
        await feedBlob(blobBoxJSON, 'armor');
        await this.state.updateList();
    }

    async chooseWeapon(blobBoxJSON) {
        await feedBlob(blobBoxJSON, 'choose weapon');
        await this.state.updateList();
    }

    async upgradeWeapon(blobBoxJSON) {
        await feedBlob(blobBoxJSON, 'upgrade weapon');
        await this.state.updateList();
    }

    toggleActions() {
        this.setState({
            showActions: !this.state.showActions,
        })
    }

    render() {
        const ownBlob = (this.state.ownerAddress === localStorage.getItem('address'));
        const currentArmorLevel = this.state.info[4];
        var upgradeArmorTips = "Cannot be upgraded.";
        if (currentArmorLevel < BLOB_ARMORS.length - 1) {
            upgradeArmorTips = 'Upgrade the armor of the blob to the level ' + (currentArmorLevel + 1) + ', '
                + BLOB_ARMORS[currentArmorLevel + 1].name
                + '.<br />Requires ' + BLOB_ARMORS[currentArmorLevel + 1].oatmeal_price
                + ' Oatmeal tokens.';
        }
        var currentWeaponType = this.state.info[5], currentWeaponLevel = this.state.info[6];
        var upgradeWeaponTips = "Cannot be upgraded."
        if (currentWeaponLevel < WEAPONS_UPGRADE_PRICES.length - 1) {
            upgradeWeaponTips = 'Upgrade the weapon of the blob to the level ' + (currentWeaponLevel + 1)
                + '.<br />Requires ' + WEAPONS_UPGRADE_PRICES[currentWeaponLevel + 1]
                + ' Oatmeal tokens.';
        }
        var chooseWeaponTips = 'Choose a weapon type for the blob, it will start at level 0'
            + '.<br />Requires ' + WEAPONS_UPGRADE_PRICES[0]
            + ' Oatmeal tokens.';
        const fightTips = 'Choose a fight bet amount (min 0.1 ERG) and set the blob in the state "Ready to fight" another Blob.';
        const feedTips = 'Feed the blob with Oatmeal tokens.<br />Increase its attack level and defense level.';
        const blobinatorTips = 'Set the state to "Ready to fight the blobinator"';
        const depositTips = 'Add ERGs to the blob to play with.';
        const withdrawTips = "Widthdraw ERGs from the blob to the owner address.";

        return (
            <div className="zonecard d-flex flex-row m-1 p-1 align-items-center" >
                <div className="d-flex flex-column zoneblob " ref={this.blobRef} >
                    <div className="d-flex flex-row justify-content-between w-100">
                        <BlobRating averagePower={(this.state.power + this.state.defense) / 2} />
                        <div className="d-flex flex-row align-items-end">
                            <ImageButton action={() => exportAsImage(this.blobRef.current, this.state.name + "_" + (new Date().toISOString()).slice(0, -5))}
                                alt="photo"
                                tips={"Get a selfie"}
                                image={PhotoIcon} />
                            {
                                this.state.disableActions ? null :
                                    this.state.showActions ?
                                        <ImageButton action={this.toggleActions}
                                            alt="toggleActions"
                                            tips={"Toggle action buttons"}
                                            image={CloseAction} />
                                        :
                                        <ImageButton action={this.toggleActions}
                                            alt="toggleActions"
                                            tips={"Toggle action buttons"}
                                            image={OpenAction} />
                            }
                        </div>
                    </div>
                    <ErgBlob key={"ergblob" + this.state.boxId}
                        color1={this.state.color1}
                        color2={this.state.color2}
                        path={this.state.path}
                        eyes_pos={this.state.eyes_pos}
                        mouth_type={this.state.mouth_type}
                        name={this.state.name}
                    />
                    {
                        this.state.disableActions ? null :
                            <div className="w-100 d-flex flex-row justify-content-center p-1" >
                                {
                                    ownBlob ?
                                        <Fragment>

                                            <BlobActionButton
                                                image={SwordsIcon}
                                                action={() => this.setStatus('fight', this.state.blobBoxJSON)}
                                                isDisabled={this.state.state[0] !== '0'}
                                                label="Upgrade weapon"
                                                tips={fightTips} />
                                            <BlobActionButton
                                                image={BlobinatorIcon}
                                                action={() => this.setStatus('blobinator', this.state.blobBoxJSON)}
                                                isDisabled={this.state.state[0] !== '0'}
                                                label="Fight the Blobinator"
                                                tips={blobinatorTips} />
                                            <BlobActionButton
                                                image={FeedIcon}
                                                action={() => this.feed(this.state.blobBoxJSON)}
                                                isDisabled={this.state.state[0] !== '0'}
                                                label="Feed"
                                                tips={feedTips} />
                                            <BlobActionButton
                                                image={AddERGIcon}
                                                action={() => this.addWidthDraw('add', this.state.blobBoxJSON)}
                                                isDisabled={this.state.state[0] !== '0'}
                                                label="Deposit"
                                                tips={depositTips} />
                                            <BlobActionButton
                                                image={WithdrawERGIcon}
                                                action={() => this.addWidthDraw('widthdraw', this.state.blobBoxJSON)}
                                                isDisabled={this.state.state[0] !== '0'}
                                                label="Withdraw"
                                                tips={withdrawTips} />
                                            <BlobActionButton
                                                image={CancelIcon}
                                                action={() => this.setStatus('reset', this.state.blobBoxJSON)}
                                                isDisabled={!(this.state.state[0] === '1' || this.state.state[0] === '4' || this.state.state[0] === '2')}
                                                label="Cancel state"
                                                tips="Set the blob back to Quiet state, cancel the current state." />
                                        </Fragment>
                                        :
                                        <Fragment>
                                            <BlobActionButton
                                                image={BuyIcon}
                                                action={() => this.buy(this.state.blobBoxJSON)}
                                                isDisabled={this.state.state[0] !== '2'}
                                                label="Buy"
                                                tips={'Buy this blob for ' + formatERGAmount(this.state.state[1]) + ' ERG'}
                                            />
                                        </Fragment>
                                }
                            </div>

                    }

                    <div className="d-flex flex-row justify-content-between m-2">
                        <div></div>
                        <div className="d-flex flex-row">
                            <ArmorItem armorLevel={currentArmorLevel} />
                            {
                                this.state.disableActions ? null :
                                    <div>
                                        {
                                            this.state.state[0] !== '0' || currentArmorLevel >= BLOB_ARMORS.length - 1 ?
                                                <BlobActionButton
                                                    image={UpgradeIcon}
                                                    isDisabled={this.state.state[0] !== '0' || currentArmorLevel >= BLOB_ARMORS.length - 1}
                                                    label="Upgrade armor"
                                                    tips={upgradeArmorTips} />
                                                :
                                                <BlobActionButton
                                                    image={UpgradeIcon}
                                                    action={() => this.upgradeArmor(this.state.blobBoxJSON)}
                                                    isDisabled={this.state.state[0] !== '0' || currentArmorLevel >= BLOB_ARMORS.length - 1}
                                                    label="Upgrade armor"
                                                    tips={upgradeArmorTips} />
                                        }
                                    </div>

                            }
                        </div>
                        <div>&nbsp;</div>
                        <div className="d-flex flex-row">
                            <WeaponItem weaponType={currentWeaponType} weaponLevel={currentWeaponLevel} />
                            {
                                this.state.disableActions ? null :
                                    <div>
                                        {
                                            currentWeaponType === 0 ?
                                                <BlobActionButton
                                                    image={UpgradeIcon}
                                                    action={() => this.chooseWeapon(this.state.blobBoxJSON)}
                                                    isDisabled={this.state.state[0] !== '0'}
                                                    label="Choose weapon"
                                                    tips={chooseWeaponTips} />
                                                :
                                                <BlobActionButton
                                                    image={UpgradeIcon}
                                                    action={() => this.upgradeWeapon(this.state.blobBoxJSON)}
                                                    isDisabled={this.state.state[0] !== '0' || currentWeaponLevel === 3}
                                                    label="Upgrade weapon"
                                                    tips={upgradeWeaponTips} />
                                        }
                                    </div>
                            }
                        </div>
                        <div></div>
                    </div>

                    <div className="border-white d-flex flex-column align-items-center p-2" >
                        <div className="d-flex flex-row justify-content-between w-100">
                            <div><strong>Value</strong></div>
                            <div><strong>{parseInt(this.state.blobBoxJSON.value) / NANOERG_TO_ERG} ERG</strong></div>
                        </div>
                        <div className="d-flex flex-row justify-content-between w-100">
                            <div><strong>Attack power</strong></div>
                            <div><strong>{this.state.power}</strong></div>
                        </div>
                        <div className="d-flex flex-row justify-content-between w-100">
                            <div><strong>Defense power</strong></div>
                            <div><strong>{this.state.defense}</strong></div>
                        </div>
                        <div className="d-flex flex-row justify-content-between w-100">
                            <div>Attack</div>
                            <div>{this.state.info[0]}</div>
                        </div>
                        <div className="d-flex flex-row justify-content-between w-100">
                            <div>Defense</div>
                            <div>{this.state.info[1]}</div>
                        </div>
                        <div className="d-flex flex-row justify-content-between w-100">
                            <div>Fights</div>
                            <div>{this.state.info[2]}</div>
                        </div>
                        <div className="d-flex flex-row justify-content-between w-100">
                            <div>Victories</div>
                            <div>{this.state.info[3]}</div>
                        </div>
                        <div className="d-flex flex-row justify-content-between w-100">
                            <div>ID</div>
                            <div>{this.state.blobId}</div>
                        </div>
                        {this.state.showStatus ?
                            <BlobState state={this.state.state[0]} stateValue={this.state.state[1]} />
                            : null
                        }
                        {
                            this.state.showOwner ?
                                <div className="m-2 d-flex flex-row justify-content-between w-100">
                                    <div >{formatLongString(this.state.ownerAddress, 5)}</div>
                                    <img className="transparent-image" src={CopyIcon} alt="copy" onClick={() => {
                                        navigator.clipboard.writeText(this.state.ownerAddress);
                                        copySuccess();
                                    }} />
                                </div>
                                : null
                        }
                    </div>

                </div>

                {
                    this.state.showActions ?
                        <div className="d-flex flex-column " >
                            {
                                ownBlob ?
                                    <Fragment>

                                        <BlobActionButton
                                            action={() => this.addWidthDraw('add', this.state.blobBoxJSON)}
                                            isDisabled={this.state.state[0] !== '0'}
                                            label="Deposit"
                                            tips={depositTips} />
                                        <BlobActionButton
                                            action={() => this.addWidthDraw('widthdraw', this.state.blobBoxJSON)}
                                            isDisabled={this.state.state[0] !== '0'}
                                            label="Widthdraw"
                                            tips={withdrawTips} />
                                        <BlobActionButton
                                            action={() => this.setStatus('sell', this.state.blobBoxJSON)}
                                            isDisabled={this.state.state[0] !== '0'}
                                            label="Sell"
                                            tips="Try to sell the blob to another player for a fixed price." />
                                        <BlobActionButton
                                            action={() => this.setStatus('reset', this.state.blobBoxJSON)}
                                            isDisabled={this.state.state[0] !== '2'}
                                            label="Cancel sell"
                                            tips="Cancel the sale of this blob." />
                                        <BlobActionButton
                                            action={() => this.setStatus('fight', this.state.blobBoxJSON)}
                                            isDisabled={this.state.state[0] !== '0'}
                                            label="Fight"
                                            tips={fightTips} />
                                        <BlobActionButton
                                            action={() => this.setStatus('reset', this.state.blobBoxJSON)}
                                            isDisabled={!(this.state.state[0] === '1' || this.state.state[0] === '4')}
                                            label="Cancel fight"
                                            tips='Remove the "ready to fight" state from this blob.' />
                                        <BlobActionButton
                                            action={() => this.feed(this.state.blobBoxJSON)}
                                            isDisabled={this.state.state[0] !== '0'}
                                            label="Feed"
                                            tips={feedTips} />
                                        <BlobActionButton
                                            action={() => this.upgradeArmor(this.state.blobBoxJSON)}
                                            isDisabled={this.state.state[0] !== '0' && currentArmorLevel < BLOB_ARMORS.length - 1}
                                            label="Upgrade armor"
                                            tips={upgradeArmorTips} />
                                        <BlobActionButton
                                            action={() => this.upgradeWeapon(this.state.blobBoxJSON)}
                                            isDisabled={this.state.state[0] !== '0' || currentWeaponType === 0 || currentWeaponLevel === 3}
                                            label="Upgrade weapon"
                                            tips={upgradeWeaponTips} />
                                        <BlobActionButton
                                            action={() => this.chooseWeapon(this.state.blobBoxJSON)}
                                            isDisabled={this.state.state[0] !== '0'}
                                            label={currentWeaponType === 0 ? "Choose weapon" : "Change weapon"}
                                            tips={chooseWeaponTips} />
                                        <BlobActionButton
                                            action={() => this.setStatus('blobinator', this.state.blobBoxJSON)}
                                            isDisabled={this.state.state[0] !== '0'}
                                            label="Fight a Blobinator"
                                            tips={blobinatorTips} />
                                        <BlobActionButton
                                            action={() => this.kill(this.state.blobBoxJSON)}
                                            isDisabled={this.state.state[0] !== '0'}
                                            label="Kill the Blob"
                                            tips="Destroy the blob and returns its value to the owner. <br /> Cannot be undone." />
                                    </Fragment>
                                    :
                                    <Fragment>
                                        <BlobActionButton
                                            action={() => this.buy(this.state.blobBoxJSON)}
                                            isDisabled={this.state.state[0] !== '2'}
                                            label="Buy"
                                            tips={'Buy this blob for ' + formatERGAmount(this.state.state[1]) + ' ERG'}
                                        />
                                    </Fragment>
                            }
                        </div>
                        : null
                }

            </div>
        )
    }
}