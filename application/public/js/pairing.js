'use strict';

const ipcRenderer = require('electron').ipcRenderer;

function makePairing() {

    ipcRenderer.on('pairing_token', (event, args) => {
        console.log(args);
    });

    ipcRenderer.send('make_pairing_token', 'Yo');
}
