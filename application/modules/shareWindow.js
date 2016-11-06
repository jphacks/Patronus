const ipcMain = require('electron').ipcMain;
const BrowserWindow = require('electron').BrowserWindow;


const ShareWindow = function(parentWindows, childWindows){

    function createParentWindow(url, id, socket){
        let parentWindow = new BrowserWindow({
            // parent: mainWindow,
            x: 0,
            y: 0,
            width: 800,
            height: 600,
            minWidth:100,
            minHeight: 50,
            darkTheme: true
        });
        parentWindow.loadURL(url);

        parentWindow.on('closed', () => {
            socket.emit('closeWindow', {id: id});
            parentWindow = null;
        });
        parentWindow.on('move', () => {
            socket.emit('move', {id: id, pos: parentWindow.getPosition()});
        });
        parentWindow.on('resize', () => {
            socket.emit('resize', {id: id, size: parentWindow.getSize()});
        });
        parentWindow.on('page-title-updated', (e, title) => {
            const url = parentWindow.webContents.getURL();
            console.log(url)
            socket.emit('updated', {id: id, url: url});
        })

        // setTimeout(() => {
        //     parentWindow.webContents.send('set-id', id);
        // },2000);
        ipcMain.on('get-id', (event, arg) => {
          event.sender.send('set-id', id)
        });
        parentWindow.webContents.openDevTools();

        const opt = {
            id: id,
            x: parentWindow.getPosition()[0],
            y: parentWindow.getPosition()[1],
            width: parentWindow.getSize()[0],
            height: parentWindow.getSize()[1],
            url: url
        }
        socket.emit('createWindow', opt);

        parentWindows[id] = parentWindow;
    }

    function createChildWindow(opt, socket){
        // console.log(opt);
        let childWindow = new BrowserWindow({
            x: opt.x,
            y: opt.y,
            width: opt.width,
            height: opt.height,
            // closable: false,
            movable: false,
            resizable: false
        });
        childWindow.loadURL(opt.url);
        childWindow.on('closed', () => {
            childWindow = null;
        });
        childWindow.id = opt.id;
        childWindows[opt.id] = childWindow;
    }

    return{
        createParentWindow: createParentWindow,
        createChildWindow: createChildWindow
    }

};

module.exports = ShareWindow;
