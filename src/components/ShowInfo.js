import React from 'react'

const ShowInfo = (props) => {
    return (
        <tbody>
            <th scope="row"></th>
            <tr>
                <td>{props.currency.name}</td>
                <td>{props.currency.market_data.current_price.usd}</td>
                <td>{props.currency.block_time_in_minutes}</td>
            </tr>
        </tbody>

    )
}
export default ShowInfo;

