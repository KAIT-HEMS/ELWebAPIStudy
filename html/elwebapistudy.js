// elwebapistudy.js for elwebapistudy(client side)
// 2021.01.12
// Copyright (c) 2020 Kanagawa Institute of Technology, ECHONET Consortium
// Released under the MIT License.
// 
// elwebapistudy.jsは、ELWebApiStudyのクライアント側JavaScript codeである。
// サーバーはlocalhost:3020/elwebapistudy
// 設定がファイルはサーバー側にconfig.jsonとして存在する。

'use strict';

const g_serverURL = "/elwebapistudy/";　// SPAのweb serverのURL
let g_dataLogArray = []; // logを格納するarray
let g_thingInfo = {}; 
// thing id(device id, group id, bulk id, history id)をkeyとして、以下の項目を保持
// serviceがdevice以外の場合は、"deviceType":""
  // {
  //   <thing id>:{
  //     "deviceType":<deviceType>, 
  //     "propertyList":[<resourceName>], 
  //     "propertyListWritable":[<resourceName>]
  //     "actionList":[<resourceName>]
　// 　}
　// }
let g_flagSendButtonIsClicked = false; // Request & ResponseとLOGに不要なデータを表示しないためのflag

let bind_data = {
  // data in config.json
  scheme: "",
  elApiServer: "",
  apiKey: "",
  prefix: "",

  // Home page, input and control
  lighting: {},
  aircon: {},
  waterHeater: {},
  propertyInfoArray: [],  // [{propertyName:string, description:string, writable:boolean}, {}]

  airconOperationStatus: "",
  airconOperationMode: "",
  airconTargetTemperature: "",

  deviceSelected: "",
  graphicLighting: "off",
  graphicAircon: "off",
  graphicWaterHeater: "off",
  device_id: "",
  device_deviceType: "",
  device_version: "",
  device_manufacturer: "",

  methodList: ["GET", "PUT", "POST", "DELETE"],
  methodSelected: "GET",
  serviceList: [""], // [/devices, /groups]
  serviceSelected: "",
  idInfoList: [], // [{deviceType:"/aircon", id:"0123", version:"Rel.M", manufacturer:"神奈川工科大学"},... ] 
                  // GET /devices, groups, bulk, histories のレスポンスを利用
  idSelected: "",
  idToolTip: "XXX",
  deviceType: "",
  resourceTypeList: [], // [/properties, /actons]
  resourceTypeSelected: "",
  resourceNameList: [], // [/airFlowLevel, /roomTemperature,...]
  resourceNameSelected:"",
  query: "",
  body: "",

  // Home page, Request & Response, LOG
  request: "request:",
  statusCode: "response: status code",
  response: "response: data",
  rbOrder: "normalOrder", // "normalOrder" or "reverseOrder"
  message_list: [],

  // Setting page
  addDevice: "", // デバイス追加で選択されたデバイス名
  addDeviceList: [  // デバイス追加に表示するデバイス名のリスト
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
    "washerDryer"
  ],
  
  // CSS
  methodStyle: {color: 'black'},
  serviceStyle: {color: 'black'},
  idStyle: {color: 'black'},
  resourceTypeStyle: {color: 'black'},
  resourceNameStyle: {color: 'black'},
  queryStyle: {color: 'black'},
  bodyStyle: {color: 'black'},
};

