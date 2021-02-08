# ECHONET Lite WebAPI 学習用ツール：ELWebAPIStudy

2021.02.05

## Abstract

ECHONET Lite WebAPI 学習用ツールは、エコーネットコンソーシアムが策定した ECHONET Lite WebAPI の仕様を学習するためのツールです。リモコンライクなUIを操作すると、ECHONET Lite WebAPI を使ったリクエストをサーバーへ送信します。サーバーへのリクエストとサーバーからのレスポンスを画面に表示します。

機器リストの取得・機器情報の取得・動作設定と状態取得という一連の操作を行い、それぞれの操作に対応するリクエスト＆レスポンスを確認することで、ECHONET Lite WebAPIの仕組みを理解することができます。

ECHONET Lite WebAPI Serverとしては、エコーネットコンソーシアムが会員向けに運用している実験クラウドを想定しています。本ツールを利用するには、あらかじめ[実験クラウドの利用登録](https://echonet.jp/echonet-lite-web-api-info/)を行いAPIkeyを取得してください。

このツールは、家庭用エアコン（homeAirConditioner）、一般照明（generalLighting）、電気温水器(electricWaterHeater)に対応しています。

## Requirements

- Windows PC または Mac
- インターネットに接続できる環境

## Installation

本ツールは、Package 版と Node.js 版があります。

- Package 版は、Windows OS と Mac OS それぞれ専用のPackageを配布しています。
- Node.js 版は、あらかじめ [Node.js](https://nodejs.org/ja/) をインストール必要があり、アプリの起動にはコマンドプロンプト(PC)やターミナル(Mac)アプリの操作が必要です。

### Package 版のインストール

1. Packageをダウンロードします
2. ダウンロードしたzip file を解凍します
3. 解凍したアプリを起動します

### Node.js 版のインストール

1. [Node.js](https://nodejs.org/ja/) のHPをアクセスし、推奨版をダウンロードしてインストールします。
2. 本ツールの Node.js 版をダウンロードし、適当なフォルダに移動します
3. コマンドプロンプト(PC) またはターミナル(Mac) を起動します
4. コマンドプロンプトまたはターミナルで CD コマンドを使い、本ツールの Node.js 版をインストールしたフォルダに移動します。
5. 次のコマンドを実行して、必要なモジュールをダウンロード・インストールします

```
  npm i
```

6. 次のコマンドを実行して、本ツールを起動します

```
  npm start
```

## 設定

アプリを起動したら、apikeyを設定します。apikeyは、実験クラウドの利用登録を行った際に、配布されます。apikeyを紛失した場合は再発行を依頼してください。

## 使い方

画面左下の「操作ガイド」にしたがって操作してください。

## Note

本ツールは内部動作のために Web Server を立ち上げ、3020 port を利用しています。他のアプリが 3020 port を利用している場合は、本ツールが起動時にエラーとなります。

Get device info ボタンをクリックしたのち、家庭用エアコン（homeAirConditioner）、一般照明（generalLighting）、電気温水器(electricWaterHeater)の３種類のデバイスのアイコンが表示されない場合は、 設定画面から機器を追加してください。
