import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { Hono } from 'hono';

import 'dotenv/config';

import { OpenAIService } from './lib/open-ai';

const app = new Hono();

app.use('*', cors());

const conversations = OpenAIService.conversations;

app.post('/api/chat/message', async (c) => {
  try {
    const body = await c.req.json() as ChatRequest;

    const { message, sessionId, personality = 'default' } = body;

    if (!message || !sessionId) {
      return c.json({ 
        error: 'Message and session ID required'  
      }, 400);
    }

    const conversation = OpenAIService.getOrCreateConversation(sessionId, personality as PersonalityType);

    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    if (conversation.messages.length > 11) {
      const systemMessage = conversation.messages[0];
      const recentMessages = conversation.messages.slice(-10);

      conversation.messages = [systemMessage, ...recentMessages];
    }

    const aiResponse = await OpenAIService.callOpenAI(conversation.messages);

    conversation.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    });

    const response: ChatResponse = {
      response: aiResponse,
      sessionId: sessionId,
      personality: conversation.personality,
      messageCount: conversation.messages.length - 1
    };

    return c.json(response);
  } catch (error) {
    console.error('Chat error:', error);

    return c.json({ 
      error: 'An error occurred during the chat process' 
    }, 500);
  }
})

app.get('/api/chat/history/:sessionId', (c) => {
  const sessionId = c.req.param('sessionId');
  const conversation = conversations.get(sessionId);

  if (!conversation) {
    return c.json({ 
      error: 'The specified session cannot be found' 
    }, 404);
  }

  const history = conversation.messages
    .slice(1)
    .map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp
    }));

  return c.json({
    sessionId: sessionId,
    personality: conversation.personality,
    history: history,
    createdAt: conversation.createdAt
  });
});

app.delete('/api/chat/session/:sessionId', (c) => {
  const sessionId = c.req.param('sessionId');
  
  if (conversations.has(sessionId)) {
    conversations.delete(sessionId);
    return c.json({ message: 'Session deleted' });
  } else {
    return c.json({ 
      error: 'The specified session cannot be found' 
    }, 404);
  }
});

app.get('/api/chat/sessions', (c) => {
  const sessions = Array.from(conversations.entries()).map(([id, conv]) => ({
    sessionId: id,
    personality: conv.personality,
    messageCount: conv.messages.length - 1,
    createdAt: conv.createdAt,
    lastActivity: conv.messages[conv.messages.length - 1]?.timestamp || conv.createdAt
  }));

  return c.json({ sessions });
});

const PORT = Number(process.env.PORT) || 3000;

console.log(`Starting server on port: ${PORT}`);

serve({
  fetch: app.fetch,
  port: PORT
});