// component:template_homeの定義
const template_home = {
  template:'#tmpl-page-home',
  data:() => {return (bind_data);},
  computed: {
    selectedDeviceComponent: function() {
      return "ctrl-" + this.deviceSelected;
    }
  },
  methods: {
    getDeviceInfoButtonIsClicked: function () {
      console.log("getDeviceInfo ボタンがクリックされました。");
      g_flagSendButtonIsClicked = true;
      const message = accessElServer(this.scheme, this.elApiServer, this.apiKey, 
        this.methodSelected, this.prefix, "/devices", "", "", "", "", "");
      // REQUEST表示エリアのデータ設定
      this.request = "REQ " + message.method + " " + this.scheme + "://" + 
                    message.hostname + message.path + " " + this.body;
    },
    clearDeviceInfoButtonIsClicked: function () {
      console.log("clearDeviceInfo ボタンがクリックされました。");
      this.deviceSelected = "";
      this.graphicLighting = "off";
      this.graphicAircon = "off";
      this.graphicWaterHeater = "off";
      this.device_id = "";
      this.device_deviceType = "";
      this.device_version = "";
      this.device_manufacturer = "";
      this.propertyInfoArray = [];
    },
    lightingIsClicked: function () {
      console.log("照明が選択されました。");
      this.deviceSelected = "lighting";
      this.graphicLighting = "selected";
      this.graphicAircon = "notSelected";
      this.graphicWaterHeater = "notSelected";
      this.device_id = this.lighting.id;
      this.device_deviceType = this.lighting.deviceType;
      this.device_version = this.lighting.version;
      this.device_manufacturer = this.lighting.manufacturer;
      this.propertyInfoArray = this.lighting.propertyInfoArray;
    },
    airconIsClicked: function () {
      console.log("エアコンが選択されました。");
      this.deviceSelected = "aircon";
      this.graphicLighting = "notSelected";
      this.graphicAircon = "selected";
      this.graphicWaterHeater = "notSelected";
      this.device_id = this.aircon.id;
      this.device_deviceType = this.aircon.deviceType;
      this.device_version = this.aircon.version;
      this.device_manufacturer = this.aircon.manufacturer;
      this.propertyInfoArray = this.aircon.propertyInfoArray;
    },
    waterHeaterIsClicked: function () {
      console.log("温水器が選択されました。");
      this.deviceSelected = "waterHeater";
      this.graphicLighting = "notSelected";
      this.graphicAircon = "notSelected";
      this.graphicWaterHeater = "selected";
      this.device_id = this.waterHeater.id;
      this.device_deviceType = this.waterHeater.deviceType;
      this.device_version = this.waterHeater.version;
      this.device_manufacturer = this.waterHeater.manufacturer;
      this.propertyInfoArray = this.waterHeater.propertyInfoArray;
    },
    getDeviceDescriptionButtonIsClicked: function () {
      console.log("getDeviceDescription ボタンがクリックされました。");
      if (this.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const message = accessElServer(this.scheme, this.elApiServer, this.apiKey, 
          this.methodSelected, this.prefix, "/devices", "/"+this.device_id, "", "", "", "");
        // REQUEST表示エリアのデータ設定
        this.request = "REQ " + message.method + " " + this.scheme + "://" + 
                      message.hostname + message.path + " " + this.body;  
      }
    },
    getAllPropertyValuesButtonIsClicked: function () {
      console.log("getAllPropertyValues ボタンがクリックされました。");
      if (this.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const message = accessElServer(this.scheme, this.elApiServer, this.apiKey, 
          this.methodSelected, this.prefix, "/devices", "/"+this.device_id, "/properties", "", "", "");
        // REQUEST表示エリアのデータ設定
        this.request = "REQ " + message.method + " " + this.scheme + "://" + 
                      message.hostname + message.path + " " + this.body;  
      }
    },
    setAirconOperationStatusOnButtonIsClicked: function () {
      console.log("setAirconOperationStatusOn ボタンがクリックされました。");
    },
    setAirconOperationStatusOffButtonIsClicked: function () {
      console.log("setAirconOperationStatusOn ボタンがクリックされました。");
    },
    getAirconOperationStatusButtonIsClicked: function () {
      console.log("getAirconOperationStatus ボタンがクリックされました。");
    },
    clearReqAndResButtonIsClicked: function () {
      console.log("clearReqAndRes ボタンがクリックされました。");
      this.request = "request:";
      this.statusCode = "response: status code";
      this.response = "response: data";
    },

    

    // SENDボタンがクリックされたときの処理
    sendButtonIsClicked: function () {
      console.log("SENDボタンがクリックされました。");
      g_flagSendButtonIsClicked = true;
      // ECHONET Lite WebApi serverにアクセスする
      const message = accessElServer(this.scheme, this.elApiServer, this.apiKey, 
        this.methodSelected, this.prefix, this.serviceSelected, this.idSelected, 
        this.resourceTypeSelected, this.resourceNameSelected, this.query, this.body);

      // REQUEST表示エリアのデータ設定
      this.request = "REQ " + message.method + " " + this.scheme + "://" +message.hostname + message.path + " " + this.body;
    
      // REQUESTをLOGに追加
      g_dataLogArray.push({
        timeStamp:timeStamp(),
        direction:"REQ",
        data:message
      });

      // ログを表示
      displayLog();
    },

    // Copy from responseボタンがクリックされたときの処理
    copyFromResponseButtonIsClicked: function () {
      this.body = JSON.stringify(vm.response);
    },

    // 入力フィールド Method の値が変更された場合の処理
    // resourceTypeListとresourceNameListをupdate
    methodIsUpdated: function () {
      // serviceとdevice idがblankでなく、device descriptionが存在する場合
      if ((this.serviceSelected !== "") && (this.idSelected !== "")) {
        console.log("methodIsUpdated:idSelected", this.idSelected);
        const thingId = this.idSelected.slice(1); // remove "/" from idSelected
        let resourceNameList = [""];
        if (g_thingInfo[thingId] !== undefined) {
          switch (this.methodSelected) {
            case "GET":
              vm.body = "";
              resourceNameList = g_thingInfo[thingId].propertyList;
              vm.resourceTypeSelected = "/properties";
              break;
            case "PUT":
              resourceNameList = g_thingInfo[thingId].propertyListWritable;
              vm.resourceTypeSelected = "/properties";
              break;
            case "POST":
              resourceNameList = g_thingInfo[thingId].actionList;
              vm.resourceTypeSelected = "/actions";
              break;
            case "DELETE":
              break;
          }
          if (vm.resourceTypeSelected !== ""){
            vm.resourceNameList = resourceNameList;
          }
        }
      }
    },

    // 入力フィールド service の値が変更された場合の処理
    serviceIsUpdated: function () {
      vm.idInfoList =[{}]
      vm.resourceTypeList = [""];
      vm.resourceNameList = [""];
      vm.idSelected = "";
      vm.resourceTypeSelected = "";
      vm.resourceNameSelected = "";
      vm.deviceType = "";
      vm.body = "";
    },

    // 入力フィールド id の値が変更された場合の処理
    // vm.deviceTypeをvm.idInfoListを利用してupdateする
    // 選択されたidのdevice descriptionが存在する場合は、resourceTypeとresourceNameを更新する
    idIsUpdated: function () {
      console.log("idIsUpdated");
      const thingId = this.idSelected.slice(1); // remove "/"
      vm.resourceTypeList = [""];
      vm.resourceNameList = [""];
      vm.deviceType ="";
      vm.resourceTypeSelected = "";
      vm.resourceNameSelected = "";

      updateDeviceType(thingId);
      const deviceInfo = g_thingInfo[thingId];
      if (deviceInfo !== undefined){
        let resourceTypeList = [""];
        if (deviceInfo.propertyList !== undefined) {
          resourceTypeList.push("/properties");
        }
        if (deviceInfo.actionList !== undefined) {
          resourceTypeList.push("/actions");
        }
        vm.resourceTypeList = resourceTypeList;
        vm.resourceTypeSelected = (resourceTypeList[1]) ? resourceTypeList[1] : "";
        updateResourceName(vm.methodSelected, thingId, vm.resourceTypeSelected);
        vm.resourceNameSelected = (vm.resourceNameList[1]) ? vm.resourceNameList[1] : "";
      } 
    },

    // 入力フィールド resourceType の値が変更された場合の処理
    //  resourceNameListをupdateする
    resourceTypeIsUpdated: function () {
      updateResourceName(this.methodSelected, this.idSelected.slice(1), this.resourceTypeSelected);
    },

    // 入力フィールド resourceName の値が変更された場合の処理
    resourceNameIsUpdated: function () {
      const resourceNameSelected=this.resourceNameSelected;
    },

    // ログのorderのラジオボタンが選択された時の処理
    rbOrderIsChanged: function () {
      displayLog();
    },

    // CLEARボタンがクリックされたときの処理（ログ画面のクリア）
    clearButtonisClicked: function () {
      clearLog();
    },

    // SAVEボタンがクリックされたときの処理（ログの保存）
    saveButtonisClicked: function () {
      saveLog();
    }
  }
};

