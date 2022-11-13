import React from 'react';
import ErgBlob from './ErgBlob';
import { SketchPicker } from 'react-color'
import reactCSS from 'reactcss'
import EyesPicker from './EyesPicker';
import MouthPicker from './MouthPicker';
import InputName from './InputName';
import { getRandomColor, getRandomInt, getRandomBlobShape } from '../utils/svgUtils';
import { NANOERG_TO_ERG, BLOB_PRICE, BLOB_MINT_FEE, TX_FEE } from '../utils/constants';
import { createBlobRequest } from '../ergo-related/blob';

class BlobEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showPicker1: false,
            showPicker2: false,
            path: getRandomBlobShape(),
            color1: getRandomColor(),
            color2: getRandomColor(),
            eyes_pos: getRandomInt(1, 5).toString(),
            mouth_type: getRandomInt(1, 4).toString(),
            name: "Choose me a name"
        };
        this.onChange1 = this.onChange1.bind(this);
        this.onChange2 = this.onChange2.bind(this);
        this.onChangeEyes = this.onChangeEyes.bind(this);
        this.onChangeName = this.onChangeName.bind(this);
        this.onChangeMouth = this.onChangeMouth.bind(this);
    }

    onClick1 = () => {
        this.setState({
            showPicker1: !this.state.showPicker1
        })
    };

    onClick2 = () => {
        this.setState({
            showPicker2: !this.state.showPicker2
        })
    };

    onClose = () => {
        this.setState({
            showPicker1: false,
            showPicker2: false
        })
    };

    onChange1 = (color) => {
        this.setState({
            color1: color.hex
        });
        //console.log("onChange1");
    };

    onChange2 = (color) => {
        this.setState({
            color2: color.hex
        });
        //console.log("onChange2");
    };

    onChangeEyes = (e) => {
        this.setState({
            eyes_pos: e.target.value
        });
    };

    onChangeMouth = (e) => {
        this.setState({
            mouth_type: e.target.value
        });
        //console.log("onChangeMouth", e);
    };

    onChangeName = (e) => {
        this.setState({
            name: e.target.value
        });
        //console.log("onChangeName", e);
    };

    async mintBlob(name, color1, color2, eyes_pos, mouth_type, svgPath) {
        await createBlobRequest(name, color1, color2, eyes_pos, mouth_type, svgPath);
        //window.open("/myblobs", "_self");
    }

    render() {
        const styles = reactCSS({
            'default': {
                color1: {
                    width: '40px',
                    height: '15px',
                    borderRadius: '3px',
                    background: `${this.state.color1}`,
                },
                color2: {
                    width: '40px',
                    height: '15px',
                    borderRadius: '3px',
                    background: `${this.state.color2}`,
                },
                popover: {
                    position: 'absolute',
                    zIndex: '3',
                },
                cover: {
                    position: 'fixed',
                    top: '0px',
                    right: '0px',
                    bottom: '0px',
                    left: '0px',
                },
                swatch: {
                    padding: '6px',
                    background: '#ffffff',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    display: 'inline-block',
                    boxShadow: '0 0 0 1px rgba(0,0,0,.2)',
                },
            },
        });

        return (
            <div className="container-sm w-75 ">
                <br />

                <div className="row w-100 justify-content-center">
                    <div className="m-2 p-2" >
                        <ErgBlob
                            color1={this.state.color1}
                            color2={this.state.color2}
                            path={this.state.path}
                            eyes_pos={this.state.eyes_pos}
                            mouth_type={this.state.mouth_type}
                            name={this.state.name}
                        />
                    </div>
                </div>

                <div className="card zonecard w-100 p-2">
                    <table>
                        <tbody>
                            <InputName
                                onChange={this.onChangeName}
                                value={this.state.name} />
                            <tr>
                                <td>
                                    <label htmlFor="color1">Color top</label>
                                </td>
                                <td>
                                    <div style={styles.swatch} onClick={this.onClick1}>
                                        <div style={styles.color1} />
                                    </div>
                                    {this.state.showPicker1 ? <div style={styles.popover} >
                                        <div style={styles.cover} onClick={this.onClose} />
                                        <SketchPicker id="color1" color={this.state.color1} onChange={this.onChange1} />
                                    </div> : null}
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <label htmlFor="color2">Color bottom</label>
                                </td>
                                <td>
                                    <div style={styles.swatch} onClick={this.onClick2}>
                                        <div style={styles.color2} />
                                    </div>
                                    {this.state.showPicker2 ? <div style={styles.popover}>
                                        <div style={styles.cover} onClick={this.onClose} />
                                        <SketchPicker id="color2" color={this.state.color2} onChange={this.onChange2} />
                                    </div> : null}
                                </td>
                            </tr>

                            <EyesPicker selected={this.state.eyes_pos} onChange={this.onChangeEyes} />

                            <MouthPicker selected={this.state.mouth_type} onChange={this.onChangeMouth} />

                            <tr>
                                <td>
                                    &nbsp;
                                </td>
                                <td >
                                    <button className="btn btn-ultra-blue"
                                        onClick={(e) => {
                                            this.setState({
                                                path: getRandomBlobShape(),
                                                color1: getRandomColor(),
                                                color2: getRandomColor(),
                                                eyes_pos: getRandomInt(1, 5).toString(),
                                                mouth_type: getRandomInt(1, 4).toString(),
                                                name: this.state.name
                                            })
                                        }}>
                                        Random Blob
                                    </button>
                                    &nbsp;
                                    <button className="btn btn-ultra-blue"
                                        onClick={(e) => {
                                            this.setState({
                                                path: getRandomBlobShape(),
                                            })
                                        }}>
                                        Random Shape
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    &nbsp;
                                </td>
                                <td >
                                    <button className="btn btn-ultra-voilet"
                                        onClick={() => this.mintBlob(
                                            this.state.name.trim(),
                                            this.state.color1,
                                            this.state.color2,
                                            this.state.eyes_pos,
                                            this.state.mouth_type,
                                            this.state.path
                                        )}
                                        disabled={this.state.name === "Choose me a name" || this.state.name.trim().length < 3}
                                    >
                                        Mint this Blob ({(BLOB_PRICE/NANOERG_TO_ERG).toFixed(4)} ERG)*
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    &nbsp;
                                </td>
                                <td >
                                    <h6>* dApp Mint fee {(BLOB_MINT_FEE/NANOERG_TO_ERG).toFixed(4)} ERG</h6>
                                    <h6>&nbsp;&nbsp;Miner fee {(TX_FEE/NANOERG_TO_ERG).toFixed(4)} ERG</h6>
                                    <h6>&nbsp;&nbsp;Blob credited with {((BLOB_PRICE - BLOB_MINT_FEE - TX_FEE)/NANOERG_TO_ERG).toFixed(4)} ERG</h6>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}

export default BlobEditor