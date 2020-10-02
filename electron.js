const { app, BrowserWindow } = require('electron');
const path = require('path');
const serve = require('electron-serve');

const loadURL = serve({directory: 'dist'});

let mainWindow;

(async () => {
  await app.whenReady();

  app.allowRendererProcessReuse = false;

  mainWindow = new BrowserWindow({
      width: 964,
      height: 570,
      webPreferences: {
        nodeIntegration: true
      }
    });

  await loadURL(mainWindow);

  // The above is equivalent to this:
  await mainWindow.loadURL('app://-');
  // The `-` is just the required hostname
})();
