import { AppState, Conversation, MentorPreferences, ReminderRule, UserProfile } from '../types';

const STORAGE_KEYS = {
  APP_STATE: 'mymentor_app_state',
  REMINDERS: 'mymentor_reminders'
};

export const DEFAULT_PREFERENCES: MentorPreferences = {
  tone: 'warm',
  answerFormat: 'step-by-step',
  challengeLevel: 'balance',
  subjectLens: 'startup-basics',
  customInstruction: '',
  islamicModeEnabled: false
};

export const INITIAL_CONVERSATION: Conversation = {
  id: 'conv-welcome-1',
  title: 'Welcome to MyMentor',
  createdAt: Date.now() - 3600000,
  updatedAt: Date.now() - 3600000,
  messages: [
    {
      id: 'msg-w-1',
      role: 'mentor',
      text: 'Salam and welcome! I am your AI mentor — designed to help you navigate study challenges, career pivots, entrepreneurial ventures, and ethical life decisions.\n\nYou can explore historical biographies with verified source citations, reflect on timeless wisdom, or ask me any question directly.\n\nWhat is currently on your mind today?',
      timestamp: Date.now() - 3600000,
      citations: [
        {
          label: 'Shu‘ab al-Iman (al-Bayhaqi #4931) on Itqan (Craftsmanship)',
          sourceType: 'hadith',
          url: 'https://sunnah.com',
          details: 'Verified hadith on pursuing excellence in work',
          lastVerified: '2026-09-15'
        }
      ]
    }
  ]
};

export const DEFAULT_APP_STATE: AppState = {
  mode: null,
  page: 'welcome',
  profile: null,
  preferences: DEFAULT_PREFERENCES,
  conversations: [INITIAL_CONVERSATION],
  activeConversationId: 'conv-welcome-1',
  selectedBiographyId: null,
  sidebarOpen: false
};

export const DEFAULT_REMINDERS: ReminderRule[] = [
  {
    id: 'rem-morning-alignment',
    messageType: 'curated',
    curatedCategory: 'Morning Alignment',
    customMessage: 'Before diving into reactive tasks: what single outcome today moves your primary needle?',
    localTime: '08:30',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    days: [1, 2, 3, 4, 5],
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    enabled: true,
    paused: false,
    createdAt: Date.now() - 86400000
  },
  {
    id: 'rem-itqan-check',
    messageType: 'curated',
    curatedCategory: 'Daily Itqan Check',
    customMessage: 'Review your primary work output today. Did you deliver with craftsmanship and diligence?',
    localTime: '15:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    days: [1, 2, 3, 4, 5],
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    enabled: true,
    paused: false,
    createdAt: Date.now() - 86400000
  }
];

export const loadStoredAppState = (): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APP_STATE);
    if (!raw) return DEFAULT_APP_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_APP_STATE,
      ...parsed,
      preferences: {
        ...DEFAULT_PREFERENCES,
        ...(parsed.preferences || {})
      }
    };
  } catch (err) {
    console.warn('Failed to parse stored app state, using defaults', err);
    return DEFAULT_APP_STATE;
  }
};

export const saveStoredAppState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.APP_STATE, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save app state to localStorage', err);
  }
};

export const loadStoredReminders = (): ReminderRule[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (!raw) return DEFAULT_REMINDERS;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to parse reminders, using defaults', err);
    return DEFAULT_REMINDERS;
  }
};

export const saveStoredReminders = (reminders: ReminderRule[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  } catch (err) {
    console.warn('Failed to save reminders to localStorage', err);
  }
};

export const exportUserDataJSON = (state: AppState, reminders: ReminderRule[]): string => {
  const payload = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    profile: state.profile,
    preferences: state.preferences,
    conversations: state.conversations,
    reminders
  };
  return JSON.stringify(payload, null, 2);
};

export const clearAllUserData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.APP_STATE);
    localStorage.removeItem(STORAGE_KEYS.REMINDERS);
  } catch (err) {
    console.warn('Failed to clear localStorage', err);
  }
};
