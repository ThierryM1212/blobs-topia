import React, { Fragment } from 'react';
import AppStatistics from '../components/AppStatistics';
import MainImage from "../images/illustration_blob_reduced.png";
import telegramLogo from "../images/telegram_logo.png";


export default class Home extends React.Component {
    render() {
        return (
            <Fragment>
                <div className='d-flex flex-column align-items-center m-2 p-2'>
                    <div className='zonecard m-1 p-1'>
                        <h1>BLOB'S TOPIA ALPHA version</h1>
                        <h2>All blobs created during the alpha test won't be usable at the end of the test.</h2>
                        <h2>Please check Telegram for the dates: &nbsp;
                            <a href="https://t.me/BlobsTopia" target="_blank" rel="noreferrer">
                                <img src={telegramLogo} width="20" height="20" className="d-inline-block align-top" alt="telegram" />
                            </a>
                        </h2>
                        <h2>Best testers will be rewarded with official Oatmeal tokens at the game launch.</h2>
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
