import { Citation, MentorPreferences, UserProfile } from '../types';
import { BIOGRAPHIES } from '../data/biographies';
import { ISLAMIC_REFLECTIONS } from '../data/reflections';

export interface GroqModelOption {
  id: string;
  name: string;
  description: string;
}

export const GROQ_MODELS: GroqModelOption[] = [
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT OSS 120B (Recommended Flagship)',
    description: 'Flagship reasoning model on Groq, exceptional at strategic mentorship, multi-step planning, and life coaching.'
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT OSS 20B Instant',
    description: 'Ultra-fast, lowest latency for rapid conversational dialogues.'
  },
  {
    id: 'qwen/qwen3.8-27b',
    name: 'Qwen 3.8 27B',
    description: 'Highly capable instruction-following model with sharp structured reasoning.'
  },
  {
    id: 'allam-2-7b',
    name: 'Allam 2 7B (Arabic & Islamic Wisdom)',
    description: 'Specialized model with deep grounding in Arabic and Islamic ethical literature.'
  },
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile',
    description: 'Meta Llama 3.3 model for balanced reasoning.'
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
    description: 'Fast 8B parameter model.'
  }
];

/**
 * Check if the server-side proxy is available and has a Groq key configured.
 * Returns true if the proxy health endpoint reports groqKeyConfigured.
 */
let _proxyAvailable: boolean | null = null;

export async function isProxyAvailable(): Promise<boolean> {
  if (_proxyAvailable !== null) return _proxyAvailable;

  try {
    const resp = await fetch('/api/health', { signal: AbortSignal.timeout(3000) });
    if (resp.ok) {
      const data = await resp.json();
      _proxyAvailable = !!data.groqKeyConfigured;
      return _proxyAvailable;
    }
  } catch {
    // Proxy not available (e.g. running vite dev without the server)
  }
  _proxyAvailable = false;
  return false;
}

/**
 * Returns the user's manually-entered Groq API key (from Settings UI),
 * or the VITE_ env var for local development.
 * Returns undefined if neither is set.
 */
export function getUserProvidedGroqApiKey(preferences: MentorPreferences): string | undefined {
  if (preferences.groqApiKey && preferences.groqApiKey.trim().length > 0) {
    return preferences.groqApiKey.trim();
  }
  const envKey = (import.meta as any).env?.VITE_GROQ_API_KEY;
  if (typeof envKey === 'string' && envKey.trim().length > 0) {
    return envKey.trim();
  }
  return undefined;
}

/**
 * Determines if the Groq AI is available — either through the server proxy
 * or through a user-supplied API key. This is used to show the "connected" badge.
 */
export async function isGroqAvailable(preferences: MentorPreferences): Promise<boolean> {
  if (getUserProvidedGroqApiKey(preferences)) return true;
  return await isProxyAvailable();
}

export function getEffectiveGroqApiKey(preferences: MentorPreferences): string | undefined {
  // For backward compat: returns user key or undefined (proxy doesn't need a key on client)
  return getUserProvidedGroqApiKey(preferences);
}

export function getEffectiveGroqModel(preferences: MentorPreferences): string {
  if (preferences.groqModel && preferences.groqModel.trim().length > 0) {
    return preferences.groqModel.trim();
  }
  const envModel = (import.meta as any).env?.VITE_GROQ_MODEL;
  if (typeof envModel === 'string' && envModel.trim().length > 0) {
    return envModel.trim();
  }
  return 'openai/gpt-oss-120b';
}

