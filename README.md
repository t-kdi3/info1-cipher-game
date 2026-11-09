# 情報Ⅰ 暗号解読チャレンジ

クラスと出席番号を入力し、40分以内に暗号問題を解くブラウザーゲームです。個人ランキングには全8問クリアのタイムを表示し、クラス平均には参加者ごとの正答数を表示します。

- クラス：1-1〜1-8
- 0：例題は練習用で、クリア条件と平均正答数の対象外
- 集計対象：1〜6、および7-1・7-2の計8問
- 問題と正答は `js/puzzles.js` で設定
- ランキング記録はGoogle Apps Script（GAS）API経由

## ローカルで実行

HTMLを直接開くのではなく、ローカルHTTPサーバーから開いてください（`localStorage` を安定して使うため）。

```sh
python3 -m http.server 8000
```

ブラウザーで `http://localhost:8000` を開きます。ランキング／共有記録を使うには、先にGAS APIを用意して次の設定を行ってください。

## 問題を設定する

`js/puzzles.js` の各課題の `question` と `answers` を編集します。`answers` は正答文字列の配列です。別表記を許可する場合は候補を追加します。回答の比較前に前後の空白を除き、Unicode NFKC正規化を行います。

```js
{
    id: "caesar",
    title: "2：シーザー暗号",
    section: "課題",
    counted: true,
    question: "問題文を記入",
    answers: ["正答", "別表記"]
}
```

`question` または `answers` が未設定の課題は「準備中」と表示され、回答欄は使えません。例題は `counted: false` のままにしてください。

## GAS APIを接続する

`js/config.js` の `GAME_API_URL` を、デプロイしたGASウェブアプリのURLに置き換えます。GASは次の仕様に対応してください。

### 記録（POST）

```json
{
  "type": "result",
  "className": "1-1",
  "studentNumber": "12",
  "solvedCount": 5,
  "totalCount": 8,
  "status": "timeout",
  "elapsedSeconds": 2400,
  "startedAt": "2026-01-01T10:00:00.000Z",
  "finishedAt": "2026-01-01T10:40:00.000Z"
}
```

保存成功時は `{"ok":true}` を返します。結果画面には送信・再送信ボタンがあり、通信エラー時はメッセージを表示します。

### ランキングとクラス平均（GET）

```json
{
  "rankings": [
    { "className": "1-1", "studentNumber": "12", "elapsedSeconds": 812 }
  ],
  "classAverages": [
    { "className": "1-1", "averageSolved": 5.25, "participantCount": 4 }
  ]
}
```

ランキングは全問クリア (`status: "complete"`) の記録をタイム順で返します。クラス平均はタイムアップ時の正答数を参加者ごとに平均し、全クラス分を返します。全問クリアした参加者は8問正解として平均に含めます。記録がない場合は空配列を返してください。

ブラウザーからGASへアクセスできるよう、ウェブアプリの公開設定とクロスオリジンアクセスも確認してください。URL未設定時は、共有記録を利用できないことを画面に表示します。
