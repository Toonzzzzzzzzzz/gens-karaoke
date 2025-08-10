const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const registerAllApi = require('./api')
const dotenv = require('dotenv')
dotenv.config()

const isDev = process.env.DEV_MODE === 'true';

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

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'))
    win.webContents.openDevTools()
  }
}

app.whenReady().then(async () => {
  createWindow()
  await registerAllApi()

  ipcMain.handle('printSlip', async (event, { queueId, deviceName }) => {
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

    if (isDev) {
      printWindow.loadURL(`http://localhost:5173/#/print/slip/${queueId}`);
    } else {
      const filePath = path.join(__dirname, 'dist/index.html');
      const url = `file://${filePath}#/print/slip/${queueId}`;
      console.log(`[Print Window] Attempting to load URL in production: ${url}`);
      printWindow.loadURL(url);
    }

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