export function buildSystemPrompt(
  profile: UserProfile | null,
  preferences: MentorPreferences
): string {
  // Construct persona directives
  const toneDirectives: Record<string, string> = {
    warm: 'Your tone is warm, empathetic, and encouraging. Acknowledge user efforts and express genuine care for their growth.',
    calm: 'Your tone is calm, stoic, objective, and analytical. Help the user step back, de-escalate anxiety, and think clearly from first principles.',
    direct: 'Your tone is direct, candid, bottom-line upfront (BLUF), and concise. Cut out conversational fluff and provide sharp, unvarnished insight.'
  };

  const formatDirectives: Record<string, string> = {
    concise: 'Formatting: Keep your response tightly focused in 3 to 5 high-impact bullet points. Highlight the single highest-leverage action.',
    'step-by-step': 'Formatting: Structure your advice into sequential operational phases (Phase 1, Phase 2, Phase 3) with concrete day/week milestones.',
    'question-first': 'Formatting: Use the Socratic method. Before prescribing solutions, ask 2 to 3 clarifying diagnostic questions that force the user to examine their assumptions.',
    detailed: 'Formatting: Deliver an in-depth strategic analysis. Unpack the underlying dynamics, trade-offs, historical analogies, and second-order consequences.'
  };

  const challengeDirectives: Record<string, string> = {
    encourage: 'Challenge stance: Prioritize positive reinforcement and building momentum. Reassure the user where they are doing well.',
    balance: 'Challenge stance: Balanced critique. Affirm their strengths while honestly pointing out blind spots, untested assumptions, and risks.',
    challenge: 'Challenge stance: Rigorous challenger. Stress-test the user\'s reasoning aggressively. Ask: "What if you are completely wrong? What is the uncomfortable truth you are avoiding?"'
  };

  const subjectLensDirectives: Record<string, string> = {
    'startup-basics': 'Primary Subject Lens: Early-stage startup fundamentals (customer discovery, validation before code, zero-capital momentum, unit economics).',
    'student-founder': 'Primary Subject Lens: Student-Founder dynamics (academic time management, energy cycles, building portfolio proof vs passing exams).',
    'product-skills': 'Primary Subject Lens: Product design and craftsmanship (radical focus, simplifying interfaces, saying no to features, user empathy).',
    leadership: 'Primary Subject Lens: Ethical leadership (team alignment, clear communication, integrity under pressure, institutional longevity).',
    'investor-literacy': 'Primary Subject Lens: Capital allocation & value investing (circle of competence, margin of safety, downside protection, uninterrupted compounding).',
    'property-research': 'Primary Subject Lens: Real estate due diligence (cash-flow yields, zoning constraints, stress-testing interest rates, reserving contingency capital).',
    'islamic-reflection': 'Primary Subject Lens: Islamic ethical wisdom (Itqān / craftsmanship, Niyyah / pure intention, Tawakkul / tying the camel before trusting, Wasatiyyah / worldly balance).'
  };

  // Curated knowledge summary
  const bioSummaries = BIOGRAPHIES.map(b =>
    `- ${b.name} (${b.context}): Key lesson: ${b.lessons[0]?.title || ''} (${b.lessons[0]?.suggestedLesson || ''})`
  ).join('\n');

  let islamicDirectives = '';
  if (preferences.islamicModeEnabled) {
    const reflectionSummaries = ISLAMIC_REFLECTIONS.map(r =>
      `- Theme ${r.theme} (${r.title}): Source text: "${r.sourceText.split('\n')[1] || r.sourceText}". Practical takeaway: ${r.practicalReflection}`
    ).join('\n');

    islamicDirectives = `
### ISLAMIC MODE ACTIVATED:
You must weave authentic Islamic ethical frameworks into your mentorship:
- Principles to apply: Itqān (craftsmanship and excellence in work), Niyyah (conscious intention preceding action), Tawakkul (meticulous effort followed by mental release/trust), Wasatiyyah (balance between worldly enterprise and eternal purpose), and honest disclosure in commerce.
- Reference verified Quran verses (with Surah and Ayah numbers) and authentic Hadith (Sahih al-Bukhari, Sahih Muslim, etc.) whenever relevant.
- Always distinguish between the divine source text and practical human application.
Curated Islamic insights available for reference:
${reflectionSummaries}
`;
  }

  return `You are "MyMentor", an expert, deeply thoughtful AI mentor specializing in study, career progression, entrepreneurial ventures, and ethical life decisions.

### USER CONTEXT:
- Name: ${profile?.displayName || 'Friend'}
- Stage: ${profile?.stage ? profile.stage.replace('-', ' ') : 'General Growth'}
- Primary Goal: ${profile?.goal || 'Developing disciplined focus and strategic clarity'}
- Weekly Focus Availability: ${profile?.weeklyTimeHours || 10} hours/week
${preferences.customInstruction ? `- User Specific Instruction: "${preferences.customInstruction}"` : ''}

### MENTOR STYLISTIC PARAMETERS:
- Tone: ${toneDirectives[preferences.tone] || toneDirectives.warm}
- Answer Structure: ${formatDirectives[preferences.answerFormat] || formatDirectives['step-by-step']}
- Challenge Level: ${challengeDirectives[preferences.challengeLevel] || challengeDirectives.balance}
- Subject Lens: ${preferences.subjectLens ? subjectLensDirectives[preferences.subjectLens] : subjectLensDirectives['startup-basics']}

### CURATED BIOGRAPHICAL KNOWLEDGE BASE:
When suitable, draw analogies from these rigorously verified historical figures:
${bioSummaries}
${islamicDirectives}

### CITATION FORMAT REQUIREMENT:
If you quote or draw heavily upon a specific historical source, Quran ayah, Hadith, book, or corporate letter, append a JSON block at the very end of your response using this EXACT format:
<!--CITATIONS_START-->
[
  {
    "label": "Short citation title",
    "sourceType": "quran|hadith|book|article|shareholder-letter|other",
    "url": "https://optional-source-url.com",
    "details": "Specific translation or chapter/verse reference"
  }
]
<!--CITATIONS_END-->
Do not put the citations block inside a code block. Keep it in the exact comment tags indicated.`;
}

