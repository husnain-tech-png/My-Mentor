import { Citation, MentorPreferences, UserProfile } from '../types';
import { BIOGRAPHIES } from '../data/biographies';
import { ISLAMIC_REFLECTIONS } from '../data/reflections';
import { getEffectiveGroqApiKey, getEffectiveGroqModel, streamGroqChatCompletion } from './groqService';

interface MentorResponseOptions {
  userMessage: string;
  history: { role: 'user' | 'mentor'; text: string }[];
  profile: UserProfile | null;
  preferences: MentorPreferences;
}

export interface GeneratedMentorOutput {
  text: string;
  citations: Citation[];
  provider?: 'groq' | 'local';
  model?: string;
  error?: string;
}

export function generateMentorReply({
  userMessage,
  profile,
  preferences
}: MentorResponseOptions): GeneratedMentorOutput {
  const query = userMessage.toLowerCase();
  const citations: Citation[] = [];

  // Match biographies or Islamic reflections based on keywords
  const matchedBio = BIOGRAPHIES.find(b =>
    query.includes(b.name.toLowerCase()) ||
    b.topicTags.some(t => query.includes(t)) ||
    (b.id === 'abdur-rahman-bin-auf' && (query.includes('market') || query.includes('trade') || query.includes('penniless') || query.includes('dullani'))) ||
    (b.id === 'warren-buffett' && (query.includes('invest') || query.includes('compound') || query.includes('stock') || query.includes('circle of competence'))) ||
    (b.id === 'steve-jobs' && (query.includes('product') || query.includes('focus') || query.includes('design') || query.includes('apple') || query.includes('saying no'))) ||
    (b.id === 'marie-curie' && (query.includes('research') || query.includes('study') || query.includes('science') || query.includes('grit') || query.includes('hard work'))) ||
    (b.id === 'fatima-al-fihri' && (query.includes('education') || query.includes('university') || query.includes('institution') || query.includes('legacy')))
  );

  const matchedReflection = ISLAMIC_REFLECTIONS.find(r =>
    preferences.islamicModeEnabled ||
    query.includes(r.theme) ||
    r.topicTags.some(t => query.includes(t)) ||
    query.includes('islam') ||
    query.includes('quran') ||
    query.includes('hadith') ||
    query.includes('sunnah') ||
    query.includes('halal') ||
    query.includes('itqan') ||
    query.includes('intention') ||
    query.includes('tawakkul') ||
    query.includes('camel')
  );

  // Tone prefixes & voice styles
  let toneOpening = '';
  if (preferences.tone === 'warm') {
    toneOpening = profile?.displayName
      ? `Great to connect with you, ${profile.displayName}. Let's look at this thoughtfully together.\n\n`
      : 'Thank you for bringing this up. Let\'s unpack this with care.\n\n';
  } else if (preferences.tone === 'direct') {
    toneOpening = 'Here is the bottom line upfront:\n\n';
  } else {
    // calm
    toneOpening = 'Let\'s pause and analyze the underlying dynamics objectively.\n\n';
  }

  // Challenge modifier
  let challengeNote = '';
  if (preferences.challengeLevel === 'challenge') {
    challengeNote = '\n\n> ⚠️ **Mentor Challenge**: Before jumping ahead, ask yourself: are you solving the root constraint, or are you avoiding the harder, more uncomfortable conversation?';
  } else if (preferences.challengeLevel === 'encourage') {
    challengeNote = '\n\n💡 **Encouragement**: You don\'t have to solve everything today. Consistent, small daily actions compound faster than erratic bursts.';
  }

  // Subject lens perspective
  let lensContext = '';
  if (preferences.subjectLens === 'student-founder') {
    lensContext = 'From a student-founder vantage point, your time allocation between academic deadlines and product traction is your primary bottleneck.';
  } else if (preferences.subjectLens === 'property-research') {
    lensContext = 'Through a property & asset diligence lens, preserve your downside first: review municipal zoning, rental yields, and reserve capital before emotional enthusiasm.';
  } else if (preferences.subjectLens === 'investor-literacy') {
    lensContext = 'Evaluating this through capital allocation: prioritize asymmetric bets with defined downside and scalable compounding.';
  }

  // Answer formatting logic
  let mainBody = '';

  // 1. Check for specific topic handlers
  if (query.includes('abdur rahman') || query.includes('dullani') || (query.includes('market') && matchedBio?.id === 'abdur-rahman-bin-auf')) {
    const arBio = BIOGRAPHIES.find(b => b.id === 'abdur-rahman-bin-auf')!;
    citations.push({
      label: 'Sahih al-Bukhari #2048 & Siyar A‘lam al-Nubala (Vol. 1)',
      sourceType: 'hadith',
      url: 'https://sunnah.com/bukhari:2048',
      details: 'Historical account of Abdur Rahman bin Auf arriving in Madinah and asking for the marketplace.',
      lastVerified: '2026-09-15'
    });

    mainBody = `### The "Dullani ‘ala al-Suq" (Show Me the Market) Framework

When Abdur Rahman bin Auf arrived penniless in Madinah, his host Sa‘d ibn al-Rabi‘ generously offered him half his wealth and property. Abdur Rahman's response became an enduring blueprint for self-reliance and commercial dignity:

> *"May Allah bless you in your family and wealth; show me where the market is."*

#### 3 Actionable Rules for Modern Execution:
1. **Zero-Capital Discovery (Go to the Flow of Value)**: He did not wait for a grant, an investor, or ideal office conditions. He went directly to where transactions were already occurring to spot friction and arbitrage.
2. **High Velocity, Low Margin**: He started with simple staples (butter and dried yogurt) with modest margins and immediate cash settlement. Cash velocity preserves agency.
3. **Radical Transparency**: He refused speculative debt or misleading claims, establishing the reputation that enabled him to later finance major trading caravans.

**Practical Application for You:**
If you're starting a project or seeking income: don't build in isolation for 6 months. Go where customers and employers are already trading time or money, and ask: *"What small, immediate problem can I solve for you right now?"*`;
  } else if (query.includes('itqan') || query.includes('excellence') || query.includes('craft')) {
    citations.push({
      label: 'Shu‘ab al-Iman (al-Bayhaqi #4931) on Itqan',
      sourceType: 'hadith',
      url: 'https://sunnah.com',
      details: 'Hadith: "Verily, Allah loves that when one of you does a job, they perform it with excellence."',
      lastVerified: '2026-09-15'
    });

    mainBody = `### The Principle of Itqān (Professional Mastery)

In Islamic ethics, work is not merely transactional; it is an arena of character. The Prophet Muhammad (pbuh) said:
> *«إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ»*  
> *"Verily, Allah loves that when one of you undertakes any work, they perform it with mastery and excellence (itqān)."*

#### How Itqan Reconciles with Fast Shipping (MVP):
- **Itqan is NOT perfectionism**: Perfectionism is ego-driven fear of criticism. Itqan is integrity in what you deliver.
- **Scope small, but execute cleanly**: If you are shipping a minimum viable prototype, ensure the single feature it offers works seamlessly and honestly.
- **Documented Diligence**: Clean code, clear contracts, and transparent communication honor everyone interacting with your craft.`;
  } else if (query.includes('invest') || query.includes('property') || query.includes('due diligence')) {
    if (matchedBio?.id === 'warren-buffett' || query.includes('buffett')) {
      citations.push({
        label: 'Berkshire Hathaway Annual Shareholder Letters',
        sourceType: 'shareholder-letter',
        url: 'https://www.berkshirehathaway.com/letters/letters.html',
        details: 'Principles of circle of competence and margin of safety.',
        lastVerified: '2026-09-20'
      });
    }

    mainBody = `### Due Diligence & Capital Allocation Framework

Whether you are evaluating property investments, index funds, or business ventures, disciplined investors rely on a strict checklist:

1. **Define Your Circle of Competence**: Never invest in an asset whose cash-flow generation mechanism you cannot clearly explain on a single napkin.
2. **Margin of Safety (Downside Protection)**:
   - For property: stress-test vacancy rates at 10-15%, simulate interest rate hikes of +200 bps, and ensure reserve fund buffers cover 6 months of mortgage obligations.
   - For equity: look for durable pricing power and trustworthy management.
3. **Long Horizon Over Timing the Market**: Compounding requires peace of mind. Avoid leverage that can force an untimely liquidation during economic contractions.`;
  } else if (query.includes('validate') || query.includes('startup') || query.includes('idea')) {
    citations.push({
      label: 'Stanford Commencement Address & Product Focus Methodology',
      sourceType: 'article',
      url: 'https://news.stanford.edu/stories/2005/06/youve-got-find-what-love-jobs-says-2005',
      details: 'Steve Jobs on simplicity, ruthless focus, and deep customer empathy.',
      lastVerified: '2026-09-18'
    });

    mainBody = `### Pre-Code Validation Roadmap

Before writing production code or investing significant capital, test willingness to pay and acute customer pain:

#### Step 1: Customer Discovery Interviews (10-15 Target Users)
- **Do not ask**: *"Would you buy this idea if I built it?"* (People will flatter you).
- **Ask instead**: *"Tell me about the last time you struggled with [specific problem]. What did you try, what did it cost, and why was it painful?"*

#### Step 2: Concierge / Manual Prototype
- Deliver the result manually behind the scenes using email, spreadsheets, or no-code tools.
- If customers won't pay or spend 15 minutes onboarding manually, a fully built software app won't magically solve it.

#### Step 3: Letter of Intent (LOI) or Deposit
- Ask for a deposit or pre-order. Real validation is measured by commitment of budget or time, not polite enthusiasm.`;
  } else {
    // General thoughtful response adapted to format
    if (preferences.answerFormat === 'concise') {
      mainBody = `Here are the essential priorities regarding **"${userMessage.trim()}"**:

- **Core Focus**: Identify the single leverage point that unlocks 80% of the outcome.
- **Execution Step**: Allocate an uninterrupted 45-minute block today to make observable progress.
- **Risk Mitigation**: Verify assumptions early with honest feedback rather than guessing in isolation.`;
    } else if (preferences.answerFormat === 'question-first') {
      mainBody = `Before prescribing a strategy for this, consider these three clarifying questions:

1. What is the specific, measurable definition of success for you here in the next 30 days?
2. What trade-off or commitment are you currently hesitant to make to achieve it?
3. If this effort failed completely, what would be the most obvious predictable reason?

*Take a moment to reply to whichever of these hits hardest, and we will formulate a concrete action plan.*`;
    } else {
      // step-by-step / detailed
      mainBody = `### Strategic Breakdown: Navigating Your Current Challenge

When addressing **"${userMessage.trim()}"**, thoughtful mentors separate the immediate urgent noise from fundamental compounding assets.

#### 1. Diagnosing Your Bottleneck
${lensContext ? `> *${lensContext}*\n\n` : ''}
Most obstacles in study, career, or entrepreneurship come down to one of three barriers:
- **Clarity Deficiency**: Not having a precise definition of the next smallest deliverable.
- **Friction in Starting**: Overestimating the difficulty of step 1 vs steps 2 through 10.
- **Feedback Lag**: Waiting weeks for external validation instead of testing a micro-hypothesis today.

#### 2. Three-Phase Action Plan
1. **Audit (Day 1)**: Remove secondary obligations that drain your mental bandwidth.
2. **Draft (Days 2–3)**: Produce a rough, unpolished draft or prototype without self-judgment.
3. **Calibrate (Days 4–5)**: Share with a peer or target user and implement one immediate improvement.`;
    }
  }

  // If Islamic mode is enabled and no reflection citation yet, add a contextual reflection
  if (preferences.islamicModeEnabled && citations.length === 0 && matchedReflection) {
    if ('surah' in matchedReflection.sourceRef) {
      citations.push({
        label: `Surah ${matchedReflection.sourceRef.surahName} (${matchedReflection.sourceRef.surah}:${matchedReflection.sourceRef.ayah})`,
        sourceType: 'quran',
        url: matchedReflection.sourceRef.sourceUrl,
        details: `${matchedReflection.sourceRef.translationName} by ${matchedReflection.sourceRef.translator}`,
        lastVerified: '2026-09-15'
      });
    } else {
      citations.push({
        label: `${matchedReflection.sourceRef.collection} #${matchedReflection.sourceRef.number}`,
        sourceType: 'hadith',
        url: matchedReflection.sourceRef.sourceUrl,
        details: `Grading: ${matchedReflection.sourceRef.grading} (${matchedReflection.sourceRef.gradingSource})`,
        lastVerified: '2026-09-15'
      });
    }
  }

  // Combine full text
  const fullText = `${toneOpening}${mainBody}${challengeNote}`;

  return {
    text: fullText,
    citations,
    provider: 'local'
  };
}

