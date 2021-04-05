// main.js for elwebapistudy(client side)
// 2021.03.04
// Copyright (c) 2021 Kanagawa Institute of Technology, ECHONET Consortium
// Released under the MIT License.
//
// main.jsは、ELWebApiStudyのクライアント側JavaScript codeである。
// サーバーはlocalhost:3020/elwebapistudy
// 設定ファイルはサーバー側にconfig.jsonとして存在する。

"use strict";

const os = require("os");
const fs = require("fs");
const path = require("path");
const scheme = "https";
const elApiServer = "webapiechonet.com";
const prefix = "/elapi/v1";

const g_serverURL = "/elwebapistudy/"; // SPAのweb serverのURL
let g_thingInfo = {};
// thing id(device id, group id, bulk id, history id)をkeyとして、以下の項目を保持
// serviceがdevice以外の場合は、"deviceType":""
// {
//   <thing id>:{
//     "deviceType":<deviceType>,
//     "propertyList":[<resourceName>],
//     "propertyListWritable":[<resourceName>]
//     "actionList":[<resourceName>]
let g_flagSendButtonIsClicked = false; // Request & Responseに不要なデータを表示しないためのflag
let g_flagIsBootProcessFinished = false; // 起動時に機器一覧を取得した時に処理が必要。その区別のため。
let g_flagIsApikeyEmpty = true; // 起動時に apikey が設定されていないかを確認

let bind_data = {
  // Software version
  version: "v0.5.0",

  // data in config.json
  scheme: "",
  elApiServer: "",
  apiKey: "",
  prefix: "",

  // Home page, input and control
  lighting: {},
  aircon: {},
  waterHeater: {},
  smartMeter: {},
  propertyInfoArray: [], // [{propertyName:string, description:string, writable:boolean}, {}]

  airconOperationStatus: "",
  airconOperationMode: "",
  airconTargetTemperature: "",
  lightingOperationStatus: "",
  lightingOperationMode: "",
  lightingBrightness: "",
  waterHeaterOperationStatus: "",
  waterHeaterTankOperationMode: "",
  waterHeaterTargetWaterHeatingTemperature: "",
  smartMeterNormalDirectionCumulativeElectricEnergy: "",
  smartMeterInstantaneousElectricPower: "",
  smartMeterNormalDirectionCumulativeElectricEnergyLog1: "",

  deviceSelected: "",
  graphicLighting: "off",
  graphicAircon: "off",
  graphicWaterHeater: "off",
  graphicSmartMeter: "off",
  device_id: "",
  device_deviceType: "",
  device_version: "",
  device_manufacturer: "",

  // methodList: ["GET", "PUT", "POST", "DELETE"],
  // requestMethod: "GET",
  serviceList: [""], // [/devices, /groups]
  // serviceSelected: "",
  idInfoList: [], // [{deviceType:"/aircon", id:"0123", version:"Rel.M", manufacturer:"神奈川工科大学"},... ]
  // GET /devices, groups, bulk, histories のレスポンスを利用
  idSelected: "",
  idToolTip: "XXX",
  deviceType: "",
  // resourceTypeList: [], // [/properties, /actons]
  // resourceTypeSelected: "",
  resourceNameList: [], // [/airFlowLevel, /roomTemperature,...]
  // resourceNameSelected:"",
  query: "",
  body: "",

  // Home page, Request & Response, LOG
  request: "request:",
  requestBody: "request body:",
  statusCode: "response: status code",
  response: "response: data",
  // rbOrder: "normalOrder", // "normalOrder" or "reverseOrder"
  message_list: [],

  // Setting page
  addDevice: "", // デバイス追加で選択されたデバイス名
  addDeviceList: [
    // デバイス追加に表示するデバイス名のリスト
    "",
    "homeAirConditioner",
    "instantaneousWaterHeater",
    "fuelCell",
    "storageBattery",
    "evChargerDischarger",
    "lvSmartElectricEnergyMeter",
    "hvSmartElectricEnergyMeter",
    "generalLighting",
    "evCharger",
    "enhancedLightingSystem",
    "controller",
    "ventilationFan",
    "airCleaner",
    "commercialAirConditionerIndoorUnit",
    "commercialAirConditionerOutdoorUnit",
    "electricRainDoor",
    "electricWaterHeater",
    "electricLock",
    "bathroomHeaterDryer",
    "pvPowerGeneration",
    "floorHeater",
    "monoFunctionalLighting",
    "refrigerator",
    "cookingHeater",
    "riceCooker",
    "commercialShowcase",
    "commercialShowcaseOutdoorUnit",
    "switch",
    "hybridWaterHeater",
    "washerDryer",
  ],

  // CSS
  methodStyle: { color: "black" },
  serviceStyle: { color: "black" },
  idStyle: { color: "black" },
  resourceTypeStyle: { color: "black" },
  resourceNameStyle: { color: "black" },
  queryStyle: { color: "black" },
  bodyStyle: { color: "black" },
};

