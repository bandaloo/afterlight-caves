const { dialog } = require('electron');

module.exports = [
  {
    role: "fileMenu",
    submenu: [{ role: "quit" }]
  },
  {
    label: "&Help",
    role: "help",
    submenu: [
      {
        label: "Controls",
        accelerator: "CommandOrControl+/",
        click: () => {
          dialog.showMessageBox(null, {
            type: "info",
            title: "Controls",
            message: "Move with WASD, shoot with arrow keys",
            detail:
              "Space drops a bomb and selects menu items." +
              "\nPress F for fullscreen." +
              "\nPress Escape to pause." +
              "\nTab goes back or cancels." +
              "\nTry using a controller with analog sticks for finer control!"
          });
        }
      },
      {
        label: "Credits",
        accelerator: "CommandOrControl+.",
        click: () => {
          dialog.showMessageBox(null, {
            type: "info",
            title: "Credits",
            message: "Created by Cole Granof, Joseph Petitti, and Matt Puentes",
            detail: "See https://afterlightcaves.com for more details"
          });
        }
      },
      { label: "Open dev tools", role: "toggleDevTools" }
    ]
  }
];
