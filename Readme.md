# ECHONET Lite WebAPI 学習用アプリ：ELWebAPIStudy

2021.03.02

## Abstract

ECHONET Lite WebAPI 学習用アプリは、エコーネットコンソーシアムが策定した ECHONET Lite WebAPI の仕様を学習するためのアプリです。リモコンライクなUIを操作すると、ECHONET Lite WebAPI を使ったリクエストをサーバーへ送信します。サーバーへのリクエストとサーバーからのレスポンスを画面に表示します。

機器リストの取得・機器情報の取得・動作設定と状態取得という一連の操作を行い、それぞれの操作に対応するリクエスト＆レスポンスを確認することで、ECHONET Lite WebAPIの仕組みを理解することができます。

このアプリは、家庭用エアコン (homeAirConditioner)　一般照明 (generalLighting)　電気温水器 (electricWaterHeater)　低圧スマート電力量メータ (lvSmartElectricEnergyMeter) に対応しています。

本アプリは、エコーネットコンソーシアムが会員向けに運用している実験クラウドを ECHONET Lite WebAPI Server として利用します。
本アプリを利用するには、あらかじめ[実験クラウドの利用登録](https://echonet.jp/echonet-lite-web-api-info/)を行いAPIkeyを取得してください。

## Requirements

- Windows PC または Mac
- インターネットに接続できる環境

## Installation

本アプリは、Package 版と Node.js 版があります。

- Package 版は、Windows 用のインストーラを配布しています。
- Node.js 版は、あらかじめ [Node.js](https://nodejs.org/ja/) をインストール必要があり、アプリの起動にはコマンドプロンプト(PC)やターミナル(Mac)での操作が必要です。

### Windows 用 Package 版のインストールと実行

1. インストーラを[ここ](http://sh-center.org/120620/downloads/elapistudy010Setup.exe)からダウンロードします
2. ダウンロードしたインストーラを実行すると、アプリケーションは以下のようにインストールされます。

    /ユーザー/\<user name>/AppData/Local/elapi_study/elapi-study.exe
3. またアプリケーションが自動で起動します。
4. インストールが正常に終了したら、インストーラは不要です。削除してください。

### Node.js 版のインストール

1. [Node.js](https://nodejs.org/ja/) のHPをアクセスし、推奨版をダウンロードしてインストールします。
2. 本アプリの Node.js 版を[ここ](https://github.com/KAIT-HEMS/ELWebAPIStudy)からダウンロードし、解凍後適当なフォルダに配置します
3. コマンドプロンプト(PC) またはターミナル(Mac) を起動します
4. コマンドプロンプトまたはターミナルで CD コマンドを使い、本アプリの Node.js 版を配置したフォルダに移動します。
5. 次のコマンドを実行して、必要なモジュールをインストールします

```
  npm i
```

6. 次のコマンドを実行して、本アプリを起動します

```
  npm start
```

7. 本アプリを終了するには、コマンドプロンプトまたはターミナルで ```CTRL + C``` を入力します。

## 設定

アプリを起動したら、apikeyを設定します。apikeyは、実験クラウドの利用登録を行った際に、配布されます。apikeyを紛失した場合は再発行を依頼してください。

## 使い方

画面左下の「操作ガイド」にしたがって操作してください。

## Note

本アプリは内部動作のために Web Server を立ち上げ、3020 port を利用しています。本アプリを起動時に、他のアプリが既に 3020 port を利用している場合は、本アプリがエラーとなり終了します。

Get device info ボタンをクリックしたのち、家庭用エアコン（homeAirConditioner）、一般照明（generalLighting）、電気温水器(electricWaterHeater)の３種類のデバイスのアイコンが表示されない場合は、 設定画面から機器を追加してください。
