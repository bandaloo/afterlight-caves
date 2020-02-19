const { app, BrowserWindow } = require("electron");
const serve = require('electron-serve');

const loadURL = serve({directory: 'dist'});

let mainWindow;

(async () => {
	await app.whenReady();

	mainWindow = new BrowserWindow({
      width: 964,
      height: 544,
      webPreferences: {
        nodeIntegration: true
      }
    });

	await loadURL(mainWindow);

	// The above is equivalent to this:
	await mainWindow.loadURL('app://-');
	// The `-` is just the required hostname
})();
