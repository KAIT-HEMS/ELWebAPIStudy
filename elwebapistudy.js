#!/usr/bin/env node

// elwebapistudy.js for ELWebAPIStudy
// 2021.03.02
// Copyright (c) 2021 Kanagawa Institute of Technology, ECHONET Consortium
// Released under the MIT License.
// access http://localhost:3020/elwebapistudy
 
'use strict';

const VERSION = "0.4.0 rev.20210302";
const portNumber = 3020;
const appname = 'ELWebAPIStudy';

let express = require('express');
let app = express();
let server = require('http').Server(app);
const fs = require('fs');
const path = require('path');
const https = require('https');
const WebSocket = require("ws").Server;
const wss = new WebSocket({ server });
const port = process.env.PORT || portNumber;
let config ={}; // config.json data

const configPath = path.join(__dirname, 'config.json');

module.exports.funcIndex = function() {  // Addition on 2021.02.01
// 設定データ(config.json)の読み込み
fs.readFile(configPath, 'utf8', (err, data) => {
    if (err) throw err;
  config = JSON.parse(data);
  console.log("\nconfig.json:", config);
});

// web serverの起動
server.listen(port, function(){
  console.log("\n**************************************************************");
  console.log("*** elwebapistudy " + VERSION + ", http://localhost:" + port + " ***");
  console.log("**************************************************************\n");
});

// ***** START of <routing for express> *****
// location of static files
app.use(express.static(__dirname + '/html'))

// middleware for express
app.use(express.json());

// *** routing for express ***
// GET /  
app.get('/', function(req, res){
  console.log("\nREST: GET /");
  res.sendFile(__dirname + '/html/index.html');
});

// GET /index
app.get('/index', function(req, res){
  console.log("\nREST: GET /index.html");
  res.sendFile(__dirname + '/html/index.html');
});

// GET /elwebapistudy/config
// request config.json data
app.get('/elwebapistudy/config', function(req, res){
  console.log("\nREST: GET /elwebapistudy/config");
  res.send(config);
});

// PUT /elwebapistudy/config
// update config.json data
app.put('/elwebapistudy/config', function(req, res){
  console.log("\nREST: PUT /elwebapistudy/config\n", req.body.config);
  updateConfig(JSON.stringify(req.body.config));
  res.send("Got a PUT request at /elwebapistudy/config");
});

// EL web api serverへのREST送信のリクエスト
app.put('/elwebapistudy/send', function(req, res){
  console.log("\nREST: PUT /elwebapistudy/send");
  sendRequest(req.body.hostname, req.body.path, req.body.method, req.body.headers, req.body.body);
  res.send("Got a PUT request at /elwebapistudy/send");
});

// Log保存リクエスト
app.post('/elwebapistudy/saveLog', function(req, res){
  console.log("\nREST: POST /elwebapistudy/saveLog");
  saveLog(req.body.log);
  res.send("Got a POST request at /elwebapistudy/saveLog");
});
// ***** END of <routing for express> *****

// websocket: A process when WebSocket server gets a connection from a client
wss.on("connection", ws => {
  console.log("WebSocket: connection");
  ws.on("message", message => {
    console.log("Received: " + message);
    if (message === "hello") {
        ws.send("hello from server");
    }
  });
});


} // Addition on 2021.02.01


// config.jsonのupdate (writeFile config.json)
function updateConfig(data){ // data:string, config.json用のデータ
  const buffer = Buffer.from(data);
  // fs.writeFile("config.json", buffer, (err) => {
  fs.writeFile(configPath, buffer, (err) => {
    if (err) console.log("Error: Can not save config.json.");
    console.log('\nconfig.json has been saved!');
  });
}

// ECHONET Lite webApi serverへのREST送信
function sendRequest(hostname, path, method, headers, body) { 
  // hostname:string, path:string, method:string, headers:object, body:
  console.log("", method, hostname, path);
  console.log(" headers:", headers);
  if (body != ""){
    console.log(" body:", body);
  }

  const options = {
    hostname: hostname, //'webapiechonet.com'
    path: path,         //'/elapi/v1'
    method: method,     //'GET', 'PUT', 'POST' or 'DELETE'
    headers: headers    // { "X-Elapi-key" : "8cef65ec5f3c85bd8179ee9d1075fe413bbb6a2ad440d27b0be57cc03035471a" }
  };
  
  // https requestの作成と、call backの定義。
  // call backはresponseが複数回の場合も考慮してresStrを作成する。
  // responseが終了(end)したら、websocketで通知する。
  const req = https.request(options, (res) => {
    console.log(' response statusCode:', res.statusCode);
    let resStr = '';

    res.on('data', (d) => {
      // response(d)はbuffer dataなので、string(JSON)に変換
      // 複数回のresponseに対応
      resStr += d.toString('utf8');
    });
    res.on('end', () => {
      console.log(" response:",resStr);
      const data = (resStr == "") ? {} : JSON.parse(resStr);
      const message = JSON.stringify({
        "hostname":hostname,
        "path":path,
        "method":method,
        "statusCode":res.statusCode,
        "response":data
      })
      // websocket: push to client(web browser)
      wss.clients.forEach((client) => {
        client.send(message, (error) => {
          if(error) {
            console.log('Failed to send a message on the WebSocket channel.', error);
          }
        });
      });
    });
  });
  
  req.on('error', (e) => {
    console.error(e);
  });

  // Write data to request-body for PUT or POST
  if ((body !== "") && (body !== undefined)){
    req.write(body);
  }
  req.end();
}
