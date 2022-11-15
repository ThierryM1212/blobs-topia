import React, { Fragment } from 'react';
import MainImage from "../images/illustration_blob_reduced.png";


export default class Home extends React.Component {
    render() {
        return (
            <Fragment>
                <div className='d-flex flex-column align-items-center m-2 p-2'>
                    <div className='d-flex flex-column w-75'>
                        <img className='rounded-image big-img' src={MainImage} alt="Blob's Topia" />
                    </div>
                    <br/>
                    <div className='zonecard d-flex flex-column m-2 p-2 align-items-start'>
                        <p>Get a Blob fighter smart contract to confront other Blobs and earn ERGs.</p>
                        <p>Improve your statistics and equipment to lead the hall of fame.</p>
                        <p>fight against the terrible Blobinator to get the reward.</p>
                        <p>More info in the <a href="/about" >About</a>.</p>
                    </div>
                    <div className='d-flex flex-column w-75 m-2 p-2 align-items-center'>
                        <button className='btn btn-ultra-blue' onClick={() => {
                            window.open("/create", '_self').focus();
                        }} >Create a blob and join the fight !</button>
                    </div>
                </div>
            </Fragment>
        )
    }
}
