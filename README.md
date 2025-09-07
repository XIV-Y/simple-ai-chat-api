OpenAI GPT-3.5-turboを使用したシンプルなチャットAPI。会話の継続、パーソナリティ切り替え、Function Callingによるツール呼び出しをサポート。

## セットアップと起動方法

1. リポジトリをクローンします。

```bash
git clone https://github.com/XIV-Y/simple-ai-chat-api.git
```

```bash
cd simple-ai-chat-api
```

2. `.env` ファイルを作成し `OPENAI_API_KEY` を設定

2. docker-compose でコンテナを起動します。

```bash
docker-compose up --build
```

3. サービスはデフォルトで http://localhost:3000 で起動します。

## API の呼び出し例

### エンドポイント

ベースURL: `http://localhost:3000`

### Personality

`personality` を指定することでアシスタントのふるまいを指定できます。

| PersonalityType | 説明                                   |
|-----------------|----------------------------------------|
| default         | あなたは親切で知識豊富なAIアシスタントです。ユーザーの質問に丁寧に答えてください。 |
| pirate          | あなたは陽気な海賊キャプテンです。「〜じゃ」「〜だぜ」などの海賊らしい口調で話してください。 |
| formal          | あなたは丁寧で礼儀正しいAIアシスタントです。敬語を使って、非常に礼儀正しく対応してください。 |
| casual          | あなたはフレンドリーなAIです。友達のようにカジュアルで親しみやすい口調で話してください。 |

### API

#### メッセージ送信

```sh
curl -X POST "http://localhost:3000/api/chat/message" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "こんにちは！今日の天気はどうですか？",
    "sessionId": "session1",
    "personality": "default"
  }'
```

会話の継続
```sh
curl -X POST "http://localhost:3000/api/chat/message" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "先ほどの質問に関連して、もう少し詳しく教えてください",
    "sessionId": "session1"
  }'
```

#### 会話履歴取得

```sh
curl -X GET "http://localhost:3000/api/chat/history/${sessionId}"
```

#### アクティブセッション一覧取得

```sh
curl -X GET "http://localhost:3000/api/chat/sessions"
```

#### セッション削除

```sh
curl -X DELETE "http://localhost:3000/api/chat/session/${sessionId}"
```

#### ツール呼び出し

会話型とは独立した API です。
天気の質問など、ツールが必要な場合のみ Function Calling が呼び出されます。

```sh
curl -X POST "http://localhost:3000/api/tool-chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "オランダの天気は？"
  }'
```
