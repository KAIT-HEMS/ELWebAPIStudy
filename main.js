// main.js for ELWebAPIStudy
// 2021.03.04
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
    height: 768,
    webPreferences: {
      nodeIntegration: false,
      worldSafeExecuteJavaScript: true,
      preload: "http://localhost:3020/index.js",
    },
  });

  // customize menu (remove items)
  const menu = Menu.getApplicationMenu(); // get default menu
  menu.items.find((item) => item.label === "File").visible = false;
  menu.items.find((item) => item.label === "View").visible = false;
  menu.items.find((item) => item.label === "Window").visible = false;
  menu.items.find((item) => item.role === "help").visible = false;
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
