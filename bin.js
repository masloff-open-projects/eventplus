#!/usr/bin/env node

var ccxt = require ('ccxt');
var www = require('./bin/www');
var yaml = require('./bin/yaml');
var client = require('./bin/redis')();
var io = require('./bin/socket')(www);

var provider = {
    feed: new (require('./provider/feed'))()
};

var processor = {
    indicators: new (require('./processor/indicators'))(yaml('./exchange.yaml'))
};

var driver = {
    bybit: new (require('./drivers/bybit')) (ccxt, io, yaml, client),
    deribit: new (require('./drivers/deribit')) (ccxt, io, yaml, client)
}

var transport = {
    indicators: new (require('./transport/indicators'))(driver, processor),
    feed: new (require('./transport/feed'))(provider.feed),
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
        io.emit('bybitMarkets', JSON.stringify(driver.bybit.data.markets));
    });

    socket.on ('deribitMarkets', (e) => {
        io.emit('deribitMarkets', JSON.stringify(driver.deribit.data.markets));
    });

    console.log('[SOCKET]', "User now connected");

    io.emit('ping', 'pong');
});

/**
 * Installation of Transport handler
 */

// socket.on ('feed', (e) => {
//     feed(function (err, rss) {
//         io.emit('feed', JSON.stringify(rss));
//     });
// });


transport.indicators.on ('init', (event) => {
    console.log('[TRANSPORT / INDICATORS]', "You are now initialization");
});

transport.indicators.init();

transport.indicators.on ('SMA', (event) => {
    if ('exchange' in event) {
        io.emit(`${event.exchange.toLowerCase()}ChartPriceSMA`, JSON.stringify(event.chart));
    }
});

transport.indicators.on ('RVI', (event) => {
    if ('exchange' in event) {
        io.emit(`${event.exchange.toLowerCase()}ChartPriceRVI`, JSON.stringify(event.chart));
    }
});

transport.indicators.on ('BB', (event) => {
    if ('exchange' in event) {
        io.emit(`${event.exchange.toLowerCase()}ChartPriceBB`, JSON.stringify(event.chart));
    }
});

transport.indicators.on ('MACD', (event) => {
    if ('exchange' in event) {
        io.emit(`${event.exchange.toLowerCase()}ChartPriceMACD`, JSON.stringify(event.chart));
    }
});

transport.indicators.on ('VOLUME', (event) => {
    if ('exchange' in event) {
        io.emit(`${event.exchange.toLowerCase()}ChartPriceVOLUME`, JSON.stringify(event.chart));
    }
});

transport.indicators.on ('MVRVZSCOPE', (event) => {
    if ('exchange' in event) {
        io.emit(`${event.exchange.toLowerCase()}ChartPriceMVRVZSCOPE`, JSON.stringify(event.chart));
    }
});

driver.deribit.on ('getChartForTradingview', (event) => {
    io.emit('deribitChartPrice', JSON.stringify(event));
});

driver.deribit.on ('getOrderBook', (event) => {
    io.emit('deribitExchangeState', JSON.stringify(event));
});

driver.bybit.on ('getChartForTradingview', (event) => {
    io.emit('bybitChartPrice', JSON.stringify(event));
})

driver.bybit.on ('getInstrument', (event) => {
    io.emit('bybitExchangeState', JSON.stringify(event));
})

transport.feed.on ('getContent', (event) => {
    io.emit('feed', JSON.stringify(event));
});

transport.feed.init();

// driver.deribit.init();
// driver.bybit.init();