export function extractCitationsFromText(rawText: string): { cleanText: string; citations: Citation[] } {
  const match = rawText.match(/<!--CITATIONS_START-->([\s\S]*?)<!--CITATIONS_END-->/);
  if (!match) {
    return { cleanText: rawText, citations: [] };
  }

  const jsonSnippet = match[1].trim();
  const cleanText = rawText.replace(/<!--CITATIONS_START-->[\s\S]*?<!--CITATIONS_END-->/, '').trim();

  try {
    const parsed = JSON.parse(jsonSnippet);
    if (Array.isArray(parsed)) {
      const citations: Citation[] = parsed.map((item: any) => ({
        label: String(item.label || 'Reference'),
        sourceType: item.sourceType || 'other',
        url: item.url || undefined,
        details: item.details || undefined,
        lastVerified: new Date().toISOString().slice(0, 10)
      }));
      return { cleanText, citations };
    }
  } catch (err) {
    console.warn('Failed to parse citations JSON from Groq output', err);
  }

  return { cleanText, citations: [] };
}

export async function testGroqConnection(
  apiKeyOrNull: string | null,
  model: string = 'openai/gpt-oss-120b'
): Promise<{ ok: boolean; message: string; latencyMs?: number }> {
  // If a user-provided key is given, call Groq directly
  if (apiKeyOrNull) {
    const startTime = Date.now();
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKeyOrNull.trim()}`,
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
        return { ok: false, message: errMsg, latencyMs };
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content?.trim();
      return {
        ok: true,
        message: `Connected successfully! Response: "${content}" (${latencyMs}ms)`,
        latencyMs
      };
    } catch (err: any) {
      return {
        ok: false,
        message: err?.message || 'Network error connecting to api.groq.com'
      };
    }
  }

  // Otherwise, test via the server proxy
  const startTime = Date.now();
  try {
    const response = await fetch('/api/groq/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model })
    });

    const latencyMs = Date.now() - startTime;
    const data = await response.json();
    return {
      ok: data.ok,
      message: data.message || (data.ok ? 'Connected via server proxy!' : 'Server proxy test failed'),
      latencyMs: data.latencyMs || latencyMs
    };
  } catch (err: any) {
    return {
      ok: false,
      message: 'Server proxy is not available. Run the server with: npm start'
    };
  }
}

/**
 * Streams a chat completion, routing through the server proxy when no user API key is set.
 * Falls back to direct Groq calls if a user-provided key exists.
 */
export async function streamGroqChatCompletion({
  apiKey,
  model,
  profile,
  preferences,
  messages,
  onChunk
}: {
  apiKey: string | null;
  model: string;
  profile: UserProfile | null;
  preferences: MentorPreferences;
  messages: { role: 'user' | 'mentor'; text: string }[];
  onChunk?: (accumulatedText: string) => void;
}): Promise<{ text: string; citations: Citation[] }> {
  const systemPrompt = buildSystemPrompt(profile, preferences);

  // Prepare payload
  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({
      role: m.role === 'mentor' ? 'assistant' : 'user',
      content: m.text
    }))
  ];

  const requestBody = {
    model,
    messages: formattedMessages,
    temperature: 0.7,
    max_tokens: 2048,
    stream: true
  };

  // Determine endpoint: proxy or direct Groq
  let fetchUrl: string;
  const fetchHeaders: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (apiKey) {
    // User provided their own key — call Groq directly
    fetchUrl = 'https://api.groq.com/openai/v1/chat/completions';
    fetchHeaders['Authorization'] = `Bearer ${apiKey.trim()}`;
  } else {
    // Use the server-side proxy (key is on the server)
    fetchUrl = '/api/groq/chat';
  }

  const response = await fetch(fetchUrl, {
    method: 'POST',
    headers: fetchHeaders,
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => null);
    const errMsg = errorJson?.error?.message || `Groq API error (${response.status}): ${response.statusText}`;
    throw new Error(errMsg);
  }

  if (!response.body) {
    throw new Error('ReadableStream not supported by browser response');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let accumulated = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(':')) continue; // SSE comment or blank

      if (trimmed === 'data: [DONE]') {
        break;
      }

      if (trimmed.startsWith('data: ')) {
        const jsonStr = trimmed.slice(6);
        try {
          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta?.content || '';
          if (delta) {
            accumulated += delta;
            if (onChunk) {
              // Strip citations tag from streaming preview for visual polish
              const previewText = accumulated.replace(/<!--CITATIONS_START-->[\s\S]*?<!--CITATIONS_END-->/, '');
              onChunk(previewText);
            }
          }
        } catch {
          // ignore parsing error for chunk boundary
        }
      }
    }
  }

  const { cleanText, citations } = extractCitationsFromText(accumulated);
  return { text: cleanText, citations };
}
