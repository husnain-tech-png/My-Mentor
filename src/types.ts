/* ========================================
   MyMentor — Type Definitions
   ======================================== */

// --- User & Profile ---

export type UserMode = 'guest' | 'personalized';

export interface UserProfile {
  displayName?: string;
  stage?: 'student' | 'early-career' | 'founder' | 'property-researcher' | 'other';
  goal?: string;
  topicTags?: string[];
  weeklyTimeHours?: number;
  language?: string;
  timezone?: string;
}

// --- Mentor Preferences (separate from profile) ---

export type Tone = 'warm' | 'calm' | 'direct';
export type AnswerFormat = 'concise' | 'step-by-step' | 'question-first' | 'detailed';
export type ChallengeLevel = 'encourage' | 'balance' | 'challenge';
export type SubjectLens =
  | 'student-founder'
  | 'startup-basics'
  | 'product-skills'
  | 'leadership'
  | 'investor-literacy'
  | 'property-research'
  | 'islamic-reflection';

export interface MentorPreferences {
  tone: Tone;
  answerFormat: AnswerFormat;
  challengeLevel: ChallengeLevel;
  subjectLens?: SubjectLens;
  customInstruction?: string;          // max 250 chars
  islamicModeEnabled: boolean;
}

// --- Conversations & Messages ---

export interface ChatMessage {
  id: string;
  role: 'user' | 'mentor';
  text: string;
  citations?: Citation[];
  timestamp: number;
  islamicMode?: boolean;
}

export interface Citation {
  label: string;
  url?: string;
  sourceType: 'quran' | 'hadith' | 'book' | 'article' | 'interview' | 'shareholder-letter' | 'other';
  details?: string;          // e.g. "Surah Al-Qasas 28:77, Dr. Mustafa Khattab translation"
  lastVerified?: string;     // ISO date
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

// --- Biography & Lessons ---

export type ReviewStatus = 'reviewed' | 'draft' | 'needs-update';

export interface BiographySource {
  title: string;
  url: string;
  author?: string;
  date?: string;
  sourceType: Citation['sourceType'];
  accessDate: string;
  rights?: string;
}

export interface Biography {
  id: string;
  name: string;
  shortBio: string;
  context: string;            // country, era, industry
  topicTags: string[];
  sources: BiographySource[];
  lessons: Lesson[];
  caveats: string[];          // limitations, collaborators, timing, uncertainty
  lastVerified: string;
  reviewStatus: ReviewStatus;
}

export interface Lesson {
  id: string;
  title: string;
  verifiedFact: string;
  attributedInterpretation: string;
  suggestedLesson: string;
  topicTags: string[];
  sourceRefs: string[];       // indexes into biography sources
  relevanceExplanation?: string; // why this lesson matches a user's context
}

// --- Islamic Content ---

export interface QuranReference {
  surah: number;
  surahName: string;
  ayah: string;              // e.g. "77" or "15-16"
  translationText: string;
  translator: string;
  translationName: string;
  sourceUrl: string;
  reviewedExplanation?: string;
  reviewStatus: ReviewStatus;
}

export interface HadithReference {
  collection: string;        // e.g. "Sahih al-Bukhari"
  bookChapter?: string;
  number: string;
  translationText: string;
  grading: string;
  gradingSource: string;
  sourceUrl: string;
  reviewStatus: ReviewStatus;
}

export interface IslamicReflection {
  id: string;
  title: string;
  theme: string;             // work, intention, balance, patience, generosity, etc.
  sourceText: string;        // Layer 1: exact source text + reference
  sourceRef: QuranReference | HadithReference;
  cautionSummary: string;    // Layer 2: cautious summary of translation/commentary
  practicalReflection: string; // Layer 3: app's suggested reflection, clearly labeled
  topicTags: string[];
  reviewStatus: ReviewStatus;
  reviewerNote?: string;
}

// --- Reminders ---

export interface ReminderRule {
  id: string;
  messageType: 'curated' | 'custom';
  customMessage?: string;
  curatedCategory?: string;
  localTime: string;         // HH:mm
  timezone: string;          // IANA timezone
  days: number[];            // 0=Sun ... 6=Sat
  quietHoursStart?: string;
  quietHoursEnd?: string;
  enabled: boolean;
  paused: boolean;
  createdAt: number;
}

// --- Push Subscription ---

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  installationId: string;    // anonymous
  createdAt: number;
}

// --- Voice State ---

export type VoiceState = 'idle' | 'ready' | 'listening' | 'processing' | 'speaking' | 'error';

// --- App Navigation ---

export type AppPage =
  | 'welcome'
  | 'onboarding'
  | 'chat'
  | 'library'
  | 'biography-detail'
  | 'islamic'
  | 'reminders'
  | 'settings';

export interface AppState {
  mode: UserMode | null;
  page: AppPage;
  profile: UserProfile | null;
  preferences: MentorPreferences;
  conversations: Conversation[];
  activeConversationId: string | null;
  selectedBiographyId: string | null;
  sidebarOpen: boolean;
}
