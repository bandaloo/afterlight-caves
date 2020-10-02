const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const serve = require('electron-serve');

const loadURL = serve({directory: 'dist'});

let mainWindow;

(async () => {
  await app.whenReady();

  app.allowRendererProcessReuse = false;

  mainWindow = new BrowserWindow({
    width: 960,
    height: 540,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true
    },
    icon: path.join('dist', 'images', 'favicon-250.png')
  });
  mainWindow.setMenu(null);

  await loadURL(mainWindow);

  // The above is equivalent to this:
  await mainWindow.loadURL('app://-');
  // The `-` is just the required hostname
})();
