import React, { Fragment } from 'react';
import AppStatistics from '../components/AppStatistics';
import MainImage from "../images/illustration_blob_reduced.png";


export default class Home extends React.Component {
    render() {
        return (
            <Fragment>
                <div className='d-flex flex-column align-items-center m-2 p-2'>
                    <div className='d-flex flex-column w-75'>
                        <img className='rounded-image big-img' src={MainImage} alt="Blob's Topia" />
                    </div>
                    <div className='d-flex flex-column w-75 m-2 p-2 align-items-center'>
                        <button className='btn btn-ultra-blue' onClick={() => {
                            window.open("/create", '_self').focus();
                        }} >Create a blob and join the fight !</button>
                    </div>
                    <AppStatistics />
                </div>
            </Fragment>
        )
    }
}
