import React, { useState } from 'react';
import { AnswerFormat, ChallengeLevel, MentorPreferences, SubjectLens, Tone, UserProfile } from '../types';

interface OnboardingWizardProps {
  initialProfile: UserProfile | null;
  initialPreferences: MentorPreferences;
  onComplete: (profile: UserProfile, preferences: MentorPreferences) => void;
  onCancel: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  initialProfile,
  initialPreferences,
  onComplete,
  onCancel
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  // Profile fields
  const [displayName, setDisplayName] = useState(initialProfile?.displayName || '');
  const [stage, setStage] = useState<UserProfile['stage']>(initialProfile?.stage || 'founder');
  const [goal, setGoal] = useState(initialProfile?.goal || '');
  const [weeklyTimeHours, setWeeklyTimeHours] = useState(initialProfile?.weeklyTimeHours || 10);

  // Preferences fields
  const [tone, setTone] = useState<Tone>(initialPreferences.tone || 'warm');
  const [answerFormat, setAnswerFormat] = useState<AnswerFormat>(initialPreferences.answerFormat || 'step-by-step');
  const [challengeLevel, setChallengeLevel] = useState<ChallengeLevel>(initialPreferences.challengeLevel || 'balance');
  const [subjectLens, setSubjectLens] = useState<SubjectLens>(initialPreferences.subjectLens || 'startup-basics');
  const [customInstruction, setCustomInstruction] = useState(initialPreferences.customInstruction || '');
  const [islamicModeEnabled, setIslamicModeEnabled] = useState(initialPreferences.islamicModeEnabled || false);

  const handleFinish = () => {
    const updatedProfile: UserProfile = {
      displayName: displayName.trim() || 'Colleague',
      stage,
      goal: goal.trim(),
      weeklyTimeHours,
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    };

    const updatedPreferences: MentorPreferences = {
      tone,
      answerFormat,
      challengeLevel,
      subjectLens,
      customInstruction: customInstruction.trim().slice(0, 250),
      islamicModeEnabled
    };

    onComplete(updatedProfile, updatedPreferences);
  };

