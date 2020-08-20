#!/usr/bin/env node

const string = require('./modify/string');
const list = require('./modify/list');

const logger = require('./bin/logger') ();
const yaml = require('./bin/yaml');
const serverYaml = yaml('./server.yaml');
const mysql = require('./bin/sql')();
const ccxt = require ('ccxt');
const fs = require ('fs');
const www = require('./bin/www') (mysql, serverYaml.http || {}, serverYaml.https || {}, logger);
const vm = require('./bin/virtual') ();
const io = require('./bin/socket')(www.server, serverYaml.io || false);
const redis = require('./bin/redis')(serverYaml.redis || {});
const request = require('request');
const printMessage = require('print-message');

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
    bybit: new (require('./drivers/bybit')) (ccxt, io, yaml, redis),
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
 * Installation of MySQL event handler
 */

mysql.connect(err => {

    if (err) {
        console.error('[SQL]', 'Error connecting: ' + err.stack);
        logger.log ({
            sender: 'SQL',
            message: `Error connecting to the SQL`,
            level: 'error',
            data: err.stack,
        });
        process.exit(1);
        return;
    }

    logger.log ({
        sender: 'SQL',
        message: `Connected as id`,
        level: 'info',
        data: mysql.threadId,
    });

});

/**
 * Installation of Redis event handler
 */

redis.on("error", error => {

    console.error('[REDIS]', 'Error connecting: ' + error);
    logger.log ({
        sender: 'REDIS',
        message: `Error connecting to the Redis client`,
        level: 'error',
        data: error,
    });
    process.exit(1);
    return;

})

redis.on("connect", event => {

    logger.log ({
        sender: 'REDIS',
        message: `Successfully connected to the server`,
        level: 'info',
        data: redis.options,
    });

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
    preprocessor.ccxt.on ('initExchange', function (event={}) {

        if (event.exchange in driver) {

            if ('meta' in driver[event.exchange]) {

                if ('type' in driver[event.exchange]['meta']) {

                    if (driver[event.exchange]['meta']['type'] == 'exchange') {

                        if ('use' in driver[event.exchange]) {

                            driver[event.exchange].use ('commutator', 'ccxt', event.object);
                            driver[event.exchange].init ();

                        } else {

                            logger.log ({
                                sender: 'BOOTLOADER',
                                message: `The '${event.exchange}' exchange diver uses an old architecture and does not support the use method.`,
                                level: 'error'
                            });

                        }

                    }

                }

            }

        }

    });


    /**
     * Settings of Crossover handler
     */

    crossover.bigData.use ('transfer', 'io', io);
    crossover.bigData.use ('bridge', 'vm', bridge.vm);
    crossover.bigData.use ('store', 'cache', new require("cache")(15 * 60 * 1000));


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

            logger.log ({
                sender: 'BOOTLOADER',
                message: `Driver '${name}' has successfully adopted all the necessary dependencies `,
                level: 'info'
            });

        } else {

            logger.log ({
                sender: 'BOOTLOADER',
                message: `Driver '${name}' is old and don't have 'use' method`,
                level: 'warning'
            });

        }

        crossover.bigData.use ('driver', name, driver[name]);
        transport.indicators.use ('driver', name, driver[name]);

        if ('on' in driver[name]) {

            driver[ name ].on('error', event => {

                logger.log({
                    sender: `DRIVER / ${name}`,
                    message: 'Error',
                    level: 'error',
                    data: event
                });

            });

            driver[ name ].on('init', event => {

                logger.log({
                    sender: `DRIVER / ${name}`,
                    message: 'Successfully initialized',
                    level: 'info'
                });

            });


        }

    }

    for (const name in transport) {

        crossover.bigData.use ('transport', name, transport[name]);

        if ('on' in transport[name]) {

            transport[ name ].on('error', event => {

                logger.log({
                    sender: `TRANSPORT / ${name}`,
                    message: 'Error',
                    level: 'error',
                    data: event
                });

            });

            transport[ name ].on('init', event => {

                logger.log({
                    sender: `TRANSPORT / ${name}`,
                    message: 'Successfully initialized',
                    level: 'info'
                });

            });

        }

    }

    for (const name in processor) {

        transport.indicators.use ('processor', name, processor[name]);

        if ('on' in processor[name]) {

            processor[name].on ('error', event => {

                logger.log ({
                    sender: `PROCESSOR / ${name}`,
                    message: 'Error',
                    level: 'error',
                    data: event
                });

            });

            processor[ name ].on('init', event => {

                logger.log({
                    sender: `PROCESSOR / ${name}`,
                    message: 'Successfully initialized',
                    level: 'info'
                });

            });

        }

    }

    for (const name in getaway) {

        crossover.bigData.use ('getaway', name, getaway[name]);

        if ('on' in getaway[name]) {

            getaway[ name ].on('error', event => {

                logger.log({
                    sender: `GETAWAY / ${name}`,
                    message: 'Error',
                    level: 'error',
                    data: event
                });

            });

            getaway[ name ].on('init', event => {

                logger.log({
                    sender: `GETAWAY / ${name}`,
                    message: 'Successfully initialized',
                    level: 'info'
                });

            });

        }

    }

    for (const name in crossover) {

        if ('on' in crossover[name]) {

            crossover[ name ].on('error', event => {

                logger.log({
                    sender: `CROSSOVER / ${name}`,
                    message: 'Error',
                    level: 'error',
                    data: event
                });

            });

            crossover[ name ].on('init', event => {

                logger.log({
                    sender: `CROSSOVER / ${name}`,
                    message: 'Successfully initialized',
                    level: 'info'
                });

            });

        }

    }

    for (const name in preprocessor) {

        if ('on' in preprocessor[name]) {

            preprocessor[ name ].on('error', event => {

                logger.log({
                    sender: `PREPROCESSOR / ${name}`,
                    message: 'Error',
                    level: 'error',
                    data: event
                });

            });

            preprocessor[ name ].on('init', event => {

                logger.log({
                    sender: `PREPROCESSOR / ${name}`,
                    message: 'Successfully initialized',
                    level: 'info'
                });

            });

        }

    }


    /**
     * Init of all drivers and indicators
     */

    preprocessor.ccxt.init();

    transport.indicators.use('logger', 'logger', logger);
    transport.indicators.init();
    crossover.bigData.init();

    bridge.vm.on('error', event => {
        logger.log({
            sender: `VIRTUAL MACHINE`,
            message: event,
            level: 'error'
        });
    })

    bridge.vm.use ('private', 'keystore', yaml('keystore.yaml'));
    bridge.vm.use ('private', 'environment', vm);
    bridge.vm.use ('private', 'fs', fs);
    bridge.vm.use ('public', 'driver', driver);

    bridge.vm.init();

    getaway.rest.init();

    printMessage([
        `Welcome to Event+`,
        `-----------------------------`,
        `Getaways count: ${Object.keys(getaway).length}`,
        `Preprocessors count: ${Object.keys(preprocessor).length}`,
        `Processors count: ${Object.keys(processor).length}`,
        `Drivers count: ${Object.keys(driver).length}`,
        `Transports count: ${Object.keys(transport).length}`,
        `Crossover count: ${Object.keys(crossover).length}`,
        `Bridge count: ${Object.keys(bridge).length}`,
        `-----------------------------`,
        `Drivers found: ${Object.keys(driver).join(', ')}`
    ]);


});
