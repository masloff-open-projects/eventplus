"use strict";

// Imports
import async from 'async';
import * as user from './controller/user';
import http from 'http';
import https from 'https';
import ccxt from 'ccxt';

import Deribit from './listener/Deribit';

import { router, passport } from './router';

// Routing
router.get('/', function (req, res, next) {
    user.create(req, res, next);
});

// Deribit
for ( const Exchange of [Deribit] ) {

    // Get positions
    Exchange.on('positions', Event => {
        console.log(Event)
    });

}

// Devel
Deribit.emit('maker', ccxt);
Deribit.on('start', async function (a) {
    console.log(a)
});

// HTTP server
const httpServer = http.createServer(router);
      httpServer.listen(8034, '127.0.0.1');