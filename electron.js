const { app, BrowserWindow, Menu, nativeImage } = require("electron");
const path = require("path");
const serve = require("electron-serve");

let mainWindow;

const menuTemplate = require("./electron-files/menuTemplate")

const loadURL = serve({directory: "dist"});

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
    icon: nativeImage.createFromPath(
      path.join("dist", "images", "favicon-250.png")
    )
  });
  const menu = Menu.buildFromTemplate(menuTemplate);
  mainWindow.setMenu(menu);

  await loadURL(mainWindow);
})();

