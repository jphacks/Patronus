const path = require('path');

const electron = require('electron');

const defaultMenu = require('electron-default-menu');

const { app, BrowserWindow, Menu, shell } = electron;

const Connector = require('./modules/connector.js');

const window_builder = require(path.join(__dirname, 'modules', 'windowBuilder.js'));

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

let role = {role: null};

let connector = null;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', (err) => {
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
                click: (item, focusedWindow) => {
                    if(!role.role) {
                        // TODO
                    }
                }
            },

        ]
    });

    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));

    mainWindow = window_builder.createMainWindow(windowCloser);

    connector = new Connector(mainWindow, role);
});

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
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