// component:template_homeの定義
const template_home = {
  template: "#tmpl-page-home",
  data: () => {
    return bind_data;
  },
  computed: {
    selectedDeviceComponent: function () {
      // Device Description が取得済みの場合のみ Property Sectionを表示する
      if (this.propertyInfoArray) {
        return "ctrl-" + this.deviceSelected;
      }
    },
    operationGuide: function () {
      if (this.idInfoList.length == 0) {
        return "機器一覧取得ボタンをクリックしてください";
      }
      if (this.deviceSelected == "") {
        return "デバイスのアイコンをクリックしてください";
      }
      if (this.propertyInfoArray === undefined) {
        return "機器情報取得ボタンをクリックしてください";
      }
      return "Property の設定や値取得を実行してください";
    },
  },
  methods: {
    getDeviceInfoButtonIsClicked: function () {
      console.log("getDeviceInfo ボタンがクリックされました。");
      g_flagSendButtonIsClicked = true;
      const requestMethod = "GET";
      const message = accessElServer(
        this.scheme,
        this.elApiServer,
        this.apiKey,
        requestMethod,
        this.prefix,
        "/devices",
        "",
        "",
        "",
        "",
        ""
      );
      // REQUEST表示エリアのデータ設定
      this.request = makeRequest(
        message.method,
        this.scheme,
        message.hostname,
        message.path
      );
      this.requestBody = "";
    },
    clearOperationButtonIsClicked: function () {
      console.log("Clear-Operation ボタンがクリックされました。");
      this.deviceSelected = "";
      this.graphicLighting = "off";
      this.graphicAircon = "off";
      this.graphicWaterHeater = "off";
      this.graphicSmartMeter = "off";
      this.idInfoList = [];
      this.device_id = "";
      this.device_deviceType = "";
      this.device_version = "";
      this.device_manufacturer = "";
      this.propertyInfoArray = [];
      this.airconOperationStatus = "";
      this.airconOperationMode = "";
      this.airconTargetTemperature = "";
    },
    lightingIsClicked: function () {
      console.log("照明が選択されました。");
      this.deviceSelected = "lighting";
      this.graphicLighting = "selected";
      if (this.graphicAircon !== "off") {
        this.graphicAircon = "notSelected";
      }
      if (this.graphicWaterHeater !== "off") {
        this.graphicWaterHeater = "notSelected";
      }
      if (this.graphicSmartMeter !== "off") {
        this.graphicSmartMeter = "notSelected";
      }
      this.device_id = this.lighting.id;
      this.device_deviceType = this.lighting.deviceType;
      this.device_version = this.lighting.version;
      this.device_manufacturer = this.lighting.manufacturer;
      this.propertyInfoArray = this.lighting.propertyInfoArray;
    },
    airconIsClicked: function () {
      console.log("エアコンが選択されました。");
      this.deviceSelected = "aircon";
      if (this.graphicLighting !== "off") {
        this.graphicLighting = "notSelected";
      }
      this.graphicAircon = "selected";
      if (this.graphicWaterHeater !== "off") {
        this.graphicWaterHeater = "notSelected";
      }
      if (this.graphicSmartMeter !== "off") {
        this.graphicSmartMeter = "notSelected";
      }
      this.device_id = this.aircon.id;
      this.device_deviceType = this.aircon.deviceType;
      this.device_version = this.aircon.version;
      this.device_manufacturer = this.aircon.manufacturer;
      this.propertyInfoArray = this.aircon.propertyInfoArray;
    },
    waterHeaterIsClicked: function () {
      console.log("温水器が選択されました。");
      this.deviceSelected = "waterHeater";
      if (this.graphicLighting !== "off") {
        this.graphicLighting = "notSelected";
      }
      if (this.graphicAircon !== "off") {
        this.graphicAircon = "notSelected";
      }
      this.graphicWaterHeater = "selected";
      if (this.graphicSmartMeter !== "off") {
        this.graphicSmartMeter = "notSelected";
      }
      this.device_id = this.waterHeater.id;
      this.device_deviceType = this.waterHeater.deviceType;
      this.device_version = this.waterHeater.version;
      this.device_manufacturer = this.waterHeater.manufacturer;
      this.propertyInfoArray = this.waterHeater.propertyInfoArray;
    },
    smartMeterIsClicked: function () {
      console.log("スマートメータが選択されました。");
      this.deviceSelected = "smartMeter";
      if (this.graphicLighting !== "off") {
        this.graphicLighting = "notSelected";
      }
      if (this.graphicAircon !== "off") {
        this.graphicAircon = "notSelected";
      }
      if (this.graphicWaterHeater !== "off") {
        this.graphicWaterHeater = "notSelected";
      }
      this.graphicSmartMeter = "selected";
      this.device_id = this.smartMeter.id;
      this.device_deviceType = this.smartMeter.deviceType;
      this.device_version = this.smartMeter.version;
      this.device_manufacturer = this.smartMeter.manufacturer;
      this.propertyInfoArray = this.smartMeter.propertyInfoArray;
    },
    getDeviceDescriptionButtonIsClicked: function () {
      console.log("機器情報取得 ボタンがクリックされました。");
      if (this.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const requestMethod = "GET";
        const message = accessElServer(
          this.scheme,
          this.elApiServer,
          this.apiKey,
          requestMethod,
          this.prefix,
          "/devices",
          "/" + this.device_id,
          "",
          "",
          "",
          ""
        );
        // REQUEST表示エリアのデータ設定
        this.request = makeRequest(
          message.method,
          this.scheme,
          message.hostname,
          message.path
        );
        this.requestBody = "";
      }
    },
    getAllPropertyValuesButtonIsClicked: function () {
      console.log("全プロパティ値取得 ボタンがクリックされました。");
      if (this.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const requestMethod = "GET";
        const message = accessElServer(
          this.scheme,
          this.elApiServer,
          this.apiKey,
          requestMethod,
          this.prefix,
          "/devices",
          "/" + this.device_id,
          "/properties",
          "",
          "",
          ""
        );
        // REQUEST表示エリアのデータ設定
        this.request = makeRequest(
          message.method,
          this.scheme,
          message.hostname,
          message.path
        );
        this.requestBody = "";
      }
    },
    clearReqAndResButtonIsClicked: function () {
      console.log("Clear-ReqAndRes ボタンがクリックされました。");
      this.request = "request:";
      this.requestBody = "request body";
      this.statusCode = "response: status code";
      this.response = "response: data";
    },
  },
};

// component:template_settingの定義
const template_setting = {
  template: "#tmpl-page-setting",
  data: () => {
    return bind_data;
  },
  methods: {
    // 設定保存ボタンがクリックされたときの処理
    saveSettingsButtonIsClicked: function () {
      // const configData = {
      //   scheme: this.scheme,
      //   elApiServer: this.elApiServer,
      //   prefix: this.prefix,
      //   apiKey: this.apiKey,
      // };
      // console.log("saveSettingsButtonIsClicked", configData);
      // saveConfig(configData);
      console.log("saveSettingsButtonIsClicked", this.apiKey);
      saveApiKey(this.apiKey);

      // 起動時処理が完了していなくて、apiKeyが設定されている場合、機器一覧取得を行う。
      if (!g_flagIsBootProcessFinished && this.apiKey) {
        const requestMethod = "GET";
        const message = accessElServer(
          scheme,
          elApiServer,
          this.apiKey,
          requestMethod,
          prefix,
          "/devices",
          "",
          "",
          "",
          "",
          ""
        );
      }
    },
    // デバイス削除ボタン(Trash can)がクリックされたときの処理
    deleteDeviceButtonIsClicked: function (value) {
      const deviceId = vm.idInfoList[value].id;
      console.log(
        "deleteDeviceButtonIsClicked is clicked, value=",
        deviceId.slice(1)
      );
      accessElServerDeleteDevice(
        this.scheme,
        this.elApiServer,
        this.apiKey,
        this.prefix,
        deviceId.slice(1)
      );
    },
    // デバイス追加ボタンがクリックされたときの処理
    addDeviceButtonIsClicked: function () {
      console.log("addDeviceButtonIsClicked is clicked", vm.addDevice);
      accessElServerAddDevice(
        this.scheme,
        this.elApiServer,
        this.apiKey,
        this.prefix,
        vm.addDevice
      );
    },
    // UPDATEボタンがクリックされたときの処理
    updateButtonIsClicked: function () {
      console.log("updateButtonIsClicked is clicked");
      const requestMethod = "GET";
      accessElServer(
        this.scheme,
        this.elApiServer,
        this.apiKey,
        requestMethod,
        this.prefix,
        "/devices",
        "",
        "",
        "",
        "",
        ""
      );
    },
  },
  // インスタンスが生成された時（Setting pageを表示する時）に呼ばれるfunction
  // EL WebAPI serverにアクセス（GET /devices)して、デバイス情報を取得
  created: function () {
    console.log("Setting page is created");
    if (!g_flagIsApikeyEmpty) {
      accessElServer(
        this.scheme,
        this.elApiServer,
        this.apiKey,
        "GET",
        this.prefix,
        "/devices",
        "",
        "",
        "",
        "",
        ""
      );
    }
  },
};

// component:template_helpの定義
const template_help = {
  template: "#tmpl-page-help",
  data: () => {
    return bind_data;
  },
};

// routerの定義
const router = new VueRouter({
  routes: [
    { path: "/", component: template_home },
    { path: "/home", component: template_home },
    { path: "/setting", component: template_setting },
    { path: "/help", component: template_help },
  ],
});

// Request & Response 表示エリアに表示する request data を作成する。（戻り値が、表示する request data）
function makeRequest(method, scheme, hostname, path) {
  return "REQ " + method + " " + scheme + "://" + hostname + path;
}

