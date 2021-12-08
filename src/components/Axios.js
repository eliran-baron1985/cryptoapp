import React, { Component } from 'react';
import socketIOClient from "socket.io-client";
import ShowInfo from './ShowInfo';
import * as axios from 'axios';

class Axios extends Component {
    socket;
    state = {

        // created arry
        Curencys: [],

    }
    componentDidMount = () => {

        // timeing the call to the server
        this.interval = setInterval(() => {
            // this.setState({ time: Date.now() })
            this.getCurrency();
        }, 6000);

    }
    componentWillUnmount() {
        // call
        clearInterval(this.interval);
    }


    getCurrency = async () => {
        console.error(this.coins.currency)
        // the calling to the api
        const key = "c5a40264c5";
        try {
            return await axios
                .get("https://api.coingecko.com/api/v3/coins/")
                // .get(`https://www.live-rates.com/api/price?key=${key}&rate=EUR_USD,AUD_CAD,BTC_JPY,AUD_NZD,AUD_JPY,AUD_USD,BTC_EUR,BTC_USD,CAD_CHF,CAD_JPY,ETH,EUR_AUD,EUR_CAD,EUR_GBP,EUR_JPY,EUR_NOK,EUR_NZD,EUR_SEK,EUR_USD,GBP_AUD,GBP_CAD,GBP_CHF,GBP_JPY,GBP_NZD,GBP_USD,LTC_Mini,NZD_CAD,NZD_CHF,NZD_JPY,NZD_USD,USD_NOK,USD_SEK,USD_ZAR,XAU_USD`)
                .then(response => {
                    console.log("Res :", response.data)
                    this.setState({ Curencys: response.data })
                })
        } catch (e) {
            console.log(e);
        }
    }

    render() {
        let items = ""
        // the loop for the object
        if (this.state.Curencys) {
            items = this.state.Curencys.map(item => {
                return (

                    <ShowInfo currency={item}></ShowInfo>)
            })
        }
        return (
            // what you see on the html page
            <div>

                <table className="table table-dark">
                    <thead>
                        <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Current Price</th>
                            <th scope="col">Block Time</th>
                        </tr>
                    </thead>
                    {items}
                </table>
            </div>

        )

    }
}






export default Axios