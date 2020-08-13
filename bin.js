#!/usr/bin/env node

var ccxt = require ('ccxt');
var www = require('./bin/www');
var yaml = require('./bin/yaml');
var io = require('./bin/socket')(www);
var redis = require('./bin/redis')();

var processor = {
    indicators: new (require('./processor/indicators'))(yaml('./exchange.yaml'))
};

var driver = {
    bybit: new (require('./drivers/bybit')) (ccxt, io, yaml, redis),
    deribit: new (require('./drivers/deribit')) (ccxt, io, yaml, redis),
    bitmex: new (require('./drivers/bitmex')) (ccxt, io, yaml, redis),
}

var transport_high = {
    indicators: new (require('./transport/indicators'))(driver, processor),
}

var transport = {
    io: new (require('./transport/socket'))(io, driver, transport_high),
}

/**
 * Installation of Redis event handler
 */

redis.on("error", function(error) {
    console.error('[REDIS]', error);
})

redis.on("connect", function() {

    console.log('[REDIS]', "You are now connected");


    /**
     * Installation of Transport handler
     */

    transport_high.indicators.on ('init', (event) => {
        console.log('[TRANSPORT / INDICATORS]', "You are now initialization");
    });

    transport.io.on ('init', (event) => {
        console.log('[TRANSPORT / IO]', "You are now initialization");
    });

    transport.io.on ('userConnect', (event) => {
        console.log('[TRANSPORT / IO]', "User connect");
    });


    /**
     * Init of all drivers and indicators
     */

    transport_high.indicators.init();
    transport.io.init();
    driver.deribit.init();
    driver.bybit.init();
    driver.bitmex.init();

});