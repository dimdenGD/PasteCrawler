const electron = require('electron');
const path = require('path');

const { app, BrowserWindow } = electron;

function createWindow () {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    },
    frame: false
  })

  win.loadFile('./static/index.html');
  win.setIcon(path.join(__dirname, './static/icon.png'));
}

app.on('ready', createWindow)