import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// --- API Key from server environment (NEVER exposed to frontend) ---
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

if (!GROQ_API_KEY) {
  console.warn('⚠️  WARNING: GROQ_API_KEY is not set in environment variables!');
  console.warn('   The proxy will not be able to forward requests to Groq.');
  console.warn('   Set it via: export GROQ_API_KEY=gsk_your_key_here');
}

// --- Health Check ---
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    groqKeyConfigured: !!GROQ_API_KEY,
    defaultModel: DEFAULT_MODEL
  });
});

// --- Groq Connection Test ---
app.post('/api/groq/test', async (req, res) => {
  if (!GROQ_API_KEY) {
    return res.status(500).json({
      ok: false,
      message: 'Server GROQ_API_KEY is not configured.'
    });
  }

  const model = req.body.model || DEFAULT_MODEL;
  const startTime = Date.now();

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Respond with the single word: "READY"' }],
        max_tokens: 5,
        temperature: 0.1
      })
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      const errMsg = errorJson?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      return res.json({ ok: false, message: errMsg, latencyMs });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    return res.json({
      ok: true,
      message: `Connected successfully! Response: "${content}" (${latencyMs}ms)`,
      latencyMs
    });
  } catch (err) {
    return res.json({
      ok: false,
      message: err?.message || 'Network error connecting to api.groq.com'
    });
  }
});

// --- Groq Chat Completions Proxy (supports streaming) ---
app.post('/api/groq/chat', async (req, res) => {
  if (!GROQ_API_KEY) {
    return res.status(500).json({
      error: { message: 'Server GROQ_API_KEY is not configured.' }
    });
  }

  const { model, messages, temperature, max_tokens, stream } = req.body;

  try {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || DEFAULT_MODEL,
        messages,
        temperature: temperature ?? 0.7,
        max_tokens: max_tokens ?? 2048,
        stream: !!stream
      })
    });

    if (!groqResponse.ok) {
      const errorJson = await groqResponse.json().catch(() => null);
      return res.status(groqResponse.status).json(
        errorJson || { error: { message: `Groq API error (${groqResponse.status})` } }
      );
    }

    // If streaming, pipe the SSE response directly to the client
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      const reader = groqResponse.body.getReader();
      const decoder = new TextDecoder();

      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            res.end();
            break;
          }
          const chunk = decoder.decode(value, { stream: true });
          res.write(chunk);
        }
      };

      // If client disconnects, abort the stream
      req.on('close', () => {
        reader.cancel();
      });

      await pump();
    } else {
      // Non-streaming: just forward the JSON response
      const data = await groqResponse.json();
      return res.json(data);
    }
  } catch (err) {
    console.error('Groq proxy error:', err);
    return res.status(500).json({
      error: { message: err?.message || 'Internal proxy error' }
    });
  }
});

// --- Serve static Vite build ---
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA fallback: serve index.html for all non-API routes
app.use((_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`\n🚀 MyMentor server running on port ${PORT}`);
  console.log(`   Frontend: http://localhost:${PORT}`);
  console.log(`   API Proxy: http://localhost:${PORT}/api/groq/chat`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Groq Key: ${GROQ_API_KEY ? '✅ Configured' : '❌ NOT SET'}\n`);
});
