var barn = new Barn(localStorage);
var notyf = new Notyf();
const websocket = new WebSocket(`${location.protocol == 'https:' ? "wss:" : "ws:"}//${location.hostname}:9999`);
