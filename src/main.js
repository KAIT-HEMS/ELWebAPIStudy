// main.js for ELWebAPIStudy
// 2021.04.05
// Copyright (c) 2021 Kanagawa Institute of Technology, ECHONET Consortium
// Released under the MIT License.

"use strict";

const appname = "ELWebAPIStudy";
const { app, BrowserWindow, Menu } = require("electron");

// electronのmain window
let mainWindow = null;
const mainFunction = require("./elwebapistudy.js");
mainFunction.funcIndex();

// foreground
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 770,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      worldSafeExecuteJavaScript: true,
      preload: "http://localhost:3020/index.js",
    },
  });

  // menu
  const menuItems = [
    {
      label: app.name,
      submenu: [
        { role: 'quit' },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ],
    },
    // {
    //   label: 'View',
    //   submenu: [
    //     {
    //       label: 'Toggle Developer Tools',
    //       click: function() { mainWindow.toggleDevTools(); }
    //     },
    //   ]
    // }
  ];
  const menu = Menu.buildFromTemplate(menuItems);
  Menu.setApplicationMenu(menu); // set the modified menu

  mainWindow.loadURL("http://localhost:3020/");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

// アプリケーションがアクティブになった時の処理
app.on("activate", () => {
  // メインウィンドウが消えている場合は再度メインウィンドウを作成する
  if (mainWindow === null) {
    createWindow();
  }
});

app.on("window-all-closed", () => {
  app.quit();
});