  return (
    <div style={{ maxWidth: '680px', margin: 'var(--space-8) auto', padding: '0 var(--space-4)' }}>
      <div className="card card-glass" style={{ padding: 'var(--space-8)' }}>
        {/* Progress Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--color-accent-primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: 700
            }}>
              {step}
            </span>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              {step === 1 ? 'Step 1 of 2: Your Focus & Context' : 'Step 2 of 2: Mentor Tone & Style'}
            </span>
          </div>
          <button
            onClick={onCancel}
            className="btn btn-secondary btn-sm"
          >
            Cancel
          </button>
        </div>

        {step === 1 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>Tell us about your background</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                Your mentor will tailor examples, difficulty, and frameworks to match your immediate reality.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="displayName">Your Name or Preferred Title</label>
              <input
                id="displayName"
                type="text"
                className="form-input"
                placeholder="e.g. Tariq, Sarah, Alex"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Current Life / Career Stage</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-2)' }}>
                {[
                  { id: 'student', label: '🎓 Student', desc: 'Academics & skills' },
                  { id: 'early-career', label: '💼 Early Career', desc: 'Promotions & mastery' },
                  { id: 'founder', label: '🚀 Founder / Builder', desc: 'MVPs & revenue' },
                  { id: 'property-researcher', label: '🏠 Property & Wealth', desc: 'Due diligence' },
                  { id: 'other', label: '🌐 General Growth', desc: 'Life planning' }
                ].map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setStage(s.id as UserProfile['stage'])}
                    style={{
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-lg)',
                      border: stage === s.id ? '2px solid var(--color-accent-primary)' : '1px solid var(--color-border)',
                      background: stage === s.id ? 'rgba(129, 140, 248, 0.15)' : 'var(--color-bg-card)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{s.label}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="primaryGoal">What is your primary goal right now?</label>
              <textarea
                id="primaryGoal"
                className="form-textarea"
                placeholder="e.g., Launching my SaaS MVP within 60 days without burning out, while staying disciplined."
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="weeklyHours">Available Weekly Focus Time: {weeklyTimeHours} hours/week</label>
              <input
                id="weeklyHours"
                type="range"
                min="2"
                max="50"
                step="2"
                value={weeklyTimeHours}
                onChange={(e) => setWeeklyTimeHours(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-accent-primary)' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
              <button
                className="btn btn-primary"
                onClick={() => setStep(2)}
              >
                Next: Customize Mentor Personality →
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>Configure Mentor Personality</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                Choose how your mentor speaks, challenges your thinking, and frames solutions.
              </p>
            </div>

            {/* Tone */}
            <div className="form-group">
              <label className="form-label">Mentor Tone</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-2)' }}>
                {[
                  { id: 'warm', label: '🤝 Warm', desc: 'Supportive & empathetic' },
                  { id: 'calm', label: '🧘 Calm', desc: 'Stoic, analytical & clear' },
                  { id: 'direct', label: '⚡ Direct', desc: 'Bottom-line & zero fluff' }
                ].map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setTone(t.id as Tone)}
                    style={{
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-lg)',
                      border: tone === t.id ? '2px solid var(--color-accent-primary)' : '1px solid var(--color-border)',
                      background: tone === t.id ? 'rgba(129, 140, 248, 0.15)' : 'var(--color-bg-card)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t.label}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Answer Format */}
            <div className="form-group">
              <label className="form-label">Preferred Answer Format</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-2)' }}>
                {[
                  { id: 'step-by-step', label: '📋 Step-by-Step', desc: 'Structured phases' },
                  { id: 'concise', label: '🎯 Concise', desc: 'Bullet points' },
                  { id: 'question-first', label: '❓ Question First', desc: 'Socratic dialogue' },
                  { id: 'detailed', label: '📖 Detailed', desc: 'Deep contextual analysis' }
                ].map((f) => (
                  <div
                    key={f.id}
                    onClick={() => setAnswerFormat(f.id as AnswerFormat)}
                    style={{
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-lg)',
                      border: answerFormat === f.id ? '2px solid var(--color-accent-primary)' : '1px solid var(--color-border)',
                      background: answerFormat === f.id ? 'rgba(129, 140, 248, 0.15)' : 'var(--color-bg-card)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{f.label}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Challenge Level */}
            <div className="form-group">
              <label className="form-label">Challenge Level</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-2)' }}>
                {[
                  { id: 'encourage', label: '🌱 Encourage', desc: 'Gentle positive reinforcement' },
                  { id: 'balance', label: '⚖️ Balanced', desc: 'Constructive validation' },
                  { id: 'challenge', label: '🔥 Challenge', desc: 'Stress-test my assumptions' }
                ].map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setChallengeLevel(c.id as ChallengeLevel)}
                    style={{
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-lg)',
                      border: challengeLevel === c.id ? '2px solid var(--color-accent-primary)' : '1px solid var(--color-border)',
                      background: challengeLevel === c.id ? 'rgba(129, 140, 248, 0.15)' : 'var(--color-bg-card)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.label}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{c.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subject Lens */}
            <div className="form-group">
              <label className="form-label">Primary Subject Lens</label>
              <select
                className="form-select"
                value={subjectLens}
                onChange={(e) => setSubjectLens(e.target.value as SubjectLens)}
              >
                <option value="startup-basics">Startup Basics & Early Execution</option>
                <option value="student-founder">Student-Founder Balancing Act</option>
                <option value="product-skills">Product Design & Simplification</option>
                <option value="leadership">Leadership & Ethical Decision Making</option>
                <option value="investor-literacy">Investor Literacy & Margin of Safety</option>
                <option value="property-research">Property Due Diligence & Valuation</option>
                <option value="islamic-reflection">Islamic Reflection & Work Ethics</option>
              </select>
            </div>

            {/* Islamic Mode Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-lg)', background: 'rgba(167, 139, 250, 0.1)', border: '1px solid rgba(167, 139, 250, 0.25)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#c4b5fd' }}>Enable Islamic Mode by Default</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  Integrates verified Quran and Sahih Hadith citations into guidance and reflection.
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={islamicModeEnabled}
                  onChange={(e) => setIslamicModeEnabled(e.target.checked)}
                />
                <span className="slider islamic-slider"></span>
              </label>
            </div>

            {/* Custom instruction */}
            <div className="form-group">
              <label className="form-label" htmlFor="customInstructions">Custom Mentor Instructions (optional, max 250 chars)</label>
              <input
                id="customInstructions"
                type="text"
                maxLength={250}
                className="form-input"
                placeholder="e.g., Focus heavily on actionable frameworks; remind me to take walks."
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-4)' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setStep(1)}
              >
                ← Back
              </button>
              <button
                className="btn btn-primary"
                onClick={handleFinish}
              >
                Complete Setup & Open Chat 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