function updateDeviceType(deviceId) {
  for (const idInfo of vm.idInfoList) {
    if (idInfo.id == ("/" + deviceId)) {
      vm.deviceType = idInfo.deviceType;
    }
  }
}

// component:template_settingの定義
const template_setting = {
  template: '#tmpl-page-setting',
  data:() => {return (bind_data);},
  methods:{
    // 設定保存ボタンがクリックされたときの処理
    saveSettingsButtonIsClicked: function () {
      const configData = {scheme:this.scheme, elApiServer:this.elApiServer, prefix:this.prefix, apiKey:this.apiKey};
      console.log("saveSettingsButtonIsClicked", configData);
      saveConfig(configData);
    },
    // デバイス削除ボタン(Trash can)がクリックされたときの処理
    deleteDeviceButtonIsClicked: function (value) {
      const deviceId = vm.idInfoList[value].id;
      console.log("deleteDeviceButtonIsClicked is clicked, value=", deviceId);
      accessElServerDeleteDevice(this.scheme, this.elApiServer, this.apiKey, this.prefix, deviceId);
    },
    // デバイス追加ボタンがクリックされたときの処理
    addDeviceButtonIsClicked: function () {
      console.log("addDeviceButtonIsClicked is clicked", vm.addDevice);
      accessElServerAddDevice(this.scheme, this.elApiServer, this.apiKey, this.prefix, vm.addDevice);
    },
    // UPDATEボタンがクリックされたときの処理
    updateButtonIsClicked: function () {
      console.log("updateButtonIsClicked is clicked");
      accessElServer(this.scheme, this.elApiServer, this.apiKey, 
        this.methodSelected, this.prefix, "/devices", "", "", "", "", "");
      }
  },
  // Setting pageを表示する時に呼ばれるfunction
  // EL WebAPI serverにアクセス（GET /devices)して、デバイス情報を取得
  created:function(){
    console.log('Setting page is created');
    accessElServer(this.scheme, this.elApiServer, this.apiKey, 
      "GET", this.prefix, "/devices", "", "", "", "", "");
  }
};

