import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ====================================================================
//  SECURITY: Core Secrets & Configuration
// ====================================================================

// API Key from server environment (NEVER exposed to frontend)
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

// Per-boot proxy session token: prevents unauthenticated external API abuse.
// The frontend obtains this via /api/session (protected by CORS + rate limit),
// then includes it in X-Proxy-Token header on all /api/groq/* calls.
const PROXY_SESSION_TOKEN = process.env.APP_API_TOKEN || crypto.randomBytes(32).toString('hex');

if (!GROQ_API_KEY) {
  console.warn('⚠️  WARNING: GROQ_API_KEY is not set in environment variables!');
  console.warn('   The proxy will not be able to forward requests to Groq.');
  console.warn('   Set it via: export GROQ_API_KEY=gsk_your_key_here');
}

// ====================================================================
//  SECURITY: Allowed Models Whitelist
// ====================================================================
const ALLOWED_MODELS = new Set([
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
  'allam-2-7b',
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant'
]);

// ====================================================================
//  SECURITY: Helmet — HTTP Security Headers
// ====================================================================
// Sets Content-Security-Policy, X-Frame-Options, X-Content-Type-Options,
// Strict-Transport-Security (HSTS), Referrer-Policy, etc.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: [
        "'self'",
        "https://api.groq.com",
        "https://*.supabase.co",
        "https://*.supabase.in"
      ],
      frameSrc: ["'none'"],       // Blocks ALL iframe embedding (anti-clickjacking)
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,  // Allow fonts/images from Google CDNs
  crossOriginResourcePolicy: { policy: 'same-origin' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// ====================================================================
//  SECURITY: CORS — Strict Same-Origin Protection
// ====================================================================
// Blocks cross-origin browser-based attacks. Only allows requests from
// the same origin or explicitly configured trusted domains.
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
  : [];

app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin requests (no Origin header sent by browser)
    if (!origin) return callback(null, true);
    // Allow explicitly configured origins (e.g., Render URL, custom domain)
    if (ALLOWED_ORIGINS.length > 0 && ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    // When no origins are configured, block all cross-origin requests
    if (ALLOWED_ORIGINS.length === 0) {
      return callback(null, false);
    }
    return callback(new Error('CORS: Origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-Proxy-Token']
}));

// ====================================================================
//  SECURITY: Rate Limiting — Anti-DDoS & Anti-Abuse
// ====================================================================

// Trust the first proxy (Render, Cloudflare) for accurate client IP
app.set('trust proxy', 1);

// Global API rate limiter: 120 requests per 15 minutes per IP
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many requests from this IP. Please try again in a few minutes.' } }
});
app.use('/api/', globalApiLimiter);

// Strict LLM proxy rate limiter: 30 chat requests per 15 minutes per IP
const llmProxyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'AI request rate limit exceeded. Please wait before sending more messages (max 30 per 15 minutes).' } }
});

// Session endpoint rate limiter: 10 requests per hour per IP
const sessionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many session requests. Please try again later.' } }
});

// ====================================================================
//  SECURITY: Body Parser with Strict Size Limit
// ====================================================================
app.use(express.json({ limit: '100kb' }));

// ====================================================================
//  SECURITY: Proxy Token Validation Middleware
// ====================================================================
// Requires X-Proxy-Token header matching the server's session token.
// The frontend obtains this token via /api/session (same-origin only).
function requireProxyToken(req, res, next) {
  const token = req.headers['x-proxy-token'];
  if (!token || !timingSafeEqual(token, PROXY_SESSION_TOKEN)) {
    return res.status(403).json({
      error: { message: 'Forbidden: Invalid or missing proxy authentication token.' }
    });
  }
  next();
}

// Constant-time string comparison to prevent timing attacks
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
  } catch {
    return false;
  }
}

