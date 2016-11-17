const path = require('path');

const electron = require('electron');

const defaultMenu = require('electron-default-menu');

const { app, BrowserWindow, Menu, shell, globalShortcut } = electron;

const Connector = require('./modules/connector.js');

// const ShareWindows = [];
const ShareWindow = require('./modules/shareWindow.js')();

const window_builder = require(path.join(__dirname, 'modules', 'windowBuilder.js'));

const expressModule = require('./modules/expressModule.js');

const globalShortcutRegister = {};

expressModule.createLocalHtmlServer();


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

let role = {role: null};

let connector = null;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', (err) => {
    mainWindow = window_builder.createMainWindow(windowCloser);

    connector = new Connector(mainWindow, role, ShareWindow);


    const menu = defaultMenu(app, shell);

    menu.splice(1, 0, {
        label: 'File',
        submenu: [
            {
                label: 'Open Video Window',
                click: (item, focusedWindow) => {
                    if(!role.role && !mainWindow) {
                        mainWindow = window_builder.createMainWindow(role, windowCloser);
                    }
                }
            },
            {
                label: 'New Share Window',
                accelerator: 'Command+N',
                click: (item, focusedWindow) => {
                    if(role.role == 'guider') {
                        ShareWindow.createShareWindow(new Date().getTime(), {url:`file://${__dirname}/public/test.html`},connector.socket);
                    }
                }
            },

        ]
    });

    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
    setTraineeGlobalShortcut();
    setGuiderGlobalShortcut();
});

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    // if (process.platform !== 'darwin') {
    //     app.quit();
    // }
});

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        if (role.joined) {
            mainWindow = window_builder.createVideoWindow(role, windowCloser);
        } else {
            mainWindow = window_builder.createMainWindow(windowCloser);
        }
        connector.changeMainWindow(mainWindow);
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

/* mainWindowが閉じたときのコールバック */
function windowCloser() {
    mainWindow = null;
    if(role.joined) {
        mainWindow = window_builder.createVideoWindow(role, windowCloser);
        connector.changeMainWindow(mainWindow);
    }
}

function setTraineeGlobalShortcut(){

    globalShortcutRegister['O'] = globalShortcut.register('CommandOrControl+Alt+O',()=>{
        mainWindow.webContents.send('change_opacity_up',{});
        console.log('CommandOrControl+Alt+O');
    });

    globalShortcutRegister['SO'] = globalShortcut.register('CommandOrControl+Alt+Shift+O',()=>{
        mainWindow.webContents.send('change_opacity_down',{});
        console.log('CommandOrControl+Alt+Shift+O');

    });

    globalShortcutRegister['J'] = globalShortcut.register('CommandOrControl+Alt+J',()=>{
        mainWindow.webContents.send('change_draw_type',{});
        console.log('CommandOrControl+Alt+J');

    });

}

function setGuiderGlobalShortcut(){

    globalShortcutRegister['L'] = globalShortcut.register('CommandOrControl+Alt+L',()=>{
        mainWindow.webContents.send('remote_scale_up',{});
        console.log('CommandOrControl+Alt+L');

    });

    globalShortcutRegister['SL'] = globalShortcut.register('CommandOrControl+Alt+Shift+L',()=>{
        mainWindow.webContents.send('remote_scale_down',{});
        console.log('CommandOrControl+Alt+Shift+L');

    });


}


function clearTraineeGlobalShortcut(){
    globalShortcut.unregister('CommandOrControl+Alt+O');
    globalShortcut.unregister('CommandOrControl+Alt+Shift+O');
    globalShortcut.unregister('CommandOrControl+Alt+J');
}

function clearGuiderGlobalShortcut(){
    globalShortcut.unregister('CommandOrControl+Alt+L');
    globalShortcut.unregister('CommandOrControl+Alt+Shift+L');
}