// ECHONET Lite WebApi serverにアクセスする
function accessElServer(
  scheme,
  elApiServer,
  apiKey,
  requestMethod,
  prefix,
  serviceSelected,
  idSelected,
  resourceTypeSelected,
  resourceNameSelected,
  query,
  body
) {
  console.log("access ECHONET Lite WebApi server");
  console.log("serviceSelected:", serviceSelected);
  // pathの作成
  let path = prefix;
  if (serviceSelected !== "") {
    path += serviceSelected;
    if (idSelected !== "") {
      path += idSelected;
      if (resourceTypeSelected !== "") {
        path += resourceTypeSelected;
        if (resourceNameSelected !== "") {
          path += resourceNameSelected;
          if (query !== "") {
            path += "?" + query;
          }
        }
      }
    }
  }
  console.log(" path:", path);

  const bodyData = requestMethod == "GET" ? "" : body;
  let message = {
    hostname: elApiServer,
    method: requestMethod,
    path: path,
    headers: {
      "X-Elapi-key": apiKey,
      "Content-Type": "application/json",
      "Content-Length": new Blob([bodyData]).size,
    },
    body: bodyData,
  };
  console.log(" message: ", message);

  const request = new XMLHttpRequest();
  request.open("PUT", g_serverURL + "send");
  request.setRequestHeader("Content-type", "application/json");
  request.send(JSON.stringify(message));

  return message;
}

// ECHONET Lite WebApi serverにアクセスして、実験クラウド専用のAPIで機器を削除する
function accessElServerDeleteDevice(
  scheme,
  elApiServer,
  apiKey,
  prefix,
  deviceId
) {
  console.log("accessElServerDeleteDevice: Delete ", deviceId);
  let path = prefix + "/config/device/" + deviceId;
  const bodyData = "";
  let message = {
    hostname: elApiServer,
    method: "DELETE",
    path: path,
    headers: {
      "X-Elapi-key": apiKey,
      "Content-Type": "application/json",
      "Content-Length": bodyData.length,
    },
    body: bodyData,
  };

  const request = new XMLHttpRequest();
  request.open("PUT", g_serverURL + "send");
  request.setRequestHeader("Content-type", "application/json");
  request.send(JSON.stringify(message));
}

// ECHONET Lite WebApi serverにアクセスして、実験クラウド専用のAPIで機器を追加する
function accessElServerAddDevice(
  scheme,
  elApiServer,
  apiKey,
  prefix,
  deviceType
) {
  console.log("accessElServerAddDevice: Add ", deviceType);
  let path = prefix + "/config/device/";
  const bodyData = '{"deviceType":"' + deviceType + '"}';
  let message = {
    hostname: elApiServer,
    method: "POST",
    path: path,
    headers: {
      "X-Elapi-key": apiKey,
      "Content-Type": "application/json",
      "Content-Length": bodyData.length,
    },
    body: bodyData,
  };

  const request = new XMLHttpRequest();
  request.open("PUT", g_serverURL + "send");
  request.setRequestHeader("Content-type", "application/json");
  request.send(JSON.stringify(message));
}

// config.jsonの保存をサーバーに依頼
function saveConfig(configData) {
  const message = { config: configData };
  console.log("saveConfig: message", message);
  const request = new XMLHttpRequest();
  request.open("PUT", g_serverURL + "config");
  request.setRequestHeader("Content-type", "application/json");
  request.send(JSON.stringify(message));
}

// saveApiKey の保存をサーバーに依頼
function saveApiKey(apiKey) {
  const message = { apiKey: apiKey };
  console.log("saveApiKey: message", message);
  const request = new XMLHttpRequest();
  request.open("PUT", g_serverURL + "apiKey");
  request.setRequestHeader("Content-type", "application/json");
  request.send(JSON.stringify(message));
}

// Home画面Left window - Property section - 照明
Vue.component("ctrl-lighting", {
  data: function () {
    return {
      brightnessValue: 30,
    };
  },
  computed: {
    operationStatus: {
      get() {
        return vm.lightingOperationStatus;
      },
      set() {
        this.operationStatus = vm.lightingOperationStatus;
      },
    },
    operationMode: {
      get() {
        return vm.lightingOperationMode;
      },
      set() {
        this.operationMode = vm.lightingOperationMode;
      },
    },
    brightness: {
      get() {
        return vm.lightingBrightness;
      },
      set() {
        this.brightness = vm.lightingBrightness;
      },
    },
    lightingBrightness: {
      get() {
        return this.brightnessValue;
      },
      set(value) {
        this.brightnessValue = value;
      },
    },
  },
  methods: {
    getOperationStatus: function () {
      console.log("getOperationStatusがクリックされました。");
      const requestMethod = "GET";
      if (vm.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const message = accessElServer(
          vm.scheme,
          vm.elApiServer,
          vm.apiKey,
          requestMethod,
          vm.prefix,
          "/devices",
          "/" + vm.device_id,
          "/properties",
          "/operationStatus",
          "",
          ""
        );
        // REQUEST表示エリアのデータ設定
        vm.request = makeRequest(
          message.method,
          vm.scheme,
          message.hostname,
          message.path
        );
        vm.requestBody = "";
      }
    },
    setOperationStatus: function (arg) {
      console.log("setOperationStatusがクリックされました。", arg);
      const body = '{"operationStatus": ' + arg + "}";
      const requestMethod = "PUT";
      if (vm.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const message = accessElServer(
          vm.scheme,
          vm.elApiServer,
          vm.apiKey,
          requestMethod,
          vm.prefix,
          "/devices",
          "/" + vm.device_id,
          "/properties",
          "/operationStatus",
          "",
          body
        );
        // REQUEST表示エリアのデータ設定
        vm.request = makeRequest(
          message.method,
          vm.scheme,
          message.hostname,
          message.path
        );
        vm.requestBody = body;
      }
    },
    getOperationMode: function () {
      console.log("getOperationModeがクリックされました。");
      const requestMethod = "GET";
      if (vm.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const message = accessElServer(
          vm.scheme,
          vm.elApiServer,
          vm.apiKey,
          requestMethod,
          vm.prefix,
          "/devices",
          "/" + vm.device_id,
          "/properties",
          "/operationMode",
          "",
          ""
        );
        // REQUEST表示エリアのデータ設定
        vm.request = makeRequest(
          message.method,
          vm.scheme,
          message.hostname,
          message.path
        );
        vm.requestBody = "";
      }
    },
    setOperationMode: function (arg) {
      console.log("setOperationModeがクリックされました。", arg);
      const body = '{"operationMode":"' + arg + '"}';
      const requestMethod = "PUT";
      if (vm.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const message = accessElServer(
          vm.scheme,
          vm.elApiServer,
          vm.apiKey,
          requestMethod,
          vm.prefix,
          "/devices",
          "/" + vm.device_id,
          "/properties",
          "/operationMode",
          "",
          body
        );
        // REQUEST表示エリアのデータ設定
        vm.request = makeRequest(
          message.method,
          vm.scheme,
          message.hostname,
          message.path
        );
        vm.requestBody = body;
      }
    },
    getBrightness: function () {
      console.log("getBrightnessがクリックされました。");
      const requestMethod = "GET";
      if (vm.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const message = accessElServer(
          vm.scheme,
          vm.elApiServer,
          vm.apiKey,
          requestMethod,
          vm.prefix,
          "/devices",
          "/" + vm.device_id,
          "/properties",
          "/brightness",
          "",
          ""
        );
        // REQUEST表示エリアのデータ設定
        vm.request = makeRequest(
          message.method,
          vm.scheme,
          message.hostname,
          message.path
        );
        vm.requestBody = "";
      }
    },
    setBrightness: function () {
      console.log(
        "setBrightnessがクリックされました。",
        this.lightingBrightness
      );
      const body = '{"brightness":' + this.lightingBrightness + "}";
      const requestMethod = "PUT";
      if (vm.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const message = accessElServer(
          vm.scheme,
          vm.elApiServer,
          vm.apiKey,
          requestMethod,
          vm.prefix,
          "/devices",
          "/" + vm.device_id,
          "/properties",
          "/brightness",
          "",
          body
        );
        // REQUEST表示エリアのデータ設定
        vm.request = makeRequest(
          message.method,
          vm.scheme,
          message.hostname,
          message.path
        );
        vm.requestBody = body;
      }
    },
  },
  template: `
  <div>
    <table class="table table-sm m-0">
      <thead>
        <th>プロパティ名</th>
        <th>操作（値設定）</th>
        <th>値取得</th>
      </thead>
      <tr>
        <td>動作状態</td>
        <td>
        <button type="button" class="btn btn-secondary btn-sm" title="ON" v-on:click="setOperationStatus('true')" >ON</button>
        <button type="button" class="btn btn-secondary btn-sm" title="OFF" v-on:click="setOperationStatus('false')" >OFF</button>
      </td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" title="Get value" v-on:click="getOperationStatus">Get value</button>
          {{operationStatus}}
        </td>
      </tr>
      <tr>
        <td>点灯モード</td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" title="normal" v-on:click="setOperationMode('normal')" >通常灯</button>
          <button type="button" class="btn btn-secondary btn-sm" title="night" v-on:click="setOperationMode('night')" >常夜灯</button>
          <button type="button" class="btn btn-secondary btn-sm" title="color" v-on:click="setOperationMode('color')" >カラー灯</button>
        </td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" title="Get value" v-on:click="getOperationMode">Get value</button>
          {{operationMode}}
        </td>
      </tr>
      <tr>
        <td>照度レベル設定値</td>
        <td>
          <div class="row">
            <input v-model="lightingBrightness" type="range" value="40" min="0" max="100" >
            <div class="slider-value" >{{lightingBrightness}}%</div>
            <button type="button" class="btn btn-secondary btn-sm ml-1" title="設定" v-on:click="setBrightness" >設定</button>
          </div>
        </td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" title="Get value" v-on:click="getBrightness">Get value</button>
          {{brightness}}
        </td>
      </tr>
    </table>
  </div>
  `,
});

