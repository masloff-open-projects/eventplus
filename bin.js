#!/usr/bin/env node

var ccxt = require ('ccxt');
var fs = require ('fs');
var www = require('./bin/www');
var yaml = require('./bin/yaml');
var string = require('./modify/string');
var vm = require('./bin/virtual') ();
var io = require('./bin/socket')(www.server);
var redis = require('./bin/redis')();
var request = require('request');

var getaway = {
    rest: new (require('./getaway/RestAPI')) ()
};

var preprocessor = {
    ccxt: new (require('./preprocessor/ccxt'))(),
};

var processor = {
    indicators: new (require('./processor/indicators'))(yaml('./exchange.yaml')),
};

var driver = {
    bybit: new (require('./drivers/bybit')) (),
    deribit: new (require('./drivers/deribit')) (ccxt, io, yaml, redis),
    bitmex: new (require('./drivers/bitmex')) (ccxt, io, yaml, redis),
}

var transport = {
    // io: new (require('./transport/socket'))(io, driver, transport_high),
    indicators: new (require('./transport/indicators'))(),
}

var crossover = {
    bigData: new (require('./crossover/bigData'))()
}

var bridge = {
    vm: new (require('./bridge/vm'))()
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
     * Setup getaway
     */

    getaway.rest.use('router', 'express', www.express.rest);
    getaway.rest.use('router', 'passport', www.express.passport);
    getaway.rest.use('router', 'authenticationMiddleware', www.express.authenticationMiddleware);


    /**
     * Setup preprocessor
     */

    preprocessor.ccxt.use('driver', 'ccxt', ccxt);
    preprocessor.ccxt.use('store', 'keystore', yaml('./keystore.yaml'));

    preprocessor.ccxt.on ('init', (event) => {
        console.log('[PREPROCESSOR / CCXT]', "You are now initialization");
    });
    
    preprocessor.ccxt.on ('initExchange', function (event={}) {

        if (event.exchange in driver) {

            if ('meta' in driver[event.exchange]) {

                if ('type' in driver[event.exchange]['meta']) {

                    if (driver[event.exchange]['meta']['type'] == 'exchange') {

                        if ('use' in driver[event.exchange]) {

                            driver[event.exchange].use ('commutator', 'ccxt', event.object);
                            driver[event.exchange].init ();

                        } else {

                            console.error('[BOOT]', `The ${event.exchange} exchange Diver uses an old architecture and does not support the use method.`)

                        }

                    }

                }

            }

        }

    });


    /**
     * Installation of Transport handler
     */

    transport.indicators.on ('init', (event) => {
        console.log('[TRANSPORT / INDICATORS]', "You are now initialization");
    });

    /**
     * Settings of Crossover handler
     */

    crossover.bigData.use ('transfer', 'io', io);
    crossover.bigData.use ('store', 'cache', new require("cache")(15 * 60 * 1000));

    crossover.bigData.on ('init', (event) => {
        console.log('[CROSSOVER / BIGDATA]', "You are now initialization");
    });

    crossover.bigData.on ('userConnect', (event) => {
        console.log('[CROSSOVER / BIGDATA]', "User connect");
    });


    /**
     * Send drivers to any ...
     */

    for (const name in driver) {

        if ('use' in driver[name]) {

            driver[name].use('store', 'keystore', yaml('./keystore.yaml')[name]);
            driver[name].use('store', 'exchange', yaml('./exchange.yaml'));
            driver[name].use('store', 'cache', new require("cache")(15 * 60 * 1000));
            driver[name].use('commutator', 'request', request);
            driver[name].use('commutator', 'wss', require('websocket').w3cwebsocket);

        } else {

            console.error('[BOOT]', `Driver ${name} is old and don't have 'use' method`)

        }

        crossover.bigData.use ('driver', name, driver[name]);
        transport.indicators.use ('driver', name, driver[name]);

    }

    for (const name in transport) {
        crossover.bigData.use ('transport', name, transport[name]);
    }

    for (const name in processor) {
        transport.indicators.use ('processor', name, processor[name]);
    }

    for (const name in getaway) {
        crossover.bigData.use ('getaway', name, getaway[name]);
    }


    /**
     * Init of all drivers and indicators
     */

    preprocessor.ccxt.init();

    transport.indicators.init();
    crossover.bigData.init();

    bridge.vm.use ('private', 'keystore', yaml('keystore.yaml'));
    bridge.vm.use ('private', 'environment', vm);
    bridge.vm.use ('private', 'fs', fs);

    bridge.vm.use ('public', 'driver', driver);

    bridge.vm.init();

    getaway.rest.init();

    // driver.deribit.init();
    // driver.bybit.init();
    // driver.bitmex.init();

});