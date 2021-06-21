# ECHONET Lite WebAPI 学習用アプリ：ELWebAPIStudy

2021.06.21

## Abstract

ECHONET Lite WebAPI 学習用アプリは、エコーネットコンソーシアムが策定した ECHONET Lite WebAPI の仕様を学習するためのアプリです。リモコンライクなUIを操作すると、ECHONET Lite WebAPI を使ったリクエストをサーバーへ送信します。サーバーへのリクエストとサーバーからのレスポンスを画面に表示します。

機器リストの取得・機器情報の取得・動作設定と状態取得という一連の操作を行い、それぞれの操作に対応するリクエスト＆レスポンスを確認することで、ECHONET Lite WebAPIの仕組みを理解することができます。

本アプリは、家庭用エアコン (homeAirConditioner)　一般照明 (generalLighting)　電気温水器 (electricWaterHeater)　低圧スマート電力量メータ (lvSmartElectricEnergyMeter) に対応しています。

本アプリは、エコーネットコンソーシアムが会員向けに運用している実験クラウドを ECHONET Lite WebAPI Server として利用します。
あらかじめ[実験クラウドの利用登録](https://echonet.jp/echonet-lite-web-api-info/)を行いAPI keyを取得してください。

本アプリは node.js 上で動作する JavaScript のプログラムです。Mac OS, Windows, Linux などの OS に node.js をインストールすることで本プログラムを実行することができます。なお、Windows に関しては、本プログラムをパッケージングして Windows 用のアプリケーションとして Microsoft アプリストアに [elwebapistudy](https://www.microsoft.com/ja-jp/p/elwebapistudy/9njvqfkqg01j?activetab=pivot:overviewtab) として登録してあります。Windows 環境ではこちらを利用することをお勧めします。

## Requirements

- Windows PC または Mac
- インターネットに接続できる環境

## Installation

1. [Node.js](https://nodejs.org/ja/) のHPをアクセスし、推奨版をダウンロードしてインストールします。
2. 本アプリを[ここ](https://github.com/KAIT-HEMS/ELWebAPIStudy)からダウンロードし、解凍後適当なフォルダに配置します
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

初めてアプリを起動したら、設定画面で API key を入力し、設定保存ボタンをクリックします。API keyは、実験クラウドの利用登録を行うと配布されます。API keyを紛失した場合は再発行を依頼してください。

## 使い方

画面左下の「操作ガイド」にしたがって操作してください。

## Note

本アプリは内部動作のために Web Server を立ち上げ、3020 port を利用しています。本アプリを起動時に、他のアプリが既に 3020 port を利用している場合は、本アプリがエラーとなり終了します。

Get device info ボタンをクリックしたのち、家庭用エアコン（homeAirConditioner）、一般照明（generalLighting）、電気温水器(electricWaterHeater)の３種類のデバイスのアイコンが表示されない場合は、 設定画面から機器を追加してください。