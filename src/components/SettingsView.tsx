import React, { useState } from 'react';
import { AnswerFormat, AppState, ChallengeLevel, MentorPreferences, ReminderRule, SubjectLens, Tone, UserMode, UserProfile } from '../types';
import { exportUserDataJSON } from '../services/storage';
import { GROQ_MODELS, testGroqConnection, getEffectiveGroqApiKey, getEffectiveGroqModel } from '../services/groqService';

interface SettingsViewProps {
  appState: AppState;
  reminders: ReminderRule[];
  onUpdateProfile: (profile: UserProfile) => void;
  onUpdatePreferences: (preferences: MentorPreferences) => void;
  onSwitchMode: (mode: UserMode) => void;
  onResetAllData: () => void;
  cloudUser?: { email?: string; displayName?: string } | null;
  onOpenSupabaseModal?: () => void;
  onOpenInstallModal?: () => void;
  isStandalone?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  appState,
  reminders,
  onUpdateProfile,
  onUpdatePreferences,
  onSwitchMode,
  onResetAllData,
  cloudUser,
  onOpenSupabaseModal,
  onOpenInstallModal,
  isStandalone
}) => {
  const [profile, setProfile] = useState<UserProfile>(
    appState.profile || {
      displayName: 'Colleague',
      stage: 'founder',
      goal: '',
      weeklyTimeHours: 10,
      language: 'en'
    }
  );

  const [preferences, setPreferences] = useState<MentorPreferences>(appState.preferences);
  const [savedNotice, setSavedNotice] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testStatus, setTestStatus] = useState<{ loading: boolean; ok?: boolean; message?: string }>({ loading: false });

  const effectiveKey = getEffectiveGroqApiKey(preferences);
  const effectiveModel = getEffectiveGroqModel(preferences);

  const handleTestGroq = async () => {
    if (!effectiveKey) {
      setTestStatus({ loading: false, ok: false, message: 'Please enter a Groq API key first.' });
      return;
    }
    setTestStatus({ loading: true });
    const result = await testGroqConnection(effectiveKey, effectiveModel);
    setTestStatus({
      loading: false,
      ok: result.ok,
      message: result.message
    });
  };

  const handleSave = () => {
    onUpdateProfile(profile);
    onUpdatePreferences(preferences);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleExportData = () => {
    const jsonString = exportUserDataJSON(appState, reminders);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mymentor-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: 'var(--space-8) var(--space-4)', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>Mentor Settings & Profile</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            Fine-tune how your mentor communicates, handles your context, and stores your data.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="btn btn-primary"
        >
          {savedNotice ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Mode Selector Card */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                Account Mode: {appState.mode === 'personalized' ? '🎯 Personalized Profile' : '⚡ Guest Mode'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                {appState.mode === 'personalized'
                  ? 'Your profile context and customized tone shape all mentor responses.'
                  : 'Fast anonymous session. You can switch to personalized anytime.'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onSwitchMode('guest')}
                className={`btn btn-sm ${appState.mode === 'guest' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Guest Mode
              </button>
              <button
                onClick={() => onSwitchMode('personalized')}
                className={`btn btn-sm ${appState.mode === 'personalized' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Personalized
              </button>
            </div>
          </div>
        </div>

        {/* User Context */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>👤</span> Your Context & Focus Area
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="settingsName">Preferred Name</label>
                <input
                  id="settingsName"
                  type="text"
                  className="form-input"
                  value={profile.displayName || ''}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  placeholder="e.g. Tariq"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Life / Career Stage</label>
                <select
                  className="form-select"
                  value={profile.stage || 'founder'}
                  onChange={(e) => setProfile({ ...profile, stage: e.target.value as UserProfile['stage'] })}
                >
                  <option value="student">🎓 Student / Graduate</option>
                  <option value="early-career">💼 Early Career Professional</option>
                  <option value="founder">🚀 Founder / Entrepreneur</option>
                  <option value="property-researcher">🏠 Property & Wealth Researcher</option>
                  <option value="other">🌐 General Life Planning</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="settingsGoal">Primary Goal</label>
              <textarea
                id="settingsGoal"
                className="form-textarea"
                value={profile.goal || ''}
                onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
                placeholder="What is your most pressing objective this month?"
                rows={2}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Available Focus Time: {profile.weeklyTimeHours || 10} hours/week</label>
              <input
                type="range"
                min="2"
                max="50"
                step="2"
                value={profile.weeklyTimeHours || 10}
                onChange={(e) => setProfile({ ...profile, weeklyTimeHours: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--color-accent-primary)' }}
              />
            </div>
          </div>
        </div>

        {/* Mentor Voice & Style Preferences */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🧠</span> Mentor Personality & Style Controls
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Tone */}
            <div className="form-group">
              <label className="form-label">Tone</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-2)' }}>
                {[
                  { id: 'warm', label: '🤝 Warm' },
                  { id: 'calm', label: '🧘 Calm' },
                  { id: 'direct', label: '⚡ Direct' }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, tone: t.id as Tone })}
                    className={`btn ${preferences.tone === t.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.85rem' }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Answer Format */}
            <div className="form-group">
              <label className="form-label">Answer Format</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-2)' }}>
                {[
                  { id: 'step-by-step', label: '📋 Step-by-Step' },
                  { id: 'concise', label: '🎯 Concise' },
                  { id: 'question-first', label: '❓ Question First' },
                  { id: 'detailed', label: '📖 Detailed' }
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, answerFormat: f.id as AnswerFormat })}
                    className={`btn ${preferences.answerFormat === f.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.8rem', padding: '8px 10px' }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Challenge Level */}
            <div className="form-group">
              <label className="form-label">Challenge Level</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-2)' }}>
                {[
                  { id: 'encourage', label: '🌱 Encourage' },
                  { id: 'balance', label: '⚖️ Balance' },
                  { id: 'challenge', label: '🔥 Challenge' }
                ].map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, challengeLevel: c.id as ChallengeLevel })}
                    className={`btn ${preferences.challengeLevel === c.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.85rem' }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Lens */}
            <div className="form-group">
              <label className="form-label">Subject Lens</label>
              <select
                className="form-select"
                value={preferences.subjectLens || 'startup-basics'}
                onChange={(e) => setPreferences({ ...preferences, subjectLens: e.target.value as SubjectLens })}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-lg)', background: 'rgba(167, 139, 250, 0.08)', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#c4b5fd' }}>Islamic Mode</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  Include verified Quran and Hadith references across all guidance.
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={preferences.islamicModeEnabled}
                  onChange={(e) => setPreferences({ ...preferences, islamicModeEnabled: e.target.checked })}
                />
                <span className="slider islamic-slider"></span>
              </label>
            </div>

            {/* Custom Instruction */}
            <div className="form-group">
              <label className="form-label" htmlFor="settingsCustomInstruction">Custom Prompt Instruction (max 250 characters)</label>
              <input
                id="settingsCustomInstruction"
                type="text"
                maxLength={250}
                className="form-input"
                value={preferences.customInstruction || ''}
                onChange={(e) => setPreferences({ ...preferences, customInstruction: e.target.value })}
                placeholder="e.g. Always include a 1-sentence bottom-line takeaway at the very end."
              />
            </div>
          </div>
        </div>

        {/* Groq Conversational AI Chatbot Configuration */}
        <div className="card" style={{ padding: 'var(--space-6)', border: '1px solid rgba(129, 140, 248, 0.35)', background: 'linear-gradient(135deg, rgba(26, 34, 53, 0.95) 0%, rgba(30, 35, 65, 0.8) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: 'var(--space-4)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-accent-green)', display: 'inline-block' }} />
                  ⚡ Groq Cloud Integration
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Ultra-Fast Llama & Mixtral Inference
                </span>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>
                Conversational AI Chatbot Engine
              </h2>
            </div>

            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem' }}
            >
              Get Free Groq Key ↗
            </a>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 'var(--space-4)' }}>
            Connect to Groq's high-speed API to power your mentor with true real-time LLM intelligence. Your key is stored securely in your browser's local storage and used directly for client-side completions.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* API Key Input */}
            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="form-label" htmlFor="groqApiKeyInput">
                  Groq API Key (starts with <code>gsk_...</code>)
                </label>
                {(import.meta as any).env?.VITE_GROQ_API_KEY && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-accent-primary)' }}>
                    ✓ Loaded from .env.local
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <input
                  id="groqApiKeyInput"
                  type={showApiKey ? 'text' : 'password'}
                  className="form-input"
                  placeholder="gsk_••••••••••••••••••••••••••••••••••••••••••••"
                  value={preferences.groqApiKey || ''}
                  onChange={(e) => setPreferences({ ...preferences, groqApiKey: e.target.value })}
                  style={{ fontFamily: showApiKey ? 'inherit' : 'monospace' }}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="btn btn-secondary"
                  title={showApiKey ? 'Hide key' : 'Show key'}
                  style={{ padding: '0 12px' }}
                >
                  {showApiKey ? '🙈' : '👁️'}
                </button>
                {preferences.groqApiKey && (
                  <button
                    type="button"
                    onClick={() => setPreferences({ ...preferences, groqApiKey: '' })}
                    className="btn btn-secondary"
                    title="Clear key"
                    style={{ padding: '0 12px', color: 'var(--color-error)' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Model Selector */}
            <div className="form-group">
              <label className="form-label">Active Model</label>
              <select
                className="form-select"
                value={preferences.groqModel || 'llama-3.3-70b-versatile'}
                onChange={(e) => setPreferences({ ...preferences, groqModel: e.target.value })}
              >
                {GROQ_MODELS.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Connection Test Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)', paddingTop: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={handleTestGroq}
                disabled={testStatus.loading}
                className="btn btn-secondary btn-sm"
              >
                {testStatus.loading ? 'Testing Connection...' : '🔌 Test Groq Connection'}
              </button>

              {testStatus.message && (
                <div style={{
                  fontSize: '0.8rem',
                  color: testStatus.ok ? 'var(--color-accent-green)' : 'var(--color-error)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>{testStatus.ok ? '✓' : '⚠️'}</span>
                  <span>{testStatus.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Supabase Cloud Sync Card */}
        <div className="card" style={{ padding: 'var(--space-6)', border: '1px solid rgba(56, 189, 248, 0.25)', background: 'rgba(56, 189, 248, 0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>☁️</span> Supabase Cloud Sync & Multi-Device Backup
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: cloudUser ? '#22c55e' : '#94a3b8',
                  boxShadow: cloudUser ? '0 0 8px #22c55e' : 'none'
                }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: cloudUser ? '#4ade80' : 'var(--color-text-secondary)' }}>
                {cloudUser ? `Connected (${cloudUser.email || cloudUser.displayName})` : 'Not Connected'}
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 'var(--space-4)' }}>
            Connect Supabase to securely save your profile, mentor chat logs, and daily reminders in the cloud so you can open MyMentor on any PC or mobile phone without losing progress.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <button
              onClick={onOpenSupabaseModal}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>☁️</span> Manage Cloud Sync & Account
            </button>
          </div>
        </div>

        {/* Mobile & PC App Installation Card */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📲</span> Mobile & PC App Installation
            </h2>
            <span
              className="badge"
              style={{
                background: isStandalone ? 'rgba(34, 197, 94, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                color: isStandalone ? '#4ade80' : '#a5b4fc',
                fontSize: '0.75rem'
              }}
            >
              {isStandalone ? '✓ Standalone App Mode' : 'Web Browser Mode'}
            </span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 'var(--space-4)' }}>
            MyMentor is a Progressive Web App (PWA). You can install it natively on your Windows PC, Mac, iPhone, iPad, or Android phone for instant 1-tap launch, distraction-free windowing, and offline access.
          </p>

          <button
            onClick={onOpenInstallModal}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>{isStandalone ? 'ℹ️' : '📲'}</span>
            <span>{isStandalone ? 'View Installation Details' : 'Install App or View Instructions'}</span>
          </button>
        </div>

        {/* Data & Privacy Controls */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔒</span> Data Sovereignty & Backups
          </h2>

          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 'var(--space-4)' }}>
            All your chat logs, preferences, and reminders are stored strictly in your local browser storage. No tracking scripts or ad analytics are loaded.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <button
              onClick={handleExportData}
              className="btn btn-secondary btn-sm"
            >
              📥 Export Data as JSON
            </button>

            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="btn btn-secondary btn-sm"
                style={{ color: 'var(--color-error)' }}
              >
                ⚠️ Reset All Local Data
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-error)' }}>Are you sure?</span>
                <button
                  onClick={() => {
                    onResetAllData();
                    setConfirmReset(false);
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ background: 'var(--color-error)' }}
                >
                  Yes, Delete Everything
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
