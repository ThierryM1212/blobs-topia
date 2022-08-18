import { getRandomColor, getRandomBlobShape, getRandomInt } from '../utils/svgUtils';
import ErgBlob from './ErgBlob';

export default function BlobWaitAnim() {
    return (

        <div className="w-100 p-3 divBlobrotate">
            <div className="w-50 ">
                <br />
                <ErgBlob
                    color1={getRandomColor()}
                    color2={getRandomColor()}
                    path={getRandomBlobShape()}
                    eyes_pos={getRandomInt(1, 5).toString()}
                    mouth_type={getRandomInt(1, 5).toString()}
                    name=""
                    rotate={true}
                />
                <br />
            </div>
        </div>

    )
}