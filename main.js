const { app, BrowserWindow } = require('electron')
const path = require('path')
const registerAllApi = require('./api')
require('./db')

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
    }
  })

  let resizeTimer;

  win.on('resize', () => {
    clearTimeout(resizeTimer); 
    resizeTimer = setTimeout(() => {
      console.log('Window resized, reloading...');
      win.reload();
    }, 250);
  });
  
  const isDev = !app.isPackaged
  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()
  registerAllApi()
})