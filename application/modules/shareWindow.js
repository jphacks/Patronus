const ipcMain = require('electron').ipcMain;
const BrowserWindow = require('electron').BrowserWindow;


const ShareWindow = function(parentWindow, childWindow){

    function createParentWindow(url, id, socket){
        parentWindow = new BrowserWindow({
            // parent: mainWindow,
            id: id,
            x: 0,
            y: 0,
            width: 800,
            height: 600,
            minWidth:100,
            minHeight: 50,
            darkTheme: true,
            alwaysOnTop: true
        });
        parentWindow.loadURL(url);

        parentWindow.on('closed', () => {
            socket.emit('closeWindow', {id: id});
            parentWindow = null;
        });
        parentWindow.on('move', () => {
            socket.emit('move', {id: id, pos:parentWindow.getPosition()});
        });
        parentWindow.on('resize', () => {
            socket.emit('resize', {id: id, size:parentWindow.getSize()});
        });
        parentWindow.on('page-title-updated', (e, title) => {
            const url = parentWindow.webContents.getURL();
            console.log(url)
            socket.emit('updated', {id: id, url:url});
        })
        const opt = {
            id: id,
            x: parentWindow.getPosition()[0],
            y: parentWindow.getPosition()[1],
            width: parentWindow.getSize()[0],
            height: parentWindow.getSize()[1],
            url: "https://www.github.com/"
        }
        // socket.emit('createWindow', opt);

        // parentWindows.id = parentWindow;
    }

    function createChildWindow(opt, socket){
        // console.log(opt);
        childWindow = new BrowserWindow({
            id: opt.id,
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

        // childWindows[opt.id] = childWindow;
    }

    return{
        createParentWindow: createParentWindow,
        createChildWindow: createChildWindow
    }

};

module.exports = ShareWindow;