// ====================================================================
//  SECURITY: Request Validation Middleware for Groq Proxy
// ====================================================================
// Whitelists approved models, clamps max_tokens & temperature,
// validates message array structure, and enforces content size limits.
function validateChatRequest(req, res, next) {
  const { model, messages, max_tokens, temperature } = req.body;

  // Validate model against whitelist
  const requestedModel = model || DEFAULT_MODEL;
  if (!ALLOWED_MODELS.has(requestedModel)) {
    return res.status(400).json({
      error: { message: `Model '${requestedModel}' is not in the approved whitelist. Allowed: ${[...ALLOWED_MODELS].join(', ')}` }
    });
  }

  // Validate messages array
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      error: { message: 'Invalid request: messages must be a non-empty array.' }
    });
  }

  if (messages.length > 50) {
    return res.status(400).json({
      error: { message: 'Conversation too long: maximum 50 messages per request.' }
    });
  }

  for (const msg of messages) {
    if (!msg || typeof msg !== 'object') {
      return res.status(400).json({
        error: { message: 'Each message must be a valid object with role and content.' }
      });
    }
    if (!msg.role || !['system', 'user', 'assistant'].includes(msg.role)) {
      return res.status(400).json({
        error: { message: `Invalid message role: '${msg.role}'. Must be system, user, or assistant.` }
      });
    }
    if (typeof msg.content !== 'string') {
      return res.status(400).json({
        error: { message: 'Each message content must be a string.' }
      });
    }
    if (msg.content.length > 15000) {
      return res.status(400).json({
        error: { message: 'Message content too large (max 15,000 characters per message).' }
      });
    }
  }

  // Sanitize and clamp parameters
  req.body.model = requestedModel;
  req.body.max_tokens = Math.min(Math.max(parseInt(max_tokens) || 2048, 1), 4096);
  req.body.temperature = Math.min(Math.max(parseFloat(temperature) || 0.7, 0.0), 1.5);

  next();
}

// ====================================================================
//  API ROUTES
// ====================================================================

// --- Session Token Endpoint ---
// The frontend calls this on app load to obtain the proxy token.
// Protected by CORS (same-origin only) and a strict rate limiter.
app.get('/api/session', sessionLimiter, (_req, res) => {
  res.json({ token: PROXY_SESSION_TOKEN });
});

// --- Health Check ---
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    groqKeyConfigured: !!GROQ_API_KEY,
    defaultModel: DEFAULT_MODEL,
    security: {
      helmet: true,
      cors: ALLOWED_ORIGINS.length > 0 ? 'restricted' : 'same-origin',
      rateLimiting: true,
      proxyAuth: true,
      modelWhitelist: [...ALLOWED_MODELS]
    }
  });
});

// --- Groq Connection Test ---
// Protected by proxy token + rate limiter
app.post('/api/groq/test', requireProxyToken, llmProxyLimiter, async (req, res) => {
  if (!GROQ_API_KEY) {
    return res.status(500).json({
      ok: false,
      message: 'Server GROQ_API_KEY is not configured.'
    });
  }

  const requestedModel = req.body.model || DEFAULT_MODEL;

  // Validate model against whitelist
  if (!ALLOWED_MODELS.has(requestedModel)) {
    return res.status(400).json({
      ok: false,
      message: `Model '${requestedModel}' is not in the approved whitelist.`
    });
  }

  const startTime = Date.now();

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: requestedModel,
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
// Triple-protected: Proxy Token + Request Validation + LLM Rate Limiter
app.post('/api/groq/chat', requireProxyToken, validateChatRequest, llmProxyLimiter, async (req, res) => {
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

      // If client disconnects, abort the upstream stream
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

// ====================================================================
//  Serve static Vite build
// ====================================================================
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA fallback: serve index.html for all non-API routes
app.use((_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ====================================================================
//  Start Server
// ====================================================================
app.listen(PORT, () => {
  console.log(`\n🚀 MyMentor server running on port ${PORT}`);
  console.log(`   Frontend: http://localhost:${PORT}`);
  console.log(`   API Proxy: http://localhost:${PORT}/api/groq/chat`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Groq Key: ${GROQ_API_KEY ? '✅ Configured' : '❌ NOT SET'}`);
  console.log(`   Security:`);
  console.log(`     ✅ Helmet (CSP, X-Frame-Options, HSTS, noSniff)`);
  console.log(`     ✅ CORS (same-origin${ALLOWED_ORIGINS.length > 0 ? ' + ' + ALLOWED_ORIGINS.join(', ') : ' only'})`);
  console.log(`     ✅ Rate Limiting (120 global / 30 LLM per 15min per IP)`);
  console.log(`     ✅ Proxy Token Auth (${process.env.APP_API_TOKEN ? 'env APP_API_TOKEN' : 'auto-generated per boot'})`);
  console.log(`     ✅ Model Whitelist (${ALLOWED_MODELS.size} models)`);
  console.log(`     ✅ Input Validation (max 50 msgs, 15k chars/msg, 4096 max_tokens)\n`);
});
