import React from 'react';
import { AppPage, CloudUser, MentorPreferences, UserMode, UserProfile } from '../types';

interface HeaderProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  userMode: UserMode | null;
  profile: UserProfile | null;
  preferences: MentorPreferences;
  onToggleIslamicMode: () => void;
  onToggleSidebar: () => void;
  unreadCount?: number;
  cloudUser: CloudUser | null;
  onOpenSupabaseModal: () => void;
  onOpenInstallModal: () => void;
  isStandalone: boolean;
  canInstallDirectly: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  userMode,
  profile,
  preferences,
  onToggleIslamicMode,
  onToggleSidebar,
  cloudUser,
  onOpenSupabaseModal,
  onOpenInstallModal,
  isStandalone
}) => {
  return (
    <header className="app-header">
      {/* Left: Hamburger + Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="btn btn-secondary btn-icon"
          style={{ width: '38px', height: '38px', borderRadius: '10px' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div
          onClick={() => onNavigate('chat')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', userSelect: 'none' }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '11px',
              background: preferences.islamicModeEnabled
                ? 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)'
                : 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: '18px',
              boxShadow: preferences.islamicModeEnabled ? 'var(--shadow-glow-violet)' : 'var(--shadow-glow-indigo)',
              transition: 'all 0.3s ease'
            }}
          >
            M
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '8px', lineHeight: 1.2 }}>
              <span style={{ background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                MyMentor
              </span>
              {preferences.islamicModeEnabled && (
                <span className="badge badge-violet" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                  🌙 Islamic Mode
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 500, letterSpacing: '0.02em' }}>
              Practical AI Life & Career Mentor
            </div>
          </div>
        </div>
      </div>

      {/* Center: Main Navigation Links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }} className="main-nav-links">
        <button
          onClick={() => onNavigate('chat')}
          className={`nav-link ${currentPage === 'chat' ? 'active' : ''}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          <span>Chat</span>
        </button>
        <button
          onClick={() => onNavigate('library')}
          className={`nav-link ${currentPage === 'library' || currentPage === 'biography-detail' ? 'active' : ''}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          <span>Biographies</span>
        </button>
        <button
          onClick={() => onNavigate('islamic')}
          className={`nav-link ${currentPage === 'islamic' ? 'active' : ''}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          <span>Reflections</span>
        </button>
        <button
          onClick={() => onNavigate('reminders')}
          className={`nav-link ${currentPage === 'reminders' ? 'active' : ''}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>Reminders</span>
        </button>
        <button
          onClick={() => onNavigate('settings')}
          className={`nav-link ${currentPage === 'settings' ? 'active' : ''}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          <span>Settings</span>
        </button>
      </nav>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {/* Supabase Cloud Sync Button */}
        <button
          onClick={onOpenSupabaseModal}
          title={cloudUser ? `Supabase Connected: ${cloudUser.email}` : 'Connect Supabase Cloud Backup'}
          className="btn btn-secondary btn-sm"
          style={{
            padding: '5px 11px',
            borderRadius: 'var(--radius-lg)',
            border: cloudUser ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid var(--color-border)',
            background: cloudUser ? 'rgba(52, 211, 153, 0.08)' : 'var(--color-bg-glass)'
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: cloudUser ? '#34d399' : '#94a3b8',
              boxShadow: cloudUser ? '0 0 8px #34d399' : 'none'
            }}
          />
          <span className="d-sm-inline" style={{ display: 'none', fontSize: '0.8rem', fontWeight: 600 }}>
            {cloudUser ? 'Cloud Active' : 'Cloud Sync'}
          </span>
          <span style={{ fontSize: '0.85rem' }}>☁️</span>
        </button>

        {/* PWA Install Button */}
        {!isStandalone && (
          <button
            onClick={onOpenInstallModal}
            title="Install App on Device (Desktop or Mobile)"
            className="btn btn-sm"
            style={{
              padding: '5px 11px',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(129, 140, 248, 0.35)',
              color: '#c7d2fe'
            }}
          >
            <span>📲</span>
            <span className="d-sm-inline" style={{ display: 'none', fontSize: '0.8rem', fontWeight: 600 }}>
              Install
            </span>
          </button>
        )}

        {/* Islamic Mode Quick Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            borderRadius: 'var(--radius-full)',
            background: preferences.islamicModeEnabled ? 'rgba(167, 139, 250, 0.12)' : 'rgba(255, 255, 255, 0.03)',
            border: preferences.islamicModeEnabled ? '1px solid rgba(167, 139, 250, 0.3)' : '1px solid var(--color-border)'
          }}
          title="Toggle Islamic Mode (Quran & Sahih Hadith guidance)"
        >
          <span style={{ fontSize: '0.85rem' }}>🌙</span>
          <label className="switch" aria-label="Toggle Islamic Mode" style={{ transform: 'scale(0.85)' }}>
            <input
              type="checkbox"
              checked={preferences.islamicModeEnabled}
              onChange={onToggleIslamicMode}
            />
            <span className="slider islamic-slider"></span>
          </label>
        </div>

        {/* User Profile Pill */}
        <button
          onClick={() => onNavigate('settings')}
          className="badge badge-indigo"
          style={{
            padding: '5px 12px',
            cursor: 'pointer',
            border: '1px solid rgba(129, 140, 248, 0.35)',
            fontSize: '0.75rem',
            fontWeight: 600
          }}
        >
          {userMode === 'personalized' && profile?.displayName ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>👤</span> {profile.displayName}
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>⚡</span> Guest Mode
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
