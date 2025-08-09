const { app, BrowserWindow, ipcMain } = require('electron')
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

  ipcMain.handle('printSlip', async (event, { queueId, deviceName }) => {
    const isDev = !app.isPackaged;
    const printWindow = new BrowserWindow({
      width: 300, // Width for a standard thermal printer
      height: 900,
      show: true, // Make window visible for debugging
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      }
    });

    const printUrl = isDev
      ? `http://localhost:5173/#/print/slip/${queueId}`
      : `file://${path.join(__dirname, 'dist/index.html')}#/print/slip/${queueId}`;

    printWindow.loadURL(printUrl);
    printWindow.webContents.openDevTools(); // Open DevTools for debugging

    // Wait for the 'ready-to-print' signal from the slip component
    ipcMain.once('ready-to-print', () => {
      printWindow.webContents.print({
        silent: false,
        printBackground: true,
        margins: { marginType: 'none' },
        pageSize: { width: 80000, height: 200000 }, // 80mm x ~200mm
        dpi: { horizontal: 203, vertical: 203 },
        scaleFactor: 1,
        ...(deviceName ? { deviceName } : {}),
        landscape: false,
        copies: 1
      }, (success, errorType) => {
        if (!success) {
          console.log(`Printing failed: ${errorType}`);
        }
        printWindow.close();
      });
    });

    // Timeout to prevent the window from staying open forever if something goes wrong
    setTimeout(() => {
        if (!printWindow.isDestroyed()) {
            printWindow.close();
        }
    }, 15000); // 15 seconds timeout

    return { success: true };
  });
})