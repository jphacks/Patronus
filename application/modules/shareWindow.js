const ipcMain = require('electron').ipcMain;
const BrowserWindow = require('electron').BrowserWindow;


const ShareWindow = function(guiderShareWindows, traineeShareWindows){

    function createGuiderShareWindow(url, id, socket){
        let guiderShareWindow = new BrowserWindow({
            // parent: mainWindow,
            x: 0,
            y: 0,
            width: 800,
            height: 600,
            minWidth:100,
            minHeight: 50,
            darkTheme: true
        });
        guiderShareWindow.loadURL(url);

        guiderShareWindow.on('closed', () => {
            socket.emit('closeWindow', {id: id});
            guiderShareWindow = null;
        });
        guiderShareWindow.on('move', () => {
            socket.emit('move', {id: id, pos: guiderShareWindow.getPosition()});
        });
        guiderShareWindow.on('resize', () => {
            socket.emit('resize', {id: id, size: guiderShareWindow.getSize()});
        });
        guiderShareWindow.on('page-title-updated', (e, title) => {
            const url = guiderShareWindow.webContents.getURL();
            console.log(url)
            socket.emit('updated', {id: id, url: url});
        })

        // setTimeout(() => {
        //     guiderShareWindow.webContents.send('set-id', id);
        // },2000);
        ipcMain.on('get-id', (event, arg) => {
          event.sender.send('set-id', id)
        });
        guiderShareWindow.webContents.openDevTools();

        const opt = {
            id: id,
            x: guiderShareWindow.getPosition()[0],
            y: guiderShareWindow.getPosition()[1],
            width: guiderShareWindow.getSize()[0],
            height: guiderShareWindow.getSize()[1],
            url: url
        }
        socket.emit('createWindow', opt);

        guiderShareWindows[id] = guiderShareWindow;
    }

    function createTraineeShareWindow(opt, socket){
        // console.log(opt);
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
        traineeShareWindow.id = opt.id;
        traineeShareWindows[opt.id] = traineeShareWindow;
    }

    return{
        createGuiderShareWindow: createGuiderShareWindow,
        createTraineeShareWindow: createTraineeShareWindow
    }

};

module.exports = ShareWindow;
