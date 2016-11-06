'use strict';

const ipcMain = require('electron').ipcMain;
const io = require('socket.io-client');

module.exports = class Connector {
    constructor(mainWindow, guiderShareWindows, traineeShareWindows, role, ShareWindow) {
        this.socket = null;
        this.mainWindow = mainWindow;
        this.guiderShareWindows = guiderShareWindows;
        this.traineeShareWindows = traineeShareWindows;
        this.role = role;
        this.ShareWindow = ShareWindow;
        this.connect();
        this.setListener();
    }

    connect() {
        if(!this.socket) {
            this.socket = io('http://localhost:58100');
        }
    }

    disconnect() {
        if(this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    changeMainWindow(new_mainWindow) {
        this.mainWindow = new_mainWindow;
    }

    setListener() {
        const socket = this.socket;
        socket.on('connect', () => {
            /* ペアリングトークン作成要求 */
            ipcMain.on('make_pairing_token', (event, args) => {
                console.log('make pairing token: ', args);
                this.role.role = 'trainee';
                socket.emit('make_pairing_token', args);
            });

            /* 作成したペアリングトークンの返信 */
            socket.on('pairing_token', (data) => {
                console.log('pairing token: ', data);
                this.mainWindow.webContents.send('pairing_token', data);
            });

            /* ペアリングトークンのルームへの入室要求 */
            ipcMain.on('input_pairing_token', (event, data) => {
                console.log('input paring token: ', data);
                this.role.role = 'guider';
                socket.emit('input_pairing_token', data);
            });

            /* 部屋への入室 */
            socket.on('join_room', (data) => {
                console.log('join_room: ', data.body, ', as: ', this.role.role);
                this.mainWindow.webContents.send('join_room', data);
                this.mainWindow.close();
            });

            /* サーバエラー */
            socket.on('error_message', (data) => {
                console.error('error', data.body);
            });


            ipcMain.on('openURL', (e, data) => {
                this.guiderShareWindows[data.id].loadURL(data.url);
            });
            socket.on('createWindow', (opt) => {
                if(this.role.role != 'guider'){ this.ShareWindow.createTraineeShareWindow(opt); }
            });
            socket.on('closeWindow', (data) => {
                if(this.traineeShareWindows[data.id] != null){ this.traineeShareWindows[data.id].close(); }
            });
            socket.on('move', (data) => {
                this.traineeShareWindows[data.id].setPosition(data.pos[0], data.pos[1], true);
            });
            socket.on('resize', (data) => {
                this.traineeShareWindows[data.id].setSize(data.size[0], data.size[1], true);
            });
            socket.on('updated', (data) => {
                this.traineeShareWindows[data.id].loadURL(data.url);
            });
        });
    }
};
