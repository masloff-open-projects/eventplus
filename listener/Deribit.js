"use strict";

import EventEmitter from 'events';
import WSS from 'deribit-ws-nodejs'

// Emitter
class Emitter extends EventEmitter {}
const emitter = new Emitter();

emitter.setMaxListeners(12);

// Client
const Client = new WSS({
    key: 'A1pCeNpp',
    secret: 'dD_81yOvEPM3IchPmaQTZdJp-nqaK5c-LekGLM1UVRA',
    testnet: true,
    message: msg => console.log(msg),
    error: err => console.error(err),
    trade: trade => console.log(trade),
});

// Ready
Client.connected.then(Event => {
    Client.action('positions').then(Positions => emitter.emit('positions', Positions));
});

// Export
export default emitter;

