import EyesPickerItem from './EyesPickerItem'

export default function EyesPicker(props) {
    return (
        <tr>
            <td>
                <label htmlFor="ref">Eyes</label>
            </td>
            <td>
                <EyesPickerItem value="1" onChange={props.onChange} selected={props.selected === "1"} />
                <EyesPickerItem value="2" onChange={props.onChange} selected={props.selected === "2"} />
                <EyesPickerItem value="3" onChange={props.onChange} selected={props.selected === "3"} />
                <EyesPickerItem value="4" onChange={props.onChange} selected={props.selected === "4"} />
                <EyesPickerItem value="5" onChange={props.onChange} selected={props.selected === "5"} />
            </td>
        </tr>
    )
}
