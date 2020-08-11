#!/usr/bin/env node

var ccxt = require ('ccxt');
var www = require('./bin/www');
var feed = require('./bin/feed');
var market = require('./bin/coingecko');
var yaml = require('./bin/yaml');
var client = require('./bin/redis')();
var io = require('./bin/socket')(www);

var processor = {
    indicators: new (require('./processor/indicators'))(yaml('./exchange.yaml'))
};

var drivers = {
    bybit: new (require('./drivers/bybit')) (ccxt, io, yaml, client),
    deribit: new (require('./drivers/deribit')) (ccxt, io, yaml, client)
}

var transport = {
    indicators: new (require('./transport/indicators'))(drivers)
}

/**
 * Installation of Redis event handler
 */

client.on("error", function(error) {
    console.error('[REDIS]', error);
})

client.on("connect", function() {
    console.log('[REDIS]', "You are now connected");
});

io.on('connection', (socket) => {

    socket.on ('bybitMarkets', (e) => {
        io.emit('bybitMarkets', JSON.stringify(drivers.bybit.data.markets));
    });

    socket.on ('deribitMarkets', (e) => {
        io.emit('deribitMarkets', JSON.stringify(drivers.deribit.data.markets));
    });

    socket.on ('feed', (e) => {
        feed(function (err, rss) {
            io.emit('feed', JSON.stringify(rss));
        });
    });

    console.log('[SOCKET]', "User now connected");

    io.emit('ping', 'pong');
});

/**
 * Installation of Transport handler
 */


transport.indicators.on ('init', (event) => {
    console.log('[TRANSPORT / INDICATORS]', "You are now initialization");
});

transport.indicators.init();

drivers.deribit.on ('getChartForTradingview', (event) => {
    io.emit('deribitChartPrice', JSON.stringify(event));
});

drivers.deribit.on ('getChart', (event) => {

    // SMA
    (async function () {

        var chartData = [];
        var indicator = processor.indicators.SMA(event.close);

        for (const key in indicator) {
            chartData.push({
                value: indicator[key],
                time: event.ticks[key] / 1000
            })
        }

        io.emit('deribitChartPriceSMA', JSON.stringify(chartData));

    }) ();


    // RVI
    (async function () {

        var chartData = [];
        var indicator = processor.indicators.RVI(event.close, event.open, event.high, event.low);

        for (const key in indicator) {
            chartData.push({
                value: indicator[key],
                time: event.ticks[key] / 1000
            })
        }

        io.emit('deribitChartPriceRVI', JSON.stringify(chartData));

    }) ();


    // Bollinger Bands
    (async function () {

        var chartData = {
            'lower': [],
            'middle': [],
            'upper': []
        };

        var indicator = processor.indicators.BB(event.close);

        for (const key in indicator) {

            chartData.lower.push({
                value: indicator[key].lower,
                time: event.ticks[key] / 1000
            });

            chartData.middle.push({
                value: indicator[key].middle,
                time: event.ticks[key] / 1000
            });

            chartData.upper.push({
                value: indicator[key].upper,
                time: event.ticks[key] / 1000
            });

        }

        io.emit('deribitChartPriceBB', JSON.stringify(chartData));

    }) ();


    // MACD
    (async function () {

        var chartData = {
            'macd': [],
            'signal': [],
            'histogram': []
        };

        var indicator = processor.indicators.MACD(event.close);

        for (const key in indicator) {

            chartData.macd.push({
                value: indicator[key].MACD,
                time: event.ticks[key] / 1000
            });

            chartData.signal.push({
                value: indicator[key].signal,
                time: event.ticks[key] / 1000
            });

            chartData.histogram.push({
                value: indicator[key].histogram,
                time: event.ticks[key] / 1000
            });

        }

        io.emit('deribitChartPriceMACD', JSON.stringify(chartData));

    }) ();


    // VOLUMES
    (async function () {

        var chartData = [];

        for (const key in event.volume) {
            chartData.push({
                value: event.volume[key],
                time: event.ticks[key] / 1000,
                color: event.volume[key] > 0 ? 'rgba(125, 181, 69, 0.3)' : 'rgba(214, 69, 69, 0.3)'
            })
        }

        io.emit('deribitChartVolume', JSON.stringify(chartData));

    }) ();


    // MVRV Z-Scope
    (async function () {

        var chartData = [];

        market.market().then(function (e) {

            var indicator = processor.indicators.MVRVZScope(event.close, e.total_supply, e.circulating_supply);

            for (const key in indicator) {
                chartData.push({
                    value: indicator[key],
                    time: event.ticks[key] / 1000
                })
            }

            io.emit('deribitChartPriceMVRVZScope', JSON.stringify(chartData));

        })

    }) ();

});

drivers.deribit.on ('getOrderBook', (event) => {
    io.emit('deribitExchangeState', JSON.stringify(event));
});

drivers.bybit.on ('getChartForTradingview', (event) => {
    io.emit('bybitChartPrice', JSON.stringify(event));
})

drivers.bybit.on ('getInstrument', (event) => {
    io.emit('bybitExchangeState', JSON.stringify(event));
})

drivers.bybit.on ('getChart', (event) => {

    // SMA
    (async function () {

        var chartData = [];
        var closes = [];

        for (const close of event) {
            closes.push(parseFloat(close.close))
        }

        var indicator = processor.indicators.SMA(closes);

        for (const key in indicator) {
            chartData.push({
                value: indicator[key],
                time: event[key].time
            })
        }

        io.emit('bybitChartPriceSMA', JSON.stringify(chartData));

    }) ();


    // RVI
    (async function () {

        var chartData = [];
        var close = [];
        var open = [];
        var high = [];
        var low = [];

        for (const _ of event) {
            close.push(parseFloat(_.close))
            open.push(parseFloat(_.open))
            high.push(parseFloat(_.high))
            low.push(parseFloat(_.low))
        }

        var indicator = processor.indicators.RVI(close, open, high, low);

        for (const key in indicator) {
            chartData.push({
                value: indicator[key],
                time: event[key].time
            })
        }

        io.emit('bybitChartPriceRVI', JSON.stringify(chartData));

    }) ();


    // Bollinger Bands
    (async function () {

        var chartData = {
            'lower': [],
            'middle': [],
            'upper': []
        };
        var closes = [];

        for (const close of event) {
            closes.push(parseFloat(close.close))
        }

        var indicator = processor.indicators.BB(closes);

        for (const key in indicator) {

            chartData.lower.push({
                value: indicator[key].lower,
                time: event[key].time
            });

            chartData.middle.push({
                value: indicator[key].middle,
                time: event[key].time
            });

            chartData.upper.push({
                value: indicator[key].upper,
                time: event[key].time
            });

        }

        io.emit('bybitChartPriceBB', JSON.stringify(chartData));

    }) ();


    // MACD
    (async function () {

        var chartData = {
            'macd': [],
            'signal': [],
            'histogram': []
        };
        var closes = [];

        for (const close of event) {
            closes.push(parseFloat(close.close))
        }

        var indicator = processor.indicators.MACD(closes);

        for (const key in indicator) {

            chartData.macd.push({
                value: indicator[key].MACD,
                time: event[key].time
            });

            chartData.signal.push({
                value: indicator[key].signal,
                time: event[key].time
            });

            chartData.histogram.push({
                value: indicator[key].histogram,
                time: event[key].time
            });

        }

        io.emit('bybitChartPriceMACD', JSON.stringify(chartData));

    }) ();


})

drivers.deribit.init();
drivers.bybit.init();