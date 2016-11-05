'use strict';

const ipcMain = require('electron').ipcMain;
const io = require('socket.io-client');
const socket = io('http://localhost:58100');

module.exports = function(mainWindow, role) {
    socket.on('connect', function () {
        /* ペアリングトークン作成要求 */
        ipcMain.on('make_pairing_token', (event, args) => {
            console.log('make pairing token: ', args);
            role.role = 'trainee';
            socket.emit('make_pairing_token', args);
        });

        /* 作成したペアリングトークンの返信 */
        socket.on('pairing_token', (data) => {
            console.log('pairing token: ', data);
            mainWindow.webContents.send('pairing_token', data);
        });

        /* ペアリングトークンのルームへの入室要求 */
        ipcMain.on('input_pairing_token', (event, data) => {
            console.log('input paring token: ', data);
            role.role = 'guider';
            socket.emit('input_pairing_token', data);
        });

        /* 部屋への入室 */
        socket.on('join_room', (data) => {
            console.log('join_room: ', data.body, ', as: ', role.role);
            mainWindow.webContents.send('join_room', data);
            mainWindow.close();
        });


        /* サーバエラー */
        socket.on('error_message', (data) => {
            console.error(data.error);
        });

    });
};