// component:template_helpの定義
const template_help = {
  template: '#tmpl-page-help',
  data:() => {return (bind_data);}
};

// routerの定義
const router = new VueRouter({
	routes : [
		{path:'/',        component:template_home},
		{path:'/home',    component:template_home},
		{path:'/setting', component:template_setting},
		{path:'/help',    component:template_help}
	]
});

// ECHONET Lite WebApi serverにアクセスする
function accessElServer(scheme, elApiServer, apiKey, methodSelected, prefix, serviceSelected, idSelected, resourceTypeSelected, resourceNameSelected, query, body) {
  console.log("access ECHONET Lite WebApi server")
  console.log("serviceSelected:",serviceSelected)
  // pathの作成
  let path = prefix;
  if (serviceSelected !== "") {
    path += (serviceSelected);
    if (idSelected !== "") {
      path += idSelected;
      if (resourceTypeSelected !== "") {
        path += resourceTypeSelected;
        if (resourceNameSelected !== "") {
          path += resourceNameSelected;
          if (query !== "") {
            path += ("?"+query);
          }
        }
      }
    }
  }
  console.log(" path:",path);

  const bodyData = (methodSelected == "GET") ? "" : body;
  let message = {
    hostname: elApiServer,
    method:   methodSelected, 
    path:     path,
    headers:  {
      "X-Elapi-key":    apiKey,
      "Content-Type":   "application/json",
      "Content-Length": (new Blob([bodyData])).size
    },
    body:     bodyData
  };
  console.log(" message: ", message);

  const request = new XMLHttpRequest();
  request.open('PUT', g_serverURL + 'send');
  request.setRequestHeader("Content-type", "application/json");
  request.send(JSON.stringify(message));

  return message;
}

// ECHONET Lite WebApi serverにアクセスして、実験クラウド専用のAPIで機器を削除する
function accessElServerDeleteDevice(scheme, elApiServer, apiKey, prefix, deviceId) {
  console.log("accessElServerDeleteDevice: Delete ", deviceId)
  let path = prefix + "/config/device/" + deviceId;
  const bodyData = "";
  let message = {
    hostname: elApiServer,
    method:   "DELETE", 
    path:     path,
    headers:  {
      "X-Elapi-key":    apiKey,
      "Content-Type":   "application/json",
      "Content-Length": bodyData.length
    },
    body:     bodyData
  };

  const request = new XMLHttpRequest();
  request.open('PUT', g_serverURL + 'send');
  request.setRequestHeader("Content-type", "application/json");
  request.send(JSON.stringify(message));
}

// ECHONET Lite WebApi serverにアクセスして、実験クラウド専用のAPIで機器を追加する
function accessElServerAddDevice(scheme, elApiServer, apiKey, prefix, deviceType) {
  console.log("accessElServerAddDevice: Add ", deviceType)
  let path = prefix + "/config/device/";
  const bodyData = '{"deviceType":"' + deviceType + '"}';
  let message = {
    hostname: elApiServer,
    method:   "POST", 
    path:     path,
    headers:  {
      "X-Elapi-key":    apiKey,
      "Content-Type":   "application/json",
      "Content-Length": bodyData.length
    },
    body:     bodyData
  };

  const request = new XMLHttpRequest();
  request.open('PUT', g_serverURL + 'send');
  request.setRequestHeader("Content-type", "application/json");
  request.send(JSON.stringify(message));
}

function clearLog() {
  g_dataLogArray.length = 0;
  vm.message_list = [];
}

function saveLog() {
  // g_dataLogArrayから保存用のstringの作成
  let log = "";
  for (let dataLog of g_dataLogArray) {
    if (dataLog.direction == "REQ") { // REQUESTの場合
      log += dataLog.timeStamp + ",REQ," + dataLog.data.method + "," + vm.scheme + "://" + dataLog.data.hostname + dataLog.data.path;
      if (dataLog.data.body == ""){
        log +=  "\n";
      } else {
        log +=  ",body:" + dataLog.data.body + "\n";
      }
    } else {　// RESPONSEの場合
      log = log + dataLog.timeStamp + ",RES," + dataLog.data.statusCode + "," + JSON.stringify(dataLog.data.response) + "\n";
    }
  }
  // ログ保存をサーバーに依頼
  const message = {log:log};
  const request = new XMLHttpRequest();
  request.open('POST', g_serverURL + 'saveLog');
  request.setRequestHeader("Content-type", "application/json");
  request.send(JSON.stringify(message));
}

