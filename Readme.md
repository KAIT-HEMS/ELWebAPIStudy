# ELWebAPIStudy

2021.01.20

## Abstract

ECHONET Lite WebAPI 学習 Toolは、エコーネットコンソーシアムが策定した ECHONET Lite WebAPI の仕様を学習するためのツールです。
エコーネットコンソーシアムが会員向けに運用している実験サーバーへのアクセスを想定しています。
実験サーバーについてはエコーネットコンソーシアムの会員限定ページを参照ください。
このツールは現在、家庭用エアコン（homeAirConditioner）、一般照明（generalLighting）、電気温水器(electricWaterHeater)に対応しています。

## Requirements

Node.jsがインストールされたWindows PC, Macまたは Linux  

## Installation

1. zip fileを解凍する
2. 解凍したフォルダーに移動し、ターミナルで expressとwsをnpmでインストールする

```
  npm i express
  npm i ws   
```

## Launch

1. 解凍したフォルダーに移動し、ターミナルで以下のコマンドを実行する   

  ```
    node index.js
  ```

2. Web Browserを起動し、localhost:3020 をアクセスする  

3. 設定画面でapiKeyを入力する

## 設定

エコーネットコンソーシアムの会員限定ページから実験サーバーのユーザー登録を行ってapiKeyを取得し、
このツールの設定画面でapiKeyを入力してください。

## 使い方

画面左下の「操作ガイド」にしたがって操作してください。

Get device info ボタンをクリックしたのち、家庭用エアコン（homeAirConditioner）、一般照明（generalLighting）、電気温水器(electricWaterHeater)の３種類のデバイスのアイコンが表示されない場合は、 設定画面から機器を追加してください。

## Note

- 設定画面でhttpを選択することができるが、実装はしていない。
