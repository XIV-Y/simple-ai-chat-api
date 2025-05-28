import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { Hono } from 'hono';

import 'dotenv/config';

const app = new Hono();

app.use('*', cors());

const PORT = Number(process.env.PORT) || 3000;

console.log(`Starting server on port: ${PORT}`);

serve({
  fetch: app.fetch,
  port: PORT
});
