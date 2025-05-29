interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface Conversation {
  messages: Message[];
  createdAt: Date;
  personality: string;
}

interface ChatRequest {
  message: string;
  sessionId: string;
  personality?: string;
}

interface ChatResponse {
  response: string;
  sessionId: string;
  personality: string;
  messageCount: number;
}

type PersonalityType = 'default' | 'pirate' | 'formal' | 'casual';
