const BrowserWindow = require('electron').BrowserWindow;

const ipcMain = require('electron').ipcMain;
const client = require('socket.io-client');
const socket = client.connect('http://localhost:58100');

let parentWindow;
let childWindow;

const ShareWindow = function(){
ipcMain.on('openURL', (e, url) => {
    parentWindow.loadURL(url);
});

socket.on('connect', () => {
    console.log('connected to socket.io server');

    socket.on('createWindow', (opt) => {
        createChildWindow(opt);
    })
    socket.on('closeWindow', () => {
        if(childWindow != null){ childWindow.close(); }
    })
    socket.on('move', (pos) => {
        childWindow.setPosition(pos[0], pos[1], true);
    })
    socket.on('resize', (size) => {
        childWindow.setSize(size[0], size[1], true);
    })
    socket.on('updated', (url) => {
        childWindow.loadURL(url);
    })

});


function createParentWindow(url){
    parentWindow = new BrowserWindow({
        // parent: mainWindow,
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        alwaysOnTop: true
    });
    parentWindow.loadURL(url);

    parentWindow.on('closed', () => {
        socket.emit('closeWindow', {});
        parentWindow = null;
    });
    parentWindow.on('move', () => {
        socket.emit('move', parentWindow.getPosition());
    });
    parentWindow.on('resize', () => {
        socket.emit('resize', parentWindow.getSize());
    });
    parentWindow.on('page-title-updated', (e, title) => {
        const url = parentWindow.webContents.getURL();
        console.log(url)
        socket.emit('updated', url);
    })
    const opt = {
        x: parentWindow.getPosition()[0],
        y: parentWindow.getPosition()[1],
        width: parentWindow.getSize()[0],
        height: parentWindow.getSize()[1],
        url: "https://www.github.com/"
    }
    socket.emit('createWindow', opt);


    // let child = new BrowserWindow({parent: parentWindow, modal: true, show: false})
    // child.loadURL(`file://${__dirname}/public/test.html`)
    // child.once('ready-to-show', () => {
    //   child.show()
    // })
    // child.on('closed', function() {
    //     const opt = {
    //         x: parentWindow.getPosition()[0],
    //         y: parentWindow.getPosition()[1],
    //         width: parentWindow.getSize()[0],
    //         height: parentWindow.getSize()[1],
    //         url: "https://www.github.com/"
    //     }
    //     socket.emit('createWindow', opt);
    //     child = null;
    // });
}

function createChildWindow(opt){
    console.log(opt)
    childWindow = new BrowserWindow({
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
}

return{
    createParentWindow: createParentWindow,
    createChildWindow: createChildWindow
}

}();

module.exports = ShareWindow;
