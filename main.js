// main.js for ELWebAPIStudy
// 2021.03.02
// Copyright (c) 2021 Kanagawa Institute of Technology, ECHONET Consortium
// Released under the MIT License.

"use strict";

// app frame config
const appname = "ELWebAPIStudy";

//////////////////////////////////////////////////////////////////////
// 基本ライブラリ
const { app, BrowserWindow, ipcMain, Menu, shell } = require("electron");

const path = require("path");
const util = require("util");
const os = require("os");
const fs = require("fs");

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
