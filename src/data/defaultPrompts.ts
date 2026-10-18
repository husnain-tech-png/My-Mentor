export interface SuggestedPrompt {
  id: string;
  category: string;
  stage?: string;
  label: string;
  prompt: string;
  icon?: string;
}

export const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: 'p-1',
    category: 'Student & Learning',
    stage: 'student',
    label: 'Break Down Complex Topic',
    prompt: 'I am struggling to balance high-volume academic study with building real-world skills. What weekly schedule framework do you recommend?',
    icon: '📚'
  },
  {
    id: 'p-2',
    category: 'Early Career',
    stage: 'early-career',
    label: 'High-Leverage Career Move',
    prompt: 'I have 2 years of experience. How do I transition from completing assigned tickets to owning projects and demonstrating leadership?',
    icon: '💼'
  },
  {
    id: 'p-3',
    category: 'Founders & Startups',
    stage: 'founder',
    label: 'Validation Before Building',
    prompt: 'I have an idea for a B2B product. How do I validate customer willingness to pay without writing a single line of production code?',
    icon: '🚀'
  },
  {
    id: 'p-4',
    category: 'Property & Wealth',
    stage: 'property-researcher',
    label: 'Due Diligence Checklist',
    prompt: 'What are the essential risk factors and quantitative criteria I should audit when researching my first residential property investment?',
    icon: '🏠'
  },
  {
    id: 'p-5',
    category: 'Biographies & Wisdom',
    label: 'Abdur Rahman bin Auf\'s Method',
    prompt: 'How did Abdur Rahman bin Auf recover financially after arriving in Madinah with zero capital, and what can a modern entrepreneur extract from it?',
    icon: '📜'
  },
  {
    id: 'p-6',
    category: 'Islamic Reflection',
    label: 'Itqan & Work Excellence',
    prompt: 'In Islamic ethics, what is the concept of Itqan (excellence in work), and how does it balance against the temptation of rushing an MVP?',
    icon: '✨'
  },
  {
    id: 'p-7',
    category: 'Decision Framework',
    label: 'Saying No to Good Ideas',
    prompt: 'I feel overwhelmed with opportunities and requests. Help me construct a clear filter to decline distractions respectfully.',
    icon: '🎯'
  }
];

export const CURATED_REMINDER_TEMPLATES = [
  {
    category: 'Morning Alignment',
    message: 'Before diving into reactive tasks: what single outcome today moves your primary needle?'
  },
  {
    category: 'Daily Itqan Check',
    message: 'Mastery is formed in the hidden details. Review one piece of work today through the lens of excellence (Itqān).'
  },
  {
    category: 'Tie Your Camel',
    message: 'Identify what you control today and execute it with thoroughness. Release the friction of what lies outside your agency.'
  },
  {
    category: 'Circle of Competence',
    message: 'Warren Buffett reminds us: knowing what you don\'t know is your greatest shield. Stay grounded in your authentic edge.'
  },
  {
    category: 'Evening Intention Audit',
    message: 'Pause and reflect on today\'s efforts. Celebrate the quiet progress made and reset your intention for tomorrow.'
  }
];
