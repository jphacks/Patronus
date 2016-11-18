const ipcMain = require('electron').ipcMain;
const BrowserWindow = require('electron').BrowserWindow;


const ShareWindow = function(){
    const ShareWindows = {};

    function createShareWindow(id, opt, screenSize){
        socket.emit('createShareWindow', {id: id, opt: opt, screenSize: screenSize});
    }

    function createGuiderShareWindow(id, opt, screenSize, socket){
        let guiderShareWindow = new BrowserWindow({
            // parent: mainWindow,
            x: 0,
            y: 0,
            width: 800,
            height: 600,
            minWidth:100,
            minHeight: 50,
            alwaysOnTop: true,
            darkTheme: true
        });
        guiderShareWindow.loadURL(opt.url);

        guiderShareWindow.on('closed', () => {
            socket.emit('closeShareWindow', {id: id});
            guiderShareWindow = null;
        });
        guiderShareWindow.on('move', () => {
            socket.emit('move', {id: id, pos: guiderShareWindow.getPosition(), parentScreenSize: screenSize});
        });
        guiderShareWindow.on('resize', () => {
            socket.emit('resize', {id: id, size: guiderShareWindow.getSize()});
        });
        guiderShareWindow.on('page-title-updated', (e, title) => {
            const url = guiderShareWindow.webContents.getURL();
            socket.emit('updated', {id: id, url: url});
        });

        // Renderの読み込みが完了するとidを要請してくるので送る
        ipcMain.on('get-id', (event, arg) => {
          event.sender.send('set-id', id)
        });
        guiderShareWindow.webContents.openDevTools();

        ShareWindows[id] = guiderShareWindow;
    }

    function createTraineeShareWindow(id, opt){
        let traineeShareWindow = new BrowserWindow({
            x: opt.x,
            y: opt.y,
            width: opt.width,
            height: opt.height,
            // closable: false,
            movable: false,
            resizable: false
        });
        traineeShareWindow.loadURL(opt.url);
        traineeShareWindow.on('closed', () => {
            traineeShareWindow = null;
        });
        ShareWindows[id] = traineeShareWindow;
    }

    return{
        ShareWindows: ShareWindows,
        createShareWindow: createShareWindow,
        createGuiderShareWindow: createGuiderShareWindow,
        createTraineeShareWindow: createTraineeShareWindow
    }

};

module.exports = ShareWindow;
