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

var transport = {
    // io: new (require('./transport/socket'))(io, driver, transport_high),
    indicators: new (require('./transport/indicators'))(driver, processor),
}

var crossover = {
    bigData: new (require('./crossover/bigData'))()
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

    transport.indicators.on ('init', (event) => {
        console.log('[TRANSPORT / INDICATORS]', "You are now initialization");
    });

    // transport.io.on ('init', (event) => {
    //     console.log('[TRANSPORT / IO]', "You are now initialization");
    // });
    //
    // transport.io.on ('userConnect', (event) => {
    //     console.log('[TRANSPORT / IO]', "User connect");
    // });

    /**
     * Settings of Crossover handler
     */

    crossover.bigData.use ('transfer', 'io', io);

    for (const name in driver) {
        crossover.bigData.use ('driver', name, driver[name]);
    }

    for (const name in transport) {
        crossover.bigData.use ('transport', name, transport[name]);
    }

    /**
     * Init of all drivers and indicators
     */

    transport.indicators.init();
    crossover.bigData.init();
    driver.deribit.init();
    driver.bybit.init();
    driver.bitmex.init();

});