// Home画面Left window - Property section - エアコン
Vue.component("ctrl-aircon", {
  data: function () {
    return {
      temperature: 25,
    };
  },
  computed: {
    operationStatus: {
      get() {
        return vm.airconOperationStatus;
      },
      set() {
        this.operationStatus = vm.airconOperationStatus;
      },
    },
    operationMode: {
      get() {
        return vm.airconOperationMode;
      },
      set() {
        this.operationMode = vm.airconOperationMode;
      },
    },
    targetTemperature: {
      get() {
        return vm.airconTargetTemperature;
      },
      set() {
        this.targetTemperature = vm.airconTargetTemperature;
      },
    },
    airconTemperature: {
      get() {
        return this.temperature;
      },
      set(value) {
        this.temperature = value;
      },
    },
  },
  methods: {
    getOperationStatus: function () {
      console.log("getOperationStatusがクリックされました。");
      const requestMethod = "GET";
      if (vm.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const message = accessElServer(
          vm.scheme,
          vm.elApiServer,
          vm.apiKey,
          requestMethod,
          vm.prefix,
          "/devices",
          "/" + vm.device_id,
          "/properties",
          "/operationStatus",
          "",
          ""
        );
        // REQUEST表示エリアのデータ設定
        vm.request = makeRequest(
          message.method,
          vm.scheme,
          message.hostname,
          message.path
        );
        vm.requestBody = "";
      }
    },
    setOperationStatus: function (arg) {
      console.log("setOperationStatusがクリックされました。", arg);
      const body = '{"operationStatus":' + arg + "}";
      const requestMethod = "PUT";
      if (vm.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const message = accessElServer(
          vm.scheme,
          vm.elApiServer,
          vm.apiKey,
          requestMethod,
          vm.prefix,
          "/devices",
          "/" + vm.device_id,
          "/properties",
          "/operationStatus",
          "",
          body
        );
        // REQUEST表示エリアのデータ設定
        vm.request = makeRequest(
          message.method,
          vm.scheme,
          message.hostname,
          message.path
        );
        vm.requestBody = body;
      }
    },
    getOperationMode: function () {
      console.log("getOperationModeがクリックされました。");
      const requestMethod = "GET";
      if (vm.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const message = accessElServer(
          vm.scheme,
          vm.elApiServer,
          vm.apiKey,
          requestMethod,
          vm.prefix,
          "/devices",
          "/" + vm.device_id,
          "/properties",
          "/operationMode",
          "",
          ""
        );
        // REQUEST表示エリアのデータ設定
        vm.request = makeRequest(
          message.method,
          vm.scheme,
          message.hostname,
          message.path
        );
        vm.requestBody = "";
      }
    },
    setOperationMode: function (arg) {
      console.log("setOperationModeがクリックされました。", arg);
      const body = '{"operationMode":"' + arg + '"}';
      const requestMethod = "PUT";
      if (vm.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const message = accessElServer(
          vm.scheme,
          vm.elApiServer,
          vm.apiKey,
          requestMethod,
          vm.prefix,
          "/devices",
          "/" + vm.device_id,
          "/properties",
          "/operationMode",
          "",
          body
        );
        // REQUEST表示エリアのデータ設定
        vm.request = makeRequest(
          message.method,
          vm.scheme,
          message.hostname,
          message.path
        );
        vm.requestBody = body;
      }
    },
    getTargetTemperature: function () {
      console.log("getTargetTemperatureがクリックされました。");
      const requestMethod = "GET";
      if (vm.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const message = accessElServer(
          vm.scheme,
          vm.elApiServer,
          vm.apiKey,
          requestMethod,
          vm.prefix,
          "/devices",
          "/" + vm.device_id,
          "/properties",
          "/targetTemperature",
          "",
          ""
        );
        // REQUEST表示エリアのデータ設定
        vm.request = makeRequest(
          message.method,
          vm.scheme,
          message.hostname,
          message.path
        );
        vm.requestBody = "";
      }
    },
    setTargetTemperature: function () {
      console.log(
        "setTargetTemperatureがクリックされました。",
        this.airconTemperature
      );
      const body = '{"targetTemperature":' + this.airconTemperature + "}";
      const requestMethod = "PUT";
      if (vm.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const message = accessElServer(
          vm.scheme,
          vm.elApiServer,
          vm.apiKey,
          requestMethod,
          vm.prefix,
          "/devices",
          "/" + vm.device_id,
          "/properties",
          "/targetTemperature",
          "",
          body
        );
        // REQUEST表示エリアのデータ設定
        vm.request = makeRequest(
          message.method,
          vm.scheme,
          message.hostname,
          message.path
        );
        vm.requestBody = body;
      }
    },
  },
  template: `
  <div>
    <table class="table table-sm m-0">
      <thead>
        <th>プロパティ名</th>
        <th>操作（値設定）</th>
        <th>値取得</th>
      </thead>
      <tr>
        <td>動作状態</td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" title="ON" v-on:click="setOperationStatus('true')" >ON</button>
          <button type="button" class="btn btn-secondary btn-sm" title="OFF" v-on:click="setOperationStatus('false')" >OFF</button>
        </td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" title="Get value" v-on:click="getOperationStatus">Get value</button>
          {{operationStatus}}
        </td>
      </tr>
      <tr>
        <td>運転モード</td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" title="冷房" v-on:click="setOperationMode('cooling')" >冷房</button>
          <button type="button" class="btn btn-secondary btn-sm" title="暖房" v-on:click="setOperationMode('heating')" >暖房</button>
          <button type="button" class="btn btn-secondary btn-sm" title="送風" v-on:click="setOperationMode('circulation')" >送風</button>
        </td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" title="Get value" v-on:click="getOperationMode">Get value</button>
          {{operationMode}}
        </td>
      </tr>
      <tr>
        <td>温度設定値</td>
        <td>
          <div class="row">
            <input v-model="airconTemperature" type="range" value="20" min="0" max="50" >
            <div class="slider-value" >{{airconTemperature}}℃</div>
            <button type="button" class="btn btn-secondary btn-sm ml-1" title="設定" v-on:click="setTargetTemperature" >設定</button>
          </div>
        </td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" title="Get value" v-on:click="getTargetTemperature">Get value</button>
          {{targetTemperature}}
        </td>
      </tr>
    </table>
  </div>
  `,
});

