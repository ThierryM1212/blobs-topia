
import { BlobMouth } from "./BlobMouth";

export default function EyesPickerItem(props) {
    const pos_eyes_x = 20;
    const pos_eyes_y = 7;
    const eyes_dist = 30;

    return (

        <label className="radio-inline m-0" >
            <div className="card m-1" >
                <input type="radio" name="mouth-item" value={props.value} checked={props.selected} onChange={props.onChange} />
                <div className="shape">
                    <svg width="50px" height="40px" viewBox="0 0 70 50" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                    <BlobMouth
                            mouth_type={props.value}
                            pos_eyes_x={pos_eyes_x}
                            pos_eyes_y={pos_eyes_y}
                            eyes_dist={eyes_dist}
                            />
                    </svg>
                </div>
            </div>
        </label>
    )
}
