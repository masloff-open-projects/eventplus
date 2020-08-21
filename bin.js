#!/usr/bin/env node

// Initialization the PacMan and key store.
const PacMan = require ('./bin/pacman');
const keystore = PacMan.yaml.read(PacMan.path.root('keystore.yaml')) || {};
const exchange = PacMan.yaml.read(PacMan.path.root('exchange.yaml')) || {};

// Obtaining instances of the essence of architecture
const instances = {
    getaway: {
        rest: require(PacMan.path.root('/getaway/rest')),
        app: require(PacMan.path.root('/getaway/app'))
    },
    preprocessor: {
        ccxt: require(PacMan.path.root('/preprocessor/ccxt'))
    },
    processor: {
        indicators: require(PacMan.path.root('/processor/indicators'))
    },
    driver: {
        bybit: require(PacMan.path.root('/drivers/bybit')),
        deribit: require(PacMan.path.root('/drivers/deribit')),
        bitmex: require(PacMan.path.root('/drivers/bitmex'))
    },
    transport: {
        indicators: require(PacMan.path.root('/transport/indicators'))
    },
    crossover: {
        bigData: require(PacMan.path.root('/crossover/bigData'))
    },
    bridge: {
        vm: require(PacMan.path.root('/bridge/vm'))
    }
}

// Map
var map = {
    driver: {},
    getaway: {},
    transport: {},
    processor: {}
};

// Single code
const pccxt = new instances.preprocessor.ccxt ();
const bd    = new instances.crossover.bigData ();
const vm    = new instances.bridge.vm ();
const tinds = new instances.transport.indicators ();
const pinds = new instances.processor.indicators (exchange);

pccxt.use ('driver', 'ccxt', PacMan.ccxt);
pccxt.use ('store', 'keystore', keystore);
pccxt.on  ('initExchange', function (event={}) {

    if (event.exchange in map.driver) {

        if (map.driver[event.exchange].meta.type == 'exchange' && map.driver[event.exchange].meta.exchange == event.exchange) {

            const driver = map.driver[event.exchange];

            if ('use' in driver) {

                driver.use ('commutator', 'ccxt', event.object);
                driver.init ();

            }

        }

    }

});

bd.use ('transport', 'indicators', tinds);
bd.use ('transfer', 'io', PacMan.io);
bd.use ('bridge', 'vm', vm);
bd.use ('store', 'cache', PacMan.cache);

tinds.use('logger', 'logger', PacMan.winston)
tinds.use('processor', 'indicators', pinds);

vm.use ('private', 'keystore', keystore);
vm.use ('private', 'environment', vm);
vm.use ('private', 'fs', PacMan.fs);
vm.use ('public', 'driver', map.driver);

// Go through the map of instances
for (const [name, instance] of Object.entries(instances)) {

    switch (name) {

        // Install and configure the driver environment
        case 'driver':

            for (const [name, driver] of Object.entries(instance)) {

                map.driver[name] = new driver();
                map.driver[name].use('store', 'keystore', keystore[name] || {});
                map.driver[name].use('store', 'exchange', exchange || {});
                map.driver[name].use('store', 'cache', PacMan.cache || false);
                map.driver[name].use('commutator', 'request', PacMan.request || false);
                map.driver[name].use('commutator', 'wss', PacMan.websocket.w3cwebsocket || false);

                bd.use ('driver', name, map.driver[name]);
                tinds.use ('driver', name, map.driver[name]);

                // Driver initialization comes later.

            }

            break;

        // Install and configure the getaway environment
        case 'getaway':

            for (const [name, getaway] of Object.entries(instance)) {

                map.getaway[name] = new getaway();

                map.getaway[name].use('commutator', 'mysql', PacMan.mysql || {});
                map.getaway[name].use('router', 'express', PacMan.appExpress || {});
                map.getaway[name].use('router', 'passport', PacMan.passport || {});
                map.getaway[name].use('router', 'authenticationMiddleware', PacMan.passport.authenticationMiddleware || {});

                bd.use ('getaway', name, map.getaway[name]);

                map.getaway[name].init();

            }

            break;

    }
}

