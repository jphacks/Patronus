'use strict';

const ipcMain = require('electron').ipcMain;
const io = require('socket.io-client');
const screencapture = require('screencapture');
const fs = require('fs');
const Datauri = require('datauri');

module.exports = class Connector {
    constructor(mainWindow, role) {
        this.socket = null;
        this.mainWindow = mainWindow;
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
                socket.emit('make_pairing_token', args);
            });

            /* 作成したペアリングトークンの返信 */
            socket.on('pairing_token', (data) => {
                console.log('pairing token: ', data);
                this.role.role = 'trainee';
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
                this.role.joined = true;
                console.log('join_room: ', data.body, ', as: ', this.role.role);
                this.mainWindow.webContents.send('join_room', data);
                this.mainWindow.close();
            });

            /* サーバエラー */
            socket.on('error_message', (data) => {
                console.error('error', data.body);
            });

            /**
             * video window edit by kyoshida
             */

            /**
             * [screenshotを取って返却する]
             * @param  {[type]} 'get_screenshot' [description]
             * @param  {[type]} {empty}            [description]
             * @return {[type]}                  [description]
             */
            ipcMain.on('get_screenshot',(event,data)=>{
                const imageURL = "TODO";
                screencapture(function(err,imagePath){
                    if(err){
                        console.log(err);
                    }else{
                        //console.log(imagePath);
                        const datauri = new Datauri();
                        datauri.on('encoded',(content)=>{
                            event.sender.send('re_get_screenshot',imageURL);
                            fs.unlink(imagePath,(err)=>{
                                if(err){
                                    console.log(err);
                                }else{

                                }
                            });
                        });
                        datauri.on('error',(err) => {console.log(err);});
                        datauri.encode(imagePath);
                    }

                });
            });

            /**
             * [traineeからのウィンドウ生成命令]
             * @param  {[type]} 'create_guider_window' [description]
             * @param  {[type]} {width,height,peerId}            [description]
             * @return {[type]}                        [description]
             */
            ipcMain.on('create_guider_window',(event,data)=>{
                //TODO
                //socket.ioでguiderのmainにdataオブジェクトを渡す
                // socket.send? 'create_guider_window'
                console.log('create guider window from browser: ', data);
                socket.emit('create_guider_window', data);
            });

            /**
             * [trainee -> main -socket.io-> main -> guider]
             * @param  {[type]} 'create_guider_window' [description]
             * @param  {[type]} data            [description]
             * @return {[type]}                        [description]
             */
            socket.on('create_guider_window',(data)=>{
                //TODO
                //guiderのmainプロセス
                //window生成 -> ウィンドウロードイベント -> window.webContents.send('connect_trainee',data);
                console.log('create guider window from socket: ', data);
                this.mainWindow.webContents.send('create_guider_window', data);
            });
        });
    }
};
