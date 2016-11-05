'use strict';

const ipcMain = require('electron').ipcMain;
const io = require('socket.io-client');
const socket = io('http://localhost:58100');

module.exports = function(mainWindow) {

    socket.on('connect', function () {
        ipcMain.on('make_pairing_token', (event, args) => {
            console.log('req: ', args);
            socket.emit('make_pairing_token', args);
        });

        socket.on('pairing_token', (data) => {
            console.log('rec: ', data);
            mainWindow.webContents.send('pairing_token', data);
        });
    });
};
