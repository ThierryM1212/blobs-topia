import React from 'react';
import { useParams } from 'react-router-dom';
import OneBlobPage from '../pages/one-blob';

const OneBlobWrapper = () => {
    const { id } = useParams();
    return <div>
        {id ? <OneBlobPage blobId={id} /> : null}
    </div>
}

export default OneBlobWrapper;