export async function generateMentorReplyAsync({
  userMessage,
  history,
  profile,
  preferences,
  onChunk
}: MentorResponseOptions & {
  onChunk?: (streamedText: string) => void;
}): Promise<GeneratedMentorOutput> {
  const apiKey = getEffectiveGroqApiKey(preferences);
  const model = getEffectiveGroqModel(preferences);

  if (apiKey) {
    try {
      const messagesForGroq = [
        ...history,
        { role: 'user' as const, text: userMessage }
      ];
      const groqResult = await streamGroqChatCompletion({
        apiKey,
        model,
        profile,
        preferences,
        messages: messagesForGroq,
        onChunk
      });
      return {
        text: groqResult.text,
        citations: groqResult.citations,
        provider: 'groq',
        model
      };
    } catch (err: any) {
      console.warn('Groq API call failed, falling back to local mentor engine:', err);
      const fallback = generateMentorReply({ userMessage, history, profile, preferences });
      const warningNote = `\n\n> ⚠️ *Note: Groq API encountered an issue (${err?.message || 'Connection error'}). Delivered via offline mentor knowledge base.*`;
      return {
        text: fallback.text + warningNote,
        citations: fallback.citations,
        provider: 'local',
        error: err?.message
      };
    }
  }

  // Fallback to local deterministic mentor engine
  const localOutput = generateMentorReply({ userMessage, history, profile, preferences });
  return {
    ...localOutput,
    provider: 'local'
  };
}
