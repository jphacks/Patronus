'use strict';

const ipcMain = require('electron').ipcMain;
const io = require('socket.io-client');
const screencapture = require('screencapture');
const fs = require('fs');
const Datauri = require('datauri');

module.exports = class Connector {
    constructor(mainWindow, role, ShareWindow) {
        this.socket = null;
        this.mainWindow = mainWindow;
        this.role = role;
        this.ShareWindow = ShareWindow;
        this.connect();
        this.setListener();
    }

    connect() {
        if(!this.socket) {
            this.socket = io('http://133.68.112.170:58100');
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
                this.role.room = data.body;
                console.log('join_room: ', data.body, ', as: ', this.role.role);
                this.mainWindow.webContents.send('join_room', data);
                this.mainWindow.close();
            });

            /* サーバエラー */
            socket.on('error_message', (data) => {
                console.error('error', data.body);
            });




            /* guiderが最初にURLを開くとき */
            ipcMain.on('openURL', (e, data) => {
                if(this.role.role == 'guider'){}
                this.ShareWindow.ShareWindows[data.id].loadURL(data.url);
            });
            /* guider,traineeに応じたShareWindowを作る */
            socket.on('createShareWindow', (data) => {
                console.log(data);
                if(this.role.role == 'guider'){ this.ShareWindow.createGuiderShareWindow(data.id, data.opt, socket); }
                if(this.role.role == 'trainee'){ this.ShareWindow.createTraineeShareWindow(data.id, data.opt); }
            });
            /* guiderがウィンドウを閉じるとtraineeも閉じる */
            socket.on('closeShareWindow', (data) => {
                if(this.ShareWindow.ShareWindows[data.id] != null){
                    this.ShareWindow.ShareWindows[data.id].close();
                }
            });
            /* guiderがウィンドウを動かすとtraineeも動く */
            socket.on('move', (data) => {
                if(this.role.role == 'trainee'){
                    this.ShareWindow.ShareWindows[data.id].setPosition(data.pos[0], data.pos[1], true);
                }
            });
            /* guiderがウィンドウをスクロールするとtraineeもスクロール */
            ipcMain.on('scroll', (e, data) => {
                socket.emit('scroll', data);
            });
            socket.on('scroll', (data) => {
                if(this.role.role == 'trainee' && this.ShareWindow.ShareWindows[data.id]){

                    this.ShareWindow.ShareWindows[data.id].webContents.executeJavaScript((
                        function(){
                            window.scrollTo(0, data.scrollY);
                        }
                    ).toString().replace(/function\s*\(\)\{/, "").replace(/}$/,"").trim());
                }
            });
            /* guiderがウィンドウをリサイズするとtraineeもリサイズ */
            socket.on('resize', (data) => {
                if(this.role.role == 'trainee'){
                    this.ShareWindow.ShareWindows[data.id].setSize(data.size[0], data.size[1], true);
                }
            });
            /* guiderがページ遷移したとき */
            socket.on('updated', (data) => {
                /* guiderのページにscroll event listener追加 */
                if(this.role.role == 'guider' && this.ShareWindow.ShareWindows[data.id]){
                    this.ShareWindow.ShareWindows[data.id].webContents.executeJavaScript((
                        function(){
                            const ipcRenderer2 = require('electron').ipcRenderer;
                            let win_id;
                            ipcRenderer2.on('set-id', (event, id) => {
                                win_id = id;
                            })
                            let ticking;
                        }
                    ).toString().replace(/function\s*\(\)\{/, "").replace(/}$/,"").trim(), function(){
                        this.ShareWindow.ShareWindows[data.id].webContents.send('set-id', data.id);
                    });
                    this.ShareWindow.ShareWindows[data.id].webContents.executeJavaScript((
                        function(){
                            window.addEventListener('scroll', function(e){
                              if(!ticking){
                                window.requestAnimationFrame(function() {
                                    console.log(window.scrollY);
                                    ipcRenderer2.send('scroll', {scrollY: window.scrollY, id: win_id});
                                    ticking = false;
                                });
                              }
                              ticking = true;
                            });
                        }
                    ).toString().replace(/function\s*\(\)\{/, "").replace(/}$/,"").trim());
                
                }
                // traineeもページ遷移
                if(this.role.role == 'trainee' && this.ShareWindow.ShareWindows[data.id]){
                    this.ShareWindow.ShareWindows[data.id].loadURL(data.url);
                }
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

                            event.sender.send('re_get_screenshot',content);
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
                data.room = this.role.room;
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
                if(this.role.role == 'guider') {
                    console.log('create guider window from socket: ', data);
                    this.mainWindow.webContents.send('connect_trainee', data);
                }
            });

            ipcMain.on('sync_window_size',(event,arg)=>{
                this.mainWindow.setSize(arg.width,arg.height);
                this.mainWindow.center();
            });
        });
    }
};
