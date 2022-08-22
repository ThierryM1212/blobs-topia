import React, { Fragment } from 'react';
import AppStatistics from '../components/AppStatistics';
import MainImage from "../images/illustration_blob_reduced.png";


export default class Home extends React.Component {
    render() {
        return (
            <Fragment>
                <div className='d-flex flex-column align-items-center m-2 p-2'>
                    <div className='zonecard m-1 p-1'>
                        <h1>BLOB'S TOPIA ALPHA test is OVER</h1>
                        <h2>Wait for Alpha2 or beta test that will come to use the dApp.</h2>
                    </div>
                    <img src={MainImage} alt="Blob's Topia" />
                    <div className='d-flex flex-column w-75 m-2 p-2 align-items-center'>
                        <h3>Create a blob and join the fight !</h3>
                    </div>
                    <AppStatistics />
                </div>
            </Fragment>
        )
    }
}
