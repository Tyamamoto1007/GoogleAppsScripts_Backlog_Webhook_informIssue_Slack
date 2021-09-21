# GoogleAppsScripts_Backlog_Webhook_informIssue_Slack
BacklogのWebhook機能を利用して、課題追加・更新・コメント追加情報をSlackに担当者にのみダイレクトメッセージで通知する機能です。

## 使い方

1. Googleドライブ(https://www.google.com/intl/ja_ALL/drive/ )にアクセスします。
1. 新規ボタン＞その他＞アプリを追加で「Google Apps Script」を検索し、接続します。
1. 新規ボタン＞その他＞「Google Apps Script」を選択します。
1. プロジェクト名を任意の名称を付けます(例「backlogInformSlack」など)
1. Githubのこのコードを張り付けます。ファイル名を「doPost.gs」に名前変更します。

1. ソースコードのコメントに書かれた以下事前条件を設定します。

事前条件1 SlackのAPIを利用できるように、アプリを追加しておく(Bot User OAuth Access Tokenを控えておく)

事前条件2 Googleスプレッドシートを新規作成、シート名を「BacklogToSlack」に名前変更する。Backlogユーザー名(A列)とSlackメンバーID(B列)の対応表入力。スプレッドシートURL欄の「～d/○○/edit#～」の○○を控えておく

事前条件3 BacklogのURL(例．https:// [スペースID] .backlog.jp/、or https:// [スペースID] .backlog.com/)を控えておく ※URL末尾にスラッシュ必須

事前条件4 メニュー「ライブラリ」の＋マークをクリックして「1on93YOYfSmV92R5q59NpKmsyWIQD8qnoLYk-gkQBI92C58SPyA2x1-bq」入力する。SlackAppを追加されるので、バージョンは最新のものを選択して保存する

事前条件5 事前条件1~3をinitProperty関数内のsetProperyメソッドの第2引数(値)に設定し、initPropertyを実行。※実行時に実行許可が必要

※初回実行後は不要になるため、APIキー等秘匿するためにinitProperty関数の記述を削除します。

7. 設定完了後、事後設定を実施します。

事後設定1 右上にある「デプロイ＞新しいデプロイ」を選択し、「種類の選択＞ウェブアプリ」、次のユーザーとしてアプリケーションを実行:自分、アクセスできるユーザー:全員でデプロイ

事後設定2 設定1でスクリプトを公開後に表示されるウェブアプリのURLを控えておく

事後設定3 Backlogの管理画面のプロジェクト設定＞インテグレーション＞Webhookの設定で、①課題登録、②課題更新、③コメント追加のみチェックを入れ、設定2のURLをWebhook先に登録する
