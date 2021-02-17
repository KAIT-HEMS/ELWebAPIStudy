// main.js for ELWebAPIStudy
// 2021.02.17
// Copyright (c) 2021 Kanagawa Institute of Technology, ECHONET Consortium
// Released under the MIT License.

"use strict";

// app frame config
const appname = "ELWebAPIStudy";

//////////////////////////////////////////////////////////////////////
// 基本ライブラリ
const { app, BrowserWindow, ipcMain, Menu, shell } = require("electron");
// const {default: installExtension, VUEJS_DEVTOOLS } = require("electron-devtools-installer");

const path = require("path");
const util = require("util");
const os = require("os");
const fs = require("fs");

// electronのmain window
let mainWindow = null;

//////////////////////////////////////////////////////////////////////
// Communication for Electron's Renderer process
//////////////////////////////////////////////////////////////////////
// IPC 受信から非同期で実行
// ipcMain.on("to-main", function (event, arg) {
//   // メッセージが来たとき
//   console.log("--- received from Renderer.");
//   console.log(arg);
// });

//////////////////////////////////////////////////////////////////////
const mainFunction = require("./elwebapistudy.js");
mainFunction.funcIndex();

//////////////////////////////////////////////////////////////////////
// Communication for Electron's Renderer process
//////////////////////////////////////////////////////////////////////
// IPC 受信から非同期で実行
// ipcMain.on("to-main", function (event, arg) {
//   // メッセージが来たとき
//   console.log("--- received from Renderer.");
//   console.log(arg);

//   let c = JSON.parse(arg);

//   switch (c.cmd) {
//     case "already": // 準備出来たらRenderer更新して，INF
//       break;

//     default:
//       console.log("## get error cmd : " + arg);
//       break;
//   }
// });

//////////////////////////////////////////////////////////////////////
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

  // mainWindow.setMenu(null);
  menuInitialize();
  mainWindow.loadURL("http://localhost:3020/");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

// アプリケーションがアクティブになった時の処理
// （Macだと、Dockがクリックされた時）
app.on("activate", () => {
  // メインウィンドウが消えている場合は再度メインウィンドウを作成する
  if (mainWindow === null) {
    createWindow();
  }
});

app.on("window-all-closed", () => {
  // macだろうとプロセスはkillしちゃう
  app.quit();
});

// menu
const menuItems = [
  {
    label: "ELWebAPIStudy",
    submenu: [
      {
        label: "Preferences...",
        accelerator: "Command+,",
        click: function () {
        },
      },
      {
        label: "Quit",
        accelerator: "Command+Q",
        click: function () {
          app.quit();
        },
      },
    ],
  },
  {
    label: "Edit",
    submenu: [
      { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
      { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
      { type: "separator" },
      { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
      { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
      { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
      {
        label: "Select All",
        accelerator: "CmdOrCtrl+A",
        selector: "selectAll:",
      },
    ],
  },
  {
    label: "View",
    submenu: [
      {
        label: "Reload",
        accelerator: "Command+R",
        click(item, focusedWindow) {
          if (focusedWindow) focusedWindow.reload();
        },
        // },
        // {
        // label: 'Toggle Full Screen',
        // accelerator: 'Ctrl+Command+F',
        // click: function() { mainWindow.setFullScreen(!mainWindow.isFullScreen()); }
        // },
        // {
        // label: 'Toggle Developer Tools',
        // accelerator: 'Alt+Command+I',
        // click: function() { mainWindow.toggleDevTools(); }
      },
    ],
  },
];

function menuInitialize() {
  let menu = Menu.buildFromTemplate(menuItems);
  Menu.setApplicationMenu(menu);
  mainWindow.setMenu(menu);
}
