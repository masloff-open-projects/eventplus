#!/usr/bin/env node

// Initialization the PacMan and key store.
const PacMan = require ('./PacMan');
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

// Configure the CCXT preprocessor
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

// Configure the BigData crossover
bd.use ('transport', 'indicators', tinds);
bd.use ('transfer', 'io', PacMan.io);
bd.use ('bridge', 'vm', vm);
bd.use ('store', 'cache', PacMan.cache);

// Configure indicator transport
tinds.use('logger', 'logger', PacMan.winston)
tinds.use('processor', 'indicators', pinds);

// Configure VM bridge
vm.use ('private', 'keystore', keystore);
vm.use ('private', 'environment', PacMan.vm);
vm.use ('private', 'fs', PacMan.fs);
vm.use ('public', 'driver', map.driver);

// Check if debuggers are enabled
if (PacMan.yargs.visualization) {

    // Debbug message
    PacMan.print([
        `Welcome to Event+ VM Visualization`,
        `---------------------------`,
        'Now the full virtual machine state dump will be sent to the console',
        PacMan.yargs.file ? 'WARNING: A file with the virtual machine data dump can reach 1TB in 10 minutes. Be careful' : ''
    ]);

    // Specific var?
    if (PacMan.yargs.watch) {

        vm.on ('context', Event => {

            // Write to file?
            if (PacMan.yargs.file) {
                PacMan.fs.appendFile(PacMan.yargs.file, "\n\n" + JSON.stringify(Event[PacMan.yargs.watch], null, 2), function () {});
            } else {
                console.log('');
                console.log(`Virtual Machine DUMP on ${Date.now()}`);
                console.log(Event[PacMan.yargs.watch]);
            }

        })

    // Dump all data
    } else {

        vm.on ('context', Event => {

            // Write to file?
            if (PacMan.yargs.file) {
                PacMan.fs.appendFile(PacMan.yargs.file, "\n\n" + JSON.stringify(Event, null, 2), function () {});
            } else {
                console.log('');
                console.log(`Virtual Machine DUMP on ${Date.now()}`);
                console.log(Event);
            }

        })

    }
}


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
for (const init of [pccxt, vm, bd, tinds]) {
    init.init();
}

// Welcome message
PacMan.print([
    `Welcome to Event+`,
    `---------------------------`,
    `HTTP URL: http://${PacMan.httpURL.join(':')}`,
    `HTTPS URL: https://${PacMan.httpsURL.join(':')}`
]);