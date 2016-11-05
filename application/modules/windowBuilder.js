'use strict';

const BrowserWindow = require('electron').BrowserWindow;

module.exports = {
    createMainWindow(closer) {
        // Create the browser window.
        const mainWindow = new BrowserWindow({
            width: 600,
            height: 400,
            center: true,
            titleBarStyle: 'hidden-inset',
            movable: true
        });

        // and load the index.html of the app.
        mainWindow.loadURL(`file://${__dirname}/../public/index.html`);

        // Open the DevTools.
        // mainWindow.webContents.openDevTools();

        // Emitted when the window is closed.
        mainWindow.on('closed', closer);

        return mainWindow;
    },

    createVideoWindow(role, closer) {
        const bound = require('electron').screen.getPrimaryDisplay().workAreaSize;

        // Create the browser window.
        const videoWindow = new BrowserWindow({
            width: bound.width,
            height: bound.height,
            x: 0,
            y: 0,
            alwaysOnTop: true,
            transparent: true,
            show: true,
            frame: false
        });

        // and load the index.html of the app.
        videoWindow.loadURL(`file://${__dirname}/../public/index.html`);
        // videoWindow.loadURL(`file://${__dirname}/../public/${role.role}_oto.html`);

        // Open the DevTools.
        // mainWindow.webContents.openDevTools();

        // Emitted when the window is closed.
        videoWindow.on('closed', closer);

        return videoWindow;
    }
};