// Home画面Left window - Property section - 温水器
Vue.component("ctrl-waterHeater", {
  data: function () {
    return {
      temperature: 25,
    };
  },
  computed: {
    operationStatus: {
      get() {
        return vm.waterHeaterOperationStatus;
      },
      set() {
        this.operationStatus = vm.waterHeaterOperationStatus;
      },
    },
    tankOperationMode: {
      get() {
        return vm.waterHeaterTankOperationMode;
      },
      set() {
        this.operationMode = vm.waterHeaterTankOperationMode;
      },
    },
    targetWaterHeatingTemperature: {
      get() {
        return vm.waterHeaterTargetWaterHeatingTemperature;
      },
      set() {
        this.targetTemperature = vm.waterHeaterTargetWaterHeatingTemperature;
      },
    },
    waterHeaterTemperature: {
      get() {
        return this.temperature;
      },
      set(value) {
        this.temperature = value;
      },
    },
  },
  methods: {
    getOperationStatus: function () {
      console.log("getOperationStatusがクリックされました。");
      const requestMethod = "GET";
      if (vm.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const message = accessElServer(
          vm.scheme,
          vm.elApiServer,
          vm.apiKey,
          requestMethod,
          vm.prefix,
          "/devices",
          "/" + vm.device_id,
          "/properties",
          "/operationStatus",
          "",
          ""
        );
        // REQUEST表示エリアのデータ設定
        vm.request = makeRequest(
          message.method,
          vm.scheme,
          message.hostname,
          message.path
        );
        vm.requestBody = "";
      }
    },
    setOperationStatus: function (arg) {
      console.log("setOperationStatusがクリックされました。", arg);
      const body = '{"operationStatus":' + arg + "}";
      const requestMethod = "PUT";
      if (vm.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const message = accessElServer(
          vm.scheme,
          vm.elApiServer,
          vm.apiKey,
          requestMethod,
          vm.prefix,
          "/devices",
          "/" + vm.device_id,
          "/properties",
          "/operationStatus",
          "",
          body
        );
        // REQUEST表示エリアのデータ設定
        vm.request = makeRequest(
          message.method,
          vm.scheme,
          message.hostname,
          message.path
        );
        vm.requestBody = body;
      }
    },
    getTankOperationMode: function () {
      console.log("getTankOperationModeがクリックされました。");
      const requestMethod = "GET";
      if (vm.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const message = accessElServer(
          vm.scheme,
          vm.elApiServer,
          vm.apiKey,
          requestMethod,
          vm.prefix,
          "/devices",
          "/" + vm.device_id,
          "/properties",
          "/tankOperationMode",
          "",
          ""
        );
        // REQUEST表示エリアのデータ設定
        vm.request = makeRequest(
          message.method,
          vm.scheme,
          message.hostname,
          message.path
        );
        vm.requestBody = "";
      }
    },
    setTankOperationMode: function (arg) {
      console.log("setTankOperationModeがクリックされました。", arg);
      const body = '{"tankOperationMode":"' + arg + '"}';
      const requestMethod = "PUT";
      if (vm.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const message = accessElServer(
          vm.scheme,
          vm.elApiServer,
          vm.apiKey,
          requestMethod,
          vm.prefix,
          "/devices",
          "/" + vm.device_id,
          "/properties",
          "/tankOperationMode",
          "",
          body
        );
        // REQUEST表示エリアのデータ設定
        vm.request = makeRequest(
          message.method,
          vm.scheme,
          message.hostname,
          message.path
        );
        vm.requestBody = body;
      }
    },
    getTargetWaterHeatingTemperature: function () {
      console.log("getTargetWaterHeatingTemperatureがクリックされました。");
      const requestMethod = "GET";
      if (vm.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const message = accessElServer(
          vm.scheme,
          vm.elApiServer,
          vm.apiKey,
          requestMethod,
          vm.prefix,
          "/devices",
          "/" + vm.device_id,
          "/properties",
          "/targetWaterHeatingTemperature",
          "",
          ""
        );
        // REQUEST表示エリアのデータ設定
        vm.request = makeRequest(
          message.method,
          vm.scheme,
          message.hostname,
          message.path
        );
        vm.requestBody = "";
      }
    },
    setTargetWaterHeatingTemperature: function () {
      console.log(
        "setTargetWaterHeatingTemperatureがクリックされました。",
        this.waterHeaterTemperature
      );
      const body =
        '{"targetWaterHeatingTemperature":' + this.waterHeaterTemperature + "}";
      const requestMethod = "PUT";
      if (vm.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const message = accessElServer(
          vm.scheme,
          vm.elApiServer,
          vm.apiKey,
          requestMethod,
          vm.prefix,
          "/devices",
          "/" + vm.device_id,
          "/properties",
          "/targetWaterHeatingTemperature",
          "",
          body
        );
        // REQUEST表示エリアのデータ設定
        vm.request = makeRequest(
          message.method,
          vm.scheme,
          message.hostname,
          message.path
        );
        vm.requestBody = body;
      }
    },
  },
  template: `
  <div>
    <table class="table table-sm m-0">
      <thead>
        <th>プロパティ名</th>
        <th>操作（値設定）</th>
        <th>値取得</th>
      </thead>
      <tr>
        <td>動作状態</td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" title="ON" v-on:click="setOperationStatus('true')" >ON</button>
          <button type="button" class="btn btn-secondary btn-sm" title="OFF" v-on:click="setOperationStatus('false')" >OFF</button>
        </td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" title="Get value" v-on:click="getOperationStatus">Get value</button>
          {{operationStatus}}
        </td>
      </tr>
      <tr>
        <td>タンク運転モード</td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" title="standard" v-on:click="setTankOperationMode('standard')" >標準</button>
          <button type="button" class="btn btn-secondary btn-sm" title="saving" v-on:click="setTankOperationMode('saving')" >節約</button>
          <button type="button" class="btn btn-secondary btn-sm" title="extra" v-on:click="setTankOperationMode('extra')" >多め</button>
        </td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" title="Get value" v-on:click="getTankOperationMode">Get value</button>
          {{tankOperationMode}}
        </td>
      </tr>
      <tr>
        <td>沸き上げ湯温設定値</td>
        <td>
          <div class="row">
            <input id="slider-1" v-model="waterHeaterTemperature" type="range" value="40" min="0" max="100" >
            <div class="slider-value" >{{waterHeaterTemperature}}℃</div>
            <button type="button" class="btn btn-secondary btn-sm ml-1" title="設定" v-on:click="setTargetWaterHeatingTemperature" >設定</button>
          </div>
        </td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" title="Get value" v-on:click="getTargetWaterHeatingTemperature">Get value</button>
          {{targetWaterHeatingTemperature}}
        </td>
      </tr>
    </table>
  </div>
  `,
});

// Home画面Left window - Property section - 低圧スマートメータ
Vue.component("ctrl-smartMeter", {
  data: function () {
    return {
      dayValue: 30,
    };
  },
  computed: {
    normalDirectionCumulativeElectricEnergy: {
      get() {
        return vm.smartMeterNormalDirectionCumulativeElectricEnergy;
      },
    },
    instantaneousElectricPower: {
      get() {
        return vm.smartMeterInstantaneousElectricPower;
      },
    },
    normalDirectionCumulativeElectricEnergyLog1: {
      get() {
        return vm.smartMeterNormalDirectionCumulativeElectricEnergyLog1;
      },
    },
    queryDayValue: {
      get() {
        return this.dayValue;
      },
      set(value) {
        this.dayValue = value;
      },
    },
  },
  methods: {
    getNormalDirectionCumulativeElectricEnergy: function () {
      console.log(
        "getNormalDirectionCumulativeElectricEnergy がクリックされました。"
      );
      const requestMethod = "GET";
      if (vm.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const message = accessElServer(
          vm.scheme,
          vm.elApiServer,
          vm.apiKey,
          requestMethod,
          vm.prefix,
          "/devices",
          "/" + vm.device_id,
          "/properties",
          "/normalDirectionCumulativeElectricEnergy",
          "",
          ""
        );
        // REQUEST表示エリアのデータ設定
        vm.request = makeRequest(
          message.method,
          vm.scheme,
          message.hostname,
          message.path
        );
        vm.requestBody = "";
      }
    },
    getInstantaneousElectricPower: function () {
      console.log("getinstantaneousElectricPower がクリックされました。");
      const requestMethod = "GET";
      if (vm.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const message = accessElServer(
          vm.scheme,
          vm.elApiServer,
          vm.apiKey,
          requestMethod,
          vm.prefix,
          "/devices",
          "/" + vm.device_id,
          "/properties",
          "/instantaneousElectricPower",
          "",
          ""
        );
        // REQUEST表示エリアのデータ設定
        vm.request = makeRequest(
          message.method,
          vm.scheme,
          message.hostname,
          message.path
        );
        vm.requestBody = "";
      }
    },
    getNormalDirectionCumulativeElectricEnergyLog1: function () {
      console.log(
        "getNormalDirectionCumulativeElectricEnergyLog1 がクリックされました。"
      );
      // console.log("query", this.queryDayValue);
      const requestMethod = "GET";
      if (vm.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const message = accessElServer(
          vm.scheme,
          vm.elApiServer,
          vm.apiKey,
          requestMethod,
          vm.prefix,
          "/devices",
          "/" + vm.device_id,
          "/properties",
          "/normalDirectionCumulativeElectricEnergyLog1",
          "day=" + this.queryDayValue,
          ""
        );
        // REQUEST表示エリアのデータ設定
        vm.request = makeRequest(
          message.method,
          vm.scheme,
          message.hostname,
          message.path
        );
        vm.requestBody = "";
      }
    },
  },
  template: `
  <div>
    <table class="table table-sm m-0">
      <thead>
        <th>プロパティ名</th>
        <th>query 値設定</th>
        <th>値取得</th>
      </thead>
      <tr>
        <td>積算電力量計測値（正方向計測値）</td>
        <td></td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" title="Get value" v-on:click="getNormalDirectionCumulativeElectricEnergy">Get value</button>
          {{normalDirectionCumulativeElectricEnergy}}
        </td>
      </tr>
      <tr>
        <td>瞬時電力計測値</td>
        <td></td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" title="Get value" v-on:click="getInstantaneousElectricPower">Get value</button>
          {{instantaneousElectricPower}}
        </td>
      </tr>
      <tr>
        <td>積算電力量計測値履歴1（正方向計測値）</td>
        <td>
          <div class="row">
            <input v-model="queryDayValue" type="range" value="0" min="0" max="99" >
            <div class="slider-value" >{{queryDayValue}}日</div>
          </div>
        </td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" title="Get value" v-on:click="getNormalDirectionCumulativeElectricEnergyLog1">Get value</button>
          {{normalDirectionCumulativeElectricEnergyLog1.day}}
        </td>
      </tr>
    </table>
  </div>
  `,
});

// Vueのインスタンス作成
let vm = new Vue({
  el: "#app",
  data: bind_data,
  router,
});

// connect websocket
console.log("Request WebScoket connection, ws://" + document.location.host);
let ws = new WebSocket("ws://" + document.location.host);
ws.onopen = function (event) {
  console.log(" WebSocket: connected");
};

// 起動時に、server側のファイル apikey.txt のデータをリクエストする。その値をvmに設定する。
// apiKeyがblankの場合、Alert ダイアログを表示する。
//  (electron では window.prompt がサポートされていないので、window.alert)
// XHR 非同期処理

vm.scheme = scheme;
vm.elApiServer = elApiServer;
vm.prefix = prefix;

function reqListenerApikey() {
  let update_flag = false;
  console.log("apiKey!:", this.responseText);
  const apiKey = this.responseText;
  if (apiKey === undefined || apiKey == "" || apiKey == null) {
    g_flagIsApikeyEmpty = true;
    console.log("apiKey is undefined or empty");
    window.alert("Api Key が設定されていません。設定画面で入力してください。");
  } else {
    g_flagIsApikeyEmpty = false;
  }

  vm.apiKey = apiKey;

  if (update_flag) {
    // const configData = {
    //   scheme: config.scheme,
    //   elApiServer: config.elApiServer,
    //   prefix: config.prefix,
    //   apiKey: config.apiKey,
    // };
    // console.log("Update config.json!", configData);
    // saveConfig(configData);
    console.log("Update apiKey!", apiKey);
    saveApiKey(apiKey);
  }

  // config.json取得後の起動処理
  // apikey が設定設定されていたら 機器一覧を ELWebAPI Server から取得する
  // ELWebAPI Server からのresponseは非同期処理、websocketで通知される。
  if (!g_flagIsApikeyEmpty) {
    const requestMethod = "GET";
    const message = accessElServer(
      scheme,
      elApiServer,
      apiKey,
      requestMethod,
      prefix,
      "/devices",
      "",
      "",
      "",
      "",
      ""
    );  
  }
}

const request = new XMLHttpRequest();
request.addEventListener("load", reqListenerApikey);
request.open("GET", g_serverURL + "apiKey");
request.send();


// FYI: オリジナルのソースコード
// 起動時に、server側のファイルconfig.jsonのデータをリクエストする。その値をvmに設定する。
// config.json の中身の scheme, elApiServer, prefix が設定されていない場合は default 値を設定し、condif.json に書き込む
// apiKeyがblankの場合、Alert ダイアログを表示する。
//  (electron では window.prompt がサポートされていないので、window.alert)
// XHR 非同期処理

/*
function reqListener() {
  let update_flag = false;
  console.log("config.json!:", this.responseText);
  const config = JSON.parse(this.responseText);
  if (config.scheme === undefined || config.apiKey == "" || config.apiKey == null) {
    console.log("config.scheme is undefined or empty");
    config.scheme = "https";
    update_flag = true;
  }
  if (config.elApiServer === undefined || config.apiKey == "" || config.apiKey == null) {
    console.log("config.elApiServer is undefined or empty");
    config.elApiServer = "webapiechonet.com";
    update_flag = true;
  }
  if (config.prefix === undefined || config.apiKey == "" || config.apiKey == null) {
    console.log("config.prefix is undefined or empty");
    config.prefix = "/elapi/v1";
    update_flag = true;
  }
  if (config.apiKey === undefined || config.apiKey == "" || config.apiKey == null) {
    g_flagIsApikeyEmpty = true;
    console.log("config.apiKey is undefined or empty");
    config.apiKey = "";
    window.alert("Api Key が設定されていません。設定画面で入力してください。");
  } else {
    g_flagIsApikeyEmpty = false;
  }

  vm.scheme = config.scheme;
  vm.elApiServer = config.elApiServer;
  vm.apiKey = config.apiKey;
  vm.prefix = config.prefix;

  if (update_flag) {
    const configData = {
      scheme: config.scheme,
      elApiServer: config.elApiServer,
      prefix: config.prefix,
      apiKey: config.apiKey,
    };
    console.log("Update config.json!", configData);
    saveConfig(configData);
  }

  // config.json取得後の起動処理
  // apikey が設定設定されていたら 機器一覧を ELWebAPI Server から取得する
  // ELWebAPI Server からのresponseは非同期処理、websocketで通知される。
  if (!g_flagIsApikeyEmpty) {
    const requestMethod = "GET";
    const message = accessElServer(
      config.scheme,
      config.elApiServer,
      config.apiKey,
      requestMethod,
      config.prefix,
      "/devices",
      "",
      "",
      "",
      "",
      ""
    );  
  }
}

const request = new XMLHttpRequest();
request.addEventListener("load", reqListener);
request.open("GET", g_serverURL + "config");
request.send();
*/

// websocket:受信処理
// index.js内のwebserverがECHONET Lite WebApi serverにRESTでアクセスし、
// そのレスポンスをブラウザーにwebsocketでPUSH通信する。そのwebsocketの受信処理。
ws.onmessage = function (event) {
  const obj = JSON.parse(event.data);
  console.log("Web socketの受信:", obj);
  console.log(" REQ: " + obj.method + " https://" + obj.hostname + obj.path);
  console.log(" path:", obj.path);
  console.log(" status code:", obj.statusCode);
  console.log(" response:", obj.response);

  // 起動時処理
  //   - 機器一覧の中に、エアコン・照明・電気温水器があるかどうかを確認する
  //   - なければ、APIで Server に作成依頼をする
  if (!g_flagIsBootProcessFinished) {
    console.log("起動時処理 in websocket 受信");
    let generalLightingIsFound = false;
    let homeAirConditionerIsFound = false;
    let electricWaterHeaterIsFound = false;
    let lvSmartElectricEnergyMeterIsFound = false;

    for (const device of obj.response.devices) {
      if (device.deviceType == "generalLighting") {
        generalLightingIsFound = true;
      }
      if (device.deviceType == "homeAirConditioner") {
        homeAirConditionerIsFound = true;
      }
      if (device.deviceType == "electricWaterHeater") {
        electricWaterHeaterIsFound = true;
      }
      if (device.deviceType == "lvSmartElectricEnergyMeter") {
        lvSmartElectricEnergyMeterIsFound = true;
      }
    }

    if (!generalLightingIsFound) {
      // Serverに照明が存在しない場合、APIで generalLighting を作成
      console.log("Create generalLighting on the server");
      accessElServerAddDevice(
        vm.scheme,
        vm.elApiServer,
        vm.apiKey,
        vm.prefix,
        "generalLighting"
      );
    }
    if (!homeAirConditionerIsFound) {
      // Serverにエアコンが存在しない場合、APIで homeAirConditioner を作成
      console.log("Create homeAirConditioner on the server");
      accessElServerAddDevice(
        vm.scheme,
        vm.elApiServer,
        vm.apiKey,
        vm.prefix,
        "homeAirConditioner"
      );
    }
    if (!electricWaterHeaterIsFound) {
      // Serverに電気温水器が存在しない場合、APIで electricWaterHeater を作成
      console.log("Create electricWaterHeater on the server");
      accessElServerAddDevice(
        vm.scheme,
        vm.elApiServer,
        vm.apiKey,
        vm.prefix,
        "electricWaterHeater"
      );
    }
    if (!lvSmartElectricEnergyMeterIsFound) {
      // Serverに低圧スマートメータが存在しない場合、APIで lvSmartElectricEnergyMeter を作成
      console.log("Create lvSmartElectricEnergyMeter on the server");
      accessElServerAddDevice(
        vm.scheme,
        vm.elApiServer,
        vm.apiKey,
        vm.prefix,
        "lvSmartElectricEnergyMeter"
      );
    }
    g_flagIsBootProcessFinished = true;
  } else {
    // 通常時処理
    // SEND buttonによるrequestのresponseなら、Request & Response 及び LOG を表示
    if (g_flagSendButtonIsClicked) {
      // Request & Responseのupdate
      vm.statusCode = "RES status code: " + obj.statusCode;
      vm.response = obj.response;
    }

    // ECHONET Lite WebApi Serverからのresponse処理
    let regex; // obj.path でどのREQUESTのRESPONSEであるかを分岐する

    // GET /elapi/v1
    // serviceListを新規に作成する
    regex = /\/v1$/; // 正規表現：行末が'/v1'
    if (regex.test(obj.path)) {
      let serviceList = [""];
      if (obj.response.v1 !== undefined) {
        for (let service of obj.response.v1) {
          serviceList.push("/" + service.name);
        }
      }
      console.log("serviceListの更新:", serviceList);
      vm.serviceList = serviceList;
      // 入力フィールドserviceの表示項目の更新
      // vm.serviceSelected = (serviceList[1]) ? serviceList[1] : "";
    }

    // GET /elapi/v1/devices, groups, bulks, histories
    // vm.idInfoListを新規に作成する
    let service = "";
    regex = /\/devices$/; // 正規表現：行末が'/devices'
    if (regex.test(obj.path)) {
      service = "devices";
    }
    regex = /\/groups$/; // 正規表現：行末が'/groups'
    if (regex.test(obj.path)) {
      service = "groups";
    }
    regex = /\/bulks$/; // 正規表現：行末が'/bulks'
    if (regex.test(obj.path)) {
      service = "bulks";
    }
    regex = /\/histories$/; // 正規表現：行末が'/histories'
    if (regex.test(obj.path)) {
      service = "histories";
    }
    if (service !== "") {
      // vm.idInfoList = [
      //   { deviceType: "", id: "", version: "", manufacturer: "" },
      // ];
      if (obj.response[service] !== undefined) {
        for (let thing of obj.response[service]) {
          const deviceType =
            thing.deviceType !== undefined ? thing.deviceType : "";
          const idInfo = {
            id: "/" + thing.id,
            deviceType: deviceType,
            version: thing.protocol.version,
            manufacturer: thing.manufacturer.descriptions.ja,
          };
          vm.idInfoList.push(idInfo);

          // Addition for elwebapistudy
          if (deviceType == "generalLighting") {
            vm.lighting = {
              id: thing.id,
              deviceType: deviceType,
              version: thing.protocol.version,
              manufacturer: thing.manufacturer.descriptions.ja,
            };
            vm.graphicLighting = "notSelected";
          } else if (deviceType == "homeAirConditioner") {
            vm.aircon = {
              id: thing.id,
              deviceType: deviceType,
              version: thing.protocol.version,
              manufacturer: thing.manufacturer.descriptions.ja,
            };
            vm.graphicAircon = "notSelected";
          } else if (deviceType == "electricWaterHeater") {
            vm.waterHeater = {
              id: thing.id,
              deviceType: deviceType,
              version: thing.protocol.version,
              manufacturer: thing.manufacturer.descriptions.ja,
            };
            vm.graphicWaterHeater = "notSelected";
          } else if (deviceType == "lvSmartElectricEnergyMeter") {
            vm.smartMeter = {
              id: thing.id,
              deviceType: deviceType,
              version: thing.protocol.version,
              manufacturer: thing.manufacturer.descriptions.ja,
            };
            vm.graphicSmartMeter = "notSelected";
          }
        }
      }

      vm.idInfoList.sort(function (a, b) {
        var nameA = a.deviceType.toUpperCase(); // 大文字と小文字を無視する
        var nameB = b.deviceType.toUpperCase(); // 大文字と小文字を無視する
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });

      if (g_flagSendButtonIsClicked) {
        // 入力フィールドidの表示項目の更新
        vm.idSelected = vm.idInfoList[1] ? vm.idInfoList[1].id : "";
        // Device Typeの表示項目の更新
        // updateDeviceType(vm.idSelected.slice(1));
      }
    }

    // GET /elapi/v1/devices, groups, bulks, histories/<id>
    // responseはdevice,group,bulk,history description -> g_thingInfoに情報を追加
    // vm.resourceTypeListにresource typeをpushする
    // vm.resourceNameListにresource nameをpushする
    service = "";
    regex = /\/devices\/([0-9]|[a-z]|[A-Z])+$/; // 正規表現'/devices/'の後、行末まで英数字
    if (regex.test(obj.path)) {
      service = "devices";
    }
    regex = /\/groups\/([0-9]|[a-z]|[A-Z])+$/; // 正規表現'/groups/'の後、行末まで英数字
    if (regex.test(obj.path)) {
      service = "groups";
    }
    regex = /\/bulks\/([0-9]|[a-z]|[A-Z])+$/; // 正規表現'/bulks/'の後、行末まで英数字
    if (regex.test(obj.path)) {
      service = "bulks";
    }
    regex = /\/histories\/([0-9]|[a-z]|[A-Z])+$/; // 正規表現'/histories/'の後、行末まで英数字
    if (regex.test(obj.path)) {
      service = "histories";
    }

    if (service !== "") {
      const pathElements = obj.path.split("/"); // pathを'/'で分割して要素を配列にする
      const thingId = pathElements[pathElements.length - 1]; // 配列の最後の要素が deviceId

      // Device Desvriptionをもとにg_thingInfoを更新する
      const thingDescription = obj.response;
      const deviceType =
        thingDescription.deviceType !== undefined
          ? thingDescription.deviceType
          : "";
      let thingInfo = {
        deviceType: deviceType,
        propertyList: [""],
        propertyListWritable: [""],
        actionList: [""],
      };

      // propertyList,propertyListWritableの作成
      if (thingDescription.properties !== undefined) {
        for (let resourceName of Object.keys(thingDescription.properties)) {
          thingInfo.propertyList.push("/" + resourceName);
          if (thingDescription.properties[resourceName].writable === true) {
            thingInfo.propertyListWritable.push("/" + resourceName);
          }
        }
      }

      // actionListの作成
      if (thingDescription.actions !== undefined) {
        for (let resourceName of Object.keys(thingDescription.actions)) {
          thingInfo.actionList.push("/" + resourceName);
        }
      }

      thingInfo.propertyList.sort();
      thingInfo.propertyListWritable.sort();
      thingInfo.actionList.sort();

      g_thingInfo[thingId] = thingInfo;
      console.log("g_thingInfo", g_thingInfo);

      // 入力フィールドidの下のdeviceTypeの更新
      vm.deviceType = obj.response.deviceType;

      // Addition for elwebapistudy
      const deviceDescription = obj.response;
      // console.log("deviceDescription:",deviceDescription);
      // deviceDescription.properties から key を取り出す
      const propertyNameArray = Object.keys(deviceDescription.properties);
      vm.propertyInfoArray = [];
      for (const propertyName of propertyNameArray) {
        const description =
          deviceDescription.properties[propertyName].descriptions.ja;
        const writable = deviceDescription.properties[propertyName].writable;
        vm.propertyInfoArray.push({
          propertyName: propertyName,
          description: description,
          writable: writable,
        });
      }
      console.log("propertyInfoArray:", vm.propertyInfoArray);
      if (vm.deviceType == "homeAirConditioner") {
        vm.aircon.propertyInfoArray = vm.propertyInfoArray;
      } else if (vm.deviceType == "generalLighting") {
        vm.lighting.propertyInfoArray = vm.propertyInfoArray;
      } else if (vm.deviceType == "electricWaterHeater") {
        vm.waterHeater.propertyInfoArray = vm.propertyInfoArray;
      } else if (vm.deviceType == "lvSmartElectricEnergyMeter") {
        vm.smartMeter.propertyInfoArray = vm.propertyInfoArray;
      }
    }

    // GET /elapi/v1/devices, groups, bulks, histories/<id>/properties
    service = "";
    regex = /\/properties$/; // 正規表現：行末が'/properties'
    if (regex.test(obj.path)) {
      console.log("response is /properties");
    }

    // GET /elapi/v1/devices, groups, bulks, histories/<id>/properties/<property>
    service = "";
    // regex = /\/properties\/([0-9]|[a-z]|[A-Z])+$/; // 正規表現'/properties/'の後、行末まで英数字
    regex = /\/properties/; // 正規表現：'/properties'
    if (obj.method == "GET") {
      if (regex.test(obj.path)) {
        console.log("response is /properties/<property>", vm.deviceType);
        console.log("response:", obj.response);
        if (vm.deviceType == "homeAirConditioner") {
          console.log("response is property value for aircon");
          if (obj.response.operationStatus !== undefined) {
            vm.airconOperationStatus = obj.response.operationStatus;
          }
          if (obj.response.operationMode !== undefined) {
            console.log("operationMode is", obj.response.operationMode);
            vm.airconOperationMode = obj.response.operationMode;
          }
          if (obj.response.targetTemperature !== undefined) {
            console.log("targetTemperature is", obj.response.targetTemperature);
            vm.airconTargetTemperature = obj.response.targetTemperature;
          }
        } else if (vm.deviceType == "generalLighting") {
          console.log("response is property value for lighting");
          if (obj.response.operationStatus !== undefined) {
            vm.lightingOperationStatus = obj.response.operationStatus;
          }
          if (obj.response.operationMode !== undefined) {
            console.log("operationMode is", obj.response.operationMode);
            vm.lightingOperationMode = obj.response.operationMode;
          }
          if (obj.response.brightness !== undefined) {
            console.log("targetTemperature is", obj.response.brightness);
            vm.lightingBrightness = obj.response.brightness;
          }
        } else if (vm.deviceType == "electricWaterHeater") {
          console.log("response is property value for waterHeater");
          if (obj.response.operationStatus !== undefined) {
            vm.waterHeaterOperationStatus = obj.response.operationStatus;
          }
          if (obj.response.tankOperationMode !== undefined) {
            console.log("tankOperationMode is", obj.response.tankOperationMode);
            vm.waterHeaterTankOperationMode = obj.response.tankOperationMode;
          }
          if (obj.response.targetWaterHeatingTemperature !== undefined) {
            console.log(
              "targetTemperature is",
              obj.response.targetWaterHeatingTemperature
            );
            vm.waterHeaterTargetWaterHeatingTemperature =
              obj.response.targetWaterHeatingTemperature;
          }
        } else if (vm.deviceType == "lvSmartElectricEnergyMeter") {
          console.log("response is property value for smartMeter");
          if (
            obj.response.normalDirectionCumulativeElectricEnergy !== undefined
          ) {
            vm.smartMeterNormalDirectionCumulativeElectricEnergy =
              obj.response.normalDirectionCumulativeElectricEnergy;
          }
          if (obj.response.instantaneousElectricPower !== undefined) {
            console.log(
              "instantaneousElectricPower is",
              obj.response.instantaneousElectricPower
            );
            vm.smartMeterInstantaneousElectricPower =
              obj.response.instantaneousElectricPower;
          }
          if (
            obj.response.normalDirectionCumulativeElectricEnergyLog1 !==
            undefined
          ) {
            console.log(
              "normalDirectionCumulativeElectricEnergyLog1 is",
              obj.response.normalDirectionCumulativeElectricEnergyLog1
            );
            vm.smartMeterNormalDirectionCumulativeElectricEnergyLog1 =
              obj.response.normalDirectionCumulativeElectricEnergyLog1;
          }
        }
      }
    }
  }
  g_flagSendButtonIsClicked = false;
};
