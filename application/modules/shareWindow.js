const BrowserWindow = require('electron').BrowserWindow;
const client = require('socket.io-client');
const socket = client.connect('http://localhost:58100');

let childWindows = [];

const hona = function(){

socket.on('connect', function(){
    console.log('connect to socket.io server');

    socket.on('openURL', function(url){
        child.close()
        // createChildWindow();
        // childWindows[0].setPosition(pos[0], pos[1], true);
    })
    socket.on('createWindow', function(opt){
        createChildWindow(opt);
        // childWindows[0].setPosition(pos[0], pos[1], true);
    })
    socket.on('closeWindow', function(){
        childWindows.forEach(function(childWindow){
            childWindow.close();
        });
    })
    socket.on('move', function(pos){
        childWindows[0].setPosition(pos[0], pos[1], true);
    })
    socket.on('resize', function(size){
        childWindows[0].setSize(size[0], size[1], true);
    })
    socket.on('updated', function(url){
        childWindows[0].loadURL(url);
    })
    socket.on('scroll', function(top){
        console.log(top);
        // childWindows[0].setSize(size[0], size[1], true);
    })
    // socket.send('how are you?');
    // socket.disconnect();
    // process.exit(0);
});


function createParentWindow(url){
    let parentWindow;
    parentWindow = new BrowserWindow({
        // parent: mainWindow,
        x: 0,
        y: 0,
        width: 800,
        height: 600
    });
    parentWindow.loadURL(url);
    parentWindow.webContents.openDevTools();

    parentWindow.on('closed', function() {
        socket.emit('closeWindow', {});
        parentWindow = null;
    });
    parentWindow.on('move', function(){
        socket.emit('move', parentWindow.getPosition());
    });
    parentWindow.on('resize', function(){
        socket.emit('resize', parentWindow.getSize());
    });
    parentWindow.on('page-title-updated', function(e, title){
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
    let childWindow;
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
    childWindow.on('closed', function() {
        childWindow = null;
    });
    childWindows.push(childWindow);
}



return{
    // windowSocket: windowSocket,
    createParentWindow: createParentWindow,
    createChildWindow: createChildWindow
}


}();


module.exports = hona;