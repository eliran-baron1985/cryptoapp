import CanvasJSReact from '../canvasjs.react';
import React, { Component } from 'react';
import updateGraph from './updateGraph';
//var CanvasJSReact = require('./canvasjs.react');
var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

class JSChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            data: {
                labels: ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"],
                datasets: [
                    {
                        data: []
                    }
                ]
            }

        }
    }
    GetData = () => {
        const self = this;

        return fetch(`https://www.live-rates.com/api/price?key=c5a40264c5&rate=EUR_USD,AUD_CAD,BTC_JPY,AUD_NZD,AUD_JPY,AUD_USD,BTC_EUR,BTC_USD,CAD_CHF,CAD_JPY,ETH,EUR_AUD,EUR_CAD,EUR_GBP,EUR_JPY,EUR_NOK,EUR_NZD,EUR_SEK,EUR_USD,GBP_AUD,GBP_CAD,GBP_CHF,GBP_JPY,GBP_NZD,GBP_USD,LTC_Mini,NZD_CAD,NZD_CHF,NZD_JPY,NZD_USD,USD_NOK,USD_SEK,USD_ZAR,XAU_USD`)
            .then((response) => response.json())
            .then((responseJson) => {

                // clone the data from the state
                const dataClone = { ...self.state.data }

                const values = responseJson.map(value => value.IMPORTO);

                dataClone.datasets[0].data = values;

                self.setState({
                    isLoading: false,
                    data: dataClone,
                });

            })
            .catch((error) => {
                console.error(error);
            });
    }
    componentDidMount = () => {
        // timeing the call to the server
        this.interval = setInterval(() => {
            // this.setState({ time: Date.now() })
            // this.getCurrency();
        }, 6000);

    }
    render() {

        const options = {
            animationEnabled: true,
            title: {
                text: "Number of New Customers"
            },
            axisY: {
                title: "Number of Customers",
                includeZero: false
            },
            toolTip: {
                shared: true
            },

            data: [
                {
                    type: "spline",
                    name: "2016",
                    showInLegend: true,
                    dataPoints: [
                        { y: 358, label: "Jan" },
                        { y: 150, label: "Feb" },
                        { y: 152, label: "Mar" },
                        { y: 148, label: "Apr" },
                        { y: 142, label: "May" },
                        { y: 150, label: "Jun" },
                        { y: 146, label: "Jul" },
                        { y: 149, label: "Aug" },
                        { y: 153, label: "Sept" },
                        { y: 158, label: "Oct" },
                        { y: 154, label: "Nov" },
                        { y: 150, label: "Dec" }
                    ]
                },
                {
                    type: "spline",
                    name: "2017",
                    showInLegend: true,
                    dataPoints: [
                        { y: 172, label: "Jan" },
                        { y: 173, label: "Feb" },
                        { y: 175, label: "Mar" },
                        { y: 172, label: "Apr" },
                        { y: 162, label: "May" },
                        { y: 165, label: "Jun" },
                        { y: 172, label: "Jul" },
                        { y: 168, label: "Aug" },
                        { y: 175, label: "Sept" },
                        { y: 170, label: "Oct" },
                        { y: 165, label: "Nov" },
                        { y: 169, label: "Dec" }
                    ]
                }]
        }

        return (

            < div >
                <CanvasJSChart options={options}
                    onRef={ref => this.chart = ref}
                />
                {/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
            </div >
        );
    }
}

export default JSChart