// config保存をサーバーに依頼
function saveConfig(configData) {
  const message = {config:configData};
  console.log("saveConfig: message", message)
  const request = new XMLHttpRequest();
  request.open('PUT', g_serverURL + 'config');
  request.setRequestHeader("Content-type", "application/json");
  request.send(JSON.stringify(message));
}

function updateResourceName(methodSelected, idSelected, resourceTypeSelected) {
  console.log("updateResourceName ", methodSelected, idSelected, resourceTypeSelected)
  let resourceNameList = [];
  if (resourceTypeSelected !== "") {
    const thingInfo = g_thingInfo[idSelected];
    if (thingInfo !== undefined) {
      if ((resourceTypeSelected == "/properties") && (methodSelected == "GET")) {
        resourceNameList = thingInfo.propertyList;
      }  
      if ((resourceTypeSelected == "/properties") && (methodSelected == "PUT")) {
        resourceNameList = thingInfo.propertyListWritable;
      }
      if ((resourceTypeSelected == "/actions") && (methodSelected == "POST")) {
        resourceNameList = thingInfo.actionList;
      }
      vm.resourceNameList = resourceNameList;
      vm.resourceNameSelected = (resourceNameList[1]) ? resourceNameList[1] : "";   
    }
  }
}

// Home画面Left window - Property section - 照明
Vue.component("ctrl-lighting", {
  methods: {
    sendButtonIsClicked: function () {
      console.log("SENDボタンがクリックされました。");
    }
  },
  template: `
  <div>
    <table class="table table-sm m-0">
      <thead>
        <th>プロパティ名</th>
        <th>設定</th>
        <th>値取得</th>
      </thead>
      <tr>
        <td>動作状態</td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" title="ON" v-on:click="sendButtonIsClicked" >ON</button>
          <button type="button" class="btn btn-secondary btn-sm" title="OFF" v-on:click="sendButtonIsClicked" >OFF</button>
        </td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" title="Get value" v-on:click="sendButtonIsClicked">Get value</button>
          ON
        </td>
      </tr>
      <tr>
        <td>点灯モード</td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" title="normal" v-on:click="sendButtonIsClicked" >通常灯</button>
          <button type="button" class="btn btn-secondary btn-sm" title="night" v-on:click="sendButtonIsClicked" >常夜灯</button>
          <button type="button" class="btn btn-secondary btn-sm" title="color" v-on:click="sendButtonIsClicked" >カラー灯</button>
        </td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" title="Get value" v-on:click="sendButtonIsClicked">Get value</button>
          暖房
        </td>
      </tr>
      <tr>
        <td>照度レベル設定値</td>
        <td>
          <div class="row">
            <input id="slider-1" type="range" value="50" min="0" max="100" >
            <div class="slider-value">50%</div>
          </div>
        </td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" title="Get value" v-on:click="sendButtonIsClicked">Get value</button>
          26℃
        </td>
      </tr>
    </table>
  </div>
  `
});

