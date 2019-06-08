//BacklogのWebhook機能を利用して、課題追加・更新・コメント追加情報をSlackに担当者にのみダイレクトメッセージで通知する機能です。
//事前条件1 SlackのAPIを利用できるように、アプリを追加しておく(Bot User OAuth Access Tokenを控えておく)
//事前条件2 メニュー「リソース＞ライブラリ」から「ライブラリを追加」に「M3W5Ut3Q39AaIwLquryEPMwV62A3znfOO」入力し、SlackAppを追加する
//事前条件3 メニュー「ファイル＞プロジェクトのプロパティ」のスクリプトプロパティタブで「プロパティ:SLACK_ACCESS_TOKEN、値：事前条件1で控えた値」を入力
//事前条件4 Googleスプレッドシートを新規作成、シート名を「BacklogToSlack」に名前変更する。Backlogユーザー名(A列)とSlackメンバーID(B列)の対応表入力。スプレッドシートURL欄の「~d/○○/edit#~」の○○を控えておく
//事前条件5 メニュー「ファイル＞プロジェクトのプロパティ」のスクリプトプロパティタブで「プロパティ:SHEET_ID、値：事前条件4で控えた値」を入力

//事後設定1 メニュー「公開＞Webアプリケーション導入」で、バージョン:New、次のユーザーとしてアプリケーションを実行:自分、アクセスできるユーザー:全員(匿名ユーザーを含む)で公開する
//事後設定2 設定1でスクリプトを公開後に表示されるURLを控えておく
//事後設定3 Backlogの管理画面のプロジェクト設定＞インテグレーション＞Webhookの設定で、①課題登録、②課題更新、③コメント追加のみチェックを入れ、設定2のURLをWebhook先に登録する

function doPost(e) {
  //GAS WebアプリケーションにPOSTされたJSONデータを処理できるようにする
  var jsonString = e.postData.getDataAsString();
  var data = JSON.parse(jsonString);
  
  //Slack通知できるようにするためにTOKENの設定。Slack APIのトークンを事前条件3で設定した値から取得する
  var token = PropertiesService.getScriptProperties().getProperty('SLACK_ACCESS_TOKEN');
  //slackにメッセージを送るSlackAppオブジェクトを生成し、tokenをセットする
  var slackApp = SlackApp.create(token); 
  
  //スプレッドシートに付随しないスタンドアロンなスクリプトのため、事前条件5で取得したスプレッドシートのIDを読み取るようにする。
  var sp = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID'));
  var settingSheet = sp.getSheetByName("BacklogToSlack");
  
  //通知タイプを取得(1:課題追加、2:課題更新、3:コメントのみ追加)
  var status = Number(data["type"]);
  //3タイプとも共通でSlackに通知必要な要素、担当者、件名、登録(更新)者、締め切り日を取得する
  var assignee = data["content"]["assignee"]["name"];
  var summary = data["content"]["summary"];
  var register = data["createdUser"]["name"];
  var dueDate = data["content"]["dueDate"];
  
  //通知タイプに応じてSlackで表示するアイコン3パターンのうちどれか1種類を読み込む
  var iconImage = "https://inko.exp.jp/wp-content/uploads/2019/05/20190513_0" + status +".png";
  
  //担当者＝登録者の場合は、通知が飛ばないよう処理を終了する
  if(assignee == register) return 0;
  
  //リンク先URLに必要な要素、BacklogのURLとプロジェクトキーと課題idを取得する
  var projectURL = settingSheet.getRange(1, 7).getValue();
  var projectKey = data["project"]["projectKey"];
  var issueKey = data["content"]["key_id"];
  var projectName = data["project"]["name"].toString().replace("【VMP】","").replace("サイト開発","");
  //設定シートから、ユーザー総数を取得し、ユーザー名リストを取得する
  var memberNum = settingSheet.getRange(1, 3).getValue();
  var memberList = settingSheet.getRange(1, 1, memberNum).getValues();
  //デフォルトのチャネルとして、#webhook_testを初期設定する
  var slackUserID = "#webhook_test";
  var statusMessage;
  
  //ユーザー名リストから担当者の紐づけを行い、担当者のSlackのユーザーIDを取得する
  for(i=0;i<memberNum;i++){
    if(assignee == memberList[i]){
      slackUserID = '@' + settingSheet.getRange(i+1, 2).getValue();
    }
  }
  
  //課題登録の場合とそれ以外の形で２つに分ける。
  if(status == 1) { //1:課題の登録の場合
    //課題の詳細から情報を取得する
    var description = data["content"]["description"];
    //URLにプロジェクトKeyと課題Keyをセットし、課題にアクセスできるURLを生成する
    projectURL += projectKey + "-" + issueKey;
    //Slackに通知するメッセージをWebhookから取得した情報から組み立てる
    statusMessage = register + "さんが「" + summary + "」を登録しました(あなたが課題担当)";
    statusMessage += "\n期限日：" + dueDate +"\n詳細：" + description + "\n課題URL：" + projectURL;
    
  }else{ //2:課題更新＋3:コメント追加の場合
    //課題更新とコメント追加共通で取得するコメント内容とコメントKeyを取得する
    var commnent = data["content"]["comment"]["content"];
    var commentKey = data["content"]["comment"]["id"];
    //URLにプロジェクトKeyと課題KeyとコメントKeyをセットし、課題にアクセスできるURLを生成する
    projectURL += projectKey + "-" + issueKey + "#comment-" +commentKey;

    if(status == 2){ //2:課題更新のみ、更新された情報を取得する
      //課題更新でどの項目が変化したかと、更新前と更新後の変化を取得する。
      var changeCategory = data["content"]["changes"][0]["field"];
      //課題の状態を変更した場合に表示内容をユーザーに分かりやすく追加する
      if(changeCategory == "status") { 
        changeCategory ="課題ステータス(1:未処理,2:処理中,3:処理済,4:完了)"
      }
      var newValue = data["content"]["changes"][0]["new_value"];
      var oldValue = data["content"]["changes"][0]["old_value"];
      changeCategory += "\n変更前:" + oldValue +"\n変更後:" + newValue;
      //Slackに通知するメッセージをWebhookから取得した情報から組み立てる
      statusMessage = register + "さんが「" + summary + "」を更新しました(あなたが課題担当)";
      statusMessage += "\n期限日：" + dueDate +"\n更新内容：" + changeCategory + "\nコメント：" +commnent + "\n課題URL：" + projectURL;
      
    }else{ //3:コメント追加の場合のみの更新情報を取得する
      //Slackに通知するメッセージをWebhookから取得した情報から組み立てる
      statusMessage = register + "さんが「" + summary + "」にコメントしました(あなたが課題担当)";
      statusMessage += "\n期限日：" + dueDate +"\nコメント：" +commnent + "\n課題URL：" + projectURL;
    }
  }

  //Slackに通知する宛先や通知内容、アイコンをセットする
  options = {
    channelId: slackUserID, //チャンネル名
    userName: projectName + "のBacklog通知サービス", //投稿するbotの名前
    message:  statusMessage, //投稿するメッセージ
    icon_url: iconImage //投稿時に表示されるアイコン
  };
      //slackにメッセージを送信
      slackApp.postMessage(options.channelId, options.message, {username: options.userName,icon_url:options.icon_url});
}