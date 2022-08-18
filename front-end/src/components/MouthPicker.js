import MouthPickerItem from './MouthPickerItem'

export default function MouthPicker(props) {
    return (
        <tr>
            <td>
                <label htmlFor="ref">Mouth</label>
            </td>
            <td>
                <MouthPickerItem value="1" onChange={props.onChange} selected={props.selected === "1"} />
                <MouthPickerItem value="2" onChange={props.onChange} selected={props.selected === "2"} />
                <MouthPickerItem value="3" onChange={props.onChange} selected={props.selected === "3"} />
                <MouthPickerItem value="4" onChange={props.onChange} selected={props.selected === "4"} />
                <MouthPickerItem value="5" onChange={props.onChange} selected={props.selected === "5"} />
            </td>
        </tr>
    )
}
