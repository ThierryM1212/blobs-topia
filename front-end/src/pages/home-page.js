import React, { Fragment } from 'react';
import MainImage from "../images/illustration_blob_reduced.png";

export default class Home extends React.Component {
    render() {
        return (
            <Fragment>
                <div className='d-flex flex-column align-items-center m-2 p-2'>
                    <img src={MainImage} alt="Blob's Topia" />
                    <div className='d-flex flex-column w-75 m-2 p-2 align-items-center'>
                        <h3>Create a blob and join the fight !</h3>
                    </div>

                </div>
            </Fragment>
        )
    }
}
