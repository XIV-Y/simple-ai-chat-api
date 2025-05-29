import OpenAI from 'openai';

import { AVAILABLE_TOOLS, SYSTEM_PROMPTS } from '../const';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const conversations = new Map<string, Conversation>();

export async function callOpenAI(messages: Message[]): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "Could not generate response";
  } catch (error) {
    console.error('OpenAI API Error:', error);

    throw new Error('OpenAI API call failed');
  }
}

export function getOrCreateConversation(
  sessionId: string,
  personality: PersonalityType = 'default'
): Conversation {
  if (!conversations.has(sessionId)) {
    conversations.set(sessionId, {
      messages: [{
        role: 'system',
        content: SYSTEM_PROMPTS[personality] || SYSTEM_PROMPTS.default
      }],
      createdAt: new Date(),
      personality: personality
    });
  }
  return conversations.get(sessionId)!;
}

export async function callToolOpenAIStateless(userMessage: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content: "あなたは親切なAIアシスタントです。天気の質問にはツール(get_current_weather)を使ってください。それ以外は通常通り会話してください。"
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
      tools: [...AVAILABLE_TOOLS],
      tool_choice: "auto"
    });

    const choice = response.choices[0];
    const toolCalls = choice.message.tool_calls;

    if (toolCalls && toolCalls.length > 0) {
      console.log('Call Tool!!!!!!!!!!!!!!!!')

      const toolResults: { tool_call_id: string, content: string }[] = toolCalls.map((toolCall: any) => {
        const result = runToolCall(toolCall as ToolCall);
        return {
          tool_call_id: toolCall.id,
          content: result
        };
      });

      const followupMessages = [
        {
          role: "system" as const,
          content: "あなたは親切なAIアシスタントです。"
        },
        {
          role: "user" as const,
          content: userMessage
        },
        {
          role: "assistant" as const,
          content: "",
          tool_calls: toolCalls as ToolCall[],
        },
        ...toolResults.map(res => ({
          role: "tool" as const,
          content: res.content,
          tool_call_id: res.tool_call_id
        }))
      ];

      const finalResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: followupMessages,
        max_tokens: 500,
        temperature: 0.7,
      });

      return finalResponse.choices[0].message.content || "Could not generate response";
    }

    return choice.message.content || "Could not generate response";
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('OpenAI API call failed');
  }
}

export function runToolCall(toolCall: ToolCall) {
  console.log(toolCall)
  if (toolCall.function.name === "get_current_weather") {
    let args: any = {};

    args = JSON.parse(toolCall.function.arguments || '{}');

    const location = args.location || "不明な場所";
    const unit = args.unit === "fahrenheit" ? "°F" : "°C";

    return `${location}の現在の天気は晴れ、気温は25${unit}です。`;
  }

  return "未対応のツール呼び出しです。";
}

export const OpenAIService = {
  conversations,
  callOpenAI,
  callToolOpenAIStateless,
  getOrCreateConversation,
};
