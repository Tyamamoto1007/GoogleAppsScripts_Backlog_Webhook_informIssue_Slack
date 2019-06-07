# GoogleAppsScripts_BacklogIssue_inform_Slack-GAS-
BacklogのWebhook機能を利用して、課題追加・更新・コメント追加情報をSlackに担当者にのみダイレクトメッセージで通知する機能です。

## 使い方

* https://www.google.com/intl/ja_ALL/drive/ にアクセスします。
* 新規ボタン＞その他＞アプリを追加で「Google Apps Script」を検索し、接続します。
* 新規ボタン＞その他＞「Google Apps Script」を選択します。
* プロジェクト名を任意の名称を付けます(例「backlogInformSlack」など)
* Githubのこのコードを張り付けます。

* ソースコードのコメントに書かれた以下事前条件を設定します。

事前条件1 SlackのAPIを利用できるように、アプリを追加しておく(Bot User OAuth Access Tokenを控えておく)

事前条件2 メニュー「リソース＞ライブラリ」から「ライブラリを追加」に「M3W5Ut3Q39AaIwLquryEPMwV62A3znfOO」入力し、SlackAppを追加する

事前条件3 メニュー「ファイル＞プロジェクトのプロパティ」のスクリプトプロパティタブで「プロパティ:SLACK_ACCESS_TOKEN、値：事前条件1で控えた値」を入力

事前条件4 Googleスプレッドシートを新規作成、シート名を「BacklogToSlack」に名前変更する。Backlogユーザー名(A列)とSlackメンバーID(B列)の対応表入力。スプレッドシートURL欄の「~d/○○/edit#~」の○○を控えておく

事前条件5 メニュー「ファイル＞プロジェクトのプロパティ」のスクリプトプロパティタブで「プロパティ:SHEET_ID、値：事前条件4で控えた値」を入力

* 設定完了後、事後設定を実施します。

事後設定1 メニュー「公開＞Webアプリケーション導入」で、バージョン:New、次のユーザーとしてアプリケーションを実行:自分、アクセスできるユーザー:全員(匿名ユーザーを含む)で公開する

事後設定2 設定1でスクリプトを公開後に表示されるURLを控えておく

事後設定3 Backlogの管理画面のプロジェクト設定＞インテグレーション＞Webhookの設定で、①課題登録、②課題更新、③コメント追加のみチェックを入れ、設定2のURLをWebhook先に登録する
