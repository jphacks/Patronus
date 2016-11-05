'use strict';

const ipcMain = require('electron').ipcMain;
const io = require('socket.io-client');

module.exports = class Connector {
    constructor(mainWindow, parentWindows, childWindows, role) {
        this.socket = null;
        this.mainWindow = mainWindow;
        this.parentWindows = parentWindows;
        this.childWindows = childWindows;
        this.role = role;
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
                this.parentWindows.loadURL(data.url);
            });
            socket.on('createWindow', (opt) => {
                // if(this.role.role != 'guider'){ createChildWindow(opt); }
            });
            socket.on('closeWindow', (data) => {
                if(this.childWindows != null){ childWindow.close(); }
            });
            socket.on('move', (data) => {
                this.childWindows.setPosition(data.pos[0], data.pos[1], true);
            });
            socket.on('resize', (data) => {
                this.childWindows.setSize(data.size[0], data.size[1], true);
            });
            socket.on('updated', (data) => {
                this.childWindows.loadURL(data.url);
            });
        });
    }
};