// Execute boot code
pccxt.init();
vm.init();
bd.init();
tinds.init();

// mysql.connect(err => {
//
//     if (err) {
//         console.error('[SQL]', 'Error connecting: ' + err.stack);
//         logger.log ({
//             sender: 'SQL',
//             message: `Error connecting to the SQL`,
//             level: 'error',
//             data: err.stack,
//         });
//         process.exit(1);
//         return;
//     }
//
//     logger.log ({
//         sender: 'SQL',
//         message: `Connected as id`,
//         level: 'info',
//         data: mysql.threadId,
//     });
//
// });
//
// /**
//  * Installation of Redis event handler
//  */
//
// redis.on("error", error => {
//
//     console.error('[REDIS]', 'Error connecting: ' + error);
//     logger.log ({
//         sender: 'REDIS',
//         message: `Error connecting to the Redis client`,
//         level: 'error',
//         data: error,
//     });
//     process.exit(1);
//     return;
//
// })
//
// redis.on("connect", event => {
//
//     logger.log ({
//         sender: 'REDIS',
//         message: `Successfully connected to the server`,
//         level: 'info',
//         data: redis.options,
//     });
//
//     /**
//      * Setup getaway
//      */
//
//     getaway.rest.use('router', 'express', www.express.rest);
//     getaway.rest.use('router', 'passport', www.express.passport);
//     getaway.rest.use('router', 'authenticationMiddleware', www.express.authenticationMiddleware);
//
//
//     /**
//      * Setup preprocessor
//      */
//
//     preprocessor.ccxt.use('driver', 'ccxt', ccxt);
//     preprocessor.ccxt.use('store', 'keystore', yaml('./keystore.yaml'));

