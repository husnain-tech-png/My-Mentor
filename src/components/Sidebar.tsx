import React from 'react';
import { AppPage, Conversation, UserProfile } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onNavigate: (page: AppPage) => void;
  currentPage: AppPage;
  profile: UserProfile | null;
  cloudUser?: { email?: string; displayName?: string } | null;
  onOpenSupabaseModal?: () => void;
  onOpenInstallModal?: () => void;
  isStandalone?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  conversations,
  activeId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onNavigate,
  currentPage,
  profile,
  cloudUser,
  onOpenSupabaseModal,
  onOpenInstallModal,
  isStandalone
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 250
          }}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '290px',
          background: 'var(--color-bg-secondary)',
          borderRight: '1px solid var(--color-border)',
          zIndex: 300,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isOpen ? 'var(--shadow-xl)' : 'none'
        }}
      >
        {/* Header */}
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: '1.2rem' }}>🧭</span>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Navigation & Chats</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close navigation sidebar"
            className="btn btn-secondary btn-icon"
            style={{ width: '32px', height: '32px' }}
          >
            ✕
          </button>
        </div>

        {/* New Chat Button */}
        <div style={{ padding: 'var(--space-4)' }}>
          <button
            onClick={() => {
              onNewConversation();
              onNavigate('chat');
              onClose();
            }}
            className="btn btn-primary"
            style={{ width: '100%', gap: 'var(--space-2)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>New Mentorship Chat</span>
          </button>
        </div>

        {/* Quick Nav Links (Mobile & Desktop) */}
        <div style={{ padding: '0 var(--space-4) var(--space-2)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>
            Explore
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              onClick={() => { onNavigate('chat'); onClose(); }}
              className={`nav-link ${currentPage === 'chat' ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              💬 Mentor Chat
            </button>
            <button
              onClick={() => { onNavigate('library'); onClose(); }}
              className={`nav-link ${currentPage === 'library' || currentPage === 'biography-detail' ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              📚 Biographies & Lessons
            </button>
            <button
              onClick={() => { onNavigate('islamic'); onClose(); }}
              className={`nav-link ${currentPage === 'islamic' ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              ✨ Islamic Reflections
            </button>
            <button
              onClick={() => { onNavigate('reminders'); onClose(); }}
              className={`nav-link ${currentPage === 'reminders' ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              ⏰ Motivation Reminders
            </button>
            <button
              onClick={() => { onNavigate('settings'); onClose(); }}
              className={`nav-link ${currentPage === 'settings' ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              ⚙️ Preferences & Profile
            </button>
            {onOpenSupabaseModal && (
              <button
                onClick={() => { onOpenSupabaseModal(); onClose(); }}
                className="nav-link"
                style={{ width: '100%', justifyContent: 'flex-start', color: cloudUser ? '#4ade80' : 'var(--color-accent-blue)' }}
              >
                ☁️ {cloudUser ? 'Supabase (Connected)' : 'Supabase Cloud Sync'}
              </button>
            )}
            {!isStandalone && onOpenInstallModal && (
              <button
                onClick={() => { onOpenInstallModal(); onClose(); }}
                className="nav-link"
                style={{ width: '100%', justifyContent: 'flex-start', color: '#a5b4fc' }}
              >
                📲 Install App on Device
              </button>
            )}
          </div>
        </div>

        {/* Conversation List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>
            Conversations ({conversations.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {conversations.map(conv => {
              const isActive = conv.id === activeId && currentPage === 'chat';
              return (
                <div
                  key={conv.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: isActive ? 'rgba(129, 140, 248, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    border: isActive ? '1px solid rgba(129, 140, 248, 0.3)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onNavigate('chat');
                    onClose();
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {conv.title || 'Untitled Conversation'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      {new Date(conv.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} · {conv.messages.length} msg
                    </div>
                  </div>

                  {conversations.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv.id);
                      }}
                      title="Delete conversation"
                      style={{
                        padding: '4px 6px',
                        color: 'var(--color-text-muted)',
                        borderRadius: 'var(--radius-sm)',
                        opacity: 0.6
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Profile Footer */}
        <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(129, 140, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
              👤
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profile?.displayName || 'Guest User'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {profile?.stage ? profile.stage.replace('-', ' ') : 'Quick Access'}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
