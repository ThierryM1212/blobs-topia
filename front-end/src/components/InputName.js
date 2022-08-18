



export default function InputName(props) {
    return (
        <tr>
            <td>
                <label htmlFor="ref" >Name</label>
            </td>
            <td>
                <input className="form-control" id="ref" pattern="[ -~]{0,15}" onChange={props.onChange} value={props.name} />
            </td>
        </tr>
    )
}