#!/usr/bin/env node

const request = require('request');
const BitMEXClient = require('bitmex-realtime-api');
const cache = require("cache");
const c = new cache(15 * 60 * 1000);

module.exports = class {

    constructor(ccxt=null, io=null, yaml=null, redis=null) {

        const this_ = this;

        this.data = {};
        this.meta = {
            name: 'Bitmex Driver by Event+',
            id: 'bmxdbe-101',
            version: 1,
            exchange: 'bitmex'
        }

        this.ccxt = ccxt;
        this.actions = [];
        this.keystore = yaml('keystore.yaml');
        this.exchange = yaml('exchange.yaml');
        this.client = new BitMEXClient({
            testnet: this.keystore.bitmex.testnet,
            maxTableLen: 10000
        });


    }

    on (action='default', callback=null) {
        return this.actions.push({
            action: action,
            function: callback
        });
    }

    call (action='default', data) {
        for (const callback of this.actions) {
            if (action === callback.action) {
                try {
                    callback.function(data)
                } catch (e) {
                    console.error(e)
                }
            }
        }
    }

    init () {

        this.client.on('initialize', () => {

            const this_ = this;

            request(`https://www.bitmex.com/api/v1/trade/bucketed?binSize=1m&partial=true&count=300&symbol=XBTUSD&reverse=true`, function (error, response, body) {
                if (response && response.statusCode == 200) {
                    const data = JSON.parse(body).reverse();
                    var history = data;
                    var chartData = [];

                    for (const bar of history) {
                        chartData.push ({
                            time: Date.parse(bar.timestamp) / 1000,
                            open: bar.open,
                            low: bar.low,
                            high: bar.high,
                            close: bar.close,
                            volume: bar.volume,
                        });
                    }

                    this_.call('getChartForTradingview', chartData);
                    this_.call('getChart', data);

                    this_.client.addStream('XBTUSD', 'tradeBin1m', function (data, symbol, tableName) {
                        if (!data.length) return;

                        for (const bar of data) {
                            chartData.push ({
                                time: Date.parse(bar.timestamp) / 1000,
                                open: bar.open,
                                low: bar.low,
                                high: bar.high,
                                close: bar.close,
                                volume: bar.volume,
                            });
                        }

                        this_.call('getChartForTradingview', chartData);
                        this_.call('getChart', data);

                    });

                }
            });

            this_.call('init', true);

        });

    }

}