#!/usr/bin/env node

var prototype = require('../models/essence');

module.exports = class extends prototype {

    constructor() {

        super();
        this.meta = {
            name: 'Bitmex Driver by Event+',
            id: 'bmxdbe-101',
            version: 1,
            exchange: 'bitmex',
            type: 'exchange'
        }

    }

    init () {

        if ('store' in this.essence) {

            if ('keystore' in this.essence['store']) {

                if ('exchange' in this.essence['store']) {

                    if ('cache' in this.essence['store']) {

                        if ('commutator' in this.essence) {

                            if ('request' in this.essence['commutator']) {

                                let BitMEXClient = require('bitmex-realtime-api');
                                let keystore = this.essence['store']['keystore'];
                                let exchange = this.essence['store']['exchange'];
                                let request = this.essence['commutator']['request'];

                                var buffer = [];
                                var chartData = [];

                                request(`https://www.bitmex.com/api/v1/trade/bucketed?binSize=1m&partial=true&count=${exchange.exchange.count}&symbol=XBTUSD&reverse=true`, (error, response, body) => {

                                    if (response && response.statusCode == 200) {

                                        const data = JSON.parse(body).reverse();
                                        buffer = data;

                                    }

                                });


                                let client = new BitMEXClient({
                                    testnet: keystore.testnet,
                                    maxTableLen: 10000
                                });

                                client.addStream('XBTUSD', 'orderBookL2_25', (data, symbol, tableName) => {

                                    let bufferOrders = {asks: [], bids: []};

                                    for (const iterator of data) {

                                        if (iterator.side == 'Buy') {
                                            bufferOrders.asks.push([
                                                parseFloat(iterator.price),
                                                parseFloat(iterator.size),
                                            ]);
                                        } else {
                                            bufferOrders.bids.push([
                                                parseFloat(iterator.price),
                                                parseFloat(iterator.size),
                                            ]);
                                        }
                                    }

                                    this.call('getOrderBook', {
                                        asks: bufferOrders.asks,
                                        bids: bufferOrders.bids
                                    });

                                });

                                // client.on('initialize', () => {
                                //     console.log(client.streams);  // Log .public, .private and .all stream names
                                // });

                                client.on('error', (event) => {
                                    this.call('error', event);
                                });

                                client.addStream('XBTUSD', 'tradeBin1m', (data, symbol, tableName) => {

                                    if (!data.length) return;

                                    if (Symbol.iterator in Object(data)) {

                                        for (const iterator of data) {
                                            buffer.push(iterator)
                                        }

                                    } else {
                                        buffer.push(data);
                                    }

                                    for (const data of buffer) {

                                        chartData.push ({
                                            time: Date.parse(data.timestamp) / 1000,
                                            open: data.open,
                                            low: data.low,
                                            high: data.high,
                                            close: data.close,
                                            volume: data.volume,
                                        });

                                    }

                                    this.call('getChartForTradingview', chartData);

                                });

                                this.call('init', true);

                            } else {
                                throw 'No request commutator found for driver';
                            }

                        } else {
                            throw 'No commutator found for driver';
                        }

                    } else {
                        throw 'No exchange object found for driver';
                    }

                } else {
                    throw 'No cache storage found for driver caches';
                }

            } else {
                throw 'No key storage found for driver';
            }

        } else {
            throw 'No storage found for driver';
        }

    }

}
