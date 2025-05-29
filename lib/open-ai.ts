import OpenAI from 'openai';

import { SYSTEM_PROMPTS } from '../const';

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

export const OpenAIService = {
  conversations,
  callOpenAI,
  getOrCreateConversation,
};
