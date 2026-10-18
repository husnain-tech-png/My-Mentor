import React from 'react';
import { AppPage, MentorPreferences, UserMode, UserProfile } from '../types';

interface HeaderProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  userMode: UserMode | null;
  profile: UserProfile | null;
  preferences: MentorPreferences;
  onToggleIslamicMode: () => void;
  onToggleSidebar: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  userMode,
  profile,
  preferences,
  onToggleIslamicMode,
  onToggleSidebar
}) => {
  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="btn btn-secondary btn-icon"
          style={{ width: '38px', height: '38px' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div
          onClick={() => onNavigate('chat')}
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-lg)',
              background: preferences.islamicModeEnabled
                ? 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)'
                : 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: '18px',
              boxShadow: 'var(--shadow-glow-indigo)'
            }}
          >
            M
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>MyMentor</span>
              {preferences.islamicModeEnabled && (
                <span className="badge" style={{ background: 'rgba(167, 139, 250, 0.2)', color: '#c4b5fd', fontSize: '0.65rem' }}>
                  Islamic Mode
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }} className="main-nav-links">
        <button
          onClick={() => onNavigate('chat')}
          className={`nav-link ${currentPage === 'chat' ? 'active' : ''}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          <span>Chat</span>
        </button>
        <button
          onClick={() => onNavigate('library')}
          className={`nav-link ${currentPage === 'library' || currentPage === 'biography-detail' ? 'active' : ''}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          <span>Biographies</span>
        </button>
        <button
          onClick={() => onNavigate('islamic')}
          className={`nav-link ${currentPage === 'islamic' ? 'active' : ''}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          <span>Reflections</span>
        </button>
        <button
          onClick={() => onNavigate('reminders')}
          className={`nav-link ${currentPage === 'reminders' ? 'active' : ''}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>Reminders</span>
        </button>
        <button
          onClick={() => onNavigate('settings')}
          className={`nav-link ${currentPage === 'settings' ? 'active' : ''}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          <span>Settings</span>
        </button>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {/* Quick Islamic Mode Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }} title="Toggle Islamic Mode (Quran & Hadith Citations)">
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'none' }} className="d-sm-inline">
            Islamic Mode
          </span>
          <label className="switch" aria-label="Toggle Islamic Mode">
            <input
              type="checkbox"
              checked={preferences.islamicModeEnabled}
              onChange={onToggleIslamicMode}
            />
            <span className="slider islamic-slider"></span>
          </label>
        </div>

        {/* Profile Pill */}
        <button
          onClick={() => onNavigate('settings')}
          className="badge badge-indigo"
          style={{ padding: '6px 12px', cursor: 'pointer', border: '1px solid rgba(129, 140, 248, 0.3)' }}
        >
          {userMode === 'personalized' && profile?.displayName ? (
            <span>👤 {profile.displayName}</span>
          ) : (
            <span>⚡ Guest Mode</span>
          )}
        </button>
      </div>
    </header>
  );
};
