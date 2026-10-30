import React, { useState, useEffect } from 'react';
import { AppState, CloudSyncStatus, CloudUser, ReminderRule } from '../types';
import { getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig, testSupabaseConnection } from '../services/supabaseClient';
import {
  getCurrentUser,
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  pushAllToCloud,
  pullAllFromCloud
} from '../services/supabaseSync';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  reminders: ReminderRule[];
  onApplyCloudData: (cloudData: {
    profile?: any;
    preferences?: any;
    conversations?: any[];
    reminders?: any[];
  }) => void;
  currentUser: CloudUser | null;
  onUserChange: (user: CloudUser | null) => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({
  isOpen,
  onClose,
  appState,
  reminders,
  onApplyCloudData,
  currentUser,
  onUserChange
}) => {
  const [activeTab, setActiveTab] = useState<'account' | 'sync' | 'credentials' | 'sql'>('sync');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authNotice, setAuthNotice] = useState<{ ok?: boolean; message: string } | null>(null);

  // Credentials fields
  const [config, setConfig] = useState(() => getSupabaseConfig());
  const [testStatus, setTestStatus] = useState<{ loading: boolean; ok?: boolean; message?: string }>({ loading: false });
  const [saveNotice, setSaveNotice] = useState(false);

  // Sync actions
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>('idle');
  const [syncNotice, setSyncNotice] = useState<{ ok?: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(getSupabaseConfig());
      setAuthNotice(null);
      setSyncNotice(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfigured = Boolean(config.url && config.anonKey);

  // Handle Auth
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthNotice({ ok: false, message: 'Please enter both email and password.' });
      return;
    }

    setAuthLoading(true);
    setAuthNotice(null);

    if (authMode === 'login') {
      const res = await signInWithEmail(email, password);
      setAuthLoading(false);
      if (res.ok && res.user) {
        onUserChange(res.user);
        setAuthNotice({ ok: true, message: 'Welcome back! Signed in successfully.' });
        // Auto push/pull prompt
        setActiveTab('sync');
      } else {
        setAuthNotice({ ok: false, message: res.message || 'Login failed.' });
      }
    } else {
      const res = await signUpWithEmail(email, password, displayName);
      setAuthLoading(false);
      if (res.ok) {
        if (res.user) onUserChange(res.user);
        setAuthNotice({ ok: true, message: res.message || 'Account created successfully!' });
      } else {
        setAuthNotice({ ok: false, message: res.message || 'Sign up failed.' });
      }
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    onUserChange(null);
    setAuthNotice({ ok: true, message: 'Signed out successfully.' });
  };

  // Test Connection
  const handleTestConnection = async () => {
    setTestStatus({ loading: true });
    const res = await testSupabaseConnection(config.url, config.anonKey);
    setTestStatus({ loading: false, ok: res.ok, message: res.message });
  };

  // Save Credentials
  const handleSaveCredentials = () => {
    try {
      saveSupabaseConfig(config.url, config.anonKey, config.autoSync);
      setSaveNotice(true);
      setTimeout(() => setSaveNotice(false), 2500);
    } catch (err: any) {
      setTestStatus({ loading: false, ok: false, message: err?.message || 'Failed to save configuration.' });
    }
  };

  // Clear Credentials
  const handleClearCredentials = () => {
    clearSupabaseConfig();
    setConfig(getSupabaseConfig());
    setTestStatus({ loading: false });
  };

  // Push Local Data to Supabase
  const handlePushToCloud = async () => {
    setSyncStatus('syncing');
    setSyncNotice(null);
    const res = await pushAllToCloud(appState, reminders);
    if (res.ok) {
      setSyncStatus('synced');
      setSyncNotice({ ok: true, message: res.message });
      setConfig(getSupabaseConfig());
    } else {
      setSyncStatus('error');
      setSyncNotice({ ok: false, message: res.message });
    }
  };

  // Pull Cloud Data to Local
  const handlePullFromCloud = async () => {
    setSyncStatus('syncing');
    setSyncNotice(null);
    const res = await pullAllFromCloud();
    if (res.ok) {
      setSyncStatus('synced');
      onApplyCloudData({
        profile: res.profile,
        preferences: res.preferences,
        conversations: res.conversations,
        reminders: res.reminders
      });
      setSyncNotice({ ok: true, message: res.message });
      setConfig(getSupabaseConfig());
    } else {
      setSyncStatus('error');
      setSyncNotice({ ok: false, message: res.message });
    }
  };

  const sqlCode = `-- Run this in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT DEFAULT 'Colleague',
  stage TEXT DEFAULT 'founder',
  goal TEXT DEFAULT '',
  topic_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  weekly_time_hours INTEGER DEFAULT 10,
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mentor_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tone TEXT DEFAULT 'warm',
  answer_format TEXT DEFAULT 'step-by-step',
  challenge_level TEXT DEFAULT 'balance',
  subject_lens TEXT DEFAULT 'startup-basics',
  custom_instruction TEXT DEFAULT '',
  islamic_mode_enabled BOOLEAN DEFAULT FALSE,
  groq_model TEXT DEFAULT 'llama-3.3-70b-versatile',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversations (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at_ms BIGINT NOT NULL,
  updated_at_ms BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'mentor')),
  text TEXT NOT NULL,
  citations JSONB DEFAULT '[]'::jsonb,
  timestamp_ms BIGINT NOT NULL,
  islamic_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reminders (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL DEFAULT 'curated',
  curated_category TEXT,
  custom_message TEXT,
  local_time TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  days INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5]::INTEGER[],
  quiet_hours_start TEXT DEFAULT '22:00',
  quiet_hours_end TEXT DEFAULT '07:00',
  enabled BOOLEAN DEFAULT TRUE,
  paused BOOLEAN DEFAULT FALSE,
  created_at_ms BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own profile" ON public.user_profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users access own preferences" ON public.mentor_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own conversations" ON public.conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own messages" ON public.messages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own reminders" ON public.reminders FOR ALL USING (auth.uid() = user_id);`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 8, 15, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)'
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border-subtle)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(56, 189, 248, 0.15)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '22px',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
              flexShrink: 0
            }}
          >
            ☁️
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              Supabase Cloud Data Sync
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              Save your chats, mentor notes, and reminders across Mobile & PC
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--color-border-subtle)',
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-4)',
            overflowX: 'auto'
          }}
        >
          <button
            onClick={() => setActiveTab('sync')}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px 14px',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: activeTab === 'sync' ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === 'sync' ? '2px solid var(--color-accent-blue)' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            🔄 Sync Data
          </button>
          <button
            onClick={() => setActiveTab('account')}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px 14px',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: activeTab === 'account' ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === 'account' ? '2px solid var(--color-accent-blue)' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            👤 {currentUser ? 'My Account' : 'Sign In / Register'}
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px 14px',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: activeTab === 'credentials' ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === 'credentials' ? '2px solid var(--color-accent-blue)' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            ⚙️ Connection Settings
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px 14px',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: activeTab === 'sql' ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === 'sql' ? '2px solid var(--color-accent-blue)' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            📋 SQL Setup Script
          </button>
        </div>

        {/* Tab Content with scroll */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          {/* TAB 1: SYNC DATA */}
          {activeTab === 'sync' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Status Box */}
              <div
                style={{
                  background: currentUser
                    ? 'rgba(34, 197, 94, 0.08)'
                    : isConfigured
                    ? 'rgba(234, 179, 8, 0.08)'
                    : 'rgba(239, 68, 68, 0.08)',
                  border: `1px solid ${
                    currentUser
                      ? 'rgba(34, 197, 94, 0.25)'
                      : isConfigured
                      ? 'rgba(234, 179, 8, 0.25)'
                      : 'rgba(239, 68, 68, 0.25)'
                  }`,
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 'var(--space-3)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: currentUser ? '#22c55e' : isConfigured ? '#eab308' : '#ef4444',
                        boxShadow: `0 0 8px ${currentUser ? '#22c55e' : isConfigured ? '#eab308' : '#ef4444'}`
                      }}
                    ></span>
                    <span>
                      {currentUser
                        ? `Connected as ${currentUser.email || currentUser.displayName}`
                        : isConfigured
                        ? 'Supabase Configured — Sign In Required to Sync'
                        : 'Supabase Not Configured'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    {config.lastSyncedAt
                      ? `Last synced: ${new Date(config.lastSyncedAt).toLocaleString()}`
                      : 'Never synced yet.'}
                  </div>
                </div>

                {!currentUser && (
                  <button
                    onClick={() => setActiveTab('account')}
                    className="btn btn-primary"
                    style={{ fontSize: '0.85rem', padding: '6px 14px' }}
                  >
                    Sign In / Sign Up
                  </button>
                )}
              </div>

              {/* Sync Actions Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                {/* Push Card */}
                <div
                  className="card"
                  style={{
                    padding: 'var(--space-4)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--color-border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 'var(--space-3)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '1.25rem', marginBottom: '4px' }}>⬆️</div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Upload Local to Cloud</div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                      Saves your current {appState.conversations.length} conversation(s), settings, and {reminders.length} reminder(s) to Supabase.
                    </p>
                  </div>
                  <button
                    onClick={handlePushToCloud}
                    disabled={!currentUser || syncStatus === 'syncing'}
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '0.85rem', padding: '8px 12px' }}
                  >
                    {syncStatus === 'syncing' ? 'Syncing...' : 'Backup to Cloud'}
                  </button>
                </div>

                {/* Pull Card */}
                <div
                  className="card"
                  style={{
                    padding: 'var(--space-4)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--color-border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 'var(--space-3)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '1.25rem', marginBottom: '4px' }}>⬇️</div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Download from Cloud</div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                      Pulls chats, profile, and reminders saved on your other PC or phone onto this device.
                    </p>
                  </div>
                  <button
                    onClick={handlePullFromCloud}
                    disabled={!currentUser || syncStatus === 'syncing'}
                    className="btn btn-secondary"
                    style={{ width: '100%', fontSize: '0.85rem', padding: '8px 12px' }}
                  >
                    {syncStatus === 'syncing' ? 'Syncing...' : 'Restore from Cloud'}
                  </button>
                </div>
              </div>

              {/* Sync Notice Alert */}
              {syncNotice && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                    background: syncNotice.ok ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: `1px solid ${syncNotice.ok ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    color: syncNotice.ok ? '#4ade80' : '#f87171'
                  }}
                >
                  {syncNotice.message}
                </div>
              )}

              {/* Multi-Device Info */}
              <div
                style={{
                  background: 'rgba(99, 102, 241, 0.05)',
                  border: '1px solid rgba(99, 102, 241, 0.15)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3)',
                  fontSize: '0.8rem',
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>💡</span>
                <span>
                  <strong>Multi-device tip:</strong> Install MyMentor on your phone and open it on your PC browser. Sign in with the same email on both to seamlessly sync your chats and reminders everywhere!
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: USER ACCOUNT & AUTH */}
          {activeTab === 'account' && (
            <div>
              {currentUser ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--space-4)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          color: '#fff'
                        }}
                      >
                        {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{currentUser.displayName || 'User'}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{currentUser.email}</div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                      User ID: <code>{currentUser.id}</code>
                    </div>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="btn btn-secondary"
                    style={{ alignSelf: 'flex-start', color: '#f87171' }}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className={`btn ${authMode === 'login' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1, padding: '8px' }}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('signup')}
                      className={`btn ${authMode === 'signup' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1, padding: '8px' }}
                    >
                      Create Account
                    </button>
                  </div>

                  {authMode === 'signup' && (
                    <div className="form-group">
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Display Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Tariq, Sarah"
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email Address</label>
                    <input
                      type="email"
                      required
                      className="form-control"
                      placeholder="user@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Password</label>
                    <input
                      type="password"
                      required
                      className="form-control"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                  </div>

                  {authNotice && (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem',
                        background: authNotice.ok ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        border: `1px solid ${authNotice.ok ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                        color: authNotice.ok ? '#4ade80' : '#f87171'
                      }}
                    >
                      {authNotice.message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="btn btn-primary"
                    style={{ padding: '10px', marginTop: 'var(--space-2)', fontWeight: 700 }}
                  >
                    {authLoading ? 'Authenticating...' : authMode === 'login' ? 'Sign In' : 'Create My Account'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: CONNECTION SETTINGS */}
          {activeTab === 'credentials' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                Enter your Supabase project credentials. You can find them in your{' '}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--color-accent-blue)', textDecoration: 'underline' }}
                >
                  Supabase Dashboard
                </a>{' '}
                under <em>Project Settings → API</em>.
              </p>

              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Project URL</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://your-project.supabase.co"
                  value={config.url}
                  onChange={e => setConfig(prev => ({ ...prev, url: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Anon / Public API Key</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={config.anonKey}
                  onChange={e => setConfig(prev => ({ ...prev, anonKey: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testStatus.loading}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '8px 14px' }}
                >
                  {testStatus.loading ? 'Testing...' : 'Test Connection'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveCredentials}
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                >
                  Save Credentials
                </button>
                <button
                  type="button"
                  onClick={handleClearCredentials}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '8px 12px', color: 'var(--color-text-tertiary)' }}
                >
                  Reset Defaults
                </button>
              </div>

              {saveNotice && (
                <div style={{ fontSize: '0.85rem', color: '#4ade80' }}>
                  ✓ Credentials saved successfully!
                </div>
              )}

              {testStatus.message && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                    background: testStatus.ok ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: `1px solid ${testStatus.ok ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    color: testStatus.ok ? '#4ade80' : '#f87171'
                  }}
                >
                  {testStatus.message}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SQL SCHEMA SCRIPT */}
          {activeTab === 'sql' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                Copy and run this SQL script in the{' '}
                <a
                  href="https://supabase.com/dashboard/project/_/sql"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--color-accent-blue)', textDecoration: 'underline' }}
                >
                  Supabase SQL Editor
                </a>
                . It will create all tables with Row Level Security (RLS) so each user's data remains private and secure.
              </div>

              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(sqlCode);
                    alert('SQL script copied to clipboard!');
                  }}
                  className="btn btn-secondary"
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    zIndex: 2
                  }}
                >
                  Copy SQL
                </button>
                <pre
                  style={{
                    background: '#090d16',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-3)',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    color: '#94a3b8',
                    maxHeight: '260px',
                    overflowY: 'auto'
                  }}
                >
                  {sqlCode}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            marginTop: 'var(--space-4)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--color-border-subtle)',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '8px 18px' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