//
//     /**
//      * Settings of Crossover handler
//      */
//
//     crossover.bigData.use ('transfer', 'io', io);
//     crossover.bigData.use ('bridge', 'vm', bridge.vm);
//     crossover.bigData.use ('store', 'cache', new require("cache")(15 * 60 * 1000));
//
//
//     /**
//      * Send drivers to any ...
//      */
//
//     for (const name in driver) {
//
//         if ('use' in driver[name]) {
//
//             driver[name].use('store', 'keystore', yaml('./keystore.yaml')[name]);
//             driver[name].use('store', 'exchange', yaml('./exchange.yaml'));
//             driver[name].use('store', 'cache', new require("cache")(15 * 60 * 1000));
//             driver[name].use('commutator', 'request', request);
//             driver[name].use('commutator', 'wss', require('websocket').w3cwebsocket);
//
//             logger.log ({
//                 sender: 'BOOTLOADER',
//                 message: `Driver '${name}' has successfully adopted all the necessary dependencies `,
//                 level: 'info'
//             });
//
//         } else {
//
//             logger.log ({
//                 sender: 'BOOTLOADER',
//                 message: `Driver '${name}' is old and don't have 'use' method`,
//                 level: 'warning'
//             });
//
//         }
//
//         crossover.bigData.use ('driver', name, driver[name]);
//         transport.indicators.use ('driver', name, driver[name]);
//
//         if ('on' in driver[name]) {
//
//             driver[ name ].on('error', event => {
//
//                 logger.log({
//                     sender: `DRIVER / ${name}`,
//                     message: 'Error',
//                     level: 'error',
//                     data: event
//                 });
//
//             });
//
//             driver[ name ].on('init', event => {
//
//                 logger.log({
//                     sender: `DRIVER / ${name}`,
//                     message: 'Successfully initialized',
//                     level: 'info'
//                 });
//
//             });
//
//
//         }
//
//     }
//
//     for (const name in transport) {
//
//         crossover.bigData.use ('transport', name, transport[name]);
//
//         if ('on' in transport[name]) {
//
//             transport[ name ].on('error', event => {
//
//                 logger.log({
//                     sender: `TRANSPORT / ${name}`,
//                     message: 'Error',
//                     level: 'error',
//                     data: event
//                 });
//
//             });
//
//             transport[ name ].on('init', event => {
//
//                 logger.log({
//                     sender: `TRANSPORT / ${name}`,
//                     message: 'Successfully initialized',
//                     level: 'info'
//                 });
//
//             });
//
//         }
//
//     }
//
//     for (const name in processor) {
//
//         transport.indicators.use ('processor', name, processor[name]);
//
//         if ('on' in processor[name]) {
//
//             processor[name].on ('error', event => {
//
//                 logger.log ({
//                     sender: `PROCESSOR / ${name}`,
//                     message: 'Error',
//                     level: 'error',
//                     data: event
//                 });
//
//             });
//
//             processor[ name ].on('init', event => {
//
//                 logger.log({
//                     sender: `PROCESSOR / ${name}`,
//                     message: 'Successfully initialized',
//                     level: 'info'
//                 });
//
//             });
//
//         }
//
//     }
//
//     for (const name in getaway) {
//
//         crossover.bigData.use ('getaway', name, getaway[name]);
//
//         if ('on' in getaway[name]) {
//
//             getaway[ name ].on('error', event => {
//
//                 logger.log({
//                     sender: `GETAWAY / ${name}`,
//                     message: 'Error',
//                     level: 'error',
//                     data: event
//                 });
//
//             });
//
//             getaway[ name ].on('init', event => {
//
//                 logger.log({
//                     sender: `GETAWAY / ${name}`,
//                     message: 'Successfully initialized',
//                     level: 'info'
//                 });
//
//             });
//
//         }
//
//     }
//
//     for (const name in crossover) {
//
//         if ('on' in crossover[name]) {
//
//             crossover[ name ].on('error', event => {
//
//                 logger.log({
//                     sender: `CROSSOVER / ${name}`,
//                     message: 'Error',
//                     level: 'error',
//                     data: event
//                 });
//
//             });
//
//             crossover[ name ].on('init', event => {
//
//                 logger.log({
//                     sender: `CROSSOVER / ${name}`,
//                     message: 'Successfully initialized',
//                     level: 'info'
//                 });
//
//             });
//
//         }
//
//     }
//
//     for (const name in preprocessor) {
//
//         if ('on' in preprocessor[name]) {
//
//             preprocessor[ name ].on('error', event => {
//
//                 logger.log({
//                     sender: `PREPROCESSOR / ${name}`,
//                     message: 'Error',
//                     level: 'error',
//                     data: event
//                 });
//
//             });
//
//             preprocessor[ name ].on('init', event => {
//
//                 logger.log({
//                     sender: `PREPROCESSOR / ${name}`,
//                     message: 'Successfully initialized',
//                     level: 'info'
//                 });
//
//             });
//
//         }
//
//     }
//
//
//     /**
//      * Init of all drivers and indicators
//      */
//
//     preprocessor.ccxt.init();
//
//     transport.indicators.use('logger', 'logger', logger);
//     transport.indicators.init();
//     crossover.bigData.init();
//
//     bridge.vm.on('error', event => {
//         logger.log({
//             sender: `VIRTUAL MACHINE`,
//             message: event,
//             level: 'error'
//         });
//     })
//
//     bridge.vm.use ('private', 'keystore', yaml('keystore.yaml'));
//     bridge.vm.use ('private', 'environment', vm);
//     bridge.vm.use ('private', 'fs', fs);
//     bridge.vm.use ('public', 'driver', driver);
//
//     bridge.vm.init();
//
//     getaway.rest.init();
//
//     printMessage([
//         `Welcome to Event+`,
//         `-----------------------------`,
//         `Getaways count: ${Object.keys(getaway).length}`,
//         `Preprocessors count: ${Object.keys(preprocessor).length}`,
//         `Processors count: ${Object.keys(processor).length}`,
//         `Drivers count: ${Object.keys(driver).length}`,
//         `Transports count: ${Object.keys(transport).length}`,
//         `Crossover count: ${Object.keys(crossover).length}`,
//         `Bridge count: ${Object.keys(bridge).length}`,
//         `-----------------------------`,
//         `Drivers found: ${Object.keys(driver).join(', ')}`
//     ]);
//
//
// });
