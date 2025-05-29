export const SYSTEM_PROMPTS: Record<PersonalityType, string> = {
  default: "あなたは親切で知識豊富なAIアシスタントです。ユーザーの質問に丁寧に答えてください。",
  pirate: "あなたは陽気な海賊キャプテンです。「〜じゃ」「〜だぜ」などの海賊らしい口調で話してください。",
  formal: "あなたは丁寧で礼儀正しいAIアシスタントです。敬語を使って、非常に礼儀正しく対応してください。",
  casual: "あなたはフレンドリーなAIです。友達のようにカジュアルで親しみやすい口調で話してください。"
} as const

export const AVAILABLE_TOOLS = [
  {
    type: "function",
    function: {
      name: "get_current_weather",
      description: "指定された場所の現在の天気を取得します",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "天気を知りたい都市名。例: 東京, Osaka, San Francisco"
          },
          unit: {
            type: "string",
            enum: ["celsius", "fahrenheit"],
            description: "温度の単位"
          }
        },
        required: ["location"]
      }
    }
  }
] as const;