// Home画面Left window - Property section - エアコン
Vue.component("ctrl-aircon", {
  // props: ['modelValue'],
  data: function () {
    return {
      temperature: 25
    }
  },
  computed: {
    operationStatus: {
      get() {
        return vm.airconOperationStatus;
      },
      set() {
        this.operationStatus = vm.airconOperationStatus;
      }
    },
    operationMode: {
      get() {
        return vm.airconOperationMode;
      },
      set() {
        this.operationMode = vm.airconOperationMode;
      }
    },
    targetTemperature: {
      get() {
        return vm.airconTargetTemperature;
      },
      set() {
        this.targetTemperature = vm.airconTargetTemperature;
      }
    },
    airconTemperature: {
      get() {
        return this.temperature;
      },
      set(value) {
        // console.log(value);
        this.temperature = value;
      }
    }
  },
  methods: {
    getOperationStatus: function () {
      console.log("getOperationStatusがクリックされました。");
      vm.methodSelected = "GET";
      if (vm.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const message = accessElServer(vm.scheme, vm.elApiServer, vm.apiKey, 
          vm.methodSelected, vm.prefix, "/devices", "/"+vm.device_id, "/properties", "/operationStatus", "", "");
        // REQUEST表示エリアのデータ設定
        vm.request = "REQ " + message.method + " " + vm.scheme + "://" + 
                      message.hostname + message.path + " " + vm.body;
      }
    },
    setOperationStatus: function (arg) {
      console.log("setOperationStatusがクリックされました。",arg);
      const body = '{"operationStatus":' + arg + '}';
      vm.methodSelected = "PUT";
      if (vm.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const message = accessElServer(vm.scheme, vm.elApiServer, vm.apiKey, 
          vm.methodSelected, vm.prefix, "/devices", "/"+vm.device_id, "/properties", "/operationStatus", "", body);
        // REQUEST表示エリアのデータ設定
        vm.request = "REQ " + message.method + " " + vm.scheme + "://" + 
                      message.hostname + message.path + " " + arg;
      }
    },
    getOperationMode: function () {
      console.log("getOperationModeがクリックされました。");
      vm.methodSelected = "GET";
      if (vm.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const message = accessElServer(vm.scheme, vm.elApiServer, vm.apiKey, 
          vm.methodSelected, vm.prefix, "/devices", "/"+vm.device_id, "/properties", "/operationMode", "", "");
        // REQUEST表示エリアのデータ設定
        vm.request = "REQ " + message.method + " " + vm.scheme + "://" + 
                      message.hostname + message.path + " " + vm.body;
      }
    },
    setOperationMode: function (arg) {
      console.log("setOperationModeがクリックされました。",arg);
      const body = '{"operationMode":"' + arg + '"}';
      vm.methodSelected = "PUT";
      if (vm.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const message = accessElServer(vm.scheme, vm.elApiServer, vm.apiKey, 
          vm.methodSelected, vm.prefix, "/devices", "/"+vm.device_id, "/properties", "/operationMode", "", body);
        // REQUEST表示エリアのデータ設定
        vm.request = "REQ " + message.method + " " + vm.scheme + "://" + 
                      message.hostname + message.path + " " + arg;
      }
    },
    getTargetTemperature: function () {
      console.log("getTargetTemperatureがクリックされました。");
      vm.methodSelected = "GET";
      if (vm.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const message = accessElServer(vm.scheme, vm.elApiServer, vm.apiKey, 
          vm.methodSelected, vm.prefix, "/devices", "/"+vm.device_id, "/properties", "/targetTemperature", "", "");
        // REQUEST表示エリアのデータ設定
        vm.request = "REQ " + message.method + " " + vm.scheme + "://" + 
                      message.hostname + message.path + " " + vm.body;
      }
    },
    setTargetTemperature: function () {
      console.log("setTargetTemperatureがクリックされました。", this.airconTemperature);
      const body = '{"targetTemperature":' + this.airconTemperature + '}';
      vm.methodSelected = "PUT";
      if (vm.device_id !== "") {
        g_flagSendButtonIsClicked = true;
        const message = accessElServer(vm.scheme, vm.elApiServer, vm.apiKey, 
          vm.methodSelected, vm.prefix, "/devices", "/"+vm.device_id, "/properties", "/targetTemperature", "", body);
        // REQUEST表示エリアのデータ設定
        vm.request = "REQ " + message.method + " " + vm.scheme + "://" + 
                      message.hostname + message.path + " " + this.airconTemperature;
      }
    }
  },
  template: `
  <div>
    <table class="table table-sm m-0">
      <thead>
        <th>プロパティ名</th>
        <th>設定</th>
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
            <input id="slider-1" v-model="airconTemperature" type="range" value="20" min="0" max="50" >
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
  `
});

// Home画面Left window - Property section - 温水器
Vue.component("ctrl-waterHeater", {
  methods: {
    sendButtonIsClicked: function () {
      console.log("SENDボタンがクリックされました。");
    }
  },
  template: `
  <div>
    <table class="table table-sm m-0">
      <thead>
        <th>プロパティ名</th>
        <th>設定</th>
        <th>値取得</th>
      </thead>
      <tr>
        <td>動作状態</td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" title="ON" v-on:click="sendButtonIsClicked" >ON</button>
          <button type="button" class="btn btn-secondary btn-sm" title="OFF" v-on:click="sendButtonIsClicked" >OFF</button>
        </td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" title="Get value" v-on:click="sendButtonIsClicked">Get value</button>
          ON
        </td>
      </tr>
      <tr>
        <td>タンク運転モード</td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" title="standard" v-on:click="sendButtonIsClicked" >標準</button>
          <button type="button" class="btn btn-secondary btn-sm" title="saving" v-on:click="sendButtonIsClicked" >節約</button>
          <button type="button" class="btn btn-secondary btn-sm" title="extra" v-on:click="sendButtonIsClicked" >多め</button>
        </td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" title="Get value" v-on:click="sendButtonIsClicked">Get value</button>
          暖房
        </td>
      </tr>
      <tr>
        <td>沸き上げ湯温設定値</td>
        <td>
          <div class="row">
            <input id="slider-1" type="range" value="50" min="0" max="100" >
            <div class="slider-value >24℃</div>
          </div>
        </td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" title="Get value" v-on:click="sendButtonIsClicked">Get value</button>
          26℃
        </td>
      </tr>
    </table>
  </div>
  `
});

// Vueのインスタンス作成
let vm = new Vue({
  el: '#app',
  data: bind_data,
  router
});

// connect websocket
console.log('Request WebScoket connection, ws://' + document.location.host);
let ws = new WebSocket('ws://' + document.location.host);
ws.onopen = function(event){
  console.log(" WebSocket: connected");
};

// server側のファイルconfig.jsonのデータをリクエストする。その値をvmに設定する。
// apiKeyがblankの場合、ダイアログを表示してapiKeyを入力させる。
// XHR 非同期処理
function reqListener() {
  console.log("config.json!:", this.responseText);
  const config = JSON.parse(this.responseText);
  vm.scheme = config.scheme;
  vm.elApiServer = config.elApiServer;
  vm.apiKey = config.apiKey;
  vm.prefix = config.prefix;
  if (config.apiKey == "") {
    window.alert("Api Keyが設定されていません。設定画面で入力してください。");
  }
}
const request = new XMLHttpRequest();
request.addEventListener("load", reqListener);
request.open('GET', g_serverURL + 'config');
request.send();

// websocket:受信処理
// index.js内のwebserverがECHONET Lite WebApi serverにRESTでアクセスし、
// そのレスポンスをブラウザーにwebsocketでPUSH通信する。そのwebsocketの受信処理。
ws.onmessage = function(event){
  const obj = JSON.parse(event.data);
  console.log("Web socketの受信:", obj);
  console.log(" REQ: " + obj.method + " https://" + obj.hostname + obj.path );
  console.log(" path:", obj.path);
  console.log(" status code:", obj.statusCode);
  console.log(" response:", obj.response);

  // SEND buttonによるrequestのresponseなら、Request & Response 及び LOG を表示
  if (g_flagSendButtonIsClicked) {
    // Request & Responseのupdate
    vm.statusCode = "RES status code: " + obj.statusCode;
    vm.response = obj.response;
    // RESPONSEをLOGに追加
    g_dataLogArray.push({
      timeStamp:timeStamp(),
      direction:"RES",
      data:obj
    });
    
    // LOG表示の更新
    displayLog();
  }

  // ECHONET Lite WebApi Serverからのresponse処理
  let regex; // obj.path でどのREQUESTのRESPONSEであるかを分岐する

  // GET /elapi/v1
  // serviceListを新規に作成する 
  regex = /\/v1$/;   // 正規表現：行末が'/v1'
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
    vm.serviceSelected = (serviceList[1]) ? serviceList[1] : "";
  }

  // GET /elapi/v1/devices, groups, bulks, histories
  // vm.idInfoListを新規に作成する
  let service = "";
  regex = /\/devices$/;   // 正規表現：行末が'/devices'
  if (regex.test(obj.path)) {
    service = "devices";
  }
  regex = /\/groups$/;   // 正規表現：行末が'/groups'
  if (regex.test(obj.path)) {
    service = "groups";
  }
  regex = /\/bulks$/;   // 正規表現：行末が'/bulks'
  if (regex.test(obj.path)) {
    service = "bulks";
  }
  regex = /\/histories$/;   // 正規表現：行末が'/histories'
  if (regex.test(obj.path)) {
    service = "histories";
  }
  if (service !== "") {
    vm.idInfoList = [{deviceType:"", id:"", version:"", manufacturer:""}];
    if (obj.response[service] !== undefined) {
      for (let thing of obj.response[service]) {
        const deviceType = (thing.deviceType !== undefined) ? thing.deviceType : "";
        const idInfo = { 
          id:"/" + thing.id, 
          deviceType:deviceType, 
          version:thing.protocol.version, 
          manufacturer:thing.manufacturer.descriptions.ja
        };
        vm.idInfoList.push(idInfo);

        // Addition for elwebapistudy
        if (deviceType == "generalLighting") {
          vm.lighting = { 
            id:thing.id, 
            deviceType:deviceType, 
            version:thing.protocol.version, 
            manufacturer:thing.manufacturer.descriptions.ja
          };
          vm.graphicLighting = "notSelected";
        } else if (deviceType == "homeAirConditioner") {
          vm.aircon = {
            id:thing.id, 
            deviceType:deviceType, 
            version:thing.protocol.version, 
            manufacturer:thing.manufacturer.descriptions.ja
          };
          vm.graphicAircon = "notSelected";
        } else if (deviceType == "electricWaterHeater") {
          vm.waterHeater = { 
            id:thing.id, 
            deviceType:deviceType, 
            version:thing.protocol.version, 
            manufacturer:thing.manufacturer.descriptions.ja
          };
          vm.graphicWaterHeater = "notSelected";
        }
      }
    }

    vm.idInfoList.sort(function(a, b) {
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
      vm.idSelected = (vm.idInfoList[1]) ? vm.idInfoList[1].id : "";
      // Device Typeの表示項目の更新
      updateDeviceType(vm.idSelected.slice(1));
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
    const pathElements = obj.path.split('/');  // pathを'/'で分割して要素を配列にする
    const thingId = pathElements[pathElements.length - 1];  // 配列の最後の要素が deviceId
    
    // Device Desvriptionをもとにg_thingInfoを更新する
    const thingDescription = obj.response;
    const deviceType = (thingDescription.deviceType !== undefined) ? thingDescription.deviceType : "";
    let thingInfo = {
      "deviceType":deviceType,
      "propertyList":[""],
      "propertyListWritable":[""],
      "actionList":[""]
    };

    // propertyList,propertyListWritableの作成
    if (thingDescription.properties !== undefined) {
      for (let resourceName of Object.keys(thingDescription.properties)) {
        thingInfo.propertyList.push("/" + resourceName);
        if (thingDescription.properties[resourceName].writable === true){
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

    // resourceTypeListを新規に作成する
    let resourceTypeList = [""];
    if (obj.response.properties !== undefined) {
      resourceTypeList.push("/properties");
    }
    if (obj.response.actions !== undefined) {
      resourceTypeList.push("/actions");
    }
    if (obj.response.events !== undefined) {
      resourceTypeList.push("/events");
    }
    console.log("resourceTypeListの更新:", resourceTypeList);
    vm.resourceTypeList = resourceTypeList;
    
    // 入力フィールドResouce TypeとResource Nameの表示項目の更新
    updateResourceName("GET", thingId, "/properties");
    vm.resourceTypeSelected = (resourceTypeList[1]) ? resourceTypeList[1] : "";

    // 入力フィールドidの下のdeviceTypeの更新
    vm.deviceType = obj.response.deviceType;

    // Addition for elwebapistudy
    const deviceDescription = obj.response;
    // console.log("deviceDescription:",deviceDescription);
    // deviceDescription.properties から key を取り出す
    const propertyNameArray = Object.keys(deviceDescription.properties);
    vm.propertyInfoArray = [];
    for (const propertyName of propertyNameArray) {
      const description = deviceDescription.properties[propertyName].descriptions.ja;
      const writable = deviceDescription.properties[propertyName].writable;
      vm.propertyInfoArray.push({propertyName:propertyName, description:description, writable:writable});
    }
    console.log("propertyInfoArray:",vm.propertyInfoArray);
    if (vm.deviceType == "homeAirConditioner"){
      vm.aircon.propertyInfoArray = vm.propertyInfoArray;
    }
    else if (vm.deviceType == "generalLighting"){
      vm.lighting.propertyInfoArray = vm.propertyInfoArray;
    }
    else if (vm.deviceType == "electricWaterHeater"){
      vm.waterHeater.propertyInfoArray = vm.propertyInfoArray;
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
  regex = /\/properties\/([0-9]|[a-z]|[A-Z])+$/; // 正規表現'/properties/'の後、行末まで英数字
  if (obj.method == 'GET') {
    if (regex.test(obj.path)) {
      console.log("response is /properties/<property>", vm.deviceType);
      console.log("response:", obj.response);
      if (vm.deviceType == "homeAirConditioner"){
        console.log("response is property value for aircon");
        if (obj.response.operationStatus !== undefined) {
          vm.airconOperationStatus = obj.response.operationStatus;
        } else if (obj.response.operationMode !== undefined) {
          console.log("operationMode is", obj.response.operationMode);
          vm.airconOperationMode = obj.response.operationMode;
        } else if (obj.response.targetTemperature !== undefined) {
          console.log("targetTemperature is", obj.response.targetTemperature);
          vm.airconTargetTemperature = obj.response.targetTemperature;
        }
      }
      else if (vm.deviceType == "generalLighting"){
        console.log("response is property value for lighting");
      }
      else if (vm.deviceType == "electricWaterHeater"){
        console.log("response is property value for waterHeater");
      }
  
    }  
  }
  
  g_flagSendButtonIsClicked = false;
};

function displayLog() {
  let log = [];
  for (let dataLog of g_dataLogArray) {
    let message = {
      id: dataLog.id,
      timeStamp: dataLog.timeStamp,
      direction: dataLog.direction,
    };
    if (dataLog.direction == 'REQ') { // REQUEST
      message.body = dataLog.data.method + " https://"+dataLog.data.hostname+dataLog.data.path;
    } else { // RESPONSE
      message.statusCode = dataLog.data.statusCode;
      message.body = dataLog.data.response;
    }
    log.push(message);
  }
  if (vm.rbOrder == "reverseOrder") {
    log.reverse();
  }
  vm.message_list = log;
}

// ログ用に現在の時刻を取得する
function timeStamp() {
  const date = new Date();
  let hour = date.getHours().toString();
  let minute = date.getMinutes().toString();
  let second = date.getSeconds().toString();
  hour = (hour.length == 1) ? ("0" + hour) : hour;
  minute = (minute.length == 1) ? ("0" + minute) : minute;
  second = (second.length == 1) ? ("0" + second) : second;
  return hour + ":" + minute + ":